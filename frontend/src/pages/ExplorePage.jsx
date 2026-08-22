import React, { useState } from 'react';
import { Compass, MapPin, Star, Flame, Search } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const destinations = [
  {
    id: '1',
    name: 'Kyoto, Japan',
    category: 'Culture & Nature',
    rating: '4.9',
    description: 'Ancient temples, traditional tea houses, and sublime bamboo groves.',
    tag: 'Trending',
  },
  {
    id: '2',
    name: 'Amalfi Coast, Italy',
    category: 'Coastal Luxury',
    rating: '4.8',
    description: 'Dramatic cliffs, pastel villages, and sparkling Mediterranean waters.',
    tag: 'Popular',
  },
  {
    id: '3',
    name: 'Reykjavik, Iceland',
    category: 'Adventure',
    rating: '4.9',
    description: 'Northern lights, geothermal hot springs, and volcanic landscapes.',
    tag: 'Bucket List',
  },
];

const ExplorePage = () => {
  const [search, setSearch] = useState('');

  return (
    <PageContainer
      title="Explore Destinations"
      subtitle="Discover world-class travel spots, local guides, and top-rated itineraries."
    >
      {/* Search Header */}
      <div className="max-w-xl mb-6">
        <Input
          placeholder="Search destinations, countries, or experiences..."
          leftIcon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid of Places */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {destinations.map((place) => (
          <Card key={place.id} hoverEffect className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="primary" icon={Flame}>
                  {place.tag}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {place.rating}
                </span>
              </div>
              <CardTitle className="mt-3 text-lg flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                {place.name}
              </CardTitle>
              <CardDescription className="mt-1">{place.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">{place.category}</span>
                <Button variant="ghost" size="sm" className="text-xs text-teal-400 hover:text-teal-300">
                  Explore Guide →
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};

export default ExplorePage;
