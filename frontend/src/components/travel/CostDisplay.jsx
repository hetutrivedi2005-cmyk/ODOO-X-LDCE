import React from 'react';
import CostLevel from './CostLevel';

export const CostDisplay = ({ costIndex, amount, className = '', alignRight = false }) => {
  const value = costIndex !== undefined && costIndex !== null ? costIndex : amount;
  return (
    <CostLevel level={value} alignRight={alignRight} className={className} />
  );
};

export default CostDisplay;
