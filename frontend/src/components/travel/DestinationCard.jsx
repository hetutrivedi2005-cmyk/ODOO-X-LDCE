import React, { useState, useEffect } from 'react';
import { Star, MapPin } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import CostDisplay from './CostDisplay';
import { cn } from '../../utils/cn';
import pexelsService from '../../services/pexelsService';

export const DestinationCard = ({
  city,
  onClick,
  onViewClick,
  onAddToTripClick,
  className = '',
}) => {
  const { id, name, country, region, costIndex, popularity, image } = city;
  
  const [imageUrl, setImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchImage = async () => {
      setImageLoading(true);
      const url = await pexelsService.getDestinationImage(name, country, image);
      if (active) {
        setImageUrl(url);
        setImageLoading(false);
      }
    };
    fetchImage();
    return () => {
      active = false;
    };
  }, [name, country, image]);

  const renderStars = (rating) => {
    const stars = [];
    const clampedRating = Math.min(Math.max(Math.round(rating), 1), 5);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={cn(
            "w-3.5 h-3.5",
            i < clampedRating ? "fill-amber-400 text-amber-400" : "text-slate-700 fill-slate-800"
          )}
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  return (
    <Card
      hoverEffect
      className={cn('flex flex-col group cursor-pointer border-slate-800 bg-slate-900/50', className)}
      onClick={() => onClick?.(id)}
    >
      {/* Image Overlay */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        {imageLoading ? (
          <div className="w-full h-full bg-slate-900/60 animate-pulse flex items-center justify-center text-slate-500">
            <span className="text-[10px] tracking-widest uppercase font-semibold">Loading Image...</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80';
            }}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 border border-teal-500/30 text-teal-400 backdrop-blur-sm shadow-md">
            {country}
          </span>
        </div>
      </div>

      <CardContent className="flex flex-col flex-grow p-5">
        <div className="flex-grow">
          <h4 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 group-hover:text-teal-400 transition-colors">
            {name}
          </h4>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
            <MapPin className="w-3.5 h-3.5 text-teal-500" />
            <span>{region}</span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 mt-3 leading-relaxed">
            Experience the culture, culinary delights, and sights in the beautiful city of {name}, {country}.
          </p>
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-800/60">
          <div>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Popularity</span>
            {renderStars(popularity)}
          </div>
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Cost Index</span>
            <CostDisplay costIndex={costIndex} />
          </div>
        </div>

        {(onViewClick || onAddToTripClick) && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800/60">
            {onViewClick && (
              <button
                type="button"
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-850 hover:bg-slate-800 text-slate-350 hover:text-white border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-center active:scale-[0.98]"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewClick(id);
                }}
              >
                View
              </button>
            )}
            {onAddToTripClick && (
              <button
                type="button"
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 shadow-md shadow-teal-500/10 hover:shadow-teal-500/20 active:scale-[0.98] transition-all cursor-pointer text-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToTripClick(city);
                }}
              >
                Add to Trip
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DestinationCard;
