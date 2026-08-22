import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Edit2, Trash2, Plus, ArrowLeft, Clock, FileText } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import DeleteTripModal from '../components/trip/DeleteTripModal';
import AddDestinationModal from '../components/trip/AddDestinationModal';
import tripService from '../services/tripService';

const TripDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddDestinationModalOpen, setIsAddDestinationModalOpen] = useState(false);
  const [isAddingStop, setIsAddingStop] = useState(false);

  const fetchTripDetails = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await tripService.getTripById(id);
      setTrip(data);
    } catch (err) {
      console.error('Failed to load trip details:', err);
      setError(err.message || 'Trip not found or unable to load details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTripDetails();
  }, [fetchTripDetails]);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await tripService.deleteTrip(id);
      navigate('/trips');
    } catch (err) {
      console.error('Failed to delete trip:', err);
      alert(err.message || 'Failed to delete trip.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddStopSubmit = async (stopData) => {
    setIsAddingStop(true);
    try {
      const newStop = await tripService.addStopToTrip(id, stopData);
      setTrip((prev) => ({
        ...prev,
        stops: [...(prev.stops || []), newStop],
      }));
      setIsAddDestinationModalOpen(false);
    } catch (err) {
      console.error('Failed to add stop:', err);
      alert(err.message || 'Failed to add destination stop.');
    } finally {
      setIsAddingStop(false);
    }
  };

  const formatDateRange = (start, end) => {
    if (!start && !end) return 'Flexible Dates';
    const sStr = start ? new Date(start).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const eStr = end ? new Date(end).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    if (sStr && eStr) return `${sStr} → ${eStr}`;
    return sStr || eStr;
  };

  if (isLoading) {
    return <LoadingState message="Loading trip details..." fullScreen={false} />;
  }

  if (error || !trip) {
    return (
      <PageContainer>
        <EmptyState
          icon={MapPin}
          title="Trip Not Found"
          description={error || "We couldn't find the requested trip details."}
          actionLabel="Back to My Trips"
          onAction={() => navigate('/trips')}
        />
      </PageContainer>
    );
  }

  const stops = trip.stops || [];

  return (
    <PageContainer>
      {/* Back button */}
      <div className="mb-2">
        <Button variant="ghost" size="sm" leftIcon={ArrowLeft} onClick={() => navigate('/trips')}>
          Back to My Trips
        </Button>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="h-64 sm:h-80 w-full relative bg-slate-800">
          <img
            src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
            alt={trip.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        {/* Hero Details Header */}
        <div className="p-6 sm:p-8 -mt-20 relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <Badge variant="primary" icon={MapPin}>
                {stops.length} Destination{stops.length === 1 ? '' : 's'} Planned
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{trip.name}</h1>
              <p className="text-sm text-teal-400 font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDateRange(trip.startDate, trip.endDate)}
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                leftIcon={Clock}
                onClick={() => navigate(`/trips/${trip.id}/itinerary`)}
              >
                Day-wise Itinerary
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={Plus}
                onClick={() => setIsAddDestinationModalOpen(true)}
              >
                Add Destination
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={Edit2}
                onClick={() => navigate(`/trips/${trip.id}/edit`)}
              >
                Edit Trip
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {trip.description && (
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              {trip.description}
            </p>
          )}
        </div>
      </div>

      {/* Itinerary Destinations / Stops Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-400" /> Destinations & Itinerary Stops
          </h2>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Plus}
            onClick={() => setIsAddDestinationModalOpen(true)}
            className="text-xs text-teal-400 hover:text-teal-300"
          >
            Add Stop
          </Button>
        </div>

        {stops.length > 0 ? (
          <div className="space-y-4">
            {stops.map((stop, index) => (
              <Card key={stop.id || index} className="p-5 border-slate-800/80 bg-slate-900/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center font-bold text-teal-400 shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {stop.cityName || stop.name}
                        {stop.country && <span className="text-xs font-normal text-slate-400">({stop.country})</span>}
                      </h3>
                      {(stop.startDate || stop.endDate) && (
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                          <Clock className="w-3.5 h-3.5 text-teal-400" />
                          {formatDateRange(stop.startDate, stop.endDate)}
                        </p>
                      )}
                      {stop.notes && (
                        <p className="text-xs text-slate-300 mt-2 flex items-start gap-1.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{stop.notes}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={MapPin}
            title="No destinations added yet"
            description="Start building your itinerary by adding cities and stops to this trip."
            actionLabel="+ Add First Destination"
            onAction={() => setIsAddDestinationModalOpen(true)}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteTripModal
        isOpen={isDeleteModalOpen}
        tripName={trip.name}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {/* Add Destination Modal */}
      <AddDestinationModal
        isOpen={isAddDestinationModalOpen}
        onClose={() => setIsAddDestinationModalOpen(false)}
        onAddStop={handleAddStopSubmit}
        isSubmitting={isAddingStop}
      />
    </PageContainer>
  );
};

export default TripDetailsPage;
