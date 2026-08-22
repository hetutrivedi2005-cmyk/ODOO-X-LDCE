import React from 'react';
import { X, MapPin, Star, Globe, Languages, DollarSign } from 'lucide-react';
import CostDisplay from './CostDisplay';
import { cn } from '../../utils/cn';

export const CityDetailsModal = ({
  city,
  isOpen,
  onClose,
  onAddToTrip,
}) => {
  if (!isOpen || !city) return null;

  const { name, country, region, costIndex, popularity, image, description, currency, language } = city;

  // Map 1-100 values to 1-5 values for display stars and cost indicators
  const displayCostIndex = Math.ceil(costIndex / 20);
  const displayPopularity = Math.ceil(popularity / 20);

  const renderStars = (rating) => {
    const stars = [];
    const clampedRating = Math.min(Math.max(Math.round(rating), 1), 5);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={cn(
            "w-4 h-4",
            i < clampedRating ? "fill-amber-400 text-amber-400" : "text-slate-750 fill-slate-800"
          )}
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      {/* Click outside to close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Modal Box */}
      <div className="bg-slate-900 border border-slate-800 max-w-xl w-full rounded-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh] md:max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/60 hover:bg-slate-950/95 border border-slate-800 text-slate-350 hover:text-white transition-all cursor-pointer z-20 shadow-md"
          aria-label="Close details"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Image Section */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
          <img
            src={image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent" />
          
          {/* Header Title */}
          <div className="absolute bottom-5 left-5 right-5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 border border-teal-500/30 text-teal-400 backdrop-blur-sm mb-2 shadow-sm">
              {country}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
              {name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1 drop-shadow">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>{region}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-grow flex flex-col gap-6">
          
          {/* Cost and Popularity Row */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <div>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Popularity Rating</span>
              <div className="flex items-center gap-2">
                {renderStars(displayPopularity)}
                <span className="text-xs text-slate-400 font-semibold">{popularity}%</span>
              </div>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Cost Standard</span>
              <div className="flex items-center gap-2">
                <CostDisplay costIndex={displayCostIndex} />
                <span className="text-xs text-slate-400 font-semibold">({costIndex}/100)</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1.5 mb-2.5">
              About the Destination
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Practical Info Row */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1.5 mb-3">
              Travel Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
                <Globe className="w-4 h-4 text-teal-400 shrink-0" />
                <div className="overflow-hidden">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-500">Region</span>
                  <span className="block text-xs font-semibold text-white truncate">{region}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
                <Languages className="w-4 h-4 text-teal-400 shrink-0" />
                <div className="overflow-hidden">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-500">Language</span>
                  <span className="block text-xs font-semibold text-white truncate">{language || 'English'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
                <DollarSign className="w-4 h-4 text-teal-400 shrink-0" />
                <div className="overflow-hidden">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-500">Currency</span>
                  <span className="block text-xs font-semibold text-white truncate">{currency || 'USD'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800/80 bg-slate-950/20 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold bg-transparent border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300 hover:text-white transition-all cursor-pointer text-center"
          >
            Close Details
          </button>
          <button
            type="button"
            onClick={() => {
              onAddToTrip(city);
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 shadow-lg shadow-teal-500/10 hover:shadow-teal-500/25 transition-all cursor-pointer text-center active:scale-[0.98]"
          >
            Add to Trip
          </button>
        </div>

      </div>
    </div>
  );
};

export default CityDetailsModal;
