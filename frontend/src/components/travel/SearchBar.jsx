import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search destinations, activities or trips...',
  className = '',
}) => {
  return (
    <div className={cn('relative flex items-center w-full', className)}>
      <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-teal-500/80 focus:bg-slate-900/80 focus:ring-4 focus:ring-teal-500/10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          onClick={() => onChange('')}
          type="button"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
