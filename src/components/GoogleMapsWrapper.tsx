import React from 'react';
import { InteractiveLeafletMap } from './InteractiveLeafletMap';

export interface GoogleMapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category?: string;
  rating?: number;
  price?: string;
  description?: string;
  imageUrl?: string;
  address?: string;
  entryFee?: string;
}

export interface GoogleMapsWrapperProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: GoogleMapMarker[];
  mapTypeId?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  heightClassName?: string;
  onMarkerClick?: (marker: GoogleMapMarker) => void;
  showControls?: boolean;
  initialDestination?: string;
}

/**
 * OpenSource Leaflet Fallback Wrapper (Replacing Google Maps JS API)
 */
export const GoogleMapsWrapper: React.FC<GoogleMapsWrapperProps> = ({
  center,
  heightClassName = 'h-[500px]',
  initialDestination = 'Jaipur',
}) => {
  return (
    <div className={`w-full ${heightClassName} relative overflow-hidden rounded-2xl`}>
      <InteractiveLeafletMap heightClassName="h-full" initialDestination={initialDestination} />
    </div>
  );
};
