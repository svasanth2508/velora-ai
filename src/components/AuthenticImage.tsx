import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, ShieldCheck, UploadCloud, Star, MessageSquare } from 'lucide-react';
import { useAuthenticLocationImage } from '../services/locationImageService';
import { CommunityPlaceModal } from './CommunityPlaceModal';

interface AuthenticImageProps {
  locationName: string;
  lat?: number;
  lng?: number;
  category?: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'auto';
  showBadge?: boolean;
  showAttributionOnHover?: boolean;
  onClick?: () => void;
  altText?: string;
}

export const AuthenticImage: React.FC<AuthenticImageProps> = ({
  locationName,
  lat,
  lng,
  category,
  className = '',
  aspectRatio = 'video',
  showBadge = true,
  showAttributionOnHover = true,
  onClick,
  altText,
}) => {
  const { imageUrl, source, attribution, totalPhotosCount, averageRating, totalReviews, isLoading, fromGooglePlaces } =
    useAuthenticLocationImage(locationName, lat, lng, category);

  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState<boolean>(false);

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'wide':
        return 'aspect-[21/9]';
      case 'auto':
        return 'h-full w-full';
      case 'video':
      default:
        return 'aspect-video';
    }
  };

  const handleContainerClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsCommunityModalOpen(true);
    }
  };

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-xl bg-slate-950 border border-slate-800/80 group ${getAspectClass()} ${className} cursor-pointer`}
        onClick={handleContainerClick}
      >
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-pulse flex flex-col items-center justify-center space-y-2 z-10">
            <Camera className="w-8 h-8 text-slate-600 animate-bounce" />
            <span className="text-[11px] text-slate-400 font-medium">Checking Community Gallery...</span>
          </div>
        )}

        {/* Real Verified Community Image */}
        {imageUrl && !imageError ? (
          <>
            <img
              src={imageUrl}
              alt={altText || `Authentic traveler photo of ${locationName}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Badge */}
            {showBadge && imageLoaded && (
              <div className="absolute top-2 left-2 z-20 flex flex-wrap items-center gap-1">
                {fromGooglePlaces || source.includes('Google Places') ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500 text-slate-950 border border-cyan-300 flex items-center space-x-1 shadow-lg">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Google Places Photo</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-slate-950 border border-emerald-400 flex items-center space-x-1 shadow-lg">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified Place Photo</span>
                  </span>
                )}
                {totalPhotosCount > 1 && (
                  <span className="px-2 py-0.5 bg-slate-950/90 text-emerald-300 border border-slate-800 rounded-full text-[10px] font-mono font-bold">
                    +{totalPhotosCount - 1} photos
                  </span>
                )}
              </div>
            )}

            {/* Hover Overlay */}
            {showAttributionOnHover && imageLoaded && (
              <div className="absolute inset-x-0 bottom-0 z-20 p-3 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">{locationName}</span>
                  <span className="text-[10px] text-slate-300 italic block mt-0.5">{source}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCommunityModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center space-x-1 shadow-md hover:bg-emerald-400 transition-colors"
                >
                  <Camera className="w-3 h-3" />
                  <span>View Gallery</span>
                </button>
              </div>
            )}
          </>
        ) : (
          /* Strictly No Image / Prompt to Upload Photo when no verified photo is available */
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center space-y-2 z-10 hover:bg-slate-900 transition-colors">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">No verified photo available</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Be the first traveler to upload photos of {locationName}!</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCommunityModalOpen(true);
              }}
              className="mt-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-extrabold rounded-lg transition-all flex items-center space-x-1 shadow-lg shadow-emerald-500/10"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>
          </div>
        )}
      </div>

      {/* Community Gallery & Review Modal */}
      <CommunityPlaceModal
        locationName={locationName}
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
      />
    </>
  );
};

