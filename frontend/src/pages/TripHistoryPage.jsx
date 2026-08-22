import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  History,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Compass,
  DollarSign,
  Share2,
  Filter,
  Info,
  X,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import historyService from '../services/historyService';
import tripService from '../services/tripService';

const FILTER_CATEGORIES = [
  { key: 'ALL', label: 'All Activities', icon: History },
  { key: 'TRIP', label: 'Trip Updates', icon: Compass },
  { key: 'DESTINATION', label: 'Destinations', icon: MapPin },
  { key: 'ITINERARY', label: 'Itinerary', icon: Calendar },
  { key: 'EXPENSE', label: 'Expenses', icon: DollarSign },
  { key: 'SHARE', label: 'Sharing', icon: Share2 },
];

const TripHistoryPage = () => {
  const { id: tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [activeFilter, setActiveFilter] = useState('ALL');

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');

  // Selected Activity Modal Inspector
  const [selectedActivity, setSelectedActivity] = useState(null);

  const fetchHistoryData = useCallback(
    async (pageToLoad = 1, filterToUse = activeFilter, append = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError('');

      try {
        const [tripData, historyData] = await Promise.all([
          pageToLoad === 1 ? tripService.getTripById(tripId) : Promise.resolve(trip),
          historyService.getTripHistory(tripId, {
            page: pageToLoad,
            limit: 20,
            entityType: filterToUse,
          }),
        ]);

        if (tripData) setTrip(tripData);

        const items = historyData?.history || [];
        const pag = historyData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 };

        if (append) {
          setHistoryItems((prev) => [...prev, ...items]);
        } else {
          setHistoryItems(items);
        }

        setPagination(pag);
      } catch (err) {
        console.error('Failed to fetch history:', err);
        setError(err.message || 'Unable to load trip activity history.');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [tripId, activeFilter, trip]
  );

  useEffect(() => {
    fetchHistoryData(1, activeFilter, false);
  }, [tripId, activeFilter]);

  const handleFilterChange = (filterKey) => {
    setActiveFilter(filterKey);
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages && !isLoadingMore) {
      fetchHistoryData(pagination.page + 1, activeFilter, true);
    }
  };

  // Group history items by time categories (Today, Yesterday, This Week, Earlier)
  const groupedTimeline = useMemo(() => {
    if (!historyItems || historyItems.length === 0) return [];

    const now = new Date();
    const todayStr = now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    const groups = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Earlier: [],
    };

    historyItems.forEach((item) => {
      const itemDate = new Date(item.createdAt);
      const itemDateStr = itemDate.toDateString();

      if (itemDateStr === todayStr) {
        groups['Today'].push(item);
      } else if (itemDateStr === yesterdayStr) {
        groups['Yesterday'].push(item);
      } else if (itemDate >= oneWeekAgo) {
        groups['This Week'].push(item);
      } else {
        groups['Earlier'].push(item);
      }
    });

    return Object.keys(groups)
      .filter((groupName) => groups[groupName].length > 0)
      .map((groupName) => ({
        title: groupName,
        items: groups[groupName],
      }));
  }, [historyItems]);

  const getEventBadgeProps = (entityType) => {
    switch (entityType) {
      case 'TRIP':
        return { icon: Compass, color: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400', label: 'Trip' };
      case 'DESTINATION':
        return { icon: MapPin, color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', label: 'Destination' };
      case 'ITINERARY':
        return { icon: Calendar, color: 'bg-amber-500/10 border-amber-500/30 text-amber-400', label: 'Itinerary' };
      case 'EXPENSE':
        return { icon: DollarSign, color: 'bg-rose-500/10 border-rose-500/30 text-rose-400', label: 'Expense' };
      case 'SHARE':
        return { icon: Share2, color: 'bg-purple-500/10 border-purple-500/30 text-purple-400', label: 'Sharing' };
      default:
        return { icon: History, color: 'bg-slate-500/10 border-slate-500/30 text-slate-400', label: 'Activity' };
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const formatFullDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading activity timeline..." fullScreen={false} />;
  }

  if (error || !trip) {
    return (
      <PageContainer>
        <EmptyState
          icon={History}
          title="Trip History Not Available"
          description={error || 'Unable to load trip details for activity history.'}
          actionLabel="Retry Loading"
          onAction={() => fetchHistoryData(1, activeFilter, false)}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Back Button */}
      <div className="mb-2">
        <Button variant="ghost" size="sm" leftIcon={ArrowLeft} onClick={() => navigate(`/trips/${tripId}`)}>
          Back to Trip Details
        </Button>
      </div>

      {/* Header Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary" icon={History}>
                Activity Audit Log
              </Badge>
              <Badge variant="success" icon={CheckCircle2}>
                {pagination.total} Recorded Event{pagination.total === 1 ? '' : 's'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{trip.name} — Activity History</h1>
            <p className="text-xs text-slate-400">
              Chronological audit log tracking all trip modifications, expenses, itinerary updates, and sharing events.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={() => fetchHistoryData(1, activeFilter, false)}
            className="text-xs"
          >
            Refresh Log
          </Button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-2 scrollbar-none">
        {FILTER_CATEGORIES.map((cat) => {
          const IconComponent = cat.icon;
          const isActive = activeFilter === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => handleFilterChange(cat.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Timeline View */}
      <div className="space-y-8 pt-4">
        {groupedTimeline.length > 0 ? (
          groupedTimeline.map((group) => (
            <div key={group.title} className="space-y-4">
              {/* Group Date Header */}
              <div className="sticky top-0 z-10 flex items-center gap-2 bg-slate-950/90 backdrop-blur-md py-2 text-xs font-bold text-teal-400 tracking-wider uppercase border-b border-slate-800/80">
                <Calendar className="w-3.5 h-3.5" />
                <span>{group.title}</span>
              </div>

              {/* Event items list */}
              <div className="relative pl-6 space-y-4 border-l-2 border-slate-800 ml-3">
                {group.items.map((item) => {
                  const badgeProps = getEventBadgeProps(item.entityType);
                  const IconComp = badgeProps.icon;
                  return (
                    <div key={item.id} className="relative group">
                      {/* Timeline Marker Bullet */}
                      <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-teal-500 group-hover:border-teal-400 group-hover:scale-110 transition-all flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      </div>

                      {/* Event Card */}
                      <div
                        onClick={() => setSelectedActivity(item)}
                        className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900 transition-all cursor-pointer shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Event Icon Badge */}
                          <div className={`p-2.5 rounded-xl border shrink-0 ${badgeProps.color}`}>
                            <IconComp className="w-4 h-4" />
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                {item.action.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] text-slate-500 font-semibold">• {formatTimestamp(item.createdAt)}</span>
                            </div>
                            <h4 className="text-sm font-semibold text-white truncate leading-snug">{item.description}</h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button className="p-1.5 text-slate-400 hover:text-teal-400 rounded-lg hover:bg-slate-800 transition-colors">
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          /* Empty History State */
          <EmptyState
            icon={History}
            title="No activity yet"
            description="Your trip activity history will appear here automatically as you create itineraries, add destinations, log expenses, or share your trip."
            actionLabel="Back to Trip Details"
            onAction={() => navigate(`/trips/${tripId}`)}
          />
        )}

        {/* Pagination Load More Button */}
        {pagination.page < pagination.totalPages && (
          <div className="flex justify-center pt-4 pb-6">
            <Button
              variant="outline"
              size="sm"
              leftIcon={ChevronDown}
              onClick={handleLoadMore}
              isLoading={isLoadingMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading Activities...' : 'Load Earlier Activities'}
            </Button>
          </div>
        )}
      </div>

      {/* Activity Details Inspector Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedActivity(null)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 space-y-4 animate-scale-in">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl border ${getEventBadgeProps(selectedActivity.entityType).color}`}>
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{selectedActivity.action.replace('_', ' ')}</h3>
                  <span className="text-[11px] text-slate-400">{getEventBadgeProps(selectedActivity.entityType).label} Event</span>
                </div>
              </div>
              <button onClick={() => setSelectedActivity(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Description</label>
                <p className="text-sm font-semibold text-white mt-0.5">{selectedActivity.description}</p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Timestamp</label>
                <p className="text-xs text-slate-200 mt-0.5 font-medium">{formatFullDate(selectedActivity.createdAt)}</p>
              </div>

              {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Event Details & Metadata</label>
                  <pre className="mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-teal-300 font-mono overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedActivity.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <Button variant="primary" size="sm" onClick={() => setSelectedActivity(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default TripHistoryPage;
