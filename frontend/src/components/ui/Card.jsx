import React from 'react';
import { cn } from '../../utils/cn';

export const Card = React.forwardRef(({ className, children, hoverEffect = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-xl overflow-hidden transition-all duration-300',
      hoverEffect && 'hover:border-slate-700 hover:shadow-2xl hover:shadow-teal-500/5 hover:-translate-y-0.5',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

export const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pb-4 border-b border-slate-800/60', className)} {...props}>
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3 ref={ref} className={cn('text-lg font-semibold tracking-tight text-white', className)} {...props}>
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <p ref={ref} className={cn('text-xs text-slate-400 mt-1 leading-relaxed', className)} {...props}>
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('p-6', className)} {...props}>
    {children}
  </div>
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-4 border-t border-slate-800/60 bg-slate-950/30 flex items-center justify-between', className)} {...props}>
    {children}
  </div>
));
CardFooter.displayName = 'CardFooter';
