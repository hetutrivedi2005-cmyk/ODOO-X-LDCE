import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, Menu, Globe } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';
import NotificationDropdown from '../notifications/NotificationDropdown';

const Header = ({ onOpenMobileMenu }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  }, []);

  const fetchNotificationsList = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await notificationService.getNotifications();
      setNotifications(list);
      const unread = list.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to load notifications list:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadCount]);

  const handleToggleDropdown = () => {
    if (!isDropdownOpen) {
      fetchNotificationsList();
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const noti = notifications.find((n) => n.id === id);
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (noti && !noti.isRead) {
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleClearAllNotifications = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
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

  const firstName = user?.name ? user.name.split(' ')[0] : 'Traveler';

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

        {/* Notifications Icon & Dropdown */}
        <div className="relative">
          <button
            onClick={handleToggleDropdown}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
            aria-expanded={isDropdownOpen}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-teal-500 text-slate-950 font-extrabold text-[9px] flex items-center justify-center animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onDelete={handleDeleteNotification}
            onClearAll={handleClearAllNotifications}
            isLoading={isLoading}
          />
        </div>

        {/* Profile Pill */}
        <NavLink
          to="/profile"
          className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-900/80 hover:bg-slate-800 transition-all"
        >
          <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center text-xs">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-teal-500 to-emerald-450 flex items-center justify-center font-bold text-slate-955">
                {getInitials(user?.name)}
              </div>
            )}
          </div>
          <span className="hidden md:inline text-xs font-medium text-slate-200">{firstName}</span>
          <Badge variant="primary" className="hidden lg:inline-flex text-[10px] py-0 px-1.5">
            Active
          </Badge>
        </NavLink>
      </div>
    </header>
  );
};

export default Header;
