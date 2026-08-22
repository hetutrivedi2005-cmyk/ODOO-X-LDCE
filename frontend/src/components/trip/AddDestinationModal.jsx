import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, FileText, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import * as cityService from '../../services/cityService';

const AddDestinationModal = ({ isOpen, onClose, onAddStop, isSubmitting }) => {
  const [formData, setFormData] = useState({
    cityId: '',
    cityName: '',
    country: '',
    startDate: '',
    endDate: '',
    notes: '',
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const cityInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityInputRef.current && !cityInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleCityNameChange = async (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      cityName: value,
      cityId: '', // Reset cityId when user changes query text
      country: '', // Reset country
    }));
    setError('');

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await cityService.searchCities(value);
      setSuggestions(results || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Failed to search cities:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (city) => {
    setFormData((prev) => ({
      ...prev,
      cityId: city.id,
      cityName: city.name,
      country: city.country || '',
    }));
    setSuggestions([]);
    setShowSuggestions(false);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.cityId) {
      setError('Please select a city from the suggestions.');
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
      <div className="fixed inset-0 bg-[#0f172a]/35 backdrop-blur-xs animate-fade-in" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 space-y-4 animate-scale-in">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-500">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 tracking-tight">Add Destination Stop</h3>
              <p className="text-xs text-slate-350">Add a new city or location to this trip</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-850">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/35 text-xs text-rose-500">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative" ref={cityInputRef}>
              <Input
                label="City / Location Name"
                name="cityName"
                placeholder="Search e.g. Kyoto"
                leftIcon={MapPin}
                value={formData.cityName}
                onChange={handleCityNameChange}
                onFocus={() => {
                  if (formData.cityName.trim()) {
                    setShowSuggestions(true);
                  }
                }}
                required
                autoComplete="off"
              />
              
              {showSuggestions && (
                <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800">
                  {isSearching ? (
                    <div className="p-3 text-xs text-slate-450 flex items-center gap-2">
                      <span className="inline-block w-3.5 h-3.5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      Searching cities...
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(city)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-850 transition-colors text-xs text-slate-300 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-100">{city.name}</span>
                          {city.country && <span className="text-slate-450 font-medium ml-1">({city.country})</span>}
                        </div>
                        {city.region && (
                          <span className="text-[10px] bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-slate-450 font-bold">
                            {city.region}
                          </span>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-slate-450 text-center">
                      No cities found
                    </div>
                  )}
                </div>
              )}
            </div>

            <Input
              label="Country"
              name="country"
              placeholder="Country will pre-fill"
              value={formData.country}
              onChange={handleChange}
              readOnly
              className="bg-slate-950 text-slate-450 cursor-not-allowed"
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
