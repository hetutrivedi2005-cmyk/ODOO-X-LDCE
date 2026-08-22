import React from 'react';
import { Loader2, Compass } from 'lucide-react';
import { cn } from '../../utils/cn';

const LoadingState = ({ message = 'Loading your travel details...', fullScreen = false, className }) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center animate-fade-in',
        fullScreen ? 'min-h-screen bg-slate-950 text-slate-100' : 'min-h-[250px] w-full',
        className
      )}
    >
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-teal-500/20 border-t-teal-500 animate-spin" />
        <Compass className="w-6 h-6 text-teal-400 absolute animate-pulse" />
      </div>
      <p className="text-sm font-medium text-slate-300 tracking-wide">{message}</p>
      <p className="text-xs text-slate-500 mt-1">Preparing your journey</p>
    </div>
  );
};

export default LoadingState;
