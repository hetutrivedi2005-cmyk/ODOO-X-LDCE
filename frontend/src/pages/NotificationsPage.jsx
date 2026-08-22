import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Check, 
  Trash2, 
  CheckSquare, 
  Clock, 
  ArrowLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import notificationService from '../services/notificationService';

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

const TYPE_COLORS = {
  TRIP_CREATED: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  TRIP_UPDATED: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  ITINERARY_UPDATED: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  EXPENSE_ADDED: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  EXPENSE_UPDATED: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
  EXPENSE_DELETED: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  SHARE_CREATED: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  SHARE_REVOKED: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' or 'UNREAD'
  
  // Feedback message state
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError(err.message || 'Unable to load notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark single as read
  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      showToast('Notification marked as read.');
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast('All notifications marked as read.');
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  // Delete single notification
  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      showToast('Notification deleted.');
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to permanently clear all notifications?')) {
      return;
    }
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      showToast('All notifications cleared.');
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  // Navigation Click Handler
  const handleNotificationClick = async (noti) => {
    if (!noti.isRead) {
      await handleMarkAsRead(noti.id);
    }
    if (noti.relatedTripId) {
      navigate(`/trips/${noti.relatedTripId}`);
    }
  };

  // Time Formatter
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

  // Filter list
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (filterType === 'UNREAD') return !n.isRead;
      return true;
    });
  }, [notifications, filterType]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  if (isLoading) {
    return <LoadingState message="Loading notification log..." />;
  }

  return (
    <PageContainer>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-teal-500 text-slate-950 font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-scale-in">
          <Bell className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Controls */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" leftIcon={ArrowLeft} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-8 h-8 text-teal-400 animate-pulse" />
            Notification Center
          </h1>
          <p className="text-slate-400 text-sm mt-0.5 font-medium">
            Manage alerts and logs for all your travel plans.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={CheckSquare}
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              leftIcon={Trash2}
              onClick={handleClearAll}
            >
              Clear Log
            </Button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      {notifications.length > 0 && (
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3.5 mb-6">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 ${
              filterType === 'ALL'
                ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Logs ({notifications.length})
          </button>
          <button
            onClick={() => setFilterType('UNREAD')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 ${
              filterType === 'UNREAD'
                ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      )}

      {/* List Container */}
      {error ? (
        <EmptyState
          icon={Bell}
          title="Connection Failure"
          description={error}
          actionLabel="Retry Connection"
          onAction={fetchNotifications}
        />
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-3.5 max-w-4xl">
          {filteredNotifications.map((noti) => (
            <Card
              key={noti.id}
              className={`p-4 border-slate-800/80 hover:bg-slate-900/60 transition-all duration-250 ${
                noti.isRead ? 'bg-slate-900/20 opacity-75' : 'bg-slate-900/50 border-l-2 border-teal-500'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <button
                  onClick={() => handleNotificationClick(noti)}
                  className="flex-1 text-left flex items-start gap-4 min-w-0"
                  aria-label={`Notification: ${noti.title}. ${noti.message}`}
                >
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 text-lg ${TYPE_COLORS[noti.type] || TYPE_COLORS.SHARE_REVOKED}`}>
                    {TYPE_ICONS[noti.type] || '🔔'}
                  </div>

                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-extrabold tracking-tight ${noti.isRead ? 'text-slate-400' : 'text-white'}`}>
                        {noti.title}
                      </h3>
                      {!noti.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl break-words">
                      {noti.message}
                    </p>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-2 font-semibold">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span>{timeAgo(noti.createdAt)}</span>
                      {noti.relatedTripId && (
                        <>
                          <span className="text-slate-700">•</span>
                          <span className="text-teal-500 hover:underline font-bold">View details</span>
                          <ChevronRight className="w-3 h-3 text-teal-600" />
                        </>
                      )}
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-1">
                  {!noti.isRead && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleMarkAsRead(noti.id)}
                      className="text-slate-400 hover:text-teal-400 p-1.5 hover:bg-slate-800/40 rounded-lg"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleDelete(noti.id)}
                    className="text-slate-400 hover:text-rose-400 p-1.5 hover:bg-slate-800/40 rounded-lg"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title={filterType === 'UNREAD' ? "No unread alerts" : "All caught up!"}
          description={filterType === 'UNREAD' ? "You have read all notification cards in your inbox." : "When events occur on your trips, logs and reminders will populate here."}
          actionLabel={filterType === 'UNREAD' ? "Show All Notifications" : ""}
          onAction={filterType === 'UNREAD' ? () => setFilterType('ALL') : undefined}
        />
      )}
    </PageContainer>
  );
};

export default NotificationsPage;
