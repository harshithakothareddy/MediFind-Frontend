import React from 'react';
import { MapPin } from 'lucide-react';

const MapPlaceholder = ({
  className = '',
  height = 'h-64',
  message,
  address,
  pharmacyName,
  lat,
  lng
}) => {
  const query = lat && lng
    ? `${lat},${lng}`
    : encodeURIComponent((pharmacyName || '') + ' ' + (address || ''));
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query || 'Pharmacy'}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Click to open location in Google Maps"
      className={`group relative bg-gradient-to-br from-[#f0fdf4] to-[#d1fae5] rounded-2xl border-2 border-dashed border-[#a7f3d0] hover:border-[#059669] hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${height} ${className}`}
    >
      {/* Decorative map-like background */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity">
        {[...Array(6)].map((_, i) => (
          <div key={`h${i}`} className="absolute border-t border-[#a7f3d0]" style={{ top: `${(i + 1) * 16.66}%`, left: 0, right: 0 }} />
        ))}
        {[...Array(8)].map((_, i) => (
          <div key={`v${i}`} className="absolute border-l border-[#a7f3d0]" style={{ left: `${(i + 1) * 12.5}%`, top: 0, bottom: 0 }} />
        ))}
      </div>
      
      {/* Demo markers */}
      <div className="absolute top-8 left-12 w-3 h-3 bg-green-500 rounded-full shadow-md animate-pulse-soft" />
      <div className="absolute top-16 right-20 w-3 h-3 bg-amber-500 rounded-full shadow-md" />
      <div className="absolute bottom-12 left-1/3 w-3 h-3 bg-red-500 rounded-full shadow-md" />
      <div className="absolute top-1/2 right-10 w-3 h-3 bg-green-500 rounded-full shadow-md animate-pulse-soft" />
      
      <div className="relative z-10 flex flex-col items-center gap-2 text-center px-6">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-card group-hover:scale-110 transition-transform">
          <MapPin className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <p className="font-bold text-neutral-800 group-hover:text-primary-700 transition-colors flex items-center justify-center gap-1.5">
            {message || 'Interactive Map'}
            <span className="text-xs text-primary-600">↗</span>
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">
            Click to open live navigation in Google Maps
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-600 text-white text-xs font-semibold mt-1 group-hover:bg-primary-700 shadow-sm">
          <span>Open Directions</span>
        </div>
      </div>
    </a>
  );
};

export default MapPlaceholder;
