import React from 'react';

export const DonutChart = ({ data = [], isLoading }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const circum = 2 * Math.PI * 50; // radius = 50 -> 314.16

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 w-full">
        <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-teal-500 animate-spin" />
        <span className="text-xs text-slate-400 mt-4 animate-pulse">Loading breakdown...</span>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 w-full border border-dashed border-slate-850 rounded-xl p-4 text-center">
        <span className="text-xs text-slate-400 font-medium">No segment data available</span>
      </div>
    );
  }

  const segments = [];
  let accumulatedPercentage = 0;
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const percentage = item.value / total;
    const strokeDashoffset = circum - (circum * percentage);
    const rotation = accumulatedPercentage * 360 - 90;
    accumulatedPercentage += percentage;
    segments.push({
      ...item,
      percentage,
      strokeDashoffset,
      rotation
    });
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
      {/* SVG Donut */}
      <div className="relative w-36 h-36 shrink-0">
        <svg viewBox="0 0 120 120" className="w-full h-full transform -scale-x-100">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="transparent"
            stroke="#0f172a"
            strokeWidth="10"
          />
          {segments.map((seg, idx) => (
            <circle
              key={idx}
              cx="60"
              cy="60"
              r="50"
              fill="transparent"
              stroke={seg.color}
              strokeWidth="10"
              strokeDasharray={circum}
              strokeDashoffset={seg.strokeDashoffset}
              transform={`rotate(${seg.rotation} 60 60)`}
              strokeLinecap={seg.percentage === 1 ? 'butt' : 'round'}
              className="transition-all duration-300 hover:stroke-[12] cursor-pointer"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
          <span className="text-sm font-extrabold text-white">
            {total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Legends */}
      <div className="flex-1 space-y-2.5 w-full">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-slate-350 font-medium">{seg.label}</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-white mr-1.5">{seg.value.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400">({Math.round(seg.percentage * 100)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
