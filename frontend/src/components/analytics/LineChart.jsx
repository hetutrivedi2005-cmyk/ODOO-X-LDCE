import React from 'react';

export const LineChart = ({ data = [], isLoading, color = '#14b8a6' }) => {
  const width = 500;
  const height = 180;
  const max = Math.max(...data.map(d => d.value), 1);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 w-full">
        <div className="w-10 h-10 rounded-full border-2 border-slate-800 border-t-teal-500 animate-spin" />
        <span className="text-xs text-slate-400 mt-3 animate-pulse">Generating trends...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 w-full border border-dashed border-slate-850 rounded-xl p-4 text-center">
        <span className="text-xs text-slate-400 font-medium">No trend data available</span>
      </div>
    );
  }

  const points = data.map((item, idx) => {
    const x = (idx / (data.length - 1 || 1)) * (width - 60) + 30;
    const y = height - (item.value / max) * (height - 50) - 25;
    return { x, y, label: item.label, value: item.value };
  });

  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${height - 10} L ${points[0].x} ${height - 10} Z`
    : '';

  return (
    <div className="w-full">
      {/* SVG Canvas */}
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

          {/* Line path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-draw-path"
            />
          )}

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#0f172a"
                stroke={color}
                strokeWidth="2.5"
                className="transition-all duration-255 group-hover:r-6"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="10"
                fill={color}
                className="opacity-0 group-hover:opacity-10 transition-opacity"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Axis / Grid Labels */}
      <div className="flex justify-between px-2 pt-2 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
        {data.map((item, idx) => (
          <div key={idx} className="text-center w-12 truncate" title={item.label}>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LineChart;
