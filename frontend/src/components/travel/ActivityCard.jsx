import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import CostDisplay from './CostDisplay';
import { cn } from '../../utils/cn';

export const ActivityCard = ({
  activity,
  onClick,
  className = '',
}) => {
  const { id, name, description, category, duration, estimatedCost, image } = activity;

  const formatDuration = (mins) => {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours === 0) return `${remainingMins}m`;
    if (remainingMins === 0) return `${hours}h`;
    return `${hours}h ${remainingMins}m`;
  };

  const getBadgeVariant = (cat) => {
    const lower = cat.toLowerCase();
    if (lower.includes('food') || lower.includes('dining')) return 'warning';
    if (lower.includes('adventure') || lower.includes('outdoor')) return 'danger';
    if (lower.includes('culture') || lower.includes('history')) return 'success';
    if (lower.includes('relax') || lower.includes('nature')) return 'info';
    return 'primary';
  };

  return (
    <Card
      hoverEffect
      className={cn('flex flex-col group cursor-pointer border-slate-800 bg-slate-900 shadow-[0_4px_20px_rgba(15,23,42,0.04)]', className)}
      onClick={() => onClick?.(id)}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        <img
          src={image || 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=600&q=80'}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <Badge variant={getBadgeVariant(category)}>{category}</Badge>
        </div>
      </div>

      <CardContent className="flex flex-col flex-grow p-5">
        <div className="flex-grow">
          <h4 className="text-sm font-bold text-slate-100 truncate group-hover:text-teal-500 transition-colors">
            {name}
          </h4>
          <div className="flex items-center gap-1.5 text-xs text-slate-350 mt-1">
            <Clock className="w-3.5 h-3.5 text-teal-500" />
            <span>{formatDuration(duration)}</span>
          </div>
          <p className="text-xs text-slate-350 line-clamp-2 mt-3 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-800">
          <span className="text-xs font-bold text-slate-400">Estimated Cost</span>
          <CostDisplay amount={estimatedCost} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
