import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Compass,
  DollarSign,
  Bell,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  History,
  Activity,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import LoadingState from '../../components/common/LoadingState';
import adminService from '../../services/adminService';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOverview = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await adminService.getAdminOverview();
      setOverview(data);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
      setError(err.message || 'Unable to load platform administrative overview.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading administrative overview..." fullScreen={false} />;
  }

  const { users, trips, expenses, notifications, recentActivity } = overview || {
    users: { total: 0, active: 0, inactive: 0 },
    trips: { total: 0, completed: 0, active: 0 },
    expenses: { totalAmount: 0 },
    notifications: { total: 0 },
    recentActivity: [],
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="danger" icon={ShieldCheck}>
                Administrative Control Panel
              </Badge>
              <Badge variant="primary" icon={Activity}>
                Live System Operations
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">System Overview</h1>
            <p className="text-xs text-slate-400">
              Real-time platform metrics, user management status, global trip counts, and audit logs.
            </p>
          </div>

          <Button variant="outline" size="sm" leftIcon={RefreshCw} onClick={fetchOverview} className="text-xs border-slate-700">
            Refresh Data
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card hoverEffect className="p-5 bg-slate-900/80 border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Users</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{users.total}</p>
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-emerald-400 font-medium">{users.active} Active</span>
            <span className="text-rose-400 font-medium">{users.inactive} Inactive</span>
          </div>
        </Card>

        {/* Total Trips */}
        <Card hoverEffect className="p-5 bg-slate-900/80 border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Platform Trips</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{trips.total}</p>
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-teal-400 font-medium">{trips.active} Upcoming / Active</span>
            <span className="text-slate-400 font-medium">{trips.completed} Completed</span>
          </div>
        </Card>

        {/* Total Expenses */}
        <Card hoverEffect className="p-5 bg-slate-900/80 border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Recorded Expenses</span>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-white">{formatCurrency(expenses.totalAmount)}</p>
          <p className="text-[11px] text-slate-400 pt-1">Across all platform user itineraries</p>
        </Card>

        {/* System Notifications */}
        <Card hoverEffect className="p-5 bg-slate-900/80 border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">System Notifications</span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{notifications.total}</p>
          <p className="text-[11px] text-slate-400 pt-1">Automated trip & budget alerts sent</p>
        </Card>
      </div>

      {/* Quick Admin Actions & Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          hoverEffect
          onClick={() => navigate('/admin/users')}
          className="p-5 bg-slate-900/80 border-slate-800 cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">User Management</h3>
                <p className="text-[11px] text-slate-400">Manage user status, roles, and search accounts</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Card>

        <Card
          hoverEffect
          onClick={() => navigate('/admin/trips')}
          className="p-5 bg-slate-900/80 border-slate-800 cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Platform Trips</h3>
                <p className="text-[11px] text-slate-400">Monitor all trips, stops, and user details</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Card>

        <Card
          hoverEffect
          onClick={() => navigate('/admin/reports')}
          className="p-5 bg-slate-900/80 border-slate-800 cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Administrative Reports</h3>
                <p className="text-[11px] text-slate-400">System growth analytics and expense distribution</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Card>
      </div>

      {/* Recent System Activity Section */}
      <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Recent System Activity</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/activity')} className="text-xs text-teal-400">
            View All Logs
          </Button>
        </div>

        {recentActivity && recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{log.description}</p>
                    <p className="text-[10px] text-slate-400">
                      User: <span className="text-slate-300 font-medium">{log.user?.name || log.user?.email || 'System'}</span> • Action:{' '}
                      <span className="font-mono text-teal-300">{log.action}</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">{formatTimestamp(log.createdAt)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">No system activity logged yet.</div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
