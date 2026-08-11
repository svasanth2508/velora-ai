import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Star,
  Camera,
  UploadCloud,
  ThumbsUp,
  Flag,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  Maximize2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageSquare,
  UserCheck,
} from 'lucide-react';
import {
  fetchPlaceCommunityData,
  submitPlaceReview,
  likeReview,
  reportContent,
  compressAndConvertImage,
  PlaceCommunitySummary,
  ReviewItem,
  ReviewPhoto,
} from '../services/communityGalleryService';
import { CommunityGalleryUpload } from './CommunityGalleryUpload';

interface CommunityPlaceModalProps {
  locationName: string;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'gallery' | 'reviews' | 'write' | 'upload';
}

export const CommunityPlaceModal: React.FC<CommunityPlaceModalProps> = ({
  locationName,
  isOpen,
  onClose,
  initialTab = 'gallery',
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'reviews' | 'write' | 'upload'>(initialTab);
  const [summary, setSummary] = useState<PlaceCommunitySummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Lightbox State
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  // Write Review Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [visitDate, setVisitDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedFiles, setSelectedFiles] = useState<{ dataUrl: string; name: string; caption: string }[]>([]);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter state for reviews
  const [reviewSort, setReviewSort] = useState<'liked' | 'recent' | 'rating'>('liked');

  useEffect(() => {
    if (isOpen && locationName) {
      setActiveTab(initialTab);
      loadCommunityData();
    }
  }, [isOpen, locationName, reviewSort, initialTab]);

  const loadCommunityData = async () => {
    setIsLoading(true);
    const data = await fetchPlaceCommunityData(locationName, reviewSort);
    setSummary(data);
    setIsLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    setFeedback(null);

    try {
      const newFiles: { dataUrl: string; name: string; caption: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          setFeedback({ type: 'error', message: `"${file.name}" is not a supported image file.` });
          continue;
        }
        if (file.size > 8 * 1024 * 1024) {
          setFeedback({ type: 'error', message: `"${file.name}" exceeds the 8MB limit.` });
          continue;
        }

        const compressed = await compressAndConvertImage(file);
        newFiles.push({
          dataUrl: compressed,
          name: file.name,
          caption: '',
        });
      }

      setSelectedFiles((prev) => [...prev, ...newFiles]);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Image processing failed.' });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || reviewText.trim().length < 5) {
      setFeedback({ type: 'error', message: 'Review text must be at least 5 characters.' });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(20);
    setFeedback(null);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 15));
    }, 200);

    const result = await submitPlaceReview({
      locationName,
      rating,
      reviewText,
      userName: userName || 'Verified Traveler',
      visitDate,
      photos: selectedFiles.map((f) => ({ dataUrl: f.dataUrl, caption: f.caption })),
    });

    clearInterval(progressInterval);
    setUploadProgress(100);

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setReviewText('');
      setSelectedFiles([]);
      setTimeout(() => {
        setIsSubmitting(false);
        setUploadProgress(0);
        loadCommunityData();
        setActiveTab('reviews');
      }, 800);
    } else {
      setIsSubmitting(false);
      setUploadProgress(0);
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const handleLike = async (reviewId: string) => {
    const res = await likeReview(reviewId);
    if (res.success && summary) {
      setSummary((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          reviews: prev.reviews.map((r) =>
            r.id === reviewId ? { ...r, helpfulCount: res.helpfulCount } : r
          ),
        };
      });
    }
  };

  const handleReport = async (reviewId: string) => {
    const reason = prompt('Please specify why you are reporting this content (e.g. inappropriate image, spam):');
    if (!reason) return;

    const res = await reportContent({ reviewId, reason });
    alert(res.message);
  };

  if (!isOpen) return null;

  const communityPhotos = summary?.communityPhotos || [];
  const reviews = summary?.reviews || [];
  const activePhoto = activeLightboxIndex !== null ? communityPhotos[activeLightboxIndex] : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[600] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  Community Gallery
                </span>
                <span className="text-xs text-slate-400">• Real Traveler Verified</span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">{locationName}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Rating Summary Bar */}
          {summary && (
            <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 items-center shrink-0">
              <div className="flex items-center space-x-3">
                <div className="text-3xl font-extrabold text-amber-400 font-mono">
                  {summary.averageRating > 0 ? summary.averageRating : 'New'}
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(summary.averageRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Based on <strong className="text-slate-200">{summary.totalReviews}</strong> traveler reviews &{' '}
                    <strong className="text-slate-200">{summary.communityPhotos.length}</strong> photos
                  </p>
                </div>
              </div>

              {/* Star Distribution Breakdown */}
              <div className="space-y-1 text-[11px] font-mono text-slate-400 hidden sm:block">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = summary.starDistribution[star as 1 | 2 | 3 | 4 | 5] || 0;
                  const pct = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center space-x-2">
                      <span className="w-3 text-right font-bold text-slate-300">{star}★</span>
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-slate-500 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Upload Photos</span>
                </button>
                <button
                  onClick={() => setActiveTab('write')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center space-x-1.5 border border-slate-700 transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>Write Review</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="px-6 py-2 bg-slate-950 border-b border-slate-800 flex items-center space-x-2 shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'gallery'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Community Photos ({communityPhotos.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Reviews ({reviews.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'upload'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Photos</span>
            </button>
            <button
              onClick={() => setActiveTab('write')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'write'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Write Review</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Loading authentic community content...</p>
              </div>
            ) : activeTab === 'gallery' ? (
              <div>
                {communityPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {communityPhotos.map((photo, idx) => (
                      <div
                        key={photo.id}
                        onClick={() => setActiveLightboxIndex(idx)}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer shadow-md hover:border-emerald-500/50 transition-all"
                      >
                        <img
                          src={photo.imageUrl}
                          alt={photo.caption || locationName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end">
                          <p className="text-[11px] font-semibold text-white line-clamp-1">{photo.caption}</p>
                          <div className="flex items-center justify-between text-[10px] text-emerald-300 mt-1">
                            <span>By {photo.uploaderName}</span>
                            <span className="flex items-center space-x-1">
                              <ThumbsUp className="w-3 h-3" />
                              <span>{photo.likesCount}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-8 text-center space-y-4 my-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">No community photos available yet</h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                        Be the first traveler to upload authentic photos of <strong className="text-white">{locationName}</strong>!
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('write')}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center space-x-2 shadow-lg shadow-emerald-500/20"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Be the First to Upload Photos</span>
                    </button>
                  </div>
                )}
              </div>
            ) : activeTab === 'reviews' ? (
              <div className="space-y-4">
                {/* Review Controls */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Showing {reviews.length} authentic traveler reviews</span>
                  <div className="flex items-center space-x-2">
                    <span>Sort by:</span>
                    <select
                      value={reviewSort}
                      onChange={(e) => setReviewSort(e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="liked">Most Helpful</option>
                      <option value="recent">Most Recent</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                </div>

                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                              alt={rev.userName}
                              className="w-9 h-9 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="text-xs font-bold text-white">{rev.userName}</h4>
                                {rev.verifiedBadge && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>Verified Traveler</span>
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                                <div className="flex items-center space-x-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`w-3 h-3 ${
                                        s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span>•</span>
                                <span>Visited {rev.visitDate || 'Recently'}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleReport(rev.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                            title="Report review"
                          >
                            <Flag className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">{rev.reviewText}</p>

                        {/* Review Attached Photos */}
                        {rev.photos && rev.photos.length > 0 && (
                          <div className="flex items-center space-x-2 pt-1 overflow-x-auto">
                            {rev.photos.map((ph) => (
                              <img
                                key={ph.id}
                                src={ph.imageUrl}
                                alt="Review attachment"
                                className="w-16 h-16 rounded-lg object-cover border border-slate-800 cursor-pointer hover:border-emerald-500/80 transition-all"
                                onClick={() => {
                                  const idx = communityPhotos.findIndex((p) => p.id === ph.id);
                                  if (idx !== -1) setActiveLightboxIndex(idx);
                                }}
                              />
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-900">
                          <span>Uploaded {new Date(rev.createdAt).toLocaleDateString()}</span>
                          <button
                            onClick={() => handleLike(rev.id)}
                            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                          >
                            <ThumbsUp className="w-3 h-3 text-emerald-400" />
                            <span>Helpful ({rev.helpfulCount})</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs">No reviews published yet for this destination.</p>
                  </div>
                )}
              </div>
            ) : activeTab === 'upload' ? (
              /* Dedicated Drag & Drop Community Gallery Upload */
              <div className="max-w-2xl mx-auto">
                <CommunityGalleryUpload
                  placeId={summary?.placeId}
                  placeName={locationName}
                  onUploadComplete={() => {
                    loadCommunityData();
                    setActiveTab('gallery');
                  }}
                  onCancel={() => setActiveTab('gallery')}
                />
              </div>
            ) : (
              /* Write Review & Upload Photos Form */
              <form onSubmit={handleSubmitReview} className="space-y-5 max-w-2xl mx-auto">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Share Your Traveler Experience & Photos</span>
                  </h3>

                  {feedback && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                        feedback.type === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {feedback.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>{feedback.message}</span>
                    </div>
                  )}

                  {/* Rating Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Your Overall Rating (1–5 Stars)
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 text-slate-700 hover:scale-110 transition-transform focus:outline-none"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= (hoverRating || rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-800'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-400 ml-2 font-mono">
                        {rating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  {/* Reviewer Name & Visit Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Your Name / Display Alias
                      </label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="e.g., Anish Kumar"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Visit Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Traveler Review & Tips
                    </label>
                    <textarea
                      rows={3}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Describe your visit, best visiting hours, crowd levels, entrance fees, or photography spots..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  {/* Drag and Drop Photo Upload Zone */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                      Attach Authentic Community Photos
                    </label>
                    <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 text-center bg-slate-900/50 transition-colors relative">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <UploadCloud className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-white">
                        Drag & Drop photos or <span className="text-emerald-400 underline">Browse files</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Supports JPEG, PNG, WEBP (Max 8MB per photo). Mobile camera uploads supported.
                      </p>
                    </div>

                    {isCompressing && (
                      <p className="text-[11px] text-emerald-400 mt-2 animate-pulse">
                        Optimizing & validating photo dimensions...
                      </p>
                    )}

                    {/* Thumbnail Previews */}
                    {selectedFiles.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                        {selectedFiles.map((file, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group">
                            <img src={file.dataUrl} alt={file.name} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="absolute top-1 right-1 bg-slate-950/80 text-rose-400 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Progress Indicator */}
                  {isSubmitting && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-emerald-400">
                        <span>Uploading review & community photos...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish Review & Community Photos</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>

      {/* Lightbox Viewer Overlay */}
      {activePhoto && (
        <div className="fixed inset-0 z-[700] bg-slate-950/95 flex flex-col items-center justify-between p-4 backdrop-blur-xl">
          <div className="w-full max-w-5xl flex items-center justify-between text-white text-xs">
            <span className="font-semibold">{locationName} • Photo {activeLightboxIndex! + 1} of {communityPhotos.length}</span>
            <button
              onClick={() => setActiveLightboxIndex(null)}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex-1 w-full max-w-4xl flex items-center justify-center py-4">
            <button
              onClick={() => setActiveLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : communityPhotos.length - 1))}
              className="absolute left-2 p-3 rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <img
              src={activePhoto.imageUrl}
              alt={activePhoto.caption || locationName}
              className="max-h-[75vh] max-w-full object-contain rounded-xl border border-slate-800 shadow-2xl"
            />
            <button
              onClick={() => setActiveLightboxIndex((prev) => (prev! < communityPhotos.length - 1 ? prev! + 1 : 0))}
              className="absolute right-2 p-3 rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-xs text-slate-300 flex items-center justify-between">
            <div>
              <p className="font-bold text-white">{activePhoto.caption || 'Traveler photo'}</p>
              <p className="text-[10px] text-slate-400">Uploaded by {activePhoto.uploaderName} on {new Date(activePhoto.uploadedAt).toLocaleDateString()}</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30 text-[11px]">
              Verified Community Content
            </span>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
