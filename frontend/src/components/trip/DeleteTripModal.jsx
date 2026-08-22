import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../ui/Button';

const DeleteTripModal = ({ isOpen, onClose, onConfirm, tripName, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
        onClick={isDeleting ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 space-y-4 animate-scale-in">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Delete this trip?</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-slate-200">"{tripName}"</span>? This action cannot be undone and will permanently remove all associated itinerary stops.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            isLoading={isDeleting}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Trip'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTripModal;
