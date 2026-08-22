import React, { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const CATEGORIES = ['Food', 'Transport', 'Hotel', 'Activities', 'Shopping', 'Other'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY'];

const ExpenseModal = ({ isOpen, onClose, onSubmit, expense = null, isSubmitting }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [spentAt, setSpentAt] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (expense) {
        setAmount(expense.amount.toString());
        setCurrency(expense.currency);
        setCategory(expense.category || 'Other');
        setDescription(expense.description || '');
        setSpentAt(expense.spentAt ? expense.spentAt.split('T')[0] : '');
      } else {
        setAmount('');
        setCurrency('INR');
        setCategory('Food');
        setDescription('');
        setSpentAt(new Date().toISOString().split('T')[0]);
      }
    }
  }, [isOpen, expense]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    if (!spentAt) {
      setError('Date is required');
      return;
    }

    onSubmit({
      amount: parsedAmount,
      currency,
      category,
      description: description.trim() || null,
      spentAt,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
        onClick={isSubmitting ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 space-y-4 animate-scale-in">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {expense ? 'Edit Expense' : 'Add Expense'}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label htmlFor="amount" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Amount *
              </label>
              <Input
                id="amount"
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="2500"
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="currency" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Currency *
              </label>
              <select
                id="currency"
                required
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-11 px-3.5 bg-slate-950 border border-slate-800 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 rounded-xl text-sm font-medium text-slate-200 outline-none transition-all duration-200"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category *
            </label>
            <select
              id="category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-11 px-3.5 bg-slate-950 border border-slate-800 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 rounded-xl text-sm font-medium text-slate-200 outline-none transition-all duration-200"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="spentAt" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Date *
            </label>
            <Input
              id="spentAt"
              type="date"
              required
              value={spentAt}
              onChange={(e) => setSpentAt(e.target.value)}
              disabled={isSubmitting}
              className="w-full text-slate-200"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dinner at restaurant, taxi ride, souvenirs..."
              disabled={isSubmitting}
              rows={2}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 rounded-xl text-sm font-medium text-slate-200 outline-none transition-all duration-200 placeholder:text-slate-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {expense ? 'Save Changes' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
