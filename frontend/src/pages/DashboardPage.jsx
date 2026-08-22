import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Luggage, MapPin, Plus, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const firstName = user?.name ? user.name.split(' ')[0] : 'Traveler';

  const stats = [
    { title: 'Upcoming Trips', value: '2', icon: Luggage, color: 'text-teal-400', badge: 'Active' },
    { title: 'Destinations Visited', value: '14', icon: MapPin, color: 'text-emerald-400', badge: 'Lifetime' },
    { title: 'Travel Budget Saved', value: '$1,250', icon: TrendingUp, color: 'text-amber-400', badge: '+12%' },
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
            <Card key={idx} hoverEffect>
              <CardContent className="flex items-center justify-between p-5">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-medium">{stat.title}</span>
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center border border-slate-700">
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
        <Card className="lg:col-span-2 relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 border-teal-500/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="primary" icon={Sparkles}>
                AI Engine Ready
              </Badge>
            </div>
            <CardTitle className="text-xl md:text-2xl mt-2 text-white">
              Where would you like to travel next?
            </CardTitle>
            <CardDescription className="text-slate-300">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4 text-teal-400" /> Next Upcoming Trip
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Kyoto & Tokyo, Japan</h4>
                <p className="text-xs text-slate-400 mt-0.5">Oct 12 - Oct 22 • 10 Days</p>
              </div>
              <Badge variant="success">Confirmed</Badge>
            </div>
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
