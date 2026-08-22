import React, { useState } from 'react';
import { MapPin, Calendar, FileText, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const AddDestinationModal = ({ isOpen, onClose, onAddStop, isSubmitting }) => {
  const [formData, setFormData] = useState({
    cityName: '',
    country: '',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.cityName.trim()) {
      setError('City name is required.');
      return;
    }

    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    onAddStop(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 space-y-4 animate-scale-in">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Add Destination Stop</h3>
              <p className="text-xs text-slate-400">Add a new city or location to this trip</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City / Location Name"
              name="cityName"
              placeholder="e.g. Kyoto"
              leftIcon={MapPin}
              value={formData.cityName}
              onChange={handleChange}
              required
            />
            <Input
              label="Country"
              name="country"
              placeholder="e.g. Japan"
              value={formData.country}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Stop Start Date"
              name="startDate"
              type="date"
              leftIcon={Calendar}
              value={formData.startDate}
              onChange={handleChange}
            />
            <Input
              label="Stop End Date"
              name="endDate"
              type="date"
              leftIcon={Calendar}
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Notes / Highlights"
            name="notes"
            placeholder="e.g. Visit shrines, food markets, local transport pass..."
            leftIcon={FileText}
            value={formData.notes}
            onChange={handleChange}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
              Add Destination
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDestinationModal;
