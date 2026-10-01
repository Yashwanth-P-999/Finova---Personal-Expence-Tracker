import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Account, AccountType } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../contexts/ToastContext.tsx';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Account | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const { success, error } = useToast();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('0');
  const [accountNumber, setAccountNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setBalance(initialData.balance.toString());
      setAccountNumber(initialData.accountNumber || '');
    } else {
      setName('');
      setType('bank');
      setBalance('0');
      setAccountNumber('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Please enter an account name');
      return;
    }

    const numBalance = parseFloat(balance);
    if (isNaN(numBalance)) {
      error('Please enter a valid numeric balance');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData) {
        await api.updateAccount(initialData.id, {
          name: name.trim(),
          type,
          balance: numBalance,
          accountNumber: accountNumber.trim() || undefined,
        });
        success('Account updated successfully');
      } else {
        await api.createAccount({
          name: name.trim(),
          type,
          balance: numBalance,
          accountNumber: accountNumber.trim() || undefined,
        });
        success('Account created successfully');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            {initialData ? 'Edit Account' : 'Add New Account'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. HDFC Salary, SBI Savings, Cash Wallet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            >
              <option value="bank">Bank Account</option>
              <option value="cash">Cash / Physical Wallet</option>
              <option value="credit">Credit Card</option>
              <option value="wallet">Digital Wallet (Paytm, etc.)</option>
              <option value="investment">Investment / Demat</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial / Current Balance (₹)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account / Card Reference (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. •••• 4128"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
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
              <span>{initialData ? 'Update Account' : 'Create Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
