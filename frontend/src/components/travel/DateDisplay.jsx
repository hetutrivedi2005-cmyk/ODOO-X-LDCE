import React from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';

export const DateDisplay = ({
  dateString,
  endDateString,
  showIcon = true,
  className = '',
}) => {
  const formatDate = (str) => {
    try {
      const date = new Date(str);
      if (isNaN(date.getTime())) return str;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return str;
    }
  };

  const formattedStart = formatDate(dateString);
  const formattedEnd = endDateString ? formatDate(endDateString) : null;

  return (
    <div className={cn('inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium', className)}>
      {showIcon && <Calendar className="w-3.5 h-3.5 text-teal-500" />}
      <span>
        {formattedEnd ? `${formattedStart} - ${formattedEnd}` : formattedStart}
      </span>
    </div>
  );
};

export default DateDisplay;
