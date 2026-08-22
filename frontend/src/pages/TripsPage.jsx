import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Luggage, MapPin, Calendar, Plus, Search, Filter } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/common/EmptyState';

const mockTrips = [
  {
    id: '1',
    destination: 'Kyoto & Tokyo, Japan',
    dates: 'Oct 12 - Oct 22, 2026',
    status: 'Upcoming',
    budget: '$3,200',
    type: 'Cultural & Food',
  },
  {
    id: '2',
    destination: 'Santorini & Athens, Greece',
    dates: 'Jun 14 - Jun 21, 2026',
    status: 'Completed',
    budget: '$2,800',
    type: 'Beach & History',
  },
  {
    id: '3',
    destination: 'Swiss Alps, Switzerland',
    dates: 'Dec 01 - Dec 08, 2026',
    status: 'Draft',
    budget: '$4,100',
    type: 'Adventure & Ski',
  },
];

const TripsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [trips, setTrips] = useState(mockTrips);

  const filteredTrips = trips.filter((t) =>
    t.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer
      title="My Trips"
      subtitle="Manage all your planned journeys, drafts, and travel memories in one place."
      actions={
        <Button variant="primary" leftIcon={Plus} onClick={() => navigate('/trips/new')}>
          Create Trip
        </Button>
      }
    >
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Filter by destination..."
            leftIcon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" leftIcon={Filter}>
            Filter Status
          </Button>
        </div>
      </div>

      {/* Trips Content List */}
      {filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <Card key={trip.id} hoverEffect className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      trip.status === 'Upcoming'
                        ? 'primary'
                        : trip.status === 'Completed'
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {trip.status}
                  </Badge>
                  <span className="text-xs text-slate-400 font-medium">{trip.type}</span>
                </div>
                <CardTitle className="text-lg mt-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                  {trip.destination}
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {trip.dates}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Estimated Budget</span>
                  <span className="font-semibold text-teal-400">{trip.budget}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" size="sm" className="w-full">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Luggage}
          title="No trips found"
          description="We couldn't find any trips matching your search criteria."
          actionLabel="Plan New Trip"
          onAction={() => navigate('/trips/new')}
        />
      )}
    </PageContainer>
  );
};

export default TripsPage;
