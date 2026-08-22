import React from 'react';
import { Plus, MapPin } from 'lucide-react';
import ItineraryItemCard from './ItineraryItemCard';
import Button from '../ui/Button';

const ItineraryDaySection = ({
  dayNumber,
  date,
  cityNames,
  items,
  tripId,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onMoveUp,
  onMoveDown,
}) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-3.5 pb-6 border-b border-slate-800/80 last:border-0 last:pb-0">
      {/* Day Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-sm shadow-md">
            D{dayNumber}
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Day {dayNumber}
              {date && <span className="text-xs font-semibold text-teal-400">• {formatDate(date)}</span>}
            </h3>
            {cityNames && cityNames.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{cityNames.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={Plus}
          onClick={() => onAddActivity(date)}
          className="text-xs text-teal-300 border-teal-500/30 hover:bg-teal-500/10"
        >
          Add Activity
        </Button>
      </div>

      {/* Activity Cards List for this day */}
      {items && items.length > 0 ? (
        <div className="space-y-3 pl-2 border-l-2 border-slate-800 ml-5 pt-1">
          {items.map((item, idx) => (
            <ItineraryItemCard
              key={item.id || idx}
              item={item}
              tripId={tripId}
              onEdit={onEditActivity}
              onDelete={onDeleteActivity}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              isFirst={idx === 0}
              isLast={idx === items.length - 1}
            />
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400 ml-5">
          No activities planned for this day yet. Click <span className="text-teal-400 font-medium">"+ Add Activity"</span> to schedule your morning, afternoon, or evening plans.
        </div>
      )}
    </div>
  );
};

export default ItineraryDaySection;
