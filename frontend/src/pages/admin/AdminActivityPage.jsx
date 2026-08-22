import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  Search,
  Filter,
  User,
  Calendar,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import adminService from '../../services/adminService';

const AdminActivityPage = () => {
  const [activityLogs, setActivityLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [entityFilter, setEntityFilter] = useState('ALL');
  const [selectedActivity, setSelectedActivity] = useState(null);

  const fetchActivityData = useCallback(
    async (pageToLoad = 1) => {
      setIsLoading(true);
      setError('');
      try {
        const data = await adminService.getActivityLogs({
          page: pageToLoad,
          limit: 20,
          entityType: entityFilter,
        });

        setActivityLogs(data.activityLogs || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
      } catch (err) {
        console.error('Failed to load system activity:', err);
        setError(err.message || 'Unable to load system activity logs.');
      } finally {
        setIsLoading(false);
      }
    },
    [entityFilter]
  );

  useEffect(() => {
    fetchActivityData(1);
  }, [fetchActivityData]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="warning" icon={History}>
              System Audit Trail
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">System Activity Log</h1>
            <p className="text-xs text-slate-400">
              Platform-wide audit log monitoring user registrations, trip creations, itinerary updates, and expense logs.
            </p>
          </div>

          <Button variant="outline" size="sm" leftIcon={RefreshCw} onClick={() => fetchActivityData(1)} className="text-xs border-slate-700">
            Refresh Logs
          </Button>
        </div>
      </div>

      {/* Entity Filter */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" /> Filter Category:
        </span>
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-200 focus:border-rose-500 focus:outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="USER">User Events</option>
          <option value="TRIP">Trip Events</option>
          <option value="DESTINATION">Destination Events</option>
          <option value="ITINERARY">Itinerary Events</option>
          <option value="EXPENSE">Expense Events</option>
          <option value="SHARE">Share Events</option>
        </select>
      </div>

      {/* Activity Table Card */}
      {isLoading ? (
        <LoadingState message="Loading audit logs..." fullScreen={false} />
      ) : error ? (
        <EmptyState
          icon={History}
          title="Unable to load activity logs"
          description={error}
          actionLabel="Retry"
          onAction={() => fetchActivityData(1)}
        />
      ) : activityLogs.length > 0 ? (
        <Card className="bg-slate-900/80 border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 uppercase tracking-wider text-[10px] font-bold text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Entity</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activityLogs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        <User className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>{item.user?.name || item.user?.email || 'System'}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-teal-300">
                        {item.action}
                      </span>
                    </td>

                    {/* Entity */}
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.entityType}</span>
                    </td>

                    {/* Description */}
                    <td className="px-5 py-3.5 max-w-md truncate font-medium text-slate-200">{item.description}</td>

                    {/* Timestamp */}
                    <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">{formatDate(item.createdAt)}</td>

                    {/* Inspector Action */}
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedActivity(item)}
                        className="p-1.5 h-7 text-[11px]"
                        title="Inspect Metadata"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          {pagination.totalPages > 1 && (
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                Showing Page <span className="font-bold text-white">{pagination.page}</span> of{' '}
                <span className="font-bold text-white">{pagination.totalPages}</span> ({pagination.total} total log entries)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchActivityData(pagination.page - 1)}
                  className="p-1.5 h-7"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchActivityData(pagination.page + 1)}
                  className="p-1.5 h-7"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <EmptyState icon={History} title="No activity logs found" description="No activity logs match your filter selection." />
      )}

      {/* Inspector Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedActivity(null)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 space-y-4 animate-scale-in">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">{selectedActivity.action}</h3>
                <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider">{selectedActivity.entityType} Event</span>
              </div>
              <button onClick={() => setSelectedActivity(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">User Account</label>
                <p className="font-semibold text-white mt-0.5">{selectedActivity.user?.name || selectedActivity.user?.email || 'System'}</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                <p className="font-medium text-slate-200 mt-0.5">{selectedActivity.description}</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Timestamp</label>
                <p className="text-slate-300 mt-0.5 font-mono">{formatDate(selectedActivity.createdAt)}</p>
              </div>

              {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Payload Metadata</label>
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
    </div>
  );
};

export default AdminActivityPage;
