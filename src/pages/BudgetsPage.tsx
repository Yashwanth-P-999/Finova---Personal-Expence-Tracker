import React, { useState, useEffect } from 'react';
import {
  PieChart as PieIcon,
  Plus,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Trash2,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { api } from '../services/api.ts';
import { Budget, Category } from '../types/index.ts';
import { formatCurrency } from '../utils/formatters.ts';

interface BudgetsPageProps {
  onOpenAddBudget: () => void;
}

export const BudgetsPage: React.FC<BudgetsPageProps> = ({ onOpenAddBudget }) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<{
    totalBudgeted: number;
    totalSpentInBudgets: number;
    totalRemaining: number;
    overallPercentage: number;
  }>({
    totalBudgeted: 0,
    totalSpentInBudgets: 0,
    totalRemaining: 0,
    overallPercentage: 0,
  });

  const [selectedMonth, setSelectedMonth] = useState(10);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBudgets = async () => {
    try {
      setIsLoading(true);
      const res = await api.getBudgets(selectedMonth, selectedYear);
      setBudgets(res.budgets);
      setSummary(res.summary);
    } catch (err: any) {
      error(err.message || 'Failed to fetch budgets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const handleDeleteBudget = async (id: string, catName?: string) => {
    if (!window.confirm(`Delete budget limit for ${catName || 'this category'}?`)) return;

    try {
      await api.deleteBudget(id);
      success('Budget removed');
      fetchBudgets();
    } catch (err: any) {
      error(err.message || 'Failed to remove budget');
    }
  };

  const currencySymbol = user?.currency || '₹';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            October 2026 Budget
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor categorical spend caps and prevent budget overruns
          </p>
        </div>

        <button
          onClick={onOpenAddBudget}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Aggregate Progress Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Monthly Budget Utilization
            </div>
            <div className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(summary.totalSpentInBudgets, currencySymbol)}{' '}
              <span className="text-base sm:text-lg font-normal text-slate-400">
                spent of {formatCurrency(summary.totalBudgeted, currencySymbol)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-extrabold text-blue-600">
              {summary.overallPercentage}%
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {formatCurrency(summary.totalRemaining, currencySymbol)} remaining
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4 w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, summary.overallPercentage)}%` }}
          />
        </div>
      </div>

      {/* Categorical Budget Cards */}
      <div className="space-y-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Category Spend Targets ({budgets.length})
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const isExceeded = b.isExceeded;
            const isNear = b.isNearLimit;

            return (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: b.categoryColor || '#2563EB' }}
                      />
                      <h3 className="text-sm font-semibold text-slate-900">{b.categoryName}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {isExceeded ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          Exceeded
                        </span>
                      ) : isNear ? (
                        <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                          Near Limit ({b.percentage}%)
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-500">
                          {b.percentage}%
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteBudget(b.id, b.categoryName)}
                        title="Delete budget"
                        className="p-1 text-slate-300 hover:text-red-600 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between text-xs text-slate-600 mt-3 mb-1.5">
                    <span>
                      Spent: <strong className="text-slate-900">{formatCurrency(b.spent, currencySymbol)}</strong>
                    </span>
                    <span>
                      Limit: {formatCurrency(b.limitAmount, currencySymbol)}
                    </span>
                  </div>

                  {/* Progress Indicator */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isExceeded
                          ? 'bg-red-500'
                          : isNear
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, b.percentage)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {isExceeded
                      ? `Over by ${formatCurrency(b.spent - b.limitAmount, currencySymbol)}`
                      : `${formatCurrency(b.remaining, currencySymbol)} buffer available`}
                  </span>
                  <span>Month of Oct</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
