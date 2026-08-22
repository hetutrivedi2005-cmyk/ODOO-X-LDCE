import React from 'react';
import { Compass } from 'lucide-react';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

const EmptyState = ({
  icon: Icon = Compass,
  title = 'No items found',
  description = 'There is nothing to display here yet.',
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 backdrop-blur-sm',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4 shadow-lg shadow-teal-500/5">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
