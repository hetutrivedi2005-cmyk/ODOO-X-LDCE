import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

export const LineChart = ({ data = [], isLoading, color = '#3b82f6' }) => {
  const { user } = useAuth();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const width = 600;
  const height = 240;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 w-full bg-slate-950/10 rounded-2xl">
        <div className="w-10 h-10 rounded-full border-2 border-slate-800 border-t-blue-500 animate-spin" />
        <span className="text-xs text-slate-400 mt-3 animate-pulse">Generating spending trends...</span>
      </div>
    );
  }

  // Handle empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 w-full border border-dashed border-slate-850 rounded-2xl p-6 text-center bg-slate-950/20">
        <span className="text-xs text-slate-400 font-bold mb-1">No spending data yet</span>
        <span className="text-[10px] text-slate-500">Add expenses to your trips to see spending trends here.</span>
      </div>
    );
  }

  // Map user's preferred currency to its display symbol
  const getCurrencySymbol = (code) => {
    const symbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'AUD': 'A$',
      'CAD': 'C$',
      'SGD': 'S$',
      'AED': 'AED '
    };
    return symbols[code] || '₹';
  };

  const currencySymbol = getCurrencySymbol(user?.currency || 'INR');

  // Format currency helper
  const formatCurrency = (val) => {
    return `${currencySymbol}${Math.round(val).toLocaleString()}`;
  };

  // Prepend a starting zero point if only one data point is present to prevent empty/broken chart rendering
  let chartData = [...data];
  if (chartData.length === 1) {
    const singlePoint = chartData[0];
    chartData = [
      { label: 'Start', value: 0 },
      singlePoint
    ];
  }

  const values = chartData.map(d => Number(d.value) || 0);
  const maxVal = Math.max(...values, 1);

  // Calculate coordinates for SVG paths and points
  const points = chartData.map((item, idx) => {
    const totalSlots = chartData.length - 1 || 1;
    const x = paddingLeft + (idx / totalSlots) * (width - paddingLeft - paddingRight);
    // Invert Y coordinate so 0 value sits on the bottom padding line
    const y = height - paddingBottom - (item.value / maxVal) * (height - paddingTop - paddingBottom);
    return {
      x,
      y,
      label: item.label,
      value: item.value,
      isPadded: chartData.length === 2 && idx === 0 // Mark prepended baseline starting point
    };
  });

  // SVG Paths
  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
    : '';

  // Generate grid lines
  const gridLines = [];
  const divisions = 4;
  for (let i = 0; i <= divisions; i++) {
    const gridY = paddingTop + (i / divisions) * (height - paddingTop - paddingBottom);
    const gridVal = maxVal - (i / divisions) * maxVal;
    gridLines.push({ y: gridY, val: gridVal });
  }

  const handleMouseMove = (e, index) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setHoveredIndex(index);
  };

  return (
    <div className="w-full relative">
      {/* SVG Canvas */}
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible select-none">
          <defs>
            <linearGradient id="spendingAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {gridLines.map((line, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={line.y}
                x2={width - paddingRight}
                y2={line.y}
                stroke="#e6ebef"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              {/* Y Axis Labels */}
              <text
                x={paddingLeft - 10}
                y={line.y + 3.5}
                textAnchor="end"
                className="fill-slate-400 text-[9px] font-bold tracking-wider"
              >
                {formatCurrency(line.val)}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#spendingAreaGrad)"
              className="transition-all duration-300"
            />
          )}

          {/* Line Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          )}

          {/* X Axis Baseline */}
          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="#e6ebef"
            strokeWidth="1"
          />

          {/* Data Circles & Hover Target Areas */}
          {points.map((p, idx) => {
            // Hide circle dots for padded starting baseline points
            if (p.isPadded) return null;

            return (
              <g
                key={idx}
                onMouseEnter={(e) => handleMouseMove(e, idx)}
                onMouseMove={(e) => handleMouseMove(e, idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Active hover vertical grid line */}
                {hoveredIndex === idx && (
                  <line
                    x1={p.x}
                    y1={paddingTop}
                    x2={p.x}
                    y2={height - paddingBottom}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Data point circle dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIndex === idx ? "6.5" : "4.5"}
                  fill="#ffffff"
                  stroke={color}
                  strokeWidth="2.5"
                  className="transition-all duration-150"
                />

                {/* Pulsing overlay circle on hover */}
                {hoveredIndex === idx && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="12"
                    fill={color}
                    className="opacity-15 animate-ping"
                  />
                )}

                {/* Large invisible circle for easy hover activation */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="25"
                  fill="transparent"
                  className="opacity-0"
                />
              </g>
            );
          })}

          {/* X-Axis Labels */}
          {points.map((p, idx) => {
            if (p.isPadded) return null;
            return (
              <text
                key={idx}
                x={p.x}
                y={height - paddingBottom + 18}
                textAnchor="middle"
                className="fill-slate-400 text-[9px] font-black uppercase tracking-widest"
              >
                {p.label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredIndex !== null && points[hoveredIndex] && !points[hoveredIndex].isPadded && (
        <div
          className="absolute z-50 bg-white border border-slate-800 text-[11px] p-2.5 rounded-xl shadow-lg pointer-events-none flex flex-col gap-0.5 min-w-[120px] transition-all duration-75"
          style={{
            left: `${mousePos.x + 12}px`,
            top: `${mousePos.y - 45}px`,
          }}
        >
          <span className="text-slate-400 font-bold tracking-wide uppercase">
            {points[hoveredIndex].label}
          </span>
          <span className="font-extrabold text-teal-500">
            Total: {formatCurrency(points[hoveredIndex].value)}
          </span>
        </div>
      )}
    </div>
  );
};

export default LineChart;
