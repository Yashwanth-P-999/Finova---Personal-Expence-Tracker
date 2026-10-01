import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { Account, Category, Transaction, PaymentMethod } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../contexts/ToastContext.tsx';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: Account[];
  categories: Category[];
  initialData?: Transaction | null;
  defaultType?: 'expense' | 'income';
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  accounts,
  categories,
  initialData,
  defaultType = 'expense',
}) => {
  const { success, error } = useToast();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isMlCategorized, setIsMlCategorized] = useState<boolean>(false);
  const [mlSuggestion, setMlSuggestion] = useState<{
    id: string;
    name: string;
    confidence: number;
  } | null>(null);

  // Initialize or reset form
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setDescription(initialData.description);
      setCategoryId(initialData.categoryId);
      setAccountId(initialData.accountId);
      setPaymentMethod(initialData.paymentMethod);
      setDate(initialData.date);
      setNotes(initialData.notes || '');
      setIsMlCategorized(!!initialData.isMlCategorized);
      setMlSuggestion(null);
    } else {
      setType(defaultType);
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().slice(0, 10));
      setNotes('');
      setIsMlCategorized(false);
      setMlSuggestion(null);

      // Default account and category
      if (accounts.length > 0) setAccountId(accounts[0].id);
      const defaultCat = categories.find((c) => c.type === defaultType) || categories[0];
      if (defaultCat) setCategoryId(defaultCat.id);
    }
  }, [initialData, defaultType, isOpen, accounts, categories]);

  // Real-time ML Auto-Categorization on description change
  useEffect(() => {
    if (!description || description.trim().length < 3 || initialData) {
      setMlSuggestion(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.predictCategory(description.trim());
        if (res.prediction && res.prediction.isConfident) {
          const matchCat = categories.find((c) => c.id === res.prediction.categoryId);
          if (matchCat) {
            setMlSuggestion({
              id: matchCat.id,
              name: matchCat.name,
              confidence: Math.round(res.prediction.confidence * 100),
            });
            // If user hasn't explicitly selected a non-default category, auto-apply ML
            setCategoryId(matchCat.id);
            setIsMlCategorized(true);
            if (matchCat.type === 'income') setType('income');
            else setType('expense');
          }
        }
      } catch {
        // Fallback silently if ML is unreachable
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [description, categories, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      error('Please enter a valid positive amount');
      return;
    }

    if (!description.trim()) {
      error('Please enter a description');
      return;
    }

    if (!accountId) {
      error('Please select an account');
      return;
    }

    if (!categoryId) {
      error('Please select a category');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData) {
        await api.updateTransaction(initialData.id, {
          accountId,
          categoryId,
          amount: numAmount,
          type,
          paymentMethod,
          description: description.trim(),
          date,
          isMlCategorized,
          notes: notes.trim() || undefined,
        });
        success('Transaction updated successfully');
      } else {
        await api.createTransaction({
          accountId,
          categoryId,
          amount: numAmount,
          type,
          paymentMethod,
          description: description.trim(),
          date,
          isMlCategorized,
          notes: notes.trim() || undefined,
        });
        success('Transaction added successfully');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            {initialData ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Segmented Control */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const firstExp = categories.find((c) => c.type === 'expense');
                if (firstExp) setCategoryId(firstExp.id);
              }}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                type === 'expense'
                  ? 'bg-white text-red-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                const firstInc = categories.find((c) => c.type === 'income');
                if (firstInc) setCategoryId(firstInc.id);
              }}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-semibold text-sm">₹</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-base font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Description & ML Auto-Suggest */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Description / Merchant
              </label>
              {mlSuggestion && (
                <div className="flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                  <Sparkles className="w-3 h-3" />
                  <span>ML: {mlSuggestion.name} ({mlSuggestion.confidence}%)</span>
                </div>
              )}
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Swiggy, Uber, Monthly Salary, BESCOM"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Category & Account in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setIsMlCategorized(false);
                }}
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (₹{acc.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              >
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{initialData ? 'Update Transaction' : 'Add Transaction'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
