import React, { useState, useEffect } from 'react';
import { Star, MapPin } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import CostLevel from './CostLevel';
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
            i < clampedRating ? "fill-amber-500 text-amber-500" : "text-slate-800 fill-slate-800"
          )}
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  return (
    <Card
      hoverEffect
      className={cn('flex flex-col group cursor-pointer border-slate-800 bg-slate-900 shadow-[0_4px_20px_rgba(15,23,42,0.04)]', className)}
      onClick={() => onClick?.(id)}
    >
      {/* Image Overlay */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        {imageLoading ? (
          <div className="w-full h-full bg-slate-950 animate-pulse flex items-center justify-center text-slate-500">
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/90 text-slate-100 shadow-sm border border-slate-800">
            {country}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500 text-white shadow-sm">
            {city.popularity ? `${(city.popularity / 20).toFixed(1)} ★` : 'N/A'}
          </span>
        </div>
      </div>

      <CardContent className="flex flex-col flex-grow p-5">
        <div className="flex-grow">
          <h4 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2 group-hover:text-teal-500 transition-colors">
            {name}
          </h4>
          <div className="flex items-center gap-1 text-xs text-slate-350 mt-1">
            <MapPin className="w-3.5 h-3.5 text-teal-500" />
            <span>{region}</span>
          </div>
          <p className="text-xs text-slate-350 line-clamp-2 mt-3 leading-relaxed">
            Experience the culture, culinary delights, and sights in the beautiful city of {name}, {country}.
          </p>
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-800">
          <div>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Trip Rating</span>
            {renderStars(popularity)}
            <span className="block text-[10px] font-semibold text-slate-350 mt-1 text-left">
              {city.popularity ? `${(city.popularity / 20).toFixed(1)} / 5` : 'N/A'}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Cost Level</span>
            <CostLevel level={costIndex} alignRight />
          </div>
        </div>

        {(onViewClick || onAddToTripClick) && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
            {onViewClick && (
              <button
                type="button"
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-slate-100 border border-slate-800 transition-all cursor-pointer text-center active:scale-[0.98]"
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
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-teal-500 text-white hover:bg-teal-600 shadow-md shadow-teal-500/10 hover:shadow-teal-500/20 active:scale-[0.98] transition-all cursor-pointer text-center border border-teal-500 hover:border-teal-600"
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
