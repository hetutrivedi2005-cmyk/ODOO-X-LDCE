import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import DateDisplay from './DateDisplay';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

export const TripCard = ({
  trip,
  onClick,
  className = '',
}) => {
  const { id, name, description, startDate, endDate, coverImage } = trip;

  return (
    <Card
      hoverEffect
      className={cn('flex flex-col group cursor-pointer border-slate-800 bg-slate-900/50', className)}
      onClick={() => onClick?.(id)}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        <img
          src={coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 backdrop-blur-sm shadow-md">
            Trip Plan
          </span>
        </div>
      </div>

      <CardContent className="flex flex-col flex-grow p-5">
        <div className="flex-grow">
          <h4 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 group-hover:text-teal-400 transition-colors">
            {name}
          </h4>
          <div className="mt-1">
            <DateDisplay dateString={startDate} endDateString={endDate} />
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 mt-3 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex justify-end mt-5">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 gap-1"
            onClick={(e) => {
              if (onClick) {
                e.stopPropagation();
                onClick(id);
              }
            }}
          >
            <span>View Itinerary</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripCard;
