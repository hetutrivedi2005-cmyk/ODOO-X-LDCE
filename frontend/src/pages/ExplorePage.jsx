import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import DestinationCard from '../components/travel/DestinationCard';
import ActivityCard from '../components/travel/ActivityCard';
import TripCard from '../components/travel/TripCard';
import SearchBar from '../components/travel/SearchBar';
import FilterBar from '../components/travel/FilterBar';
import DateDisplay from '../components/travel/DateDisplay';
import CostDisplay from '../components/travel/CostDisplay';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';

// Sample travel data shapes
const SAMPLE_CITIES = [
  {
    id: 'c1',
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    costIndex: 4,
    popularity: 5,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'c2',
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    costIndex: 4,
    popularity: 5,
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'c3',
    name: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    costIndex: 2,
    popularity: 4,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'c4',
    name: 'Cairo',
    country: 'Egypt',
    region: 'Africa',
    costIndex: 1,
    popularity: 3,
    image: 'https://images.unsplash.com/photo-1572252009286-268acec5a0af?auto=format&fit=crop&w=600&q=80',
  },
];

const SAMPLE_ACTIVITIES = [
  {
    id: 'a1',
    name: 'Sushi Making Masterclass',
    cityId: 'c2',
    description: 'Learn the ancient art of sushi making from an authentic local chef, with fresh ingredients and tasting.',
    category: 'Dining',
    duration: 180,
    estimatedCost: 85,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'a2',
    name: 'Louvre Guided Art Tour',
    cityId: 'c1',
    description: 'Explore historical masterpieces, including the Mona Lisa, with skip-the-line museum entry and a licensed guide.',
    category: 'Culture',
    duration: 120,
    estimatedCost: 35,
    image: 'https://images.unsplash.com/photo-1601887389937-0b02c26b6c3c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'a3',
    name: 'Mount Batur Sunrise Trek',
    cityId: 'c3',
    description: 'Hike to the active volcanic summit of Mount Batur in the early morning to catch a stunning sunrise above the clouds.',
    category: 'Adventure',
    duration: 300,
    estimatedCost: 50,
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=80',
  },
];

const SAMPLE_TRIPS = [
  {
    id: 't1',
    name: 'Summer Europe Escapade',
    description: 'A grand multi-city trip exploring Paris, Rome, and Barcelona with customized culinary tours and museum tickets.',
    startDate: '2026-07-01',
    endDate: '2026-07-15',
    coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 't2',
    name: 'East Asia Exploration',
    description: 'Discovering modern neon structures and serene temple retreats across Tokyo, Kyoto, and Seoul.',
    startDate: '2026-10-10',
    endDate: '2026-10-25',
    coverImage: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80',
  },
];

const ExplorePage = () => {
  // Search & Filter state
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCostIndex, setSelectedCostIndex] = useState(undefined);
  
  // Interactive UI configs
  const [loading, setLoading] = useState(false);
  const [showEmptyStateDemo, setShowEmptyStateDemo] = useState(false);
  const [eventLogs, setEventLogs] = useState(['Playground initialized. Click elements to register actions.']);

  const addLog = (msg) => {
    setEventLogs((prev) => [msg, ...prev.slice(0, 5)]);
  };

  // Unique categories for filter tags
  const categories = Array.from(new Set(SAMPLE_ACTIVITIES.map((act) => act.category)));

  // Filter lists based on interactive states
  const filteredCities = SAMPLE_CITIES.filter((city) => {
    const matchesSearch = city.name.toLowerCase().includes(searchText.toLowerCase()) || 
                          city.country.toLowerCase().includes(searchText.toLowerCase()) ||
                          city.region.toLowerCase().includes(searchText.toLowerCase());
    const matchesCost = selectedCostIndex === undefined || city.costIndex === selectedCostIndex;
    return matchesSearch && matchesCost;
  });

  const filteredActivities = SAMPLE_ACTIVITIES.filter((act) => {
    const matchesSearch = act.name.toLowerCase().includes(searchText.toLowerCase()) ||
                          act.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || act.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageContainer
      title="Explore Destinations"
      subtitle="Discover world-class travel spots, local guides, and top-rated itineraries."
    >
      {/* Control Panel & Log Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-sm">
          <span className="block text-[10px] uppercase font-bold tracking-wider text-teal-400 mb-3">State Controls</span>
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                loading 
                  ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md shadow-amber-500/10' 
                  : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
              onClick={() => {
                setLoading(!loading);
                addLog(`Toggled LoadingState: ${!loading}`);
              }}
            >
              {loading ? 'Stop Loading' : 'Simulate LoadingState'}
            </button>
            <button 
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                showEmptyStateDemo 
                  ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md shadow-amber-500/10' 
                  : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
              onClick={() => {
                setShowEmptyStateDemo(!showEmptyStateDemo);
                addLog(`Toggled EmptyState: ${!showEmptyStateDemo}`);
              }}
            >
              {showEmptyStateDemo ? 'Hide Empty State' : 'Simulate EmptyState'}
            </button>
            <button 
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-800 bg-slate-900/20 text-slate-400 hover:text-slate-200 transition-all flex items-center gap-1 cursor-pointer"
              onClick={() => {
                setSearchText('');
                setSelectedCategory('All');
                setSelectedCostIndex(undefined);
                addLog('Reset all filters.');
              }}
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 font-mono text-[11px] text-slate-400">
          <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2">Developer Logs</span>
          <div className="flex flex-col gap-1.5 max-h-[85px] overflow-y-auto">
            {eventLogs.map((log, idx) => (
              <div key={idx} className={idx === 0 ? 'text-teal-400' : ''}>
                &gt; {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Sandbox Content */}
      <div className="flex flex-col gap-10">
        
        {/* Search & Filter Bar Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">1 & 2. Search & Filter Bar</h3>
          <SearchBar 
            value={searchText} 
            onChange={(val) => {
              setSearchText(val);
              addLog(`Search: "${val}"`);
            }} 
          />
          <FilterBar 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={(cat) => {
              setSelectedCategory(cat);
              addLog(`Category: "${cat}"`);
            }}
            selectedCostIndex={selectedCostIndex}
            onCostIndexChange={(idx) => {
              setSelectedCostIndex(idx);
              addLog(`Cost Level: ${idx !== undefined ? '$'.repeat(idx) : 'None'}`);
            }}
          />
        </div>

        {/* Loading and Empty State Demos */}
        {(loading || showEmptyStateDemo) && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">Simulated States</h3>
            {loading && <LoadingState message="Fetching travel database information..." />}
            {showEmptyStateDemo && (
              <EmptyState 
                title="No Trip Stops Found" 
                description="Your itinerary path is currently empty. Get started by selecting a destination card below." 
                actionLabel="Reset Sandbox"
                onAction={() => {
                  addLog('Empty state action clicked.');
                  setSearchText('');
                  setSelectedCostIndex(undefined);
                  setShowEmptyStateDemo(false);
                }}
              />
            )}
          </div>
        )}

        {/* Destination Cards Section */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 mb-5">
            3. DestinationCard (City Model)
          </h3>
          {filteredCities.length === 0 ? (
            <EmptyState 
              title="No Destinations Found" 
              description="No cities match your search filter settings."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCities.map((city) => (
                <DestinationCard 
                  key={city.id} 
                  city={city} 
                  onClick={(id) => addLog(`Clicked CityCard: ${city.name} (${id})`)} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Activity Cards Section */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 mb-5">
            4. ActivityCard (Activity Model)
          </h3>
          {filteredActivities.length === 0 ? (
            <EmptyState 
              title="No Activities Found" 
              description="No activities match the selected filters."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredActivities.map((act) => (
                <ActivityCard 
                  key={act.id} 
                  activity={act} 
                  onClick={(id) => addLog(`Clicked ActivityCard: ${act.name} (${id})`)} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Trip Cards Section */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 mb-5">
            5. TripCard (Trip Model)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SAMPLE_TRIPS.map((trip) => (
              <TripCard 
                key={trip.id} 
                trip={trip} 
                onClick={(id) => addLog(`Clicked TripCard: ${trip.name} (${id})`)} 
              />
            ))}
          </div>
        </div>

        {/* Display Components Section (Badges, Cost, Date) */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 mb-5">
            6, 7 & 8. Displays & Atoms
          </h3>
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-sm grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Badges */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Badge Variants</span>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="primary" onClick={() => addLog('Clicked Primary Badge')}>Primary</Badge>
                <Badge variant="success" onClick={() => addLog('Clicked Success Badge')}>Success</Badge>
                <Badge variant="warning" onClick={() => addLog('Clicked Warning Badge')}>Warning</Badge>
                <Badge variant="danger" onClick={() => addLog('Clicked Danger Badge')}>Danger</Badge>
                <Badge variant="info" onClick={() => addLog('Clicked Info Badge')}>Info</Badge>
              </div>
            </div>

            {/* Date Display */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">DateDisplay Examples</span>
              <div>
                <span className="block text-[9px] text-slate-650 uppercase mb-1 font-semibold">Single Date</span>
                <DateDisplay dateString="2026-08-22" />
              </div>
              <div>
                <span className="block text-[9px] text-slate-650 uppercase mb-1 font-semibold">Date Range</span>
                <DateDisplay dateString="2026-08-22" endDateString="2026-08-31" />
              </div>
            </div>

            {/* Cost Display */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">CostDisplay Examples</span>
              <div>
                <span className="block text-[9px] text-slate-650 uppercase mb-1 font-semibold">Relative Index</span>
                <CostDisplay costIndex={3} />
              </div>
              <div>
                <span className="block text-[9px] text-slate-650 uppercase mb-1 font-semibold">Price Amount</span>
                <CostDisplay amount={150} />
              </div>
              <div>
                <span className="block text-[9px] text-slate-650 uppercase mb-1 font-semibold">Combined View</span>
                <CostDisplay costIndex={4} amount={2400} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  );
};

export default ExplorePage;
