import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  increment 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface ReviewPhoto {
  id: string;
  reviewId: string;
  placeId: string;
  imageUrl: string;
  uploadedAt: string;
  caption?: string;
  likesCount: number;
  uploaderName: string;
  userId?: string;
}

export interface ReviewItem {
  id: string;
  placeId: string;
  placeName: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1 to 5
  reviewText: string;
  visitDate?: string;
  createdAt: string;
  updatedAt: string;
  photos: ReviewPhoto[];
  helpfulCount: number;
  verifiedBadge: boolean;
  reported: boolean;
  reportReason?: string;
}

export interface PlaceCommunitySummary {
  placeId: string;
  placeName: string;
  averageRating: number;
  totalReviews: number;
  starDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  reviews: ReviewItem[];
  communityPhotos: ReviewPhoto[];
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
  Fetch authentic community reviews, photo gallery, and star rating distribution for a place
 */
export async function fetchPlaceCommunityData(
  locationName: string,
  sortBy: 'recent' | 'liked' | 'rating' = 'liked'
): Promise<PlaceCommunitySummary> {
  const normName = locationName.trim();
  const normId = normName.toLowerCase().replace(/[^a-z0-9]/g, '-');

  let serverData: PlaceCommunitySummary = {
    placeId: normId,
    placeName: normName,
    averageRating: 0,
    totalReviews: 0,
    starDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    reviews: [],
    communityPhotos: [],
  };

  // 1. Fetch from server endpoint as primary / baseline
  try {
    const params = new URLSearchParams({
      locationName: normName,
      sortBy,
    });
    const res = await fetch(`/api/places/community-reviews?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        serverData = data.data;
      }
    }
  } catch (err) {
    console.warn('Error fetching server community place data:', err);
  }

  // 2. Fetch directly from Firestore 'Reviews' and 'ReviewImages' collections
  try {
    const reviewsPath = 'Reviews';
    const reviewsRef = collection(db, reviewsPath);
    const qReviews = query(reviewsRef, where('placeId', '==', normId));
    const querySnapshot = await getDocs(qReviews);

    const firestoreReviewsMap = new Map<string, ReviewItem>();
    const firestorePhotosMap = new Map<string, ReviewPhoto>();

    for (const docSnap of querySnapshot.docs) {
      const rData = docSnap.data() as ReviewItem;
      firestoreReviewsMap.set(docSnap.id, {
        ...rData,
        id: docSnap.id,
        photos: rData.photos || [],
      });
    }

    // Fetch images from 'ReviewImages' collection for this place
    const imagesPath = 'ReviewImages';
    const imagesRef = collection(db, imagesPath);
    const qImages = query(imagesRef, where('placeId', '==', normId));
    const imgSnapshot = await getDocs(qImages);

    for (const imgSnap of imgSnapshot.docs) {
      const pData = imgSnap.data() as ReviewPhoto;
      firestorePhotosMap.set(imgSnap.id, {
        ...pData,
        id: imgSnap.id,
      });
    }

    // Merge photos into their respective reviews if applicable
    for (const [photoId, photo] of firestorePhotosMap.entries()) {
      if (photo.reviewId && firestoreReviewsMap.has(photo.reviewId)) {
        const review = firestoreReviewsMap.get(photo.reviewId)!;
        if (!review.photos.some((p) => p.id === photoId)) {
          review.photos.push(photo);
        }
      }
    }

    // Combine Firestore reviews with Server reviews (avoiding duplicates by id)
    const combinedReviewsMap = new Map<string, ReviewItem>();
    
    // Add Firestore items first (user real time docs)
    firestoreReviewsMap.forEach((rev, id) => combinedReviewsMap.set(id, rev));
    // Add server items if not already present
    serverData.reviews.forEach((rev) => {
      if (!combinedReviewsMap.has(rev.id)) {
        combinedReviewsMap.set(rev.id, rev);
      }
    });

    const allReviews = Array.from(combinedReviewsMap.values());

    // Aggregate community photos
    const allPhotosMap = new Map<string, ReviewPhoto>();
    allReviews.forEach((r) => {
      if (r.photos) {
        r.photos.forEach((ph) => allPhotosMap.set(ph.id, ph));
      }
    });
    firestorePhotosMap.forEach((ph, id) => allPhotosMap.set(id, ph));

    const communityPhotos = Array.from(allPhotosMap.values());

    // Recalculate rating stats
    const totalReviews = allReviews.length;
    const starDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sumRating = 0;

    allReviews.forEach((r) => {
      sumRating += r.rating;
      if (r.rating >= 1 && r.rating <= 5) {
        starDistribution[r.rating as 1 | 2 | 3 | 4 | 5] += 1;
      }
    });

    const averageRating = totalReviews > 0 ? parseFloat((sumRating / totalReviews).toFixed(1)) : 0;

    // Sort reviews
    if (sortBy === 'recent') {
      allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'rating') {
      allReviews.sort((a, b) => b.rating - a.rating);
    } else {
      allReviews.sort((a, b) => b.helpfulCount - a.helpfulCount);
    }

    communityPhotos.sort((a, b) => b.likesCount - a.likesCount);

    return {
      placeId: normId,
      placeName: normName,
      averageRating,
      totalReviews,
      starDistribution,
      reviews: allReviews,
      communityPhotos,
    };
  } catch (err) {
    console.warn('Error querying Firestore for community data:', err);
    return serverData;
  }
}

/**
  Submit a new traveler review with ratings and attached photos directly into Firestore
 */
export async function submitPlaceReview(payload: {
  locationName: string;
  rating: number;
  reviewText: string;
  userName?: string;
  userAvatar?: string;
  visitDate?: string;
  photos?: { dataUrl: string; caption?: string }[];
}): Promise<{ success: boolean; message: string; review?: ReviewItem }> {
  try {
    const normName = payload.locationName.trim();
    const normId = normName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const reviewId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const currentUserId = auth.currentUser?.uid || `user-${Date.now()}`;
    const displayUserName = payload.userName || auth.currentUser?.displayName || 'Verified Traveler';
    const displayUserAvatar = payload.userAvatar || auth.currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

    // Process attached photos
    const createdPhotos: ReviewPhoto[] = [];
    if (Array.isArray(payload.photos)) {
      payload.photos.forEach((p, idx) => {
        if (p.dataUrl) {
          createdPhotos.push({
            id: `img-${Date.now()}-${idx}`,
            reviewId,
            placeId: normId,
            imageUrl: p.dataUrl,
            uploadedAt: new Date().toISOString(),
            caption: p.caption || `Traveler photo of ${normName}`,
            likesCount: 1,
            uploaderName: displayUserName,
            userId: currentUserId,
          });
        }
      });
    }

    const newReview: ReviewItem = {
      id: reviewId,
      placeId: normId,
      placeName: normName,
      userId: currentUserId,
      userName: displayUserName,
      userAvatar: displayUserAvatar,
      rating: Number(payload.rating),
      reviewText: payload.reviewText.trim(),
      visitDate: payload.visitDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photos: createdPhotos,
      helpfulCount: 1,
      verifiedBadge: true,
      reported: false,
    };

    // 1. Write Review to Firestore 'Reviews' collection
    const reviewsPath = `Reviews/${reviewId}`;
    try {
      await setDoc(doc(db, 'Reviews', reviewId), newReview);

      // Write individual images to 'ReviewImages' collection
      for (const photo of createdPhotos) {
        const imagePath = `ReviewImages/${photo.id}`;
        await setDoc(doc(db, 'ReviewImages', photo.id), photo);
      }
    } catch (fsErr) {
      handleFirestoreError(fsErr, OperationType.WRITE, reviewsPath);
    }

    // 2. Sync write to Express backend DB as well for backup/in-memory consistency
    try {
      await fetch('/api/places/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Ignore backend sync error if Firestore write succeeded
    }

    return {
      success: true,
      message: 'Your review and community photos have been published to Firestore successfully!',
      review: newReview,
    };
  } catch (err: any) {
    console.error('Error submitting review to Firestore:', err);
    return {
      success: false,
      message: err.message || 'Failed to submit review due to database error.',
    };
  }
}

/**
  Like/Helpful toggle for a review in Firestore
 */
export async function likeReview(reviewId: string): Promise<{ success: boolean; helpfulCount: number }> {
  const currentUserId = auth.currentUser?.uid || `anon-${Date.now()}`;
  const likeId = `like-${currentUserId}-${reviewId}`;
  const likePath = `Likes/${likeId}`;
  const reviewPath = `Reviews/${reviewId}`;

  try {
    // Write Like record
    await setDoc(doc(db, 'Likes', likeId), {
      id: likeId,
      reviewId,
      userId: currentUserId,
      createdAt: new Date().toISOString(),
    });

    // Increment helpful count on review doc
    const reviewRef = doc(db, 'Reviews', reviewId);
    await updateDoc(reviewRef, {
      helpfulCount: increment(1),
    });

    const updatedDoc = await getDoc(reviewRef);
    const newCount = updatedDoc.data()?.helpfulCount || 1;

    // Also sync to server
    fetch(`/api/reviews/${reviewId}/like`, { method: 'POST' }).catch(() => {});

    return { success: true, helpfulCount: newCount };
  } catch (fsErr) {
    console.warn('Firestore write failed for like, using server fallback:', fsErr);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        return { success: true, helpfulCount: data.helpfulCount };
      }
    } catch {
      // Ignore
    }
  }

  return { success: false, helpfulCount: 0 };
}

/**
  Report inappropriate review or image in Firestore
 */
export async function reportContent(payload: {
  reviewId?: string;
  imageId?: string;
  reason: string;
}): Promise<{ success: boolean; message: string }> {
  const reportId = `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const currentUserId = auth.currentUser?.uid || 'anonymous-user';
  const reportPath = `Reports/${reportId}`;

  try {
    await setDoc(doc(db, 'Reports', reportId), {
      id: reportId,
      reviewId: payload.reviewId || null,
      imageId: payload.imageId || null,
      reportedBy: currentUserId,
      reason: payload.reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    if (payload.reviewId) {
      const reviewRef = doc(db, 'Reviews', payload.reviewId);
      await updateDoc(reviewRef, {
        reported: true,
        reportReason: payload.reason,
      }).catch(() => {});
    }

    // Sync to express server
    fetch('/api/reviews/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});

    return {
      success: true,
      message: 'Thank you for reporting. The item has been logged in Firestore for moderation.',
    };
  } catch (fsErr) {
    handleFirestoreError(fsErr, OperationType.WRITE, reportPath);
    return { success: false, message: 'Failed to record report.' };
  }
}

/**
  Helper to compress image file to Base64 Data URL on client side
 */
export function compressAndConvertImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }
    if (file.size > 8 * 1024 * 1024) {
      return reject(new Error('File size exceeds 8MB limit.'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context unavailable.'));

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}
