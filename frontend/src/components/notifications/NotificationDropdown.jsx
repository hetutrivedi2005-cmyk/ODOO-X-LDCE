import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash, CheckSquare, X } from 'lucide-react';
import Button from '../ui/Button';

const TYPE_ICONS = {
  TRIP_CREATED: '🛫',
  TRIP_UPDATED: '🔄',
  ITINERARY_UPDATED: '📅',
  EXPENSE_ADDED: '💵',
  EXPENSE_UPDATED: '📝',
  EXPENSE_DELETED: '❌',
  SHARE_CREATED: '🔗',
  SHARE_REVOKED: '🚷',
};

const NotificationDropdown = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onClearAll,
  isLoading,
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNotificationClick = async (noti) => {
    if (!noti.isRead) {
      await onMarkRead(noti.id);
    }
    onClose();
    if (noti.relatedTripId) {
      navigate(`/trips/${noti.relatedTripId}`);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-30 overflow-hidden animate-scale-in"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold text-white tracking-tight">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-[10px] text-slate-400 hover:text-teal-400 font-semibold flex items-center gap-0.5 transition-colors"
              title="Mark all as read"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Close dropdown"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body List */}
      <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-800/60">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <span className="inline-block w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mr-2" />
            Loading notifications...
          </div>
        ) : notifications.length > 0 ? (
          notifications.slice(0, 5).map((noti) => (
            <div
              key={noti.id}
              className={`p-3.5 transition-all relative group flex items-start justify-between gap-3 ${
                noti.isRead ? 'bg-slate-900/30' : 'bg-slate-900 border-l-2 border-teal-500'
              }`}
            >
              <button
                onClick={() => handleNotificationClick(noti)}
                className="flex-1 text-left flex gap-3 min-w-0"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center text-sm shrink-0">
                  {TYPE_ICONS[noti.type] || '🔔'}
                </div>
                <div className="min-w-0">
                  <h4 className={`text-xs font-bold truncate ${noti.isRead ? 'text-slate-400' : 'text-white'}`}>
                    {noti.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed break-words pr-2">
                    {noti.message}
                  </p>
                  <span className="text-[9px] text-slate-500 block mt-1 font-semibold">
                    {timeAgo(noti.createdAt)}
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2.5 top-3 bg-slate-900 pl-2">
                {!noti.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead(noti.id);
                    }}
                    className="p-1 hover:text-teal-400 text-slate-500 hover:bg-slate-800 rounded transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(noti.id);
                  }}
                  className="p-1 hover:text-rose-400 text-slate-500 hover:bg-slate-800 rounded transition-colors"
                  title="Delete notification"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-1">
            <span className="text-xl">🔔</span>
            <p className="font-semibold text-slate-400">No notifications yet</p>
            <p className="text-[10px] text-slate-500">You're all caught up!</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={onClearAll}
            className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold"
          >
            Clear all
          </button>
          <button
            onClick={() => {
              onClose();
              navigate('/notifications');
            }}
            className="text-[10px] text-teal-400 hover:text-teal-300 font-bold"
          >
            View all ({notifications.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
