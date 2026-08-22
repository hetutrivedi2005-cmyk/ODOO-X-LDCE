import React from 'react';
import { Card, CardContent } from '../ui/Card';

export const KpiCard = ({ label, value, icon: Icon, color = 'text-teal-400', context, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-2.5 flex-1">
            <div className="h-3 w-16 bg-slate-800 rounded animate-pulse" />
            <div className="h-6 w-24 bg-slate-800 rounded animate-pulse" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800/60 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card hoverEffect>
      <CardContent className="p-5 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-450">{label}</span>
          <div className="text-2xl font-black text-white">{value}</div>
          {context && <p className="text-[10px] text-slate-400 font-medium">{context}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center shrink-0">
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
