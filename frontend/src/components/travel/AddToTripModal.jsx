import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, Luggage, Check, Plus, Loader2 } from 'lucide-react';
import { getUserTrips, addCityToTrip } from '../../services/cityService';
import Button from '../ui/Button';

export const AddToTripModal = ({
  city,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [addingStop, setAddingStop] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !city) return;
    const fetchTrips = async () => {
      try {
        setLoadingTrips(true);
        const data = await getUserTrips();
        setTrips(data);
        if (data.length > 0) {
          setSelectedTripId(data[0].id); // Auto-select first trip
        }
      } catch (err) {
        setError('Unable to load trips. Please try again.');
        console.error(err);
      } finally {
        setLoadingTrips(false);
      }
    };

    fetchTrips();
  }, [isOpen, city]);

  if (!isOpen || !city) return null;

  const handleAddStop = async () => {
    if (!selectedTripId) return;

    try {
      setAddingStop(true);
      setError(null);
      await addCityToTrip(selectedTripId, city.id);
      setSuccess(true);
    } catch (err) {
      setError('Failed to add destination to trip. Please try again.');
      console.error(err);
    } finally {
      setAddingStop(false);
    }
  };

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      {/* Click outside to close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Modal Box */}
      <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {success ? 'Success!' : `Add to Trip`}
            </h3>
            {!success && (
              <p className="text-xs text-slate-400 mt-1">
                Add <span className="text-teal-400 font-semibold">{city.name}</span> to one of your travel itineraries.
              </p>
            )}
          </div>
          {!addingStop && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
              aria-label="Close add to trip"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Success View */}
        {success ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400 mb-5 shadow-lg shadow-teal-500/10 animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white tracking-tight">Destination Added</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed">
              Successfully added <span className="text-teal-400 font-medium">{city.name}</span> to your trip <span className="text-white font-medium">"{selectedTrip?.name}"</span>.
            </p>
            <div className="flex gap-3 w-full mt-8">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-all cursor-pointer text-center"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/trips');
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 shadow-md shadow-teal-500/10 hover:shadow-teal-500/25 transition-all cursor-pointer text-center"
              >
                Go to My Trips
              </button>
            </div>
          </div>
        ) : (
          /* Normal Selection View */
          <>
            <div className="p-6 flex-grow max-h-[300px] overflow-y-auto">
              {error && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                  {error}
                </div>
              )}

              {loadingTrips ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400">
                  <Loader2 className="w-7 h-7 text-teal-400 animate-spin" />
                  <span className="text-xs">Fetching your active itineraries...</span>
                </div>
              ) : trips.length === 0 ? (
                <div className="text-center py-8 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3 border border-slate-700/60">
                    <Luggage className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">No trips available</h4>
                  <p className="text-xs text-slate-400 max-w-[240px] mt-1 leading-relaxed">
                    You haven't created any travel itineraries yet. Plan one to get started!
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={Plus}
                    className="mt-5"
                    onClick={() => {
                      onClose();
                      navigate('/trips/new');
                    }}
                  >
                    Create a Trip
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                    Select Destination Trip
                  </span>
                  {trips.map((trip) => {
                    const isSelected = selectedTripId === trip.id;
                    return (
                      <div
                        key={trip.id}
                        onClick={() => setSelectedTripId(trip.id)}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-500/10 border-teal-500/40 text-teal-400 shadow-md shadow-teal-500/5'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`p-2 rounded-lg shrink-0 ${
                            isSelected ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-900 text-slate-400'
                          }`}>
                            <Luggage className="w-4 h-4" />
                          </div>
                          <div className="overflow-hidden">
                            <span className="block text-xs font-bold truncate text-white">
                              {trip.name}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-teal-500" />
                              {trip.destination}
                            </span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? 'border-teal-500 bg-teal-500 text-slate-950' : 'border-slate-800 bg-slate-950'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-5 border-t border-slate-800/60 bg-slate-950/20 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={addingStop}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-350 hover:text-white border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-center disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddStop}
                disabled={!selectedTripId || addingStop || trips.length === 0}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 shadow-lg shadow-teal-500/10 hover:shadow-teal-500/25 active:scale-[0.98] transition-all cursor-pointer text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingStop ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Adding Stop...</span>
                  </>
                ) : (
                  <span>Add City</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddToTripModal;
