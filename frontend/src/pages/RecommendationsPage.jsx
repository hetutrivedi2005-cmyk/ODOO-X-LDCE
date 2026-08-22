import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw, 
  Sparkles, 
  MapPin, 
  Compass, 
  DollarSign, 
  Clock, 
  Check, 
  Search, 
  Compass as CompassIcon
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent } from '../components/ui/Card';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import CityDetailsModal from '../components/travel/CityDetailsModal';
import AddToTripModal from '../components/travel/AddToTripModal';
import CostDisplay from '../components/travel/CostDisplay';
import * as cityService from '../services/cityService';

const RecommendationsPage = () => {
  const navigate = useNavigate();

  // Recommendation Form States
  const [selectedInterest, setSelectedInterest] = useState('Adventure');
  const [selectedBudget, setSelectedBudget] = useState('Medium');
  const [selectedDuration, setSelectedDuration] = useState('4-7 days');

  // API Data & States
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Modals state
  const [selectedCityForDetails, setSelectedCityForDetails] = useState(null);
  const [selectedCityForTrip, setSelectedCityForTrip] = useState(null);

  // Constants
  const interests = [
    { name: 'Adventure', icon: Compass },
    { name: 'Beach', icon: CompassIcon },
    { name: 'Nature', icon: Sparkles },
    { name: 'Culture', icon: Sparkles },
    { name: 'Food', icon: Sparkles },
    { name: 'History', icon: Clock }
  ];

  const budgets = [
    { label: 'Low ($)', value: 'Low' },
    { label: 'Medium ($$)', value: 'Medium' },
    { label: 'High ($$$)', value: 'High' }
  ];

  const durations = [
    { label: '1–3 Days (Weekend)', value: '1-3 days' },
    { label: '4–7 Days (Weeklong)', value: '4-7 days' },
    { label: '8+ Days (Extended)', value: '8+ days' }
  ];

  // Fetch Recommendations based on form parameters
  const loadRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      const params = {
        interest: selectedInterest,
        budget: selectedBudget,
        duration: selectedDuration
      };

      const data = await cityService.getRecommendations(params);
      setRecommendations(data);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Unable to load travel recommendations. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedInterest, selectedBudget, selectedDuration]);

  // Load recommendations automatically on mount
  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const handleResetForm = () => {
    setSelectedInterest('Adventure');
    setSelectedBudget('Medium');
    setSelectedDuration('4-7 days');
    setRecommendations([]);
    setHasSearched(false);
  };

  return (
    <PageContainer
      title="Travel Intelligence"
      subtitle="Discover personalized destinations suggested by our smart scoring engine based on your preferences."
    >
      <div className="flex flex-col gap-6">
        
        {/* Unified Tab Navigation */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => navigate('/explore')}
            className="py-3 px-6 text-sm font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Search Destinations
          </button>
          <button
            className="py-3 px-6 text-sm font-semibold border-b-2 border-teal-500 text-teal-400 cursor-pointer"
          >
            Smart Recommendations
          </button>
        </div>

        {/* Preference Form Section */}
        <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-md">
          <CardContent className="p-6">
            <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              Configure Travel Preferences
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Interest Grid */}
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">
                  1. What is your primary interest?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {interests.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedInterest === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setSelectedInterest(item.name)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left active:scale-[0.98] ${
                          isSelected
                            ? 'bg-teal-500/10 border-teal-500 text-teal-400'
                            : 'bg-slate-900 border-slate-800 text-slate-350 hover:border-slate-700 hover:text-slate-100'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-teal-400' : 'text-slate-500'}`} />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget Toggle */}
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">
                  2. Select Budget Level
                </label>
                <div className="flex flex-col gap-2">
                  {budgets.map((item) => {
                    const isSelected = selectedBudget === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setSelectedBudget(item.value)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] ${
                          isSelected
                            ? 'bg-teal-500/10 border-teal-500 text-teal-400'
                            : 'bg-slate-900 border-slate-800 text-slate-350 hover:border-slate-700 hover:text-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <DollarSign className={`w-4 h-4 ${isSelected ? 'text-teal-400' : 'text-slate-500'}`} />
                          <span>{item.label}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-teal-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration Toggle */}
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">
                  3. Trip Duration
                </label>
                <div className="flex flex-col gap-2">
                  {durations.map((item) => {
                    const isSelected = selectedDuration === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setSelectedDuration(item.value)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] ${
                          isSelected
                            ? 'bg-teal-500/10 border-teal-500 text-teal-400'
                            : 'bg-slate-900 border-slate-800 text-slate-350 hover:border-slate-700 hover:text-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className={`w-4 h-4 ${isSelected ? 'text-teal-400' : 'text-slate-500'}`} />
                          <span>{item.label}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-teal-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-800">
              <button
                type="button"
                onClick={handleResetForm}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={loadRecommendations}
                className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 disabled:opacity-55 shadow-md shadow-teal-500/10 transition-all cursor-pointer active:scale-[0.98]"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Find Destinations
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Results Content Section */}
        <div className="mt-4">
          {loading ? (
            <LoadingState message="Analyzing and scoring destinations database..." />
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-rose-900/40 bg-slate-900/20 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight">Failed to Load Recommendations</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6 leading-relaxed">
                {error}
              </p>
              <button
                type="button"
                onClick={loadRecommendations}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 shadow-md shadow-teal-500/15 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          ) : hasSearched && recommendations.length === 0 ? (
            <EmptyState
              title="No recommendations found"
              description="No destinations match your exact budget or interest preferences. Try expanding your search options."
              actionLabel="Reset Preferences"
              onAction={handleResetForm}
            />
          ) : (
            <div className="flex flex-col gap-4">
              {hasSearched && (
                <div className="text-xs text-slate-400 flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  Showing top destinations ranked by matching compatibility:
                </div>
              )}

              {/* Recommendation Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {recommendations.map((item) => {
                  const displayCity = {
                    ...item,
                    costIndex: Math.ceil(item.costIndex / 20),
                    popularity: Math.ceil(item.popularity / 20),
                  };

                  return (
                    <Card
                      key={item.id}
                      hoverEffect
                      className="flex flex-col group cursor-pointer border-slate-800 bg-slate-900/50"
                      onClick={() => setSelectedCityForDetails(item)}
                    >
                      {/* Image container */}
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80'}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* Score Overlay Badge */}
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-lg shadow-teal-500/20">
                            <Sparkles className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                            Score: {item.score}/9
                          </span>
                        </div>
                        {/* Country Tag */}
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900/80 border border-slate-800 text-slate-100 backdrop-blur-sm shadow-md">
                            {item.country}
                          </span>
                        </div>
                      </div>

                      {/* Content details */}
                      <CardContent className="flex flex-col flex-grow p-5">
                        <div className="flex-grow">
                          <h4 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 group-hover:text-teal-400 transition-colors">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-teal-500" />
                            <span>{item.region}</span>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-2 mt-3 leading-relaxed">
                            {item.description}
                          </p>

                          {/* Matching criteria checklist */}
                          <div className="mt-4 py-2.5 px-3 rounded-xl bg-teal-950/20 border border-teal-500/10 flex flex-col gap-1.5 text-[11px] text-teal-400">
                            {item.reasons?.map((reason, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Card metadata (popularity/cost) */}
                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-800/60">
                          <div>
                            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Trip Rating</span>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Sparkles
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < displayCity.popularity ? 'fill-amber-400 text-amber-400' : 'text-slate-700 fill-slate-800'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Cost Level</span>
                            <CostDisplay costIndex={displayCity.costIndex} />
                          </div>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800/60">
                          <button
                            type="button"
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-850 hover:bg-slate-800 text-slate-350 hover:text-white border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-center active:scale-[0.98]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCityForDetails(item);
                            }}
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 shadow-md shadow-teal-500/10 hover:shadow-teal-500/20 active:scale-[0.98] transition-all cursor-pointer text-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCityForTrip(item);
                            }}
                          >
                            Add to Trip
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* City Details Information Modal */}
      <CityDetailsModal
        isOpen={selectedCityForDetails !== null}
        city={selectedCityForDetails}
        onClose={() => setSelectedCityForDetails(null)}
        onAddToTrip={(c) => {
          setSelectedCityForDetails(null);
          setSelectedCityForTrip(c);
        }}
      />

      {/* Add To Trip Stop Selection Modal */}
      <AddToTripModal
        isOpen={selectedCityForTrip !== null}
        city={selectedCityForTrip}
        onClose={() => setSelectedCityForTrip(null)}
      />
    </PageContainer>
  );
};

export default RecommendationsPage;
