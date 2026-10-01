import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  Wallet,
  Calendar,
  RotateCcw,
  Plus,
  ScanLine,
  FileSpreadsheet,
  PiggyBank,
  ChevronDown,
  Scale,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { api } from '../services/api.ts';
import {
  Account,
  Category,
  Transaction,
  AnalyticsSummary,
} from '../types/index.ts';
import { formatCurrency, formatShortDate } from '../utils/formatters.ts';

interface DashboardPageProps {
  onOpenAddTransaction: (defaultType?: 'expense' | 'income') => void;
  onNavigateToTransactions: () => void;
  onNavigateToBudgets: () => void;
  onNavigateToAccounts: () => void;
  onNavigateToBalancer?: () => void;
  onOpenScanner: () => void;
  onOpenReset: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenAddTransaction,
  onNavigateToTransactions,
  onNavigateToBudgets,
  onNavigateToAccounts,
  onNavigateToBalancer,
  onOpenScanner,
  onOpenReset,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const { resolvedTheme } = useTheme();

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Map<string, Category>>(new Map());
  const [currencyChoice, setCurrencyChoice] = useState<'INR' | 'USD'>('INR');
  const [dynamicCashflow, setDynamicCashflow] = useState<any[]>([]);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [sumRes, txRes, catsList, accsList, cashflowRes] = await Promise.all([
        api.getSummary(),
        api.getTransactions({ limit: 12 }),
        api.getCategories(),
        api.getAccounts(),
        api.getCashflow(),
      ]);

      setSummary(sumRes);
      setRecentTransactions(txRes.transactions);
      setAccounts(accsList.accounts);

      const cMap = new Map<string, Category>();
      catsList.categories.forEach((c) => cMap.set(c.id, c));
      setCategoriesMap(cMap);

      if (cashflowRes && Array.isArray(cashflowRes.cashflow)) {
        setDynamicCashflow(
          cashflowRes.cashflow.map((pt) => ({
            month: pt.month,
            income: pt.income,
            expense: -pt.expense,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDownloadExcel = async () => {
    try {
      setIsDownloadingExcel(true);
      const blob = await api.exportExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Finova_Spendings_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      success('Excel spreadsheet (.xlsx) downloaded successfully');
    } catch (err: any) {
      error(err.message || 'Excel download failed');
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  const currSymbol = user?.currency || '₹';
  const isDark = resolvedTheme === 'dark';

  // Money Balancing Metrics for Dashboard Widget
  // Rule: 25% of salary allocated to SIP & Investments
  const monthlySalary = summary?.currentMonthIncome ?? 0;
  const targetSipAmount = (monthlySalary * 25) / 100; // 0.25 of total salary

  const investedThisMonth = useMemo(() => {
    return recentTransactions
      .filter((t) => {
        const desc = t.description.toLowerCase();
        const isInvCat = t.categoryId === 'cat_sip___investments' || t.categoryId === 'cat_investments';
        const hasKeywords =
          desc.includes('sip') ||
          desc.includes('mutual fund') ||
          desc.includes('zerodha') ||
          desc.includes('groww') ||
          desc.includes('stock') ||
          desc.includes('nifty') ||
          desc.includes('ppf') ||
          desc.includes('etf');
        return isInvCat || (t.type === 'expense' && hasKeywords);
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [recentTransactions]);

  const sipProgress = targetSipAmount > 0 ? Math.min(100, (investedThisMonth / targetSipAmount) * 100) : 0;
  const remainingSip = Math.max(0, targetSipAmount - investedThisMonth);

  // Fallback cashflow data if fresh
  const chartData = dynamicCashflow.length > 0 ? dynamicCashflow : [
    { month: 'May', income: 0, expense: 0 },
    { month: 'Jun', income: 0, expense: 0 },
    { month: 'Jul', income: 0, expense: 0 },
    { month: 'Aug', income: 0, expense: 0 },
    { month: 'Sep', income: 0, expense: 0 },
    { month: 'Oct', income: summary?.currentMonthIncome ?? 0, expense: -(summary?.currentMonthExpense ?? 0) },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12 font-sans text-[#181512] dark:text-[#FAF7F2]">
      {/* Top Header Row: Dashboard Title + Right Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-[#181512] dark:text-[#FAF7F2]">
            Dashboard
          </h1>
          <p className="text-xs text-[#665E54] dark:text-[#A89F94] mt-0.5">
            Consolidated financial overview & wealth ledger
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh / Reset Button */}
          <button
            onClick={onOpenReset}
            title="Reset or start ledger fresh"
            className="w-9 h-9 rounded-xl border border-[#E8E1D5] dark:border-[#2E2722] bg-white dark:bg-[#1C1816] text-[#7A7165] hover:text-[#181512] dark:hover:text-[#FAF7F2] hover:bg-[#FAF7F2] dark:hover:bg-[#25201C] flex items-center justify-center shadow-2xs transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Download Excel */}
          <button
            onClick={handleDownloadExcel}
            disabled={isDownloadingExcel}
            className="flex items-center gap-1.5 text-xs font-semibold bg-white dark:bg-[#1C1816] hover:bg-[#FAF7F2] dark:hover:bg-[#25201C] text-[#5C554D] dark:text-[#D6C2B0] border border-[#E8E1D5] dark:border-[#2E2722] px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#2A7352]" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          {/* Upload Bill / Script OCR Scanner */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 text-xs font-semibold bg-[#EFE8DD] dark:bg-[#2B231D] hover:bg-[#E5DDCF] dark:hover:bg-[#362C24] text-[#7A6B58] dark:text-[#D6C2B0] border border-[#DDD5C7] dark:border-[#3D332A] px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
          >
            <ScanLine className="w-3.5 h-3.5 text-[#AF6E4D] dark:text-[#C87D55]" />
            <span>Upload Bill / Script</span>
          </button>

          {/* Add Transaction CTA (Warm Caramel Nubuck Matching Reference Image) */}
          <button
            onClick={() => onOpenAddTransaction()}
            className="flex items-center gap-1.5 text-xs font-semibold bg-[#AF6E4D] hover:bg-[#965A39] active:bg-[#864828] text-white px-4 py-2 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Top 3 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        {/* Card 1 (Cols 5): Total Balance Hero Card */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1C1816] rounded-2xl border border-[#E8E1D5] dark:border-[#2D2622] p-5 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            {/* Top row: Icon + Label + Currency Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#AF6E4D] text-white flex items-center justify-center shadow-xs">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-[#181512] dark:text-[#FAF7F2]">
                  Total Balance
                </span>
              </div>

              {/* Currency Dropdown Selector */}
              <div className="relative">
                <select
                  value={currencyChoice}
                  onChange={(e) => setCurrencyChoice(e.target.value as any)}
                  className="appearance-none bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E8E1D5] dark:border-[#332A24] rounded-xl pl-2.5 pr-7 py-1 text-xs font-semibold text-[#5C554D] dark:text-[#D6C2B0] hover:border-[#AF6E4D] focus:outline-hidden cursor-pointer shadow-2xs"
                >
                  <option value="INR">🇮🇳 INR (₹)</option>
                  <option value="USD">🇺🇸 USD ($)</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#9E9589] absolute right-2 top-2 pointer-events-none" />
              </div>
            </div>

            {/* Stat Row + Mini Bar Sparkline Chart */}
            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#181512] dark:text-[#FAF7F2] tracking-tight font-heading tabular-nums">
                  {currSymbol}
                  {(summary?.totalBalance ?? 0).toLocaleString('en-IN')}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  <span className="inline-flex items-center gap-0.5 font-bold text-[#2A7352] dark:text-[#4ADE80]">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#E8F2EC] dark:bg-[#1A3326] text-[#2A7352] dark:text-[#4ADE80] flex items-center justify-center text-[10px]">
                      ↑
                    </span>
                    {(summary?.balanceGrowth ?? 0) >= 0 ? `+${summary?.balanceGrowth ?? 0}%` : `${summary?.balanceGrowth}%`}
                  </span>
                  <span className="text-[#8C8478] dark:text-[#9E9589]">vs last month</span>
                </div>
              </div>

              {/* Mini vertical sparkline histogram with tooltip */}
              <div className="relative flex items-end gap-1.5 h-14 pb-1 pl-2">
                <div className="w-2.5 bg-[#E8E1D5] dark:bg-[#332A24] rounded-t-sm h-5" />
                <div className="w-2.5 bg-[#E8E1D5] dark:bg-[#332A24] rounded-t-sm h-7" />
                <div className="w-2.5 bg-[#E8E1D5] dark:bg-[#332A24] rounded-t-sm h-6" />
                <div className="w-2.5 bg-[#E8E1D5] dark:bg-[#332A24] rounded-t-sm h-10" />
                <div className="w-2.5 bg-[#E8E1D5] dark:bg-[#332A24] rounded-t-sm h-8" />
                {/* Active Highlight Caramel Bar */}
                <div className="w-2.5 bg-[#AF6E4D] dark:bg-[#C87D55] rounded-t-sm h-12 shadow-xs ring-2 ring-[#AF6E4D]/30" />
                <div className="w-2.5 bg-[#E8E1D5] dark:bg-[#332A24] rounded-t-sm h-4" />
              </div>
            </div>
          </div>

          {/* Bottom Dual Action Buttons: Receive Money & Send Money */}
          <div className="mt-5 pt-4 border-t border-[#E8E1D5] dark:border-[#2D2622] grid grid-cols-2 gap-3">
            <button
              onClick={() => onOpenAddTransaction('income')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#FAF7F2] dark:bg-[#25201C] hover:bg-[#F3EDE3] dark:hover:bg-[#2D2622] text-[#181512] dark:text-[#FAF7F2] border border-[#DDD5C7] dark:border-[#382F28] rounded-xl text-xs font-semibold shadow-2xs transition-colors"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-[#665E54] dark:text-[#ACA397]" />
              <span>Receive Money</span>
            </button>

            <button
              onClick={() => onOpenAddTransaction('expense')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#181512] dark:bg-[#FAF7F2] hover:bg-[#2D2622] dark:hover:bg-[#EAE4DA] text-white dark:text-[#181512] rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <ArrowUpFromLine className="w-3.5 h-3.5" />
              <span>Send Money</span>
            </button>
          </div>
        </div>

        {/* Card 2 (Cols 4): Monthly Income & Monthly Expenses Stack */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1C1816] rounded-2xl border border-[#E8E1D5] dark:border-[#2D2622] p-5 shadow-xs flex flex-col justify-between gap-4 transition-colors">
          {/* Top Half: Monthly Income */}
          <div className="pb-4 border-b border-[#E8E1D5] dark:border-[#2D2622] flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EAE3D6] dark:bg-[#2B231D] text-[#7A6B58] dark:text-[#D6C2B0] flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4 text-[#2A7352]" />
                </div>
                <span className="text-xs font-semibold text-[#5C554D] dark:text-[#C5BCB2]">
                  Monthly Income
                </span>
              </div>
              <div className="mt-2 text-2xl font-extrabold text-[#181512] dark:text-[#FAF7F2] font-heading tabular-nums">
                {currSymbol}
                {(summary?.currentMonthIncome ?? 0).toLocaleString('en-IN')}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                <span className="font-bold text-[#2A7352] dark:text-[#4ADE80]">↑ Inflow</span>
                <span className="text-[#8C8478] dark:text-[#9E9589]">recorded this month</span>
              </div>
            </div>

            <div className="text-right text-[10px] text-[#8C8478] dark:text-[#9E9589] font-mono font-semibold space-y-1 w-24">
              <div>Cap: ₹60k</div>
              <div className="w-full bg-[#E8E1D5] dark:bg-[#2E2722] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#2A7352] h-full rounded-full"
                  style={{ width: `${Math.min(100, ((summary?.currentMonthIncome ?? 0) / 60000) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Half: Monthly Expenses */}
          <div className="flex items-start justify-between pt-1">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F5ECE8] dark:bg-[#2B1F1C] text-[#B24531] flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-[#5C554D] dark:text-[#C5BCB2]">
                  Monthly Expenses
                </span>
              </div>
              <div className="mt-2 text-2xl font-extrabold text-[#181512] dark:text-[#FAF7F2] font-heading tabular-nums">
                {currSymbol}
                {(summary?.currentMonthExpense ?? 0).toLocaleString('en-IN')}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                <span className="font-bold text-[#AF6E4D] dark:text-[#D68D65]">Outflow</span>
                <span className="text-[#8C8478] dark:text-[#9E9589]">recorded this month</span>
              </div>
            </div>

            <div className="text-right text-[10px] text-[#8C8478] dark:text-[#9E9589] font-mono font-semibold space-y-1 w-24">
              <div>Cap: ₹40k</div>
              <div className="w-full bg-[#E8E1D5] dark:bg-[#2E2722] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#AF6E4D] h-full rounded-full"
                  style={{ width: `${Math.min(100, ((summary?.currentMonthExpense ?? 0) / 40000) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 (Cols 3): Total Savings & Savings Rate */}
        <div className="lg:col-span-3 bg-white dark:bg-[#1C1816] rounded-2xl border border-[#E8E1D5] dark:border-[#2D2622] p-5 shadow-xs flex flex-col justify-between transition-colors">
          {/* Top Half: Total Savings */}
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#EAE3D6] dark:bg-[#2B231D] text-[#7A6B58] dark:text-[#D6C2B0] flex items-center justify-center">
                <PiggyBank className="w-4 h-4 text-[#AF6E4D] dark:text-[#C87D55]" />
              </div>
              <span className="text-xs font-semibold text-[#5C554D] dark:text-[#C5BCB2]">
                Net Savings (Surplus)
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-[#181512] dark:text-[#FAF7F2] font-heading tabular-nums">
              {currSymbol}
              {(summary?.netSavings ?? 0).toLocaleString('en-IN')}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px]">
              <span className="font-bold text-[#2A7352] dark:text-[#4ADE80]">
                {summary?.savingsRate ?? 0}% Rate
              </span>
              <span className="text-[#8C8478] dark:text-[#9E9589]">retained</span>
            </div>
          </div>

          {/* Bottom Half: Real Dynamic Savings Rate Progress */}
          <div className="mt-4 pt-3 border-t border-[#E8E1D5] dark:border-[#2D2622]">
            <div className="flex items-center justify-between text-xs font-semibold text-[#5C554D] dark:text-[#C5BCB2] mb-2">
              <span>Savings Rate</span>
              <span className="text-xs text-[#AF6E4D] dark:text-[#C87D55] font-bold">
                {summary?.savingsRate ?? 0}%
              </span>
            </div>

            <div className="w-full bg-[#E8E1D5] dark:bg-[#2E2722] h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-[#AF6E4D] dark:bg-[#C87D55] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, summary?.savingsRate ?? 0))}%` }}
              />
            </div>

            <button
              onClick={onNavigateToBudgets}
              className="text-[11px] text-[#8C8478] dark:text-[#ACA397] hover:text-[#AF6E4D] dark:hover:text-[#C87D55] font-medium transition-colors"
            >
              Adjust budget limits & targets →
            </button>
          </div>
        </div>
      </div>

      {/* Luxury Raw Elegance Wealth Balancer Banner (Caramel & Espresso Atelier Card) */}
      <div className="rounded-2xl p-6 sm:p-7 text-[#FAF7F2] bg-gradient-to-br from-[#1C1815] via-[#261E1A] to-[#14110F] border border-[#3E332B] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all">
        <div className="space-y-2.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="bg-[#3B3026] text-[#D9C4B2] border border-[#524336] text-[10px] font-mono tracking-[0.15em] uppercase font-bold px-3 py-1 rounded-full">
              MONEY BALANCER · 25% SIP ALLOCATION
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-heading text-[#FAF7F2]">
            {monthlySalary > 0
              ? `Target SIP: ${formatCurrency(targetSipAmount, currSymbol)} (25% of ${formatCurrency(monthlySalary, currSymbol)} salary)`
              : 'Set Your 25% Salary Allocation for Investments & SIP'}
          </h2>

          <p className="text-xs text-[#C5BCB2] leading-relaxed">
            {investedThisMonth > 0
              ? `You have invested ${formatCurrency(investedThisMonth, currSymbol)} this month (${sipProgress.toFixed(1)}% of your target). ${
                  remainingSip > 0 ? `${formatCurrency(remainingSip, currSymbol)} remaining to balance your goal.` : 'Target reached! 🎉'
                }`
              : 'Allocate 25% (0.25) of your monthly income to systematic investments, mutual funds, or stocks.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            onClick={() => onOpenAddTransaction('expense')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#AF6E4D] hover:bg-[#965A39] active:bg-[#864828] text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record SIP Deposit</span>
          </button>

          {onNavigateToBalancer && (
            <button
              onClick={onNavigateToBalancer}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/10 text-[#FAF7F2] font-semibold text-xs border border-[#FAF7F2]/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View Money Balancer</span>
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Middle Row: Cashflow Bar Chart + Account Portfolios */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Cashflow Bipolar Bar Chart (Cols 8) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1C1816] rounded-2xl border border-[#E8E1D5] dark:border-[#2D2622] p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-[#181512] dark:text-[#FAF7F2] font-heading">
                  Cashflow Activity
                </h2>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-xs bg-[#AF6E4D]" />
                  <span className="text-[#665E54] dark:text-[#ACA397]">Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-xs bg-[#DDD5C7] dark:bg-[#4A3F36]" />
                  <span className="text-[#665E54] dark:text-[#ACA397]">Expense</span>
                </div>

                <div className="flex items-center gap-1 bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E8E1D5] dark:border-[#382F28] rounded-lg px-2.5 py-1 text-[#5C554D] dark:text-[#D6C2B0] shadow-2xs">
                  <Calendar className="w-3 h-3 text-[#9E9589]" />
                  <span>Timeline</span>
                  <ChevronDown className="w-3 h-3 text-[#9E9589]" />
                </div>
              </div>
            </div>

            {/* Bipolar Bar Chart */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} stackOffset="sign" margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#2E2722' : '#F0EAE0'} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={{ stroke: isDark ? '#382F28' : '#E8E1D5' }}
                    tick={{ fill: isDark ? '#ACA397' : '#7A7165', fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={{ stroke: isDark ? '#382F28' : '#E8E1D5' }}
                    tick={{ fill: isDark ? '#ACA397' : '#7A7165', fontSize: 11, fontWeight: 500 }}
                    tickFormatter={(val) => {
                      if (val === 0) return '0';
                      const prefix = val < 0 ? '-' : '';
                      const absVal = Math.abs(val);
                      return `${prefix}₹${absVal >= 1000 ? `${absVal / 1000}k` : absVal}`;
                    }}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      `₹${Math.abs(Number(val)).toLocaleString('en-IN')}`,
                      name === 'income' ? 'Income' : 'Expense',
                    ]}
                    contentStyle={{
                      backgroundColor: isDark ? '#1C1816' : '#FFFFFF',
                      borderColor: isDark ? '#382F28' : '#E8E1D5',
                      color: isDark ? '#FAF7F2' : '#181512',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <ReferenceLine y={0} stroke={isDark ? '#4A3F36' : '#DDD5C7'} strokeWidth={1.5} />
                  <Bar
                    dataKey="income"
                    fill="#AF6E4D"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                    name="income"
                  />
                  <Bar
                    dataKey="expense"
                    fill={isDark ? '#4A3F36' : '#DDD5C7'}
                    radius={[0, 0, 6, 6]}
                    maxBarSize={36}
                    name="expense"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E8E1D5] dark:border-[#2D2622] flex items-center justify-between text-xs text-[#8C8478] dark:text-[#9E9589]">
            <span>Cashflow frequency balanced across active cycles</span>
            <span className="font-semibold text-[#181512] dark:text-[#FAF7F2]">
              Net Surplus: {formatCurrency(summary?.netSavings ?? 0, currSymbol)}
            </span>
          </div>
        </div>

        {/* Right Card: Account Portfolios & Consolidated Liquidity (Cols 4) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1C1816] rounded-2xl border border-[#E8E1D5] dark:border-[#2D2622] p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] dark:border-[#2D2622] mb-3">
              <h2 className="text-base font-bold text-[#181512] dark:text-[#FAF7F2] font-heading">
                Account Portfolios
              </h2>
              <button
                onClick={onNavigateToAccounts}
                className="text-xs font-semibold text-[#AF6E4D] dark:text-[#C87D55] hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="divide-y divide-[#E8E1D5]/70 dark:divide-[#2D2622]">
              {accounts.slice(0, 4).map((acc) => (
                <div key={acc.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] dark:bg-[#25201C] text-[#5C554D] dark:text-[#D6C2B0] flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-[#AF6E4D] dark:text-[#C87D55]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#181512] dark:text-[#FAF7F2]">{acc.name}</div>
                      <div className="text-[11px] text-[#8C8478] dark:text-[#9E9589] capitalize">
                        {acc.type} {acc.accountNumber ? `· ${acc.accountNumber}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm font-bold text-[#181512] dark:text-[#FAF7F2] tabular-nums">
                    {formatCurrency(acc.balance, currSymbol)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E8E1D5] dark:border-[#2D2622] flex items-center justify-between">
            <span className="text-xs font-medium text-[#8C8478] dark:text-[#9E9589]">Consolidated Liquidity</span>
            <span className="text-sm font-extrabold text-[#181512] dark:text-[#FAF7F2] font-heading tabular-nums">
              {formatCurrency(summary?.totalBalance ?? 0, currSymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Bill & Script Scanner Feature Card + Recent Transactions Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Scanner Card (Cols 4) */}
        <div className="lg:col-span-4 bg-[#F7F4EE] dark:bg-[#181513] rounded-2xl border border-[#E8E1D5] dark:border-[#2D2622] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#AF6E4D] dark:text-[#C87D55] font-bold text-xs uppercase tracking-wider mb-2">
              <ScanLine className="w-4 h-4" />
              <span>Smart Bill & Script OCR</span>
            </div>
            <h3 className="text-base font-bold text-[#181512] dark:text-[#FAF7F2] font-heading">
              Upload Bills or Written Notes
            </h3>
            <p className="text-xs text-[#665E54] dark:text-[#ACA397] mt-1 leading-relaxed">
              Upload store receipts, supermarket bills, or paste handwritten expense notes. The OCR engine reads line items, auto-classifies categories via ML, and reconciles balances in Indian Rupees (₹).
            </p>
          </div>

          <button
            onClick={onOpenScanner}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-[#AF6E4D] hover:bg-[#965A39] text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors"
          >
            <ScanLine className="w-4 h-4" />
            <span>Open Bill Scanner</span>
          </button>
        </div>

        {/* Recent Transactions List (Cols 8) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1C1816] rounded-2xl border border-[#E8E1D5] dark:border-[#2D2622] p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] dark:border-[#2D2622] mb-2">
            <h3 className="text-base font-bold text-[#181512] dark:text-[#FAF7F2] font-heading">
              Recent Transactions Ledger
            </h3>
            <button
              onClick={onNavigateToTransactions}
              className="text-xs font-semibold text-[#AF6E4D] dark:text-[#C87D55] hover:underline"
            >
              View full ledger →
            </button>
          </div>

          <div className="divide-y divide-[#E8E1D5]/70 dark:divide-[#2D2622]">
            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8C8478] dark:text-[#9E9589]">
                No transactions recorded yet. Click "Add Transaction" to start recording your ledger.
              </div>
            ) : (
              recentTransactions.slice(0, 6).map((tx) => {
                const cat = categoriesMap.get(tx.categoryId);
                const isExp = tx.type === 'expense';

                return (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-[#181512] dark:text-[#FAF7F2] truncate">
                        {tx.description}
                      </div>
                      <div className="text-[11px] text-[#8C8478] dark:text-[#9E9589] truncate mt-0.5">
                        {formatShortDate(tx.date)} · {cat?.name || 'General'} · {tx.paymentMethod}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`text-xs sm:text-sm font-bold tabular-nums ${
                          isExp ? 'text-[#181512] dark:text-[#FAF7F2]' : 'text-[#2A7352] dark:text-[#4ADE80]'
                        }`}
                      >
                        {isExp ? '-' : '+'}
                        {formatCurrency(tx.amount, currSymbol)}
                      </div>
                      {tx.isMlCategorized && (
                        <span className="text-[9px] font-mono text-[#AF6E4D] dark:text-[#C87D55] font-semibold bg-[#EFE8DD] dark:bg-[#2B231D] px-1.5 py-0.5 rounded">
                          ML Classified
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
