import React from 'react';

export const BarChart = ({ data = [], isLoading }) => {
  const max = Math.max(...data.map(d => d.value), 1);

  if (isLoading) {
    return (
      <div className="space-y-4 py-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-20 bg-slate-800 rounded animate-pulse" />
              <div className="h-3 w-10 bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 w-full border border-dashed border-slate-850 rounded-xl p-4 text-center">
        <span className="text-xs text-slate-400 font-medium">No details available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item, idx) => {
        const percentage = (item.value / max) * 100;
        return (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">{item.label}</span>
              <span className="text-white font-bold">{item.value.toLocaleString()}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-900 flex">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color || '#14b8a6'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BarChart;
