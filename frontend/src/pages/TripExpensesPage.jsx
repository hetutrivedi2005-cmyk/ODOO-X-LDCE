import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  Coins, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  PiggyBank,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import ExpenseModal from '../components/expenses/ExpenseModal';
import DeleteExpenseModal from '../components/expenses/DeleteExpenseModal';
import expenseService from '../services/expenseService';
import tripService from '../services/tripService';

const CATEGORY_COLORS = {
  Food: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  Transport: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  Hotel: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  Activities: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  Shopping: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
  Other: 'bg-slate-500/10 border-slate-500/20 text-slate-400'
};

const TripExpensesPage = () => {
  const { id: tripId } = useParams();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Budget Edit State
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState('');
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

  const [deletingExpense, setDeletingExpense] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback Message State (Toast)
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [expensesData, summaryData] = await Promise.all([
        expenseService.getExpenses(tripId),
        expenseService.getExpensesSummary(tripId)
      ]);
      setExpenses(expensesData);
      setSummary(summaryData);
      setNewBudget(summaryData.budget ? summaryData.budget.toString() : '');
    } catch (err) {
      console.error('Failed to load expenses:', err);
      setError(err.message || 'Unable to load expenses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Budget Update
  const handleBudgetSave = async (e) => {
    e.preventDefault();
    setIsSavingBudget(true);
    try {
      const parsedBudget = newBudget.trim() === '' ? null : parseFloat(newBudget);
      if (parsedBudget !== null && (isNaN(parsedBudget) || parsedBudget < 0)) {
        alert('Budget must be a positive number');
        setIsSavingBudget(false);
        return;
      }
      await tripService.updateTrip(tripId, { budget: parsedBudget });
      setSummary(prev => ({ ...prev, budget: parsedBudget }));
      setIsEditingBudget(false);
      showToast('Trip budget updated successfully!');
    } catch (err) {
      console.error('Failed to update budget:', err);
      alert(err.message || 'Failed to update budget.');
    } finally {
      setIsSavingBudget(false);
    }
  };

  // Handle Create or Update Expense
  const handleExpenseSubmit = async (expenseData) => {
    setIsSubmittingExpense(true);
    try {
      if (editingExpense) {
        // Edit flow
        const updated = await expenseService.updateExpense(tripId, editingExpense.id, expenseData);
        setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
        showToast('Expense updated successfully!');
      } else {
        // Create flow
        const created = await expenseService.createExpense(tripId, expenseData);
        setExpenses(prev => [created, ...prev]);
        showToast('Expense added successfully!');
      }
      // Re-fetch summary to update aggregates
      const updatedSummary = await expenseService.getExpensesSummary(tripId);
      setSummary(updatedSummary);
      setIsExpenseModalOpen(false);
      setEditingExpense(null);
    } catch (err) {
      console.error('Expense action failed:', err);
      alert(err.message || 'Failed to process expense.');
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  // Handle Delete Expense
  const handleDeleteConfirm = async () => {
    if (!deletingExpense) return;
    setIsDeleting(true);
    try {
      await expenseService.deleteExpense(tripId, deletingExpense.id);
      setExpenses(prev => prev.filter(e => e.id !== deletingExpense.id));
      showToast('Expense record deleted.');
      
      const updatedSummary = await expenseService.getExpensesSummary(tripId);
      setSummary(updatedSummary);
      setDeletingExpense(null);
    } catch (err) {
      console.error('Delete expense failed:', err);
      alert(err.message || 'Failed to delete expense.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Format Currency Utility
  const formatCurrency = (val, curr = 'INR') => {
    const symbol = curr === 'INR' ? '₹' : curr === 'USD' ? '$' : curr === 'EUR' ? '€' : curr === 'GBP' ? '£' : `${curr} `;
    return `${symbol}${Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // Filtered Expenses list
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = 
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.category && e.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        String(e.amount).includes(searchQuery);
      
      const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchQuery, selectedCategory]);

  if (isLoading) {
    return <LoadingState message="Loading trip budget & expenses..." />;
  }

  if (error || !summary) {
    return (
      <PageContainer>
        <EmptyState
          icon={Coins}
          title="Expenses Not Found"
          description={error || "We were unable to load the expense logs for this trip."}
          actionLabel="Back to Trip"
          onAction={() => navigate(`/trips/${tripId}`)}
        />
      </PageContainer>
    );
  }

  // Calculate budget statistics
  const budget = summary.budget || 0;
  const spent = summary.totalAmount || 0;
  const remaining = budget - spent;
  const percentSpent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOverBudget = remaining < 0;

  return (
    <PageContainer>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-teal-500 text-slate-950 font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-scale-in">
          <Coins className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back Button */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" leftIcon={ArrowLeft} onClick={() => navigate(`/trips/${tripId}`)}>
          Back to Trip Details
        </Button>
      </div>

      {/* Header Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Coins className="w-8 h-8 text-teal-400" />
            Trip Expenses
          </h1>
          <p className="text-slate-400 text-sm mt-0.5 font-medium">{summary.tripName}</p>
        </div>
        
        <Button
          variant="primary"
          size="sm"
          leftIcon={Plus}
          onClick={() => {
            setEditingExpense(null);
            setIsExpenseModalOpen(true);
          }}
        >
          Add Expense
        </Button>
      </div>

      {/* Dashboard Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Spending */}
        <Card className="border-slate-800/80 bg-slate-900/60 p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400">Total Spending</span>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {formatCurrency(spent, summary.byCurrency[0]?.currency || 'INR')}
            </h2>
            {summary.byCurrency.length > 1 && (
              <div className="text-xs text-slate-400 pt-1 border-t border-slate-800/50 mt-2 flex flex-wrap gap-x-2 gap-y-1">
                <span className="font-semibold text-slate-300">Breakdown:</span>
                {summary.byCurrency.map(c => (
                  <span key={c.currency} className="bg-slate-950 px-1.5 py-0.5 rounded text-[10px]">
                    {formatCurrency(c.total, c.currency)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Budget utilization */}
        <Card className="border-slate-800/80 bg-slate-900/60 p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400">Remaining Budget</span>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          
          {isEditingBudget ? (
            <form onSubmit={handleBudgetSave} className="flex items-center gap-2">
              <Input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                placeholder="20000"
                className="w-full text-slate-200 h-9 px-3"
                disabled={isSavingBudget}
                autoFocus
              />
              <Button type="submit" size="xs" variant="primary" isLoading={isSavingBudget}>
                Save
              </Button>
              <Button size="xs" variant="outline" onClick={() => setIsEditingBudget(false)}>
                Cancel
              </Button>
            </form>
          ) : (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <h2 className={`text-3xl font-bold tracking-tight ${isOverBudget ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                  {budget > 0 ? formatCurrency(remaining, summary.byCurrency[0]?.currency || 'INR') : 'Flexible'}
                </h2>
                <button
                  onClick={() => setIsEditingBudget(true)}
                  className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
                >
                  {budget > 0 ? 'Edit' : 'Set Budget'}
                </button>
              </div>

              {budget > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${percentSpent > 90 ? 'bg-rose-500' : percentSpent > 75 ? 'bg-amber-500' : 'bg-teal-500'}`}
                      style={{ width: `${percentSpent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{percentSpent.toFixed(0)}% Utilized</span>
                    <span>Budget: {formatCurrency(budget, summary.byCurrency[0]?.currency || 'INR')}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Expense Count */}
        <Card className="border-slate-800/80 bg-slate-900/60 p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400">Total Expenses</span>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-white tracking-tight">{summary.expenseCount}</h2>
            <p className="text-xs text-slate-400">Logged activities & fees</p>
          </div>
        </Card>
      </div>

      {/* Main content view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Filters and Expense List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-800/80 bg-slate-900/60 p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <Input
                  type="text"
                  placeholder="Search description or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full bg-slate-950/80 h-10 border-slate-800"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 px-3.5 bg-slate-950 border border-slate-800 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 rounded-xl text-sm font-medium text-slate-200 outline-none"
              >
                <option value="All">All Categories</option>
                {Object.keys(CATEGORY_COLORS).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </Card>

          {/* Expense Card List */}
          {filteredExpenses.length > 0 ? (
            <div className="space-y-3">
              {filteredExpenses.map((exp) => (
                <Card key={exp.id} className="p-4 border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/60 transition-all duration-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 text-xs font-bold ${CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.Other}`}>
                        {exp.category ? exp.category.substring(0, 4) : 'Oth'}
                      </div>
                      
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">
                          {exp.description || `${exp.category} Expense`}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {new Date(exp.spentAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-base font-bold text-white tracking-tight">
                        {formatCurrency(exp.amount, exp.currency)}
                      </span>

                      <div className="flex items-center gap-1 border-l border-slate-800/80 pl-2">
                        <button
                          onClick={() => {
                            setEditingExpense(exp);
                            setIsExpenseModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-800/50 rounded-lg transition-colors"
                          title="Edit expense"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingExpense(exp)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 rounded-lg transition-colors"
                          title="Delete expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Coins}
              title={expenses.length === 0 ? "No expenses added yet" : "No matches found"}
              description={expenses.length === 0 ? "Keep track of flights, hotels, dinners, and tours by adding your first expense." : "Try adjusting your search filters."}
              actionLabel={expenses.length === 0 ? "+ Add Your First Expense" : ""}
              onAction={expenses.length === 0 ? () => setIsExpenseModalOpen(true) : undefined}
            />
          )}
        </div>

        {/* Category Breakdown Sidebar Widget */}
        <div className="space-y-6">
          <Card className="border-slate-800/80 bg-slate-900/60 p-6">
            <h3 className="text-base font-bold text-white tracking-tight mb-4 flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-teal-400" />
              Category Breakdown
            </h3>

            {summary.byCategory.length > 0 ? (
              <div className="space-y-4">
                {summary.byCategory.map((item) => {
                  const catSpent = item.total;
                  const ratio = spent > 0 ? catSpent / spent : 0;
                  const percent = ratio * 100;
                  
                  return (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-300">{item.category}</span>
                        <span className="text-white">
                          {formatCurrency(catSpent, summary.byCurrency[0]?.currency || 'INR')}
                          <span className="text-[10px] text-slate-400 font-normal ml-1">({percent.toFixed(0)}%)</span>
                        </span>
                      </div>
                      
                      <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            item.category === 'Food' ? 'bg-amber-500' :
                            item.category === 'Transport' ? 'bg-blue-500' :
                            item.category === 'Hotel' ? 'bg-indigo-500' :
                            item.category === 'Activities' ? 'bg-purple-500' :
                            item.category === 'Shopping' ? 'bg-pink-500' : 'bg-slate-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                <FileText className="w-8 h-8 text-slate-700" />
                <p>No breakdown data. Add an expense to view categories.</p>
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* Add / Edit Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleExpenseSubmit}
        expense={editingExpense}
        isSubmitting={isSubmittingExpense}
      />

      {/* Delete Modal */}
      <DeleteExpenseModal
        isOpen={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleDeleteConfirm}
        expenseDescription={deletingExpense ? deletingExpense.description || deletingExpense.category : ''}
        isDeleting={isDeleting}
      />
    </PageContainer>
  );
};

export default TripExpensesPage;
