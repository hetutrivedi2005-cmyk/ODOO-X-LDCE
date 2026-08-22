import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Compass, Calendar, FileText, Image as ImageIcon, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import tripService from '../services/tripService';

const EditTripPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    coverImage: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      setIsLoading(true);
      setServerError('');
      try {
        const trip = await tripService.getTripById(id);
        setFormData({
          name: trip.name || '',
          description: trip.description || '',
          startDate: trip.startDate || '',
          endDate: trip.endDate || '',
          coverImage: trip.coverImage || '',
        });
      } catch (err) {
        console.error('Failed to load trip for editing:', err);
        setServerError(err.message || 'Failed to load trip details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Trip name is required.';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required.';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required.';
    } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date cannot be earlier than start date.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await tripService.updateTrip(id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        coverImage: formData.coverImage.trim() || undefined,
      });

      navigate(`/trips/${id}`);
    } catch (err) {
      console.error('Failed to update trip:', err);
      setServerError(err.message || 'Unable to save trip updates.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading trip details..." />;
  }

  return (
    <PageContainer
      title="Edit Trip Details"
      subtitle="Update dates, title, description, or cover image for this trip."
    >
      <div className="mb-2">
        <Button variant="ghost" size="sm" leftIcon={ArrowLeft} onClick={() => navigate(`/trips/${id}`)}>
          Back to Trip Details
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Edit Trip Information</CardTitle>
            <CardDescription>Modify fields below and click save to apply changes.</CardDescription>
          </CardHeader>
          <CardContent>
            {serverError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-400">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Trip Name *"
                name="name"
                placeholder="e.g. Europe Adventure"
                leftIcon={Compass}
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                disabled={isSubmitting}
                required
              />

              <Input
                label="Description"
                name="description"
                placeholder="Summary of trip goals..."
                leftIcon={FileText}
                value={formData.description}
                onChange={handleChange}
                disabled={isSubmitting}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Start Date *"
                  name="startDate"
                  type="date"
                  leftIcon={Calendar}
                  value={formData.startDate}
                  onChange={handleChange}
                  error={errors.startDate}
                  disabled={isSubmitting}
                  required
                />

                <Input
                  label="End Date *"
                  name="endDate"
                  type="date"
                  leftIcon={Calendar}
                  value={formData.endDate}
                  onChange={handleChange}
                  error={errors.endDate}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <Input
                label="Cover Image URL"
                name="coverImage"
                type="url"
                placeholder="https://images.unsplash.com/..."
                leftIcon={ImageIcon}
                value={formData.coverImage}
                onChange={handleChange}
                disabled={isSubmitting}
              />

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <Button variant="outline" type="button" onClick={() => navigate(`/trips/${id}`)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  leftIcon={Save}
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default EditTripPage;
