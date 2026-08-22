import React, { useState } from 'react';
import { X, Copy, Check, Calendar, Clock, AlertCircle } from 'lucide-react';
import shareService from '../../services/shareService';

export const ShareTripModal = ({ isOpen, onClose, tripId, tripName, onShareCreated }) => {
  const [expirationType, setExpirationType] = useState('never');
  const [customDate, setCustomDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdShare, setCreatedShare] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const calculateExpiresAt = () => {
    const now = new Date();
    if (expirationType === '1day') {
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    }
    if (expirationType === '7days') {
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }
    if (expirationType === '30days') {
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }
    if (expirationType === 'custom') {
      if (!customDate) return null;
      // End of selected day
      const date = new Date(customDate);
      date.setHours(23, 59, 59, 999);
      return date.toISOString();
    }
    return null; // Never
  };

  const handleCreateShare = async () => {
    if (expirationType === 'custom' && !customDate) {
      setError('Please select a custom expiration date.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const expiresAt = calculateExpiresAt();
      const share = await shareService.createShareLink(tripId, { expiresAt });
      setCreatedShare(share);
      if (onShareCreated) {
        onShareCreated(); // Trigger reload of links list
      }
    } catch (err) {
      console.error('Failed to create share link:', err);
      setError(err.message || 'Failed to create share link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!createdShare) return;
    navigator.clipboard.writeText(createdShare.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCreatedShare(null);
    setExpirationType('never');
    setCustomDate('');
    setError('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <h3 className="text-base font-bold text-white tracking-tight">Share Trip</h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!createdShare ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-350 leading-relaxed">
              Create a public shareable link for <strong className="text-white">{tripName}</strong>. 
              Anyone with this link will be able to view the itinerary and stops read-only without needing an account.
            </p>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Expiration Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Link Expiration
              </label>
              <div className="space-y-2">
                {[
                  { value: 'never', label: 'Never Expires' },
                  { value: '1day', label: '1 Day' },
                  { value: '7days', label: '7 Days' },
                  { value: '30days', label: '30 Days' },
                  { value: 'custom', label: 'Custom Date' }
                ].map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      expirationType === opt.value
                        ? 'bg-teal-500/10 border-teal-500 text-teal-400'
                        : 'bg-slate-950 border-slate-800 text-slate-350 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="expiration"
                        value={opt.value}
                        checked={expirationType === opt.value}
                        onChange={() => {
                          setExpirationType(opt.value);
                          setError('');
                        }}
                        className="sr-only"
                      />
                      <Clock className="w-4 h-4 opacity-70" />
                      <span>{opt.label}</span>
                    </div>
                    {expirationType === opt.value && <Check className="w-4 h-4 text-teal-400" />}
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Date Input */}
            {expirationType === 'custom' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="block text-xs text-slate-400 font-medium">Select Custom Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => {
                      setCustomDate(e.target.value);
                      setError('');
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-medium focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-450 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCreateShare}
                className="inline-flex items-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 disabled:opacity-50 transition-all cursor-pointer active:scale-[0.98]"
              >
                {isSubmitting ? 'Creating...' : 'Create Share Link'}
              </button>
            </div>
          </div>
        ) : (
          /* Share Link Created Screen */
          <div className="space-y-5 py-2 text-center">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto">
              <Check className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">Share Link Generated!</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Copy and send the URL below to share this read-only travel planner.
              </p>
            </div>

            {/* Link Text Box */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-850">
              <input
                type="text"
                readOnly
                value={createdShare.shareUrl}
                className="flex-grow bg-transparent border-none text-xs text-teal-400 font-medium px-2 focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  copied
                    ? 'bg-teal-500/20 text-teal-400'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
                title="Copy share link"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {createdShare.expiresAt && (
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                <span>Expires: {new Date(createdShare.expiresAt).toLocaleDateString()}</span>
              </div>
            )}

            {/* Done button */}
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-slate-850 hover:border-slate-800 transition-colors cursor-pointer"
              >
                Create Another
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="py-2.5 px-6 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 transition-all cursor-pointer active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ShareTripModal;
