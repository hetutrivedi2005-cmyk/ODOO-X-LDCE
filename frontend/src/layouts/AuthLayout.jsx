import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Globe, Compass, ShieldCheck } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-teal-500 selection:text-white">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-bold text-slate-950 shadow-xl shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Globe className="w-6 h-6 text-slate-950" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-2xl font-black tracking-tight text-white">GlobeTrotter</span>
            <span className="text-xs text-teal-400 font-medium">Smart Travel Companion</span>
          </div>
        </Link>
      </div>

      {/* Main Form Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <Outlet />
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500" /> Secure SSL
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-teal-500" /> AI Travel Engine
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
