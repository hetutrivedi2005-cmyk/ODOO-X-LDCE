import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { X, Globe, LogOut, Sparkles } from 'lucide-react';
import { navItems } from './Sidebar';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

const MobileNav = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'GT';
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Bottom Navigation Bar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl z-40 px-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path) && item.path !== '/trips/new');

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive: isExactActive }) => {
                const active = item.path === '/trips/new' ? isExactActive : isActive;
                return cn(
                  'flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all',
                  active ? 'text-teal-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                );
              }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Slide-out Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-slate-950 border-r border-slate-800 h-full flex flex-col p-5 shadow-2xl z-10 animate-slide-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-slate-950">
                  <Globe className="w-4 h-4 text-slate-950" />
                </div>
                <span className="font-extrabold text-base text-white">GlobeTrotter</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="py-6 flex-1 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                        isActive
                          ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                          : 'text-slate-300 hover:bg-slate-900'
                      )
                    }
                  >
                    <Icon className="w-5 h-5 text-teal-400" />
                    <span>{item.name}</span>
                    {item.highlight && <Sparkles className="w-4 h-4 ml-auto text-teal-400" />}
                  </NavLink>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-800">
              <NavLink
                to="/profile"
                onClick={onClose}
                className="flex items-center gap-3 p-2 rounded-xl bg-slate-900"
              >
                <div className="w-9 h-9 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                  {getInitials(user?.name)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate">{user?.name || 'Traveler'}</span>
                  <span className="text-[10px] text-slate-400 truncate">{user?.email || 'user@example.com'}</span>
                </div>
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-full mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
