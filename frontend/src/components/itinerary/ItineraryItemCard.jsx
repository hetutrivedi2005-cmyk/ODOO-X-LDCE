import React from 'react';
import { Clock, MapPin, Edit2, Trash2, Tag } from 'lucide-react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const ItineraryItemCard = ({ item, onEdit, onDelete }) => {
  const formatTimeRange = (start, end) => {
    if (!start && !end) return 'Anytime';
    if (start && end) return `${start} — ${end}`;
    return start || end;
  };

  return (
    <Card hoverEffect className="p-4 sm:p-5 border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left Section: Time & Details */}
        <div className="flex items-start gap-3 sm:gap-4 flex-1">
          {/* Time Badge Pill */}
          <div className="px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 font-semibold text-xs shrink-0 flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimeRange(item.startTime, item.endTime)}</span>
          </div>

          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-bold text-white tracking-tight leading-snug">{item.title}</h4>
              {item.cityName && (
                <Badge variant="primary" icon={Tag} className="text-[10px]">
                  {item.cityName}
                </Badge>
              )}
            </div>

            {item.description && (
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{item.description}</p>
            )}

            {item.location && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="truncate">{item.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
          <Button
            variant="secondary"
            size="sm"
            aria-label="Edit Activity"
            onClick={() => onEdit(item)}
            className="p-2 h-8 text-xs"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-300" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label="Delete Activity"
            onClick={() => onDelete(item)}
            className="p-2 h-8 text-xs hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-400"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ItineraryItemCard;
