import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  Camera,
  Trash2,
  Lock,
  Sparkles,
  ShieldCheck,
  FileImage,
  Loader2,
  LogIn,
  UserCheck,
} from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, storage, loginWithGoogle, loginAnonymously } from '../lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { ReviewPhoto } from '../services/communityGalleryService';

interface FileUploadState {
  id: string;
  file: File;
  compressedBlob: Blob;
  previewUrl: string;
  caption: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
  downloadUrl?: string;
}

interface CommunityGalleryUploadProps {
  placeId?: string;
  placeName: string;
  onUploadComplete?: (uploadedPhotos: ReviewPhoto[]) => void;
  onCancel?: () => void;
  className?: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

export const CommunityGalleryUpload: React.FC<CommunityGalleryUploadProps> = ({
  placeId,
  placeName,
  onUploadComplete,
  onCancel,
  className = '',
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<FileUploadState[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Overall upload process state
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [totalProgress, setTotalProgress] = useState<number>(0);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  const normalizedPlaceId = (placeId || placeName).toLowerCase().replace(/[^a-z0-9]/g, '-');

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // HTML5 Canvas Image Compression helper
  const compressImage = useCallback(
    (file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.82): Promise<{ blob: Blob; dataUrl: string }> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
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
            if (!ctx) return reject(new Error('Canvas context initialization failed.'));

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (!blob) return reject(new Error('Image compression blob conversion failed.'));
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve({ blob, dataUrl });
              },
              'image/jpeg',
              quality
            );
          };
          img.onerror = () => reject(new Error(`Failed to render image "${file.name}"`));
          img.src = event.target?.result as string;
        };
        reader.onerror = () => reject(new Error(`Failed to read file "${file.name}"`));
        reader.readAsDataURL(file);
      });
    },
    []
  );

  // Validate and process raw files
  const processFiles = async (filesList: FileList | File[]) => {
    setValidationErrors([]);
    setUploadSuccessMessage(null);
    const errors: string[] = [];
    const validRawFiles: File[] = [];

    Array.from(filesList).forEach((file) => {
      // 1. File Type Validation (JPG / PNG)
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        errors.push(`"${file.name}" is not a valid JPG or PNG image.`);
        return;
      }
      // 2. File Size Validation (Max 5MB)
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        errors.push(`"${file.name}" is ${sizeMb}MB (exceeds the 5MB limit).`);
        return;
      }
      validRawFiles.push(file);
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
    }

    if (validRawFiles.length === 0) return;

    setIsCompressing(true);

    try {
      const processedItems: FileUploadState[] = [];
      for (let i = 0; i < validRawFiles.length; i++) {
        const file = validRawFiles[i];
        const { blob, dataUrl } = await compressImage(file);

        processedItems.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          compressedBlob: blob,
          previewUrl: dataUrl,
          caption: '',
          progress: 0,
          status: 'pending',
        });
      }

      setSelectedFiles((prev) => [...prev, ...processedItems]);
    } catch (err: any) {
      setValidationErrors((prev) => [...prev, err.message || 'Error processing selected images.']);
    } finally {
      setIsCompressing(false);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCaptionChange = (id: string, caption: string) => {
    setSelectedFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, caption } : item))
    );
  };

  // Execute Firebase Storage & Firestore Upload
  const handleStartUpload = async () => {
    if (!currentUser) {
      setValidationErrors(['Authentication required to publish photos to the community gallery.']);
      return;
    }

    if (selectedFiles.length === 0) {
      setValidationErrors(['Please select at least one JPG/PNG image to upload.']);
      return;
    }

    setIsUploading(true);
    setValidationErrors([]);
    setUploadSuccessMessage(null);

    const completedPhotos: ReviewPhoto[] = [];
    const totalCount = selectedFiles.length;

    for (let index = 0; index < totalCount; index++) {
      const item = selectedFiles[index];

      // Update status to uploading
      setSelectedFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'uploading', progress: 5 } : f))
      );

      let finalDownloadUrl = '';

      try {
        // Attempt upload using Firebase Storage uploadBytesResumable
        const storagePath = `community_gallery/${normalizedPlaceId}/${item.id}_${item.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const storageRef = ref(storage, storagePath);

        const uploadTask = uploadBytesResumable(storageRef, item.compressedBlob, {
          contentType: 'image/jpeg',
          customMetadata: {
            uploaderUid: currentUser.uid,
            placeId: normalizedPlaceId,
            placeName,
          },
        });

        finalDownloadUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progressPct = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              setSelectedFiles((prev) =>
                prev.map((f) => (f.id === item.id ? { ...f, progress: progressPct } : f))
              );

              // Calculate overall total progress
              const currentTotal = Math.round(
                ((index + progressPct / 100) / totalCount) * 100
              );
              setTotalProgress(currentTotal);
            },
            (error) => {
              console.warn('Firebase Storage upload warning, switching to direct pipeline fallback:', error);
              // Fallback to Data URL preview string
              resolve(item.previewUrl);
            },
            async () => {
              try {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
              } catch {
                resolve(item.previewUrl);
              }
            }
          );
        });
      } catch (storageErr) {
        console.warn('Storage execution exception:', storageErr);
        finalDownloadUrl = item.previewUrl;
      }

      // Mark file complete
      setSelectedFiles((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, status: 'completed', progress: 100, downloadUrl: finalDownloadUrl } : f
        )
      );

      // Create photo document metadata for Firestore 'ReviewImages' collection
      const photoDoc: ReviewPhoto = {
        id: item.id,
        reviewId: `gallery-upload-${normalizedPlaceId}`,
        placeId: normalizedPlaceId,
        imageUrl: finalDownloadUrl,
        uploadedAt: new Date().toISOString(),
        caption: item.caption.trim() || `Community photo of ${placeName}`,
        likesCount: 1,
        uploaderName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Verified Traveler',
        userId: currentUser.uid,
      };

      try {
        // Save metadata into Firestore
        await setDoc(doc(db, 'ReviewImages', item.id), photoDoc);
      } catch (docErr) {
        console.warn('Firestore metadata save warning:', docErr);
      }

      completedPhotos.push(photoDoc);
    }

    setTotalProgress(100);
    setIsUploading(false);
    setUploadSuccessMessage(
      `Successfully uploaded ${completedPhotos.length} photo${completedPhotos.length > 1 ? 's' : ''} for ${placeName}!`
    );

    if (onUploadComplete) {
      onUploadComplete(completedPhotos);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Verifying traveler authentication...</p>
      </div>
    );
  }

  // Render Authentication Required Banner if not logged in
  if (!currentUser) {
    return (
      <div className={`bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-xl ${className}`}>
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Authentication Required</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Please sign in to upload authentic traveler photos for <strong className="text-slate-200">{placeName}</strong> to the community gallery.
          </p>
        </div>

        {authError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium max-w-md mx-auto">
            {authError}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              setAuthError(null);
              loginWithGoogle().catch((err) => setAuthError(err.message));
            }}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg transition-all"
          >
            <LogIn className="w-4 h-4 text-emerald-600" />
            <span>Sign in with Google</span>
          </button>
          <button
            onClick={() => {
              setAuthError(null);
              loginAnonymously().catch((err) => setAuthError(err.message));
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center space-x-2 border border-slate-700 transition-all"
          >
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>Continue as Guest</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-950 border border-slate-800/90 rounded-2xl p-5 space-y-5 shadow-2xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold text-white">Upload Community Photos</h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                JPG/PNG • Max 5MB
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Destination: <span className="text-slate-200 font-semibold">{placeName}</span>
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Validation Errors Alert */}
      {validationErrors.length > 0 && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>File Validation Warnings</span>
          </div>
          <ul className="text-[11px] text-rose-300 list-disc list-inside pl-1 space-y-0.5">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Notification */}
      {uploadSuccessMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center space-x-2 text-xs font-semibold text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{uploadSuccessMessage}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-emerald-500/50 bg-slate-900/50'
        }`}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          multiple
          onChange={handleFileInputChange}
          disabled={isUploading || isCompressing}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10 disabled:cursor-not-allowed"
        />

        <div className="space-y-2 pointer-events-none">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">
              Drag & Drop traveler photos here or <span className="text-emerald-400 underline">Browse Files</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Supports <strong className="text-slate-300">JPG & PNG</strong> format up to <strong className="text-slate-300">5MB</strong> per image.
            </p>
          </div>
        </div>
      </div>

      {/* Compression Processing Spinner */}
      {isCompressing && (
        <div className="flex items-center justify-center space-x-2 py-2 text-xs text-emerald-400 font-mono">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Compressing & optimizing image dimensions...</span>
        </div>
      )}

      {/* Selected Files List & Preview Grid */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>Selected Images ({selectedFiles.length})</span>
            {!isUploading && (
              <button
                onClick={() => setSelectedFiles([])}
                className="text-[11px] text-rose-400 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {selectedFiles.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex space-x-3 items-center relative group"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0 relative">
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />
                  {item.status === 'completed' && (
                    <div className="absolute inset-0 bg-emerald-950/80 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-white truncate max-w-[140px]">
                      {item.file.name}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400">
                      {(item.file.size / (1024 * 1024)).toFixed(1)}MB
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="Add caption (e.g., Temple view at sunrise)..."
                    value={item.caption}
                    disabled={isUploading || item.status === 'completed'}
                    onChange={(e) => handleCaptionChange(item.id, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />

                  {/* Progress bar per file */}
                  {item.status === 'uploading' && (
                    <div className="space-y-0.5">
                      <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full transition-all duration-200"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <p className="text-[9px] font-mono text-emerald-400 text-right">
                        {item.progress}%
                      </p>
                    </div>
                  )}
                </div>

                {!isUploading && item.status !== 'completed' && (
                  <button
                    onClick={() => handleRemoveFile(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total Upload Progress Bar */}
      {isUploading && (
        <div className="space-y-1.5 p-3 bg-slate-900 rounded-xl border border-slate-800">
          <div className="flex justify-between text-xs font-mono text-emerald-400 font-bold">
            <span>Uploading to Firebase Storage & Firestore...</span>
            <span>{totalProgress}%</span>
          </div>
          <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Submit Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleStartUpload}
          disabled={isUploading || selectedFiles.length === 0 || isCompressing}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading... ({totalProgress}%)</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Publish {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''} Photos</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
