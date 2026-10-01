import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Category, Budget } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../contexts/ToastContext.tsx';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  initialBudget?: Budget | null;
  selectedMonth: number;
  selectedYear: number;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
  initialBudget,
  selectedMonth,
  selectedYear,
}) => {
  const { success, error } = useToast();
  const [categoryId, setCategoryId] = useState(
    initialBudget?.categoryId || categories.find((c) => c.type === 'expense')?.id || ''
  );
  const [limitAmount, setLimitAmount] = useState(
    initialBudget ? initialBudget.limitAmount.toString() : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numLimit = parseFloat(limitAmount);
    if (!limitAmount || isNaN(numLimit) || numLimit <= 0) {
      error('Please enter a valid positive budget limit');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createOrUpdateBudget({
        categoryId,
        limitAmount: numLimit,
        month: selectedMonth,
        year: selectedYear,
      });
      success('Budget allocated successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            {initialBudget ? 'Update Budget Limit' : 'Set Category Budget'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expense Category
            </label>
            <select
              value={categoryId}
              disabled={!!initialBudget}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all disabled:bg-slate-50 disabled:text-slate-500"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monthly Limit (₹)
            </label>
            <input
              type="number"
              step="100"
              min="100"
              required
              placeholder="e.g. 5000"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-300"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialBudget ? 'Update Limit' : 'Save Budget'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
