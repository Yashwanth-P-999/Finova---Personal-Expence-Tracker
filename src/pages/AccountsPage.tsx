import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Landmark,
  CreditCard,
  Banknote,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { api } from '../services/api.ts';
import { Account, AccountType } from '../types/index.ts';
import { formatCurrency } from '../utils/formatters.ts';

interface AccountsPageProps {
  onOpenAddAccount: () => void;
  onEditAccount: (acc: Account) => void;
}

export const AccountsPage: React.FC<AccountsPageProps> = ({
  onOpenAddAccount,
  onEditAccount,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAccounts();
      setAccounts(res.accounts);
    } catch (err: any) {
      error(err.message || 'Failed to fetch accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete account "${name}"? Only accounts without existing transactions can be deleted.`)) {
      return;
    }

    try {
      await api.deleteAccount(id);
      success('Account deleted successfully');
      fetchAccounts();
    } catch (err: any) {
      error(err.message || 'Failed to delete account');
    }
  };

  const currencySymbol = user?.currency || '₹';
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return Landmark;
      case 'credit':
        return CreditCard;
      case 'cash':
        return Banknote;
      case 'investment':
        return TrendingUp;
      default:
        return Wallet;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Accounts & Cards
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your bank accounts, digital cards, and cash balances
          </p>
        </div>

        <button
          onClick={onOpenAddAccount}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Net Worth Summary Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Consolidated Net Balance
          </span>
          <div className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalBalance, currencySymbol)}
          </div>
        </div>
        <div className="text-right text-xs text-slate-500">
          <span className="font-semibold text-slate-800">{accounts.length}</span> Linked Portfolios
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const IconComponent = getAccountIcon(acc.type);
          const isNegative = acc.balance < 0;

          return (
            <div
              key={acc.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{acc.name}</h3>
                      <div className="text-[11px] text-slate-500 uppercase tracking-wider">
                        {acc.type} {acc.accountNumber ? `· ${acc.accountNumber}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditAccount(acc)}
                      title="Edit Account"
                      className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(acc.id, acc.name)}
                      title="Delete Account"
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-5">
                  <span className="text-[11px] text-slate-400 font-medium">Current Balance</span>
                  <div
                    className={`text-xl font-bold tracking-tight mt-0.5 ${
                      isNegative ? 'text-red-600' : 'text-slate-900'
                    }`}
                  >
                    {formatCurrency(acc.balance, currencySymbol)}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Auto-Reconciled</span>
                <span>Active</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
