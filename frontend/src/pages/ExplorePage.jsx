import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Search } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import DestinationCard from '../components/travel/DestinationCard';
import SearchBar from '../components/travel/SearchBar';
import FilterBar from '../components/travel/FilterBar';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import CityDetailsModal from '../components/travel/CityDetailsModal';
import AddToTripModal from '../components/travel/AddToTripModal';
import * as cityService from '../services/cityService';

const ExplorePage = () => {
  const navigate = useNavigate();
  // Search & Filter state
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedCost, setSelectedCost] = useState('All');
  const [selectedPopularity, setSelectedPopularity] = useState('Any');

  // API Data & States
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [selectedCityForDetails, setSelectedCityForDetails] = useState(null);
  const [selectedCityForTrip, setSelectedCityForTrip] = useState(null);

  // Available Filter Options in Database
  const countries = ['All', 'France', 'India', 'Italy', 'Japan', 'USA', 'UAE', 'Egypt'];
  const regions = ['All', 'Asia', 'Europe', 'North America', 'Middle East', 'Africa'];

  // Debounce search text input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 350);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  // Fetch Cities with active filters and search query
  const loadCities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: debouncedSearch,
        country: selectedCountry,
        region: selectedRegion,
        cost: selectedCost,
        popularity: selectedPopularity,
      };

      const data = await cityService.getCities(params);
      setCities(data);
    } catch (err) {
      console.error('Error loading cities:', err);
      setError('Unable to load destinations. Please check your connection or try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCountry, selectedRegion, selectedCost, selectedPopularity]);

  // Trigger load when debounced search or filters change
  useEffect(() => {
    loadCities();
  }, [loadCities]);

  // Reset all filters to default
  const handleResetFilters = () => {
    setSearchText('');
    setSelectedCountry('All');
    setSelectedRegion('All');
    setSelectedCost('All');
    setSelectedPopularity('Any');
  };

  return (
    <PageContainer
      title="Explore Destinations"
      subtitle="Find your next destination, browse world-class spots, and build your perfect itinerary."
    >
      <div className="flex flex-col gap-6">
        
        {/* Unified Tab Navigation */}
        <div className="flex border-b border-slate-800">
          <button
            className="py-3 px-6 text-sm font-semibold border-b-2 border-teal-500 text-teal-400 cursor-pointer"
          >
            Search Destinations
          </button>
          <button
            onClick={() => navigate('/explore/recommendations')}
            className="py-3 px-6 text-sm font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Smart Recommendations
          </button>
        </div>

        {/* Search Bar */}
        <div className="w-full">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search destinations by city, country or region..."
          />
        </div>

        {/* Filter Selection Panel */}
        <FilterBar
          mode="cities"
          countries={countries}
          selectedCountry={selectedCountry}
          onCountryChange={setSelectedCountry}
          regions={regions}
          selectedRegion={selectedRegion}
          onRegionChange={setSelectedRegion}
          selectedCost={selectedCost}
          onCostChange={setSelectedCost}
          selectedPopularity={selectedPopularity}
          onPopularityChange={setSelectedPopularity}
        />

        {/* Content Section */}
        <div className="mt-4">
          {loading ? (
            /* Loading State */
            <LoadingState message="Searching destinations database..." />
          ) : error ? (
            /* Friendly Error State with Retry */
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-rose-900/40 bg-slate-900/20 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight">Search Failed</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6 leading-relaxed">
                {error}
              </p>
              <button
                type="button"
                onClick={loadCities}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 shadow-md shadow-teal-500/15 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Search
              </button>
            </div>
          ) : cities.length === 0 ? (
            /* Empty State with Clear Filters Action */
            <EmptyState
              title="No destinations found"
              description="No cities match your search filter criteria. Try resetting or clearing the options."
              actionLabel="Clear Filters"
              onAction={handleResetFilters}
            />
          ) : (
            /* Cities Responsive Grid: 1 col on mobile, 2 on tablet, 4 on desktop */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
              {cities.map((city) => {
                // Map the 1-100 scale index values from City API representation to 1-5 scales expected by components
                const displayCity = {
                  ...city,
                  costIndex: Math.ceil(city.costIndex / 20),
                  popularity: Math.ceil(city.popularity / 20),
                };
                return (
                  <DestinationCard
                    key={city.id}
                    city={displayCity}
                    onClick={() => {
                      // Clicking the card body shows details
                      setSelectedCityForDetails(city);
                    }}
                    onViewClick={() => {
                      setSelectedCityForDetails(city);
                    }}
                    onAddToTripClick={(c) => {
                      setSelectedCityForTrip(c);
                    }}
                  />
                );
              })}
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

export default ExplorePage;
