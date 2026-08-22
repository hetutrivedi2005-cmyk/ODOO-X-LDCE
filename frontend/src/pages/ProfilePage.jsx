import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Globe, Settings, Camera, ChevronDown } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
];

const LANGUAGES = [
  'English (US)',
  'English (UK)',
  'Hindi',
  'Gujarati',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Japanese',
  'Chinese',
];

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    currency: 'USD',
    language: 'English (US)',
    avatarUrl: '',
  });

  const [avatarPreview, setAvatarPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        currency: user.currency || 'USD',
        language: user.language || 'English (US)',
        avatarUrl: user.avatarUrl || '',
      });
      setAvatarPreview(user.avatarUrl || '');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setAvatarPreview(base64String);
      setFormData((prev) => ({ ...prev, avatarUrl: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    setFormData((prev) => ({ ...prev, avatarUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setError('');

    try {
      const updatedUser = await authService.updateProfile({
        name: formData.name,
        currency: formData.currency,
        language: formData.language,
        avatarUrl: formData.avatarUrl,
      });

      updateUser(updatedUser);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'GT';
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <PageContainer
      title="User Profile"
      subtitle="Manage your GlobeTrotter account details, travel preferences, and security settings."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="text-center p-6 flex flex-col items-center bg-slate-900 border-slate-800">
          {/* Avatar Container */}
          <div className="relative group w-24 h-24 mb-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full rounded-full overflow-hidden border-2 border-slate-700 bg-slate-950 flex items-center justify-center shadow-xl shadow-teal-500/10 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 relative group-hover:border-teal-400 cursor-pointer"
              aria-label="Upload profile photo"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-teal-500 to-emerald-450 flex items-center justify-center text-slate-950 font-black text-3xl">
                  {getInitials(formData.name || user?.name)}
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-teal-400">
                <Camera className="w-6 h-6 animate-pulse" />
              </div>
            </button>

            {/* Hidden Native File Picker */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
            />
          </div>

          <h3 className="text-lg font-bold text-white leading-tight">{formData.name || user?.name || 'Traveler'}</h3>
          <p className="text-xs text-slate-400 mt-1">{user?.email || 'user@example.com'}</p>
          
          <div className="mt-3">
            <Badge variant="primary">Pro GlobeTrotter</Badge>
          </div>

          <div className="flex flex-col gap-2 mt-5 w-full">
            <Button
              variant="outline"
              size="xs"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full cursor-pointer"
            >
              Change Photo
            </Button>
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-xs font-semibold text-rose-450 hover:text-rose-400 transition-colors py-1 cursor-pointer"
              >
                Remove Photo
              </button>
            )}
          </div>
        </Card>

        {/* Account Details Form */}
        <Card className="md:col-span-2 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details and travel profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-450 animate-fade-in">
                  {successMsg}
                </div>
              )}
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-450 animate-fade-in">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  leftIcon={User}
                  required
                />
                <Input
                  label="Email Address"
                  value={user?.email || ''}
                  leftIcon={Mail}
                  readOnly
                  disabled
                  className="bg-slate-950/40 text-slate-500 cursor-not-allowed border-slate-800/50"
                  helperText="Email address cannot be changed."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Home Currency Dropdown */}
                <div className="w-full flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300 tracking-wide">
                    Home Currency
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 pointer-events-none text-slate-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 appearance-none cursor-pointer"
                    >
                      {CURRENCIES.map((curr) => (
                        <option key={curr.code} value={curr.code} className="bg-slate-950 text-slate-100">
                          {curr.code} — {curr.name} ({curr.symbol})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 pointer-events-none text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Language Dropdown */}
                <div className="w-full flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300 tracking-wide">
                    Language
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 pointer-events-none text-slate-400">
                      <Settings className="w-4 h-4" />
                    </div>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 appearance-none cursor-pointer"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang} className="bg-slate-950 text-slate-100">
                          {lang}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 pointer-events-none text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  isLoading={isSaving}
                  disabled={isSaving}
                  className="cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default ProfilePage;
