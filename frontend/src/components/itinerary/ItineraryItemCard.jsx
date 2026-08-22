import React, { useState } from 'react';
import { Clock, MapPin, Edit2, Trash2, Tag, ChevronUp, ChevronDown, Plus, Check, ListTodo } from 'lucide-react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import itineraryService from '../../services/itineraryService';

const ItineraryItemCard = ({ item, tripId, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const [subActivities, setSubActivities] = useState(item.activities || []);
  const [showAddSub, setShowAddSub] = useState(false);
  const [newSubTitle, setNewSubTitle] = useState('');
  const [isAddingSub, setIsAddingSub] = useState(false);

  const formatTimeRange = (start, end) => {
    if (!start && !end) return 'Anytime';
    if (start && end) return `${start} — ${end}`;
    return start || end;
  };

  const handleAddSubActivitySubmit = async (e) => {
    e.preventDefault();
    if (!newSubTitle.trim()) return;

    setIsAddingSub(true);
    try {
      const created = await itineraryService.addSubActivity(tripId, item.id, {
        title: newSubTitle.trim(),
      });
      setSubActivities((prev) => [...prev, created]);
      setNewSubTitle('');
      setShowAddSub(false);
    } catch (err) {
      console.error('Failed to add sub-activity:', err);
    } finally {
      setIsAddingSub(false);
    }
  };

  const handleDeleteSubActivity = async (subId) => {
    try {
      await itineraryService.deleteSubActivity(tripId, item.id, subId);
      setSubActivities((prev) => prev.filter((s) => String(s.id) !== String(subId)));
    } catch (err) {
      console.error('Failed to delete sub-activity:', err);
    }
  };

  return (
    <Card hoverEffect className="p-4 sm:p-5 border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left Section: Order controls & Time & Details */}
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Reorder Buttons */}
          <div className="flex flex-col gap-1 items-center shrink-0 pt-0.5">
            <button
              onClick={() => onMoveUp(item)}
              disabled={isFirst}
              className="p-1 rounded bg-slate-800/80 border border-slate-700/80 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
              title="Move Up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onMoveDown(item)}
              disabled={isLast}
              className="p-1 rounded bg-slate-800/80 border border-slate-700/80 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
              title="Move Down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Time Badge Pill */}
          <div className="px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 font-semibold text-xs shrink-0 flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimeRange(item.startTime, item.endTime)}</span>
          </div>

          {/* Details */}
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

            {/* Sub-activities List */}
            {subActivities && subActivities.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <ListTodo className="w-3 h-3 text-teal-400" /> Sub-tasks / Checkpoints ({subActivities.length}):
                </span>
                <div className="space-y-1 pl-1">
                  {subActivities.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/50 px-2.5 py-1 rounded-lg border border-slate-800/60 group"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <Check className="w-3 h-3 text-teal-400 shrink-0" />
                        <span className="truncate">{sub.title || sub.name || 'Sub-activity'}</span>
                      </span>
                      <button
                        onClick={() => handleDeleteSubActivity(sub.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-0.5"
                        title="Delete sub-task"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Sub-activity Inline Form */}
            {showAddSub ? (
              <form onSubmit={handleAddSubActivitySubmit} className="mt-2.5 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Buy entrance tickets, take photo..."
                  value={newSubTitle}
                  onChange={(e) => setNewSubTitle(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-teal-500"
                  autoFocus
                />
                <Button variant="primary" size="sm" type="submit" isLoading={isAddingSub} className="py-1 px-2.5 text-xs">
                  Save
                </Button>
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddSub(false)} className="py-1 px-2 text-xs">
                  Cancel
                </Button>
              </form>
            ) : (
              <button
                onClick={() => setShowAddSub(true)}
                className="mt-2 text-[11px] text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add sub-task / checkpoint
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Edit & Delete Buttons */}
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
