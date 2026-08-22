import React from 'react';
import { cn } from '../../utils/cn';

export const CostDisplay = ({
  costIndex,
  className = '',
  alignRight = false,
}) => {
  // If costIndex is undefined, null, or invalid, render a fallback message
  if (costIndex === undefined || costIndex === null || isNaN(Number(costIndex))) {
    return (
      <div className={cn('text-xs text-slate-500 font-medium', className)}>
        Cost information unavailable
      </div>
    );
  }

  // Map 1-100 percentage values to 1-5 scales if needed
  let level = Number(costIndex);
  if (level > 5) {
    level = Math.ceil(level / 20);
  }
  // Clamp level safely
  level = Math.min(Math.max(level, 1), 5);

  const LABELS = {
    1: 'Budget',
    2: 'Affordable',
    3: 'Moderate',
    4: 'Premium',
    5: 'Luxury',
  };

  const TOOLTIPS = {
    1: 'Budget — lower accommodation, dining, and activity costs',
    2: 'Affordable — budget-friendly choices and value options available',
    3: 'Moderate — average lodging, dining, and standard activity costs',
    4: 'Premium — higher accommodation, food, and activity costs',
    5: 'Luxury — premium/high-end accommodation, fine dining, and exclusive activities',
  };

  const label = LABELS[level];
  const tooltipText = TOOLTIPS[level];

  // Render 5 visual indicator segments/dots
  const dots = [];
  for (let i = 1; i <= 5; i++) {
    dots.push(
      <span
        key={i}
        className={cn(
          "inline-block w-2.5 h-2.5 rounded-full border border-slate-700 transition-all",
          i <= level
            ? "bg-teal-400 border-teal-400/80 shadow-[0_0_6px_rgba(45,212,191,0.3)]"
            : "bg-slate-900"
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
      title={tooltipText}
      aria-label={`Cost level: ${label}`}
    >
      {/* 5-dot visual scale */}
      <div className="flex items-center gap-1.5 h-3.5">
        {dots}
      </div>
      {/* Category text label */}
      <span className="text-[11px] font-semibold text-slate-350 tracking-wide uppercase">
        {label}
      </span>
    </div>
  );
};

export default CostDisplay;
