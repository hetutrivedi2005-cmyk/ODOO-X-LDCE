import React from 'react';
import { cn } from '../../utils/cn';

const PageContainer = ({ title, subtitle, actions, children, className }) => {
  return (
    <div className={cn('p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 pb-24 md:pb-12', className)}>
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            {title && <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{title}</h1>}
            {subtitle && <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default PageContainer;
