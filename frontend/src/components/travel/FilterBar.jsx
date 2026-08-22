import React from 'react';
import { cn } from '../../utils/cn';

export const FilterBar = ({
  mode = 'activities', // or 'cities'
  countries = ['All'],
  selectedCountry = 'All',
  onCountryChange,
  regions = ['All'],
  selectedRegion = 'All',
  onRegionChange,
  selectedCost = 'All',
  onCostChange,
  selectedPopularity = 'Any',
  onPopularityChange,
  // original props (retained for backward compatibility)
  categories = [],
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

  if (mode === 'cities') {
    return (
      <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/30 backdrop-blur-sm w-full', className)}>
        {/* Country Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Country</label>
          <select
            value={selectedCountry}
            onChange={(e) => onCountryChange?.(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none transition-all duration-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            {countries.map((c) => (
              <option key={c} value={c} className="bg-slate-950 text-slate-200">{c}</option>
            ))}
          </select>
        </div>

        {/* Region Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Region</label>
          <select
            value={selectedRegion}
            onChange={(e) => onRegionChange?.(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none transition-all duration-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            {regions.map((r) => (
              <option key={r} value={r} className="bg-slate-950 text-slate-200">{r}</option>
            ))}
          </select>
        </div>

        {/* Cost Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Cost Level</label>
          <select
            value={selectedCost}
            onChange={(e) => onCostChange?.(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none transition-all duration-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="All" className="bg-slate-950 text-slate-200">All</option>
            <option value="Budget" className="bg-slate-950 text-slate-200">Budget (&lt;$35)</option>
            <option value="Moderate" className="bg-slate-950 text-slate-200">Moderate ($35-$70)</option>
            <option value="Premium" className="bg-slate-950 text-slate-200">Premium (&gt;$70)</option>
          </select>
        </div>

        {/* Popularity Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Popularity</label>
          <select
            value={selectedPopularity}
            onChange={(e) => onPopularityChange?.(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none transition-all duration-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="Any" className="bg-slate-950 text-slate-200">Any</option>
            <option value="Popular" className="bg-slate-950 text-slate-200">Popular (&gt;=70%)</option>
            <option value="Very Popular" className="bg-slate-950 text-slate-200">Very Popular (&gt;=90%)</option>
          </select>
        </div>
      </div>
    );
  }

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
