import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Globe, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Compass, 
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LoadingState from '../components/common/LoadingState';
import shareService from '../services/shareService';

const PublicTripView = () => {
  const { shareToken } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedTrip = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await shareService.getSharedTrip(shareToken);
        setTrip(data);
      } catch (err) {
        console.error('Failed to load shared trip:', err);
        setError(err.message || 'This shared trip is no longer available. The link may have expired or been revoked.');
      } finally {
        setIsLoading(false);
      }
    };

    if (shareToken) {
      fetchSharedTrip();
    }
  }, [shareToken]);

  const formatDateRange = (start, end) => {
    if (!start && !end) return 'Flexible Dates';
    const sStr = start ? new Date(start).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const eStr = end ? new Date(end).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    if (sStr && eStr) return `${sStr} → ${eStr}`;
    return sStr || eStr;
  };

  const formatDayDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  // Group itinerary items by date and sort chronologically
  const groupedDays = useMemo(() => {
    if (!trip || !trip.itineraryItems || trip.itineraryItems.length === 0) return [];

    const map = {};
    trip.itineraryItems.forEach((item) => {
      // Form date string yyyy-mm-dd safely
      const dateKey = item.date ? new Date(item.date).toISOString().split('T')[0] : 'Unscheduled';
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(item);
    });

    const sortedDates = Object.keys(map).sort((a, b) => {
      if (a === 'Unscheduled') return 1;
      if (b === 'Unscheduled') return -1;
      return new Date(a) - new Date(b);
    });

    return sortedDates.map((dateKey, idx) => {
      const sortedItems = [...map[dateKey]].sort((a, b) => {
        if (a.startTime && b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        return (a.order || 0) - (b.order || 0);
      });

      return {
        dayNumber: idx + 1,
        date: dateKey === 'Unscheduled' ? '' : dateKey,
        items: sortedItems,
      };
    });
  }, [trip]);

  if (isLoading) {
    return <LoadingState message="Retrieving shared travel plan..." fullScreen />;
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 selection:bg-teal-500 selection:text-white">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Link Unavailable</h1>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              {error || 'This shared trip is no longer available. The link may have expired or been revoked.'}
            </p>
          </div>
          <div>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stops = trip.stops || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 selection:bg-teal-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Read-Only Logo header */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-bold text-slate-950">
              <Globe className="w-4 h-4 text-slate-950" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-black tracking-tight text-white">GlobeTrotter</span>
              <span className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider">Shared Travel Plan</span>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/login')}
            className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-900 bg-slate-900/40 hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Create Your Own Trip
          </button>
        </div>

        {/* Hero Banner (Read-only representation) */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="h-60 sm:h-72 w-full relative bg-slate-800">
            <img
              src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
              alt={trip.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          <div className="p-6 sm:p-8 -mt-20 relative z-10 space-y-4">
            <div className="space-y-1">
              <Badge variant="primary" icon={MapPin}>
                {stops.length} Destination{stops.length === 1 ? '' : 's'} Shared
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{trip.name}</h1>
              <p className="text-xs sm:text-sm text-teal-400 font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDateRange(trip.startDate, trip.endDate)}
              </p>
            </div>

            {trip.description && (
              <p className="text-xs sm:text-sm text-slate-350 max-w-3xl leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                {trip.description}
              </p>
            )}
          </div>
        </div>

        {/* Destinations List */}
        <div className="space-y-4 pt-2">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 border-b border-slate-900 pb-3">
            <MapPin className="w-4.5 h-4.5 text-teal-400" /> Planned Stops & Destinations
          </h2>
          {stops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stops.map((stop, index) => (
                <Card key={index} className="p-4 border-slate-900 bg-slate-900/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center font-bold text-teal-400 text-xs shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {stop.city?.name || 'Destination'}
                        <span className="text-[10px] font-normal text-slate-400">({stop.city?.country})</span>
                      </h4>
                      {(stop.startDate || stop.endDate) && (
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-teal-500" />
                          {formatDateRange(stop.startDate, stop.endDate)}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-dashed border-slate-900 text-center text-xs text-slate-400 bg-slate-900/10">
              No destinations scheduled.
            </div>
          )}
        </div>

        {/* Day-wise Itinerary schedule */}
        <div className="space-y-5 pt-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 border-b border-slate-900 pb-3">
            <Compass className="w-4.5 h-4.5 text-teal-400" /> Day-Wise Schedule
          </h2>

          {groupedDays.length > 0 ? (
            <div className="space-y-6">
              {groupedDays.map((day) => (
                <div key={day.dayNumber} className="space-y-3.5 pb-4 border-b border-slate-900 last:border-0 last:pb-0">
                  {/* Day Header */}
                  <div className="flex items-center gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-900">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-xs shadow-md">
                      D{day.dayNumber}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                        Day {day.dayNumber}
                        {day.date && <span className="text-xs font-semibold text-teal-400">• {formatDayDate(day.date)}</span>}
                      </h3>
                    </div>
                  </div>

                  {/* Day Activities List */}
                  <div className="space-y-3 pl-2 border-l border-slate-900 ml-4.5 pt-1">
                    {day.items.map((item, itemIdx) => (
                      <Card key={itemIdx} className="p-4 border-slate-900/80 bg-slate-900/30">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1.5">
                            <h4 className="text-sm font-bold text-white tracking-tight">
                              {item.title}
                            </h4>
                            {item.description && (
                              <p className="text-xs text-slate-400 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                            {item.location && (
                              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                <MapPin className="w-3.5 h-3.5 text-teal-500/85" />
                                <span>{item.location}</span>
                              </div>
                            )}
                          </div>
                          {item.startTime && (
                            <span className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900 border border-slate-850 text-teal-400">
                              <Clock className="w-3.5 h-3.5" />
                              {item.startTime} {item.endTime ? ` - ${item.endTime}` : ''}
                            </span>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-dashed border-slate-900 text-center text-xs text-slate-400 bg-slate-900/10">
              No itinerary items planned for this shared trip yet.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PublicTripView;
