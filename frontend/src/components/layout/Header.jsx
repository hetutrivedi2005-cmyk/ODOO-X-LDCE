import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, Menu, Globe, Compass } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const Header = ({ onOpenMobileMenu }) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Left side: Mobile menu toggle & Title/Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="md:hidden flex items-center gap-2 mr-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-bold shrink-0">
            <Globe className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-bold text-sm text-white">GlobeTrotter</span>
        </div>

        {/* Global Search Bar */}
        <div className="hidden sm:flex items-center relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search trips, destinations, itineraries..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="sm"
          leftIcon={Plus}
          onClick={() => navigate('/trips/new')}
          className="hidden sm:inline-flex"
        >
          New Trip
        </Button>

        {/* Notifications Icon */}
        <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-400" />
        </button>

        {/* Profile Pill */}
        <NavLink
          to="/profile"
          className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-900/80 hover:bg-slate-800 transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-bold text-xs text-slate-950">
            JD
          </div>
          <span className="hidden md:inline text-xs font-medium text-slate-200">Jane</span>
          <Badge variant="primary" className="hidden lg:inline-flex text-[10px] py-0 px-1.5">
            Active
          </Badge>
        </NavLink>
      </div>
    </header>
  );
};

export default Header;
