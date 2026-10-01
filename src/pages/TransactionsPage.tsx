import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { api } from '../services/api.ts';
import { Account, Category, Transaction } from '../types/index.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';

interface TransactionsPageProps {
  onOpenAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenAddTransaction,
  onEditTransaction,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const res = await api.getTransactions({
        search: search.trim() || undefined,
        categoryId: selectedCategory || undefined,
        accountId: selectedAccount || undefined,
        type: selectedType || undefined,
        page,
        limit: 12,
      });
      setTransactions(res.transactions);
      setTotalPages(res.pagination.totalPages || 1);
      setTotalCount(res.pagination.total || 0);
    } catch (err: any) {
      error(err.message || 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [catsRes, accsRes] = await Promise.all([api.getCategories(), api.getAccounts()]);
      setCategories(catsRes.categories);
      setAccounts(accsRes.accounts);
    } catch (err) {
      console.error('Failed to load categories/accounts:', err);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [search, selectedCategory, selectedAccount, selectedType, page]);

  const handleDelete = async (id: string, description: string) => {
    if (!window.confirm(`Are you sure you want to delete transaction "${description}"? Account balance will be restored automatically.`)) {
      return;
    }

    try {
      await api.deleteTransaction(id);
      success('Transaction deleted and account balance updated');
      fetchTransactions();
    } catch (err: any) {
      error(err.message || 'Failed to delete transaction');
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      const blob = await api.exportExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SmartFin_Transactions_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      success('Excel spreadsheet (.xlsx) downloaded successfully');
    } catch (err: any) {
      error(err.message || 'Excel export failed');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const currencySymbol = user?.currency || '₹';
  const categoriesMap = new Map(categories.map((c) => [c.id, c]));
  const accountsMap = new Map(accounts.map((a) => [a.id, a]));

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-12">
      {/* Header and Add CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-heading">
            Transactions Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {totalCount} recorded transactions with real-time balance reconciliation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-2 rounded-lg transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isExportingExcel ? 'Exporting...' : 'Export Excel (.xlsx)'}</span>
          </button>

          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-800 hover:bg-indigo-900 active:bg-indigo-950 text-white px-3.5 py-2 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search description, merchant..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder:text-slate-400"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="">All Types (Income & Expense)</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table (Desktop & Tablet) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No transactions match your current search or filters.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const cat = categoriesMap.get(tx.categoryId);
                  const acc = accountsMap.get(tx.accountId);
                  const isExp = tx.type === 'expense';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{tx.description}</span>
                          {tx.isMlCategorized && (
                            <span
                              title="Categorized via ML NLP model"
                              className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-normal"
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              ML
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="font-medium">{cat?.name || 'Uncategorized'}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {acc?.name || 'Primary'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {tx.paymentMethod}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-semibold whitespace-nowrap ${
                          isExp ? 'text-red-600' : 'text-emerald-600'
                        }`}
                      >
                        {isExp ? '-' : '+'}
                        {formatCurrency(tx.amount, currencySymbol)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Edit"
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id, tx.description)}
                            title="Delete"
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Transaction Cards */}
        <div className="md:hidden divide-y divide-slate-100 p-3">
          {transactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No transactions match your search.
            </div>
          ) : (
            transactions.map((tx) => {
              const cat = categoriesMap.get(tx.categoryId);
              const acc = accountsMap.get(tx.accountId);
              const isExp = tx.type === 'expense';

              return (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {tx.description}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {formatDate(tx.date)} · {cat?.name} · {acc?.name}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <div
                        className={`text-xs font-semibold ${
                          isExp ? 'text-red-600' : 'text-emerald-600'
                        }`}
                      >
                        {isExp ? '-' : '+'}
                        {formatCurrency(tx.amount, currencySymbol)}
                      </div>
                      <div className="text-[10px] text-slate-400">{tx.paymentMethod}</div>
                    </div>
                    <button
                      onClick={() => handleDelete(tx.id, tx.description)}
                      className="p-1 text-slate-300 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Page <span className="font-semibold">{page}</span> of{' '}
            <span className="font-semibold">{totalPages}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
