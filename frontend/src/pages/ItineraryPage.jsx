import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Plus, ArrowLeft, Clock, MapPin, Compass, Sparkles } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
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

  // Toast notification state
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

      // Support backend grouped structure or flat array
      if (Array.isArray(itineraryData) && itineraryData.length > 0 && itineraryData[0].items) {
        const flatItems = itineraryData.flatMap((g) => g.items || []);
        setActivities(flatItems);
      } else {
        setActivities(Array.isArray(itineraryData) ? itineraryData : []);
      }
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
      let dateKey = 'Unscheduled';
      if (act.date) {
        dateKey = typeof act.date === 'string' ? act.date.split('T')[0] : new Date(act.date).toISOString().split('T')[0];
      }
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(act);
    });

    const sortedDates = Object.keys(map).sort((a, b) => {
      if (a === 'Unscheduled') return 1;
      if (b === 'Unscheduled') return -1;
      return new Date(a) - new Date(b);
    });

    return sortedDates.map((dateKey, idx) => {
      const sortedItems = [...map[dateKey]].sort((a, b) => {
        if ((a.order !== undefined && b.order !== undefined) && a.order !== b.order) {
          return a.order - b.order;
        }
        if (a.startTime && b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        return 0;
      });

      const cities = Array.from(
        new Set(
          sortedItems
            .map((i) => i.cityName || (i.tripStop && i.tripStop.city ? i.tripStop.city.name : ''))
            .filter(Boolean)
        )
      );

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
        const updated = await itineraryService.updateItineraryItem(tripId, editingActivity.id, formData);
        setActivities((prev) =>
          prev.map((act) => (String(act.id) === String(editingActivity.id) ? { ...act, ...updated } : act))
        );
        showToast('Itinerary activity updated successfully.');
      } else {
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

  // Reorder Handler (Move item up/down within its day)
  const handleMoveItem = async (targetItem, direction) => {
    let dateKey = 'Unscheduled';
    if (targetItem.date) {
      dateKey = typeof targetItem.date === 'string' ? targetItem.date.split('T')[0] : new Date(targetItem.date).toISOString().split('T')[0];
    }

    const dayGroup = groupedDays.find((g) => g.date === dateKey || (!g.date && dateKey === 'Unscheduled'));
    if (!dayGroup) return;

    const items = [...dayGroup.items];
    const index = items.findIndex((i) => String(i.id) === String(targetItem.id));
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    // Swap items in memory
    const temp = items[index];
    items[index] = items[newIndex];
    items[newIndex] = temp;

    // Re-assign orders
    const reorderedPayload = items.map((item, idx) => ({
      id: item.id,
      order: idx + 1,
    }));

    // Optimistic UI update
    setActivities((prev) => {
      const otherItems = prev.filter((i) => {
        let iDate = i.date ? (typeof i.date === 'string' ? i.date.split('T')[0] : new Date(i.date).toISOString().split('T')[0]) : 'Unscheduled';
        return iDate !== dateKey;
      });

      const updatedDayItems = items.map((item, idx) => ({ ...item, order: idx + 1 }));
      return [...otherItems, ...updatedDayItems];
    });

    try {
      await itineraryService.reorderItineraryItems(tripId, reorderedPayload);
      showToast('Itinerary order updated.');
    } catch (err) {
      console.error('Reorder API failed, rolling back:', err);
      fetchTripAndItinerary();
    }
  };

  const formatDateRange = (start, end) => {
    if (!start && !end) return 'Flexible Dates';
    const sStr = start ? new Date(start).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const eStr = end ? new Date(end).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    if (sStr && eStr) return `${sStr} — ${eStr}`;
    return sStr || eStr;
  };

  // Calculate trip duration in days
  const durationInDays = useMemo(() => {
    if (!trip?.startDate || !trip?.endDate) return null;
    const s = new Date(trip.startDate);
    const e = new Date(trip.endDate);
    const diffTime = Math.abs(e - s);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [trip]);

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
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary" icon={Calendar}>
                {formatDateRange(trip.startDate, trip.endDate)}
              </Badge>
              {durationInDays && (
                <Badge variant="success" icon={Clock}>
                  {durationInDays} Days Trip
                </Badge>
              )}
            </div>
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
              tripId={tripId}
              onAddActivity={(d) => handleOpenAddModal(d)}
              onEditActivity={handleOpenEditModal}
              onDeleteActivity={(act) => setDeletingActivity(act)}
              onMoveUp={(act) => handleMoveItem(act, 'up')}
              onMoveDown={(act) => handleMoveItem(act, 'down')}
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
