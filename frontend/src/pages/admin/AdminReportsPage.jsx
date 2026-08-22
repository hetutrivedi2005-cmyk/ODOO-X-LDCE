import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Compass,
  DollarSign,
  PieChart as PieIcon,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import DonutChart from '../../components/analytics/DonutChart';
import BarChart from '../../components/analytics/BarChart';
import adminService from '../../services/adminService';

const AdminReportsPage = () => {
  const [reports, setReports] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await adminService.getAdminReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load admin reports:', err);
      setError(err.message || 'Unable to load administrative report analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  if (isLoading) {
    return <LoadingState message="Generating administrative reports..." fullScreen={false} />;
  }

  if (error || !reports) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Unable to load reports"
        description={error || 'Failed to generate platform reports.'}
        actionLabel="Retry"
        onAction={fetchReports}
      />
    );
  }

  const { userStats, tripStats, expenseOverview, categoryExpenses } = reports;

  // Format data for charts
  const categoryChartData = categoryExpenses.map((c) => ({
    label: c.category,
    value: c.amount,
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="danger" icon={BarChart3}>
              Executive Intelligence
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Administrative Reports</h1>
            <p className="text-xs text-slate-400">
              System-level expense analytics, user distribution, and platform growth metrics.
            </p>
          </div>

          <Button variant="outline" size="sm" leftIcon={RefreshCw} onClick={fetchReports} className="text-xs border-slate-700">
            Refresh Reports
          </Button>
        </div>
      </div>

      {/* Expense Executive Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hoverEffect className="p-5 bg-slate-900/80 border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Platform Expenses</span>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{formatCurrency(expenseOverview?.totalAmount)}</p>
          <p className="text-[11px] text-slate-400">Total amount logged by users</p>
        </Card>

        <Card hoverEffect className="p-5 bg-slate-900/80 border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Average Transaction</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{formatCurrency(expenseOverview?.averageExpense)}</p>
          <p className="text-[11px] text-slate-400">Mean expense per logged item</p>
        </Card>

        <Card hoverEffect className="p-5 bg-slate-900/80 border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Expense Logs</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{expenseOverview?.totalCount || 0}</p>
          <p className="text-[11px] text-slate-400">Individual expense entries recorded</p>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Expense Distribution Chart */}
        <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-rose-400" />
              <h3 className="text-base font-bold text-white tracking-tight">Expenses by Category</h3>
            </div>
          </div>

          {categoryChartData.length > 0 ? (
            <DonutChart data={categoryChartData} valuePrefix="₹" />
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">No expense category data logged yet.</div>
          )}
        </Card>

        {/* Category Bar Chart Distribution */}
        <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-400" />
              <h3 className="text-base font-bold text-white tracking-tight">Category Breakdown</h3>
            </div>
          </div>

          {categoryChartData.length > 0 ? (
            <BarChart data={categoryChartData} valuePrefix="₹" />
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">No expense breakdown available.</div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminReportsPage;
