import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Luggage, MapPin, Plus, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import reportService from '../services/reportService';
import tripService from '../services/tripService';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const firstName = user?.name ? user.name.split(' ')[0] : 'Traveler';

  const [overview, setOverview] = useState(null);
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [overviewRes, tripsRes] = await Promise.all([
          reportService.getOverview(),
          tripService.getTrips()
        ]);
        setOverview(overviewRes);
        setTrips(tripsRes || []);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const formatSpendingKpi = (spendList) => {
    if (!spendList || spendList.length === 0) return '₹0';
    return spendList.map(s => {
      const symbol = s.currency === 'USD' ? '$' : s.currency === 'EUR' ? '€' : '₹';
      return `${symbol}${Math.round(s.amount).toLocaleString()}`;
    }).join(' / ');
  };

  const upcomingTrip = trips.find(t => {
    if (!t.startDate) return false;
    return new Date(t.startDate) > new Date();
  });

  const formatDateRange = (start, end) => {
    if (!start && !end) return '';
    const sStr = start ? new Date(start).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '';
    const eStr = end ? new Date(end).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    if (sStr && eStr) return `${sStr} - ${eStr}`;
    return sStr || eStr;
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return '';
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    return `${days} Day${days === 1 ? '' : 's'}`;
  };

  const stats = [
    { title: 'Upcoming Trips', value: overview ? overview.upcomingTrips.toString() : '0', icon: Luggage, color: 'text-teal-500', badge: 'Upcoming' },
    { title: 'Destinations Visited', value: overview ? overview.totalDestinations.toString() : '0', icon: MapPin, color: 'text-emerald-500', badge: 'Lifetime' },
    { title: 'Total Travel Budget Spent', value: overview ? formatSpendingKpi(overview.totalSpendingByCurrency) : '₹0', icon: TrendingUp, color: 'text-amber-500', badge: 'Spent' },
  ];

  return (
    <PageContainer
      title={`Welcome back, ${firstName}! 👋`}
      subtitle="Here is an overview of your upcoming adventures and travel insights."
      actions={
        <Button variant="primary" leftIcon={Plus} onClick={() => navigate('/trips/new')}>
          Plan New Trip
        </Button>
      }
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} hoverEffect className="border-slate-800 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
              <CardContent className="flex items-center justify-between p-5">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-semibold">{stat.title}</span>
                  <div className="text-2xl font-black text-slate-100">{stat.value}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-850 flex items-center justify-center border border-slate-800">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <Badge variant="primary">{stat.badge}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Feature Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Trip Banner */}
        <Card className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-white via-white to-teal-50/20 border-slate-800 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="primary" icon={Sparkles}>
                AI Engine Ready
              </Badge>
            </div>
            <CardTitle className="text-xl md:text-2xl mt-2 text-slate-100">
              Where would you like to travel next?
            </CardTitle>
            <CardDescription className="text-slate-350">
              Generate custom itineraries, budget forecasts, and local recommendations in seconds.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-3 mt-2">
              <Button variant="primary" leftIcon={Compass} onClick={() => navigate('/trips/new')}>
                Start AI Trip Wizard
              </Button>
              <Button variant="outline" onClick={() => navigate('/explore')}>
                Explore Destinations
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Upcoming Preview */}
        <Card className="border-slate-800 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-slate-100">
              <Calendar className="w-4 h-4 text-teal-500" /> Next Upcoming Trip
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 animate-pulse">
                <div className="h-4 w-3/4 bg-slate-800 rounded" />
                <div className="h-3.5 w-1/2 bg-slate-800 rounded" />
              </div>
            ) : upcomingTrip ? (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 truncate max-w-[160px]" title={upcomingTrip.name}>
                    {upcomingTrip.name}
                  </h4>
                  <p className="text-xs text-slate-350 mt-0.5">
                    {formatDateRange(upcomingTrip.startDate, upcomingTrip.endDate)} • {calculateDuration(upcomingTrip.startDate, upcomingTrip.endDate)}
                  </p>
                </div>
                <Badge variant="success">Confirmed</Badge>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-450">
                No upcoming trips planned yet.
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate('/trips')}
            >
              View All Trips
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
