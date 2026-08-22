import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Luggage,
  PlusCircle,
  Compass,
  User,
  Globe,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

export const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'My Trips', path: '/trips', icon: Luggage },
  { name: 'Plan New Trip', path: '/trips/new', icon: PlusCircle, highlight: true },
  { name: 'Explore', path: '/explore', icon: Compass },
  { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
  { name: 'Profile', path: '/profile', icon: User },
];

const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
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

  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-xl transition-all duration-300 z-30 shrink-0 select-none relative',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-lg shadow-teal-500/25 group-hover:scale-105 transition-transform">
            <Globe className="w-5 h-5 text-slate-950" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                GlobeTrotter
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 font-semibold">
                  PRO
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Smart Travel Planner</span>
            </div>
          )}
        </NavLink>
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-md z-40"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
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
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                  active
                    ? 'bg-gradient-to-r from-teal-500/15 to-emerald-500/10 text-teal-400 border border-teal-500/20 shadow-sm'
                    : item.highlight
                    ? 'text-teal-300 hover:bg-teal-500/10 hover:text-teal-200'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100',
                  isCollapsed && 'justify-center px-0'
                );
              }}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                  location.pathname === item.path ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                )}
              />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
              {!isCollapsed && item.highlight && (
                <Sparkles className="w-3.5 h-3.5 ml-auto text-teal-400 animate-pulse shrink-0" />
              )}
            </NavLink>
          );
        })}

        {/* Admin Link if Admin */}
        {isAdmin && (
          <NavLink
            to="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all mt-4',
              isCollapsed && 'justify-center px-0'
            )}
            title={isCollapsed ? 'Admin Panel' : undefined}
          >
            <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0" />
            {!isCollapsed && <span>Admin Panel</span>}
          </NavLink>
        )}
      </div>

      {/* Footer Profile Quick View */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <NavLink
          to="/profile"
          className={cn(
            'flex items-center gap-3 p-2 rounded-xl hover:bg-slate-900 transition-colors group',
            isCollapsed && 'justify-center'
          )}
        >
          <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-800 bg-slate-955 flex items-center justify-center shrink-0 shadow-md">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center font-bold text-slate-955">
                {getInitials(user?.name)}
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-white truncate group-hover:text-teal-300 transition-colors flex items-center gap-1">
                {user?.name || 'Traveler'}
                {isAdmin && <ShieldCheck className="w-3 h-3 text-rose-400 shrink-0" />}
              </span>
              <span className="text-[11px] text-slate-400 truncate">{user?.email || 'user@example.com'}</span>
            </div>
          )}
        </NavLink>

        {!isCollapsed && (
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
