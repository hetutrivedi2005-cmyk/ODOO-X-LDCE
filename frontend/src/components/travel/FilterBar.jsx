import React from 'react';
import { cn } from '../../utils/cn';

export const FilterBar = ({
  categories,
  selectedCategory = 'All',
  onCategoryChange,
  selectedCostIndex,
  onCostIndexChange,
  className = '',
}) => {
  const handleCostClick = (index) => {
    if (!onCostIndexChange) return;
    if (selectedCostIndex === index) {
      onCostIndexChange(undefined); // Toggle off
    } else {
      onCostIndexChange(index);
    }
  };

  return (
    <div className={cn('flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-xl border border-slate-850 bg-slate-900/30 backdrop-blur-sm w-full', className)}>
      {/* Category List */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Category Filter</span>
        <div className="flex flex-wrap gap-1.5">
          {['All', ...categories].map((category) => (
            <button
              key={category}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer',
                selectedCategory === category
                  ? 'bg-teal-500 border-teal-500 text-slate-950 shadow-lg shadow-teal-500/10 font-semibold'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              )}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Cost Index Selector */}
      {onCostIndexChange && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Cost Level</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((index) => (
              <button
                key={index}
                className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs border transition-all cursor-pointer',
                  selectedCostIndex === index
                    ? 'bg-amber-500 border-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/15'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-750 hover:text-slate-200'
                )}
                onClick={() => handleCostClick(index)}
                title={`Filter by Cost Index: ${index}`}
                aria-label={`Filter by Cost Index ${index}`}
              >
                {'$'.repeat(1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
