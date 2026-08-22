import React, { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, 
  MapPin, 
  Calendar, 
  Clock, 
  Filter, 
  RefreshCw, 
  Compass, 
  Luggage,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/common/EmptyState';
import KpiCard from '../components/analytics/KpiCard';
import DonutChart from '../components/analytics/DonutChart';
import BarChart from '../components/analytics/BarChart';
import LineChart from '../components/analytics/LineChart';
import reportService from '../services/reportService';
import tripService from '../services/tripService';

const ReportsPage = () => {
  // Filters state
  const [dateRange, setDateRange] = useState('all');
  const [selectedTrip, setSelectedTrip] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Dropdown options
  const [tripsList, setTripsList] = useState([]);

  // Data states
  const [overview, setOverview] = useState(null);
  const [expenseData, setExpenseData] = useState(null);
  const [destinationData, setDestinationData] = useState(null);
  const [activityData, setActivityData] = useState(null);

  // Loaders / Errors
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Formulates filter payload for APIs
  const getFilterPayload = useCallback(() => {
    const payload = {};
    if (selectedTrip && selectedTrip !== 'all') {
      payload.tripId = selectedTrip;
    }
    if (selectedCategory && selectedCategory !== 'all') {
      payload.category = selectedCategory;
    }

    const now = new Date();
    if (dateRange === '7days') {
      const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      payload.startDate = d.toISOString();
    } else if (dateRange === '30days') {
      const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      payload.startDate = d.toISOString();
    } else if (dateRange === '90days') {
      const d = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      payload.startDate = d.toISOString();
    } else if (dateRange === 'year') {
      const d = new Date(now.getFullYear(), 0, 1);
      payload.startDate = d.toISOString();
    } else if (dateRange === 'custom') {
      if (customStart) {
        payload.startDate = new Date(customStart).toISOString();
      }
      if (customEnd) {
        const d = new Date(customEnd);
        d.setHours(23, 59, 59, 999);
        payload.endDate = d.toISOString();
      }
    }
    return payload;
  }, [dateRange, selectedTrip, selectedCategory, customStart, customEnd]);

  // Load dropdown lists (on mount)
  useEffect(() => {
    const loadTrips = async () => {
      try {
        const list = await tripService.getTrips();
        setTripsList(list || []);
      } catch (err) {
        console.error('Failed to load trips dropdown list:', err);
      }
    };
    loadTrips();
  }, []);

  // Fetch report data
  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError('');
    const filters = getFilterPayload();
    try {
      const [overviewRes, expenseRes, destinationRes, activityRes] = await Promise.all([
        reportService.getOverview(filters),
        reportService.getExpenseAnalytics(filters),
        reportService.getDestinationAnalytics(filters),
        reportService.getActivityAnalytics(filters)
      ]);

      setOverview(overviewRes);
      setExpenseData(expenseRes);
      setDestinationData(destinationRes);
      setActivityData(activityRes);
    } catch (err) {
      console.error('Failed to retrieve travel reports:', err);
      setError(err.message || 'Unable to retrieve analytics dashboard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [getFilterPayload]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Reset filters
  const handleResetFilters = () => {
    setDateRange('all');
    setSelectedTrip('all');
    setSelectedCategory('all');
    setCustomStart('');
    setCustomEnd('');
  };

  // Safe formatting helpers
  const formatSpendingKpi = (spendList) => {
    if (!spendList || spendList.length === 0) return '₹0';
    return spendList.map(s => {
      const symbol = s.currency === 'USD' ? '$' : s.currency === 'EUR' ? '€' : '₹';
      return `${symbol}${Math.round(s.amount).toLocaleString()}`;
    }).join(' / ');
  };

  // Convert categories object lists for Donut Charts
  const getCategoryChartData = () => {
    if (!expenseData || !expenseData.byCategory || expenseData.byCategory.length === 0) return [];
    const colors = ['#06b6d4', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#64748b'];
    return expenseData.byCategory.map((cat, idx) => {
      // Sum value across currencies for simple relative proportion or use primary currency amount
      const totalAmount = cat.breakdown.reduce((sum, b) => sum + b.amount, 0);
      return {
        label: cat.category,
        value: Math.round(totalAmount),
        color: colors[idx % colors.length]
      };
    });
  };

  // Convert cities visits list for Bar Charts
  const getCityChartData = () => {
    if (!destinationData || !destinationData.topDestinations || destinationData.topDestinations.length === 0) return [];
    return destinationData.topDestinations.map(city => ({
      label: `${city.name}, ${city.country}`,
      value: city.count,
      color: '#10b981'
    }));
  };

  // Convert monthly data for Line Charts
  const getTrendChartData = () => {
    if (!expenseData || !expenseData.overTime || expenseData.overTime.length === 0) return [];
    return expenseData.overTime.map(item => {
      const sumVal = item.breakdown.reduce((sum, b) => sum + b.amount, 0);
      return {
        label: item.period,
        value: Math.round(sumVal)
      };
    });
  };

  // Format activity action label
  const formatActivityText = (act) => {
    const dateStr = act.scheduledAt ? new Date(act.scheduledAt).toLocaleDateString() : new Date(act.createdAt).toLocaleDateString();
    return `${act.title} scheduled in ${act.location} for trip "${act.tripName}" on ${dateStr}`;
  };

  const hasTrips = overview?.totalTrips > 0;

  return (
    <PageContainer
      title="Reports & Analytics 📊"
      subtitle="Unlock visual insights and aggregate statistics about your travel schedules and finances."
      actions={
        <Button variant="outline" size="sm" leftIcon={RefreshCw} onClick={fetchReports} disabled={isLoading}>
          Refresh Report
        </Button>
      }
    >
      {/* Filters Bar Card */}
      <Card className="border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-800/80">
            <h3 className="text-xs font-black uppercase text-slate-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-teal-400" /> Filter Analytics Dataset
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[10px] font-bold uppercase tracking-wider text-slate-450 hover:text-teal-400 transition-colors"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Date Range Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold focus:border-teal-500 focus:outline-none"
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Trip Selector Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trip filter</label>
              <select
                value={selectedTrip}
                onChange={(e) => setSelectedTrip(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold focus:border-teal-500 focus:outline-none"
              >
                <option value="all">All Trips</option>
                {tripsList.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Category Selector Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expense category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold focus:border-teal-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {['Food', 'Transport', 'Accommodation', 'Activities', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Date Picker Fields */}
          {dateRange === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 animate-fade-in">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Global Error Banner */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div className="space-y-1">
            <span className="font-bold">Error Displaying Analytics</span>
            <p className="opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Analytics KPI Rows */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Trips"
          value={overview ? overview.totalTrips : '0'}
          icon={Luggage}
          color="text-teal-400"
          isLoading={isLoading}
          context={overview ? `Active: ${overview.activeTrips} • Upcoming: ${overview.upcomingTrips}` : ''}
        />
        <KpiCard
          label="Destinations"
          value={overview ? overview.totalDestinations : '0'}
          icon={MapPin}
          color="text-emerald-400"
          isLoading={isLoading}
          context={destinationData ? `Countries: ${destinationData.countriesCount} • Cities: ${destinationData.citiesCount}` : ''}
        />
        <KpiCard
          label="Travel Days"
          value={overview ? `${overview.totalTravelDays} days` : '0 days'}
          icon={Calendar}
          color="text-amber-400"
          isLoading={isLoading}
        />
        <KpiCard
          label="Total Spending"
          value={overview ? formatSpendingKpi(overview.totalSpendingByCurrency) : '₹0'}
          icon={DollarSign}
          color="text-rose-400"
          isLoading={isLoading}
          context="Currency aware breakdown"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Spending Splits (Donut Chart) */}
        <Card>
          <CardHeader className="border-b border-slate-900 pb-3">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-teal-400" /> Spending By Category
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <DonutChart
              data={getCategoryChartData()}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Most Visited Cities (Bar Chart) */}
        <Card>
          <CardHeader className="border-b border-slate-900 pb-3">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" /> Most Visited Cities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <BarChart
              data={getCityChartData()}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Spending Over Time (Line Chart) */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-slate-900 pb-3">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" /> Spending Trends Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <LineChart
              data={getTrendChartData()}
              isLoading={isLoading}
              color="#3b82f6"
            />
          </CardContent>
        </Card>
      </div>

      {/* Activity Logs (Integrates M11) */}
      <Card>
        <CardHeader className="border-b border-slate-900 pb-3">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-400" /> Recent Trip Activity Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-slate-900 border border-slate-850 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-3/4 bg-slate-900 rounded" />
                    <div className="h-2.5 w-1/4 bg-slate-900 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : activityData?.recentActivities?.length > 0 ? (
            <div className="divide-y divide-slate-900">
              {activityData.recentActivities.map(act => (
                <div key={act.id} className="flex items-start gap-4 p-4 hover:bg-slate-900/10 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 font-semibold leading-relaxed">
                      {formatActivityText(act)}
                    </p>
                    {act.notes && (
                      <p className="text-[10px] text-slate-400 mt-1 italic leading-relaxed">
                        Note: "{act.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-450">
              No recent itinerary activities logged. Set up day schedule items in your trip planner.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Global Empty State */}
      {!isLoading && !hasTrips && (
        <EmptyState
          icon={Compass}
          title="No travel analytics available"
          description="Build your first travel itinerary plan to start visualizing dashboard stats, KPI metrics, and category splits."
        />
      )}
    </PageContainer>
  );
};

export default ReportsPage;
