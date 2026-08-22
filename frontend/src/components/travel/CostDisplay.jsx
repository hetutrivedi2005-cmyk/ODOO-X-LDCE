import React from 'react';
import { cn } from '../../utils/cn';

export const CostDisplay = ({
  amount,
  currency = '$',
  costIndex,
  className = '',
}) => {
  const renderCostIndex = (index) => {
    const clampedIndex = Math.min(Math.max(index, 1), 5);
    const active = currency.repeat(clampedIndex);
    const inactive = currency.repeat(5 - clampedIndex);
    return (
      <span className="inline-flex">
        <span className="text-amber-500 font-semibold tracking-wider">{active}</span>
        <span className="text-slate-700 tracking-wider">{inactive}</span>
      </span>
    );
  };

  const formatAmount = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === '$' ? 'USD' : currency,
      maximumFractionDigits: 0,
    })
      .format(val)
      .replace('USD', '$');
  };

  return (
    <div className={cn('inline-flex items-center text-sm font-medium text-slate-200', className)}>
      {costIndex !== undefined && renderCostIndex(costIndex)}
      {costIndex !== undefined && amount !== undefined && (
        <span className="mx-2 text-slate-700">•</span>
      )}
      {amount !== undefined && (
        <span className="text-teal-400 font-semibold">{formatAmount(amount)}</span>
      )}
    </div>
  );
};

export default CostDisplay;
