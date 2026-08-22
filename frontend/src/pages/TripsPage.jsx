import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Luggage, MapPin, Calendar, Plus, Search, Eye, Edit2, Trash2 } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import DeleteTripModal from '../components/trip/DeleteTripModal';
import tripService from '../services/tripService';

const TripsPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete modal state
  const [deletingTrip, setDeletingTrip] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await tripService.getTrips();
      setTrips(data);
    } catch (err) {
      console.error('Failed to load trips:', err);
      setError(err.message || 'Unable to load your trips. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTrip) return;
    setIsDeleting(true);
    try {
      await tripService.deleteTrip(deletingTrip.id);
      setTrips((prev) => prev.filter((t) => String(t.id) !== String(deletingTrip.id)));
      setDeletingTrip(null);
    } catch (err) {
      console.error('Failed to delete trip:', err);
      alert(err.message || 'Unable to delete trip.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDateRange = (start, end) => {
    if (!start && !end) return 'Flexible Dates';
    const sStr = start ? new Date(start).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const eStr = end ? new Date(end).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    if (sStr && eStr) return `${sStr} — ${eStr}`;
    return sStr || eStr;
  };

  const filteredTrips = trips.filter(
    (trip) =>
      trip.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer
      title="My Trips"
      subtitle="Plan, manage, and explore your journeys."
      actions={
        <Button variant="primary" leftIcon={Plus} onClick={() => navigate('/trips/new')}>
          Create Trip
        </Button>
      }
    >
      {/* Search & Filter Bar */}
      {trips.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search your trips by title or keyword..."
              leftIcon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Showing {filteredTrips.length} of {trips.length} trip{trips.length === 1 ? '' : 's'}
          </span>
        </div>
      )}

      {/* Loading & Error States */}
      {isLoading ? (
        <LoadingState message="Loading your journeys..." />
      ) : error ? (
        <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-center space-y-3">
          <p className="text-sm font-semibold">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchTrips}>
            Retry Loading
          </Button>
        </div>
      ) : filteredTrips.length > 0 ? (
        /* Trips Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const stopsCount = trip.stops ? trip.stops.length : 0;
            return (
              <Card key={trip.id} hoverEffect className="flex flex-col group overflow-hidden">
                {/* Cover Image */}
                <div className="relative h-44 w-full bg-slate-800 overflow-hidden">
                  <img
                    src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
                    alt={trip.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <Badge variant="primary" icon={MapPin}>
                      {stopsCount} destination{stopsCount === 1 ? '' : 's'}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pt-4 flex-1">
                  <CardTitle className="text-lg text-white group-hover:text-teal-300 transition-colors">
                    {trip.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1.5 mt-1 text-teal-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </CardDescription>
                  {trip.description && (
                    <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                      {trip.description}
                    </p>
                  )}
                </CardHeader>

                <CardFooter className="pt-3 gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={Eye}
                    className="flex-1 text-xs"
                    onClick={() => navigate(`/trips/${trip.id}`)}
                  >
                    View Trip
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label="Edit Trip"
                    onClick={() => navigate(`/trips/${trip.id}/edit`)}
                    className="p-2"
                  >
                    <Edit2 className="w-4 h-4 text-slate-300" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Delete Trip"
                    onClick={() => setDeletingTrip(trip)}
                    className="p-2 hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <EmptyState
          icon={Luggage}
          title="No trips yet"
          description="Start planning your next adventure and keep all your itineraries organized."
          actionLabel="+ Create Your First Trip"
          onAction={() => navigate('/trips/new')}
        />
      )}

      {/* Delete Modal */}
      <DeleteTripModal
        isOpen={!!deletingTrip}
        tripName={deletingTrip?.name || ''}
        onClose={() => setDeletingTrip(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </PageContainer>
  );
};

export default TripsPage;
