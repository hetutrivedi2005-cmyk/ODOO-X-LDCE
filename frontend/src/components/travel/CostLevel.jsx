import React from 'react';
import { cn } from '../../utils/cn';

export const CostLevel = ({ level, alignRight = false, className = '' }) => {
  let normalizedLevel = Number(level);
  
  if (level === undefined || level === null || isNaN(normalizedLevel)) {
    return (
      <span className="text-xs text-slate-450 font-medium">Cost Level N/A</span>
    );
  }

  // Map 1-100 values to 1-5 scales if needed
  if (normalizedLevel > 5) {
    normalizedLevel = Math.ceil(normalizedLevel / 20);
  }
  normalizedLevel = Math.min(Math.max(normalizedLevel, 1), 5);

  const LABELS = {
    1: 'Budget',
    2: 'Affordable',
    3: 'Moderate',
    4: 'Premium',
    5: 'Luxury',
  };

  const label = LABELS[normalizedLevel];

  // Render 5 visual indicator dots
  const dots = [];
  for (let i = 1; i <= 5; i++) {
    dots.push(
      <span
        key={i}
        className={cn(
          "inline-block w-2.5 h-2.5 rounded-full transition-all border",
          i <= normalizedLevel
            ? "bg-teal-500 border-teal-500"
            : "bg-slate-800 border-slate-800"
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-1 select-none',
        alignRight ? 'items-end text-right' : 'items-start text-left',
        className
      )}
      aria-label={`Cost level: ${label}`}
    >
      <div className="flex items-center gap-1.5 h-3.5">
        {dots}
      </div>
      <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">
        {label}
      </span>
    </div>
  );
};

export default CostLevel;
