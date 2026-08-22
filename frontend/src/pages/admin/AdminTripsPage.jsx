import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Search,
  Calendar,
  User,
  MapPin,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import adminService from '../../services/adminService';

const AdminTripsPage = () => {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTripsData = useCallback(
    async (pageToLoad = 1) => {
      setIsLoading(true);
      setError('');
      try {
        const data = await adminService.getTrips({
          page: pageToLoad,
          limit: 15,
          search: searchTerm,
        });

        setTrips(data.trips || []);
        setPagination(data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
      } catch (err) {
        console.error('Failed to load trips:', err);
        setError(err.message || 'Unable to load platform trips.');
      } finally {
        setIsLoading(false);
      }
    },
    [searchTerm]
  );

  useEffect(() => {
    fetchTripsData(1);
  }, [fetchTripsData]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Flexible';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getTripStatusBadge = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">Flexible</span>;
    }
    const now = new Date();
    const s = new Date(startDate);
    const e = new Date(endDate);

    if (now > e) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">Completed</span>;
    }
    if (now >= s && now <= e) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Ongoing</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30">Upcoming</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="success" icon={Compass}>
              Platform Trip Monitor
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Platform Trips</h1>
            <p className="text-xs text-slate-400">
              System-wide read-only monitoring of all user created travel itineraries and stop statistics.
            </p>
          </div>

          <Badge variant="primary" className="text-xs">
            {pagination.total} Total Platform Trip{pagination.total === 1 ? '' : 's'}
          </Badge>
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <Input
          placeholder="Search trips by title..."
          leftIcon={Search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Trips Table Card */}
      {isLoading ? (
        <LoadingState message="Loading platform trips..." fullScreen={false} />
      ) : error ? (
        <EmptyState
          icon={Compass}
          title="Unable to load trips"
          description={error}
          actionLabel="Retry"
          onAction={() => fetchTripsData(1)}
        />
      ) : trips.length > 0 ? (
        <Card className="bg-slate-900/80 border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 uppercase tracking-wider text-[10px] font-bold text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Trip Name</th>
                  <th className="px-5 py-3.5">Owner</th>
                  <th className="px-5 py-3.5">Dates</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Stops</th>
                  <th className="px-5 py-3.5">Expenses</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {trips.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Trip Name */}
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-white text-xs">{item.name}</p>
                    </td>

                    {/* Owner */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                        <User className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>{item.user?.name || item.user?.email || 'Unknown Owner'}</span>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="px-5 py-3.5 text-slate-400">
                      {formatDate(item.startDate)} — {formatDate(item.endDate)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">{getTripStatusBadge(item.startDate, item.endDate)}</td>

                    {/* Stops Count */}
                    <td className="px-5 py-3.5 font-semibold text-slate-300">
                      {item._count?.stops || 0} stop{(item._count?.stops || 0) === 1 ? '' : 's'}
                    </td>

                    {/* Expenses Count */}
                    <td className="px-5 py-3.5 font-semibold text-slate-300">
                      {item._count?.expenses || 0} item{(item._count?.expenses || 0) === 1 ? '' : 's'}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/admin/users/${item.user?.id}`)}
                        className="p-1.5 h-7 text-[11px]"
                        title="View Owner Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
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
                <span className="font-bold text-white">{pagination.totalPages}</span> ({pagination.total} total trips)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchTripsData(pagination.page - 1)}
                  className="p-1.5 h-7"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchTripsData(pagination.page + 1)}
                  className="p-1.5 h-7"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <EmptyState
          icon={Compass}
          title="No trips found"
          description="No platform trips match your search query."
          actionLabel="Clear Search"
          onAction={() => setSearchTerm('')}
        />
      )}
    </div>
  );
};

export default AdminTripsPage;
