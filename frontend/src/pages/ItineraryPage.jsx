import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Plus, ArrowLeft, Clock, MapPin, Compass, Sparkles } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import ItineraryDaySection from '../components/itinerary/ItineraryDaySection';
import ActivityModal from '../components/itinerary/ActivityModal';
import DeleteActivityModal from '../components/itinerary/DeleteActivityModal';
import itineraryService from '../services/itineraryService';
import tripService from '../services/tripService';

const ItineraryPage = () => {
  const { id: tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Toast / feedback message state
  const [toastMessage, setToastMessage] = useState('');

  // Modals state
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [defaultDateForModal, setDefaultDateForModal] = useState('');
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);

  const [deletingActivity, setDeletingActivity] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTripAndItinerary = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [tripData, itineraryData] = await Promise.all([
        tripService.getTripById(tripId),
        itineraryService.getItinerary(tripId),
      ]);
      setTrip(tripData);
      setActivities(Array.isArray(itineraryData) ? itineraryData : []);
    } catch (err) {
      console.error('Failed to load itinerary:', err);
      setError(err.message || 'Unable to load itinerary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTripAndItinerary();
  }, [fetchTripAndItinerary]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Group activities by date and sort
  const groupedDays = useMemo(() => {
    if (!activities || activities.length === 0) return [];

    const map = {};
    activities.forEach((act) => {
      const dateKey = act.date || 'Unscheduled';
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(act);
    });

    // Sort dates chronologically
    const sortedDates = Object.keys(map).sort((a, b) => {
      if (a === 'Unscheduled') return 1;
      if (b === 'Unscheduled') return -1;
      return new Date(a) - new Date(b);
    });

    return sortedDates.map((dateKey, idx) => {
      // Sort items within day by startTime or order
      const sortedItems = [...map[dateKey]].sort((a, b) => {
        if (a.startTime && b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        return (a.order || 0) - (b.order || 0);
      });

      // Collect unique city names for the day section header
      const cities = Array.from(new Set(sortedItems.map((i) => i.cityName).filter(Boolean)));

      return {
        dayNumber: idx + 1,
        date: dateKey === 'Unscheduled' ? '' : dateKey,
        cityNames: cities,
        items: sortedItems,
      };
    });
  }, [activities]);

  const handleOpenAddModal = (dateStr = '') => {
    setEditingActivity(null);
    setDefaultDateForModal(dateStr || trip?.startDate || '');
    setIsActivityModalOpen(true);
  };

  const handleOpenEditModal = (activityItem) => {
    setEditingActivity(activityItem);
    setIsActivityModalOpen(true);
  };

  const handleActivitySubmit = async (formData) => {
    setIsSubmittingActivity(true);
    try {
      if (editingActivity) {
        // Edit mode
        const updated = await itineraryService.updateItineraryItem(tripId, editingActivity.id, formData);
        setActivities((prev) =>
          prev.map((act) => (String(act.id) === String(editingActivity.id) ? { ...act, ...updated } : act))
        );
        showToast('Itinerary activity updated successfully.');
      } else {
        // Create mode
        const created = await itineraryService.createItineraryItem(tripId, formData);
        setActivities((prev) => [...prev, created]);
        showToast('Itinerary activity added successfully.');
      }
      setIsActivityModalOpen(false);
    } catch (err) {
      console.error('Failed to save activity:', err);
      alert(err.message || 'Failed to save activity.');
    } finally {
      setIsSubmittingActivity(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingActivity) return;
    setIsDeleting(true);
    try {
      await itineraryService.deleteItineraryItem(tripId, deletingActivity.id);
      setActivities((prev) => prev.filter((act) => String(act.id) !== String(deletingActivity.id)));
      setDeletingActivity(null);
      showToast('Activity deleted successfully.');
    } catch (err) {
      console.error('Failed to delete activity:', err);
      alert(err.message || 'Failed to delete activity.');
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

  if (isLoading) {
    return <LoadingState message="Loading itinerary plans..." fullScreen={false} />;
  }

  if (error || !trip) {
    return (
      <PageContainer>
        <EmptyState
          icon={Compass}
          title="Itinerary Not Available"
          description={error || 'Unable to load trip details for itinerary planning.'}
          actionLabel="Back to My Trips"
          onAction={() => navigate('/trips')}
        />
      </PageContainer>
    );
  }

  const tripStops = trip.stops || [];

  return (
    <PageContainer>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs shadow-2xl animate-slide-in flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back Button */}
      <div className="mb-2">
        <Button variant="ghost" size="sm" leftIcon={ArrowLeft} onClick={() => navigate(`/trips/${tripId}`)}>
          Back to Trip Details
        </Button>
      </div>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="primary" icon={Calendar}>
              {formatDateRange(trip.startDate, trip.endDate)}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{trip.name} — Itinerary</h1>
            <p className="text-xs text-slate-400">
              Day-by-day activity schedule ({activities.length} total activity{activities.length === 1 ? '' : 'ies'})
            </p>
          </div>

          <Button variant="primary" size="sm" leftIcon={Plus} onClick={() => handleOpenAddModal()}>
            Add Activity
          </Button>
        </div>
      </div>

      {/* Main Day-wise Content */}
      <div className="space-y-6 pt-4">
        {groupedDays.length > 0 ? (
          groupedDays.map((dayGroup) => (
            <ItineraryDaySection
              key={dayGroup.dayNumber}
              dayNumber={dayGroup.dayNumber}
              date={dayGroup.date}
              cityNames={dayGroup.cityNames}
              items={dayGroup.items}
              onAddActivity={(d) => handleOpenAddModal(d)}
              onEditActivity={handleOpenEditModal}
              onDeleteActivity={(act) => setDeletingActivity(act)}
            />
          ))
        ) : (
          /* Empty State */
          <EmptyState
            icon={Compass}
            title="No itinerary yet"
            description="Start planning your day-by-day adventure by adding your first activity."
            actionLabel="+ Add First Activity"
            onAction={() => handleOpenAddModal()}
          />
        )}
      </div>

      {/* Activity Create/Edit Modal */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onSubmit={handleActivitySubmit}
        initialData={
          editingActivity || (defaultDateForModal ? { date: defaultDateForModal } : null)
        }
        tripStops={tripStops}
        isSubmitting={isSubmittingActivity}
      />

      {/* Delete Confirmation Modal */}
      <DeleteActivityModal
        isOpen={!!deletingActivity}
        activityTitle={deletingActivity?.title || ''}
        onClose={() => setDeletingActivity(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </PageContainer>
  );
};

export default ItineraryPage;
