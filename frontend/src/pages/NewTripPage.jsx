import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Calendar, DollarSign, Users, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

const NewTripPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    travelers: '1',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Trip planning feature will be fully connected in Module 2!');
    navigate('/trips');
  };

  return (
    <PageContainer
      title="Plan New Trip"
      subtitle="Fill in your travel preferences and let our AI create a custom itinerary for you."
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="primary" icon={Sparkles}>
                Module 1 Shell
              </Badge>
            </div>
            <CardTitle className="text-xl">Trip Preferences</CardTitle>
            <CardDescription>
              Enter details below to test our reusable input components and layout structure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Destination"
                name="destination"
                placeholder="e.g. Paris, France or Bali, Indonesia"
                leftIcon={MapPin}
                value={formData.destination}
                onChange={handleChange}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  name="startDate"
                  type="date"
                  leftIcon={Calendar}
                  value={formData.startDate}
                  onChange={handleChange}
                />
                <Input
                  label="End Date"
                  name="endDate"
                  type="date"
                  leftIcon={Calendar}
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Estimated Budget ($)"
                  name="budget"
                  type="number"
                  placeholder="2000"
                  leftIcon={DollarSign}
                  value={formData.budget}
                  onChange={handleChange}
                />
                <Input
                  label="Number of Travelers"
                  name="travelers"
                  type="number"
                  min="1"
                  leftIcon={Users}
                  value={formData.travelers}
                  onChange={handleChange}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => navigate('/trips')}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" rightIcon={ArrowRight}>
                  Generate Itinerary
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default NewTripPage;
