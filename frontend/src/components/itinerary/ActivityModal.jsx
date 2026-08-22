import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Tag, FileText, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ActivityModal = ({ isOpen, onClose, onSubmit, initialData, tripStops = [], isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    cityName: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        date: initialData.date || '',
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        location: initialData.location || '',
        cityName: initialData.cityName || (tripStops.length > 0 ? tripStops[0].cityName || tripStops[0].name : ''),
      });
    } else {
      setFormData({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        cityName: tripStops.length > 0 ? tripStops[0].cityName || tripStops[0].name : '',
      });
    }
    setErrors({});
  }, [initialData, isOpen, tripStops]);

  if (!isOpen) return null;

  const isEditMode = !!initialData?.id;

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Activity title is required.';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required.';
    }

    if (formData.startTime && formData.endTime && formData.endTime < formData.startTime) {
      newErrors.endTime = 'End time cannot be earlier than start time.';
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
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 space-y-4 animate-scale-in">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white tracking-tight">
            {isEditMode ? 'Edit Activity' : 'Add Itinerary Activity'}
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitForm} className="space-y-4" noValidate>
          <Input
            label="Activity Title *"
            name="title"
            placeholder="e.g. Visit Eiffel Tower, Lunch at Local Bistro"
            leftIcon={FileText}
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            disabled={isSubmitting}
            required
          />

          <Input
            label="Description (Optional)"
            name="description"
            placeholder="Notes, ticket details, or tour specifics..."
            value={formData.description}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date *"
              name="date"
              type="date"
              leftIcon={Calendar}
              value={formData.date}
              onChange={handleChange}
              error={errors.date}
              disabled={isSubmitting}
              required
            />

            {/* Trip Stop / City Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300 tracking-wide">
                City / Trip Stop
              </label>
              <div className="relative flex items-center">
                <select
                  name="cityName"
                  value={formData.cityName}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="">Select City / Stop</option>
                  {tripStops.map((stop, idx) => (
                    <option key={stop.id || idx} value={stop.cityName || stop.name}>
                      {stop.cityName || stop.name} {stop.country ? `(${stop.country})` : ''}
                    </option>
                  ))}
                  <option value="General">General / Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Time"
              name="startTime"
              type="time"
              leftIcon={Clock}
              value={formData.startTime}
              onChange={handleChange}
              disabled={isSubmitting}
            />

            <Input
              label="End Time"
              name="endTime"
              type="time"
              leftIcon={Clock}
              value={formData.endTime}
              onChange={handleChange}
              error={errors.endTime}
              disabled={isSubmitting}
            />
          </div>

          <Input
            label="Specific Location / Address"
            name="location"
            placeholder="e.g. Champ de Mars, 5 Avenue Anatole France"
            leftIcon={MapPin}
            value={formData.location}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Activity' : 'Add Activity'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityModal;
