import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { api } from '../services/api.ts';
import { CashflowPoint, CategoryBreakdownItem, AnalyticsSummary } from '../types/index.ts';
import { formatCurrency } from '../utils/formatters.ts';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [cashflow, setCashflow] = useState<CashflowPoint[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdownItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        const [sumRes, cashRes, catRes] = await Promise.all([
          api.getSummary(),
          api.getCashflow(),
          api.getCategoriesDistribution(),
        ]);
        setSummary(sumRes);
        setCashflow(cashRes.cashflow);
        setCategories(catRes.breakdown);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const currencySymbol = user?.currency || '₹';

  // Compute key analytical metrics
  const avgMonthlySpending = cashflow.length > 0
    ? Math.round(cashflow.reduce((acc, c) => acc + c.expense, 0) / cashflow.length)
    : 0;

  const highestCat = categories.length > 0 ? categories[0] : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Financial Analytics
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          In-depth insights into your spending habits, capital velocity, and savings rate
        </p>
      </div>

      {/* 4 Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Avg Monthly Spending
          </span>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(avgMonthlySpending, currencySymbol)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Based on past 6 months</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Savings Rate
          </span>
          <div className="mt-2 text-2xl font-bold text-emerald-600 tracking-tight">
            {summary?.savingsRate || 0}%
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Healthy savings benchmark</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Top Outflow Category
          </span>
          <div className="mt-2 text-xl font-bold text-slate-900 tracking-tight truncate">
            {highestCat ? highestCat.name : 'Food & Dining'}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {highestCat ? `${highestCat.percentage}% of all expenses` : 'Dominant expenditure'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Largest Single Outflow
          </span>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            ₹16,000
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Apartment Monthly Rent</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend Line Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Spending Velocity Trend</h3>
            <p className="text-xs text-slate-500">Monthly expense trajectory over time</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashflow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Expenses']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#2563EB' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Comparison Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Income vs. Expense Bar Comparison</h3>
            <p className="text-xs text-slate-500">Net monthly cash flow comparison</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, '']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
