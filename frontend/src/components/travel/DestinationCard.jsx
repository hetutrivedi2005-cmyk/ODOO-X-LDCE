import React from 'react';
import { Star, MapPin } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import CostDisplay from './CostDisplay';
import { cn } from '../../utils/cn';

export const DestinationCard = ({
  city,
  onClick,
  className = '',
}) => {
  const { id, name, country, region, costIndex, popularity, image } = city;

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
        <img
          src={image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80'}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
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
      </CardContent>
    </Card>
  );
};

export default DestinationCard;
