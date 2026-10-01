import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertCircle,
  Plus,
  Coins,
  ShieldCheck,
  Building2,
  Sparkles,
  PieChart,
  ArrowRight,
  Sliders,
  DollarSign,
  Info,
  Scale,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { api } from '../services/api.ts';
import { Transaction, Account, Category } from '../types/index.ts';
import { formatCurrency, formatShortDate } from '../utils/formatters.ts';

interface MoneyBalancerPageProps {
  onOpenAddTransaction: (defaultType?: 'expense' | 'income') => void;
}

export const MoneyBalancerPage: React.FC<MoneyBalancerPageProps> = ({ onOpenAddTransaction }) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // User Allocation Preferences (Default: 25% of salary to SIP / Investments as requested by user)
  const [investmentPercent, setInvestmentPercent] = useState<number>(25); // 0.25 of total salary
  const [needsPercent, setNeedsPercent] = useState<number>(50); // 50% for rent, groceries, bills
  const [wantsPercent, setWantsPercent] = useState<number>(25); // 25% for dining, shopping, leisure

  // Manual Salary Override Option (or uses detected salary)
  const [salaryOverride, setSalaryOverride] = useState<string>('');
  const [isEditingSalary, setIsEditingSalary] = useState<boolean>(false);

  // SIP Compound Calculator State
  const [calcHorizonYears, setCalcHorizonYears] = useState<number>(5);
  const [calcReturnRate, setCalcReturnRate] = useState<number>(12); // 12% p.a. equity benchmark

  const currSymbol = user?.currency || '₹';

  // Fetch transactions and categories
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [txRes, accRes, catRes] = await Promise.all([
        api.getTransactions({ limit: 100 }),
        api.getAccounts(),
        api.getCategories(),
      ]);
      setTransactions(txRes.transactions);
      setAccounts(accRes.accounts);
      setCategories(catRes.categories);
    } catch (err: any) {
      error(err.message || 'Failed to load balancer data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter transactions for current month (October 2026 or active month)
  const currentMonthTransactions = useMemo(() => {
    const currentPrefix = '2026-10';
    return transactions.filter((t) => t.date.startsWith(currentPrefix));
  }, [transactions]);

  // Detected Monthly Salary / Inflow
  const detectedSalary = useMemo(() => {
    let sum = 0;
    currentMonthTransactions.forEach((t) => {
      if (t.type === 'income') {
        sum += t.amount;
      }
    });
    return sum;
  }, [currentMonthTransactions]);

  // Effective Salary used for balancing (override or detected or fallback)
  const effectiveSalary = useMemo(() => {
    const parsedOverride = parseFloat(salaryOverride);
    if (!isNaN(parsedOverride) && parsedOverride > 0) {
      return parsedOverride;
    }
    return detectedSalary > 0 ? detectedSalary : 50000; // Default baseline ₹50,000 if fresh
  }, [salaryOverride, detectedSalary]);

  // Filter actual investments & SIP transactions recorded
  const investmentTransactions = useMemo(() => {
    return currentMonthTransactions.filter((t) => {
      const desc = t.description.toLowerCase();
      const isInvCat = t.categoryId === 'cat_sip___investments' || t.categoryId === 'cat_investments';
      const hasKeywords =
        desc.includes('sip') ||
        desc.includes('mutual fund') ||
        desc.includes('zerodha') ||
        desc.includes('groww') ||
        desc.includes('stock') ||
        desc.includes('share') ||
        desc.includes('nifty') ||
        desc.includes('etf') ||
        desc.includes('ppf') ||
        desc.includes('gold') ||
        desc.includes('crypto') ||
        desc.includes('deposit');
      return isInvCat || (t.type === 'expense' && hasKeywords);
    });
  }, [currentMonthTransactions]);

  // Actual Amount Invested this month
  const actualInvested = useMemo(() => {
    return investmentTransactions.reduce((acc, t) => acc + t.amount, 0);
  }, [investmentTransactions]);

  // Target Investment Amount (e.g. 25% or 0.25 of salary)
  const targetInvestment = useMemo(() => {
    return (effectiveSalary * investmentPercent) / 100;
  }, [effectiveSalary, investmentPercent]);

  // Investment progress percentage and remaining gap
  const investmentProgress = targetInvestment > 0 ? (actualInvested / targetInvestment) * 100 : 0;
  const remainingToInvest = Math.max(0, targetInvestment - actualInvested);

  // Needs & Essentials Actual Spent
  const actualNeedsSpent = useMemo(() => {
    const needsCategories = [
      'cat_housing___rent',
      'cat_groceries',
      'cat_utilities___bills',
      'cat_transportation',
      'cat_healthcare',
    ];
    return currentMonthTransactions
      .filter((t) => t.type === 'expense' && needsCategories.includes(t.categoryId))
      .reduce((acc, t) => acc + t.amount, 0);
  }, [currentMonthTransactions]);

  const targetNeeds = (effectiveSalary * needsPercent) / 100;

  // Wants & Discretionary Actual Spent
  const actualWantsSpent = useMemo(() => {
    const wantsCategories = ['cat_food___dining', 'cat_shopping', 'cat_entertainment', 'cat_other'];
    return currentMonthTransactions
      .filter((t) => t.type === 'expense' && wantsCategories.includes(t.categoryId))
      .reduce((acc, t) => acc + t.amount, 0);
  }, [currentMonthTransactions]);

  const targetWants = (effectiveSalary * wantsPercent) / 100;

  // Compound SIP Wealth Projection calculation
  const sipProjection = useMemo(() => {
    const monthlySip = targetInvestment > 0 ? targetInvestment : 12500;
    const r = calcReturnRate / 100 / 12;
    const n = calcHorizonYears * 12;

    const totalInvested = monthlySip * n;
    const futureValue = monthlySip * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const wealthGain = futureValue - totalInvested;

    return {
      monthlySip,
      totalInvested,
      futureValue,
      wealthGain,
    };
  }, [targetInvestment, calcReturnRate, calcHorizonYears]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 font-sans text-[#181512] dark:text-[#FAF7F2]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#181512] dark:text-[#FAF7F2] tracking-tight font-heading">
              Money Balancer & Wealth Allocation
            </h1>
            <span className="text-[10px] font-mono font-bold bg-[#EFE8DD] dark:bg-[#2B231D] text-[#7A6B58] dark:text-[#D6C2B0] border border-[#DDD5C7] dark:border-[#3D332A] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              25% Rule
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#665E54] dark:text-[#ACA397] mt-1">
            Balance your salary systematically: target <strong>{investmentPercent}%</strong> for wealth building & SIPs, maintain essential ceilings, and monitor your monthly investments.
          </p>
        </div>

        <button
          onClick={() => onOpenAddTransaction('expense')}
          className="flex items-center gap-1.5 text-xs font-semibold bg-[#AF6E4D] hover:bg-[#965A39] active:bg-[#864828] text-white px-4 py-2.5 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log SIP / Investment</span>
        </button>
      </div>

      {/* Top Banner: Salary & Inflow Baseline Configuration */}
      <div className="bg-white dark:bg-[#1C1816] rounded-2xl border border-[#E8E1D5] dark:border-[#2D2622] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#EFE8DD] dark:bg-[#2B231D] text-[#AF6E4D] dark:text-[#C87D55] flex items-center justify-center font-bold text-base shadow-xs shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-[#8C8478] dark:text-[#9E9589] uppercase tracking-wider">
              Monthly Salary Baseline (Inflow)
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#181512] dark:text-[#FAF7F2] font-heading tabular-nums mt-0.5">
              {formatCurrency(effectiveSalary, currSymbol)}
            </div>
            <div className="text-[11px] text-[#8C8478] dark:text-[#9E9589] mt-0.5">
              {detectedSalary > 0
                ? `Auto-detected from ${currentMonthTransactions.filter((t) => t.type === 'income').length} income records this month`
                : 'Using custom baseline salary for balancing'}
            </div>
          </div>
        </div>

        {/* Adjust Salary Button / Inline Input */}
        <div className="flex items-center gap-2">
          {isEditingSalary ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={salaryOverride}
                onChange={(e) => setSalaryOverride(e.target.value)}
                placeholder="e.g. 50000"
                className="w-32 px-3 py-1.5 text-xs font-semibold bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E8E1D5] dark:border-[#382F28] rounded-xl text-[#181512] dark:text-[#FAF7F2] focus:outline-hidden focus:border-[#AF6E4D]"
              />
              <button
                onClick={() => {
                  setIsEditingSalary(false);
                  success('Monthly salary updated for balancing!');
                }}
                className="px-3.5 py-1.5 bg-[#AF6E4D] text-white rounded-xl text-xs font-semibold hover:bg-[#965A39]"
              >
                Apply
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingSalary(true)}
              className="text-xs font-semibold text-[#5C554D] dark:text-[#D6C2B0] hover:text-[#AF6E4D] dark:hover:text-[#C87D55] bg-[#FAF7F2] dark:bg-[#25201C] hover:bg-[#F3EDE3] dark:hover:bg-[#2D2622] border border-[#DDD5C7] dark:border-[#382F28] px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
            >
              Adjust Baseline Salary
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI Grid: The User's Core Request (Target vs Invested) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Target SIP & Investment */}
        <div className="bg-white dark:bg-[#1C1816] rounded-2xl border border-[#E8E1D5] dark:border-[#2D2622] p-5 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#8C8478] dark:text-[#9E9589] uppercase tracking-wider">
                Target Investment
              </span>
              <span className="text-xs font-extrabold text-[#AF6E4D] dark:text-[#C87D55] bg-[#EFE8DD] dark:bg-[#2B231D] px-2 py-0.5 rounded-full font-mono">
                {investmentPercent}% of Salary
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#181512] dark:text-[#FAF7F2] font-heading tabular-nums mt-2">
              {formatCurrency(targetInvestment, currSymbol)}
            </div>
          </div>
          <div className="text-[11px] text-[#8C8478] dark:text-[#9E9589] mt-3 pt-3 border-t border-[#E8E1D5] dark:border-[#2D2622]">
            Formula: {investmentPercent}% $\times$ {formatCurrency(effectiveSalary, currSymbol)}
          </div>
        </div>

        {/* Card 2: Actual Invested this Month */}
        <div className="bg-white dark:bg-[#1C1816] rounded-2xl border border-[#E8E1D5] dark:border-[#2D2622] p-5 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#8C8478] dark:text-[#9E9589] uppercase tracking-wider">
                Invested So Far
              </span>
              <span
                className={`text-xs font-extrabold px-2 py-0.5 rounded-full font-mono ${
                  investmentProgress >= 100
                    ? 'text-[#2A7352] bg-[#E8F2EC] dark:bg-[#1A3326] dark:text-[#4ADE80]'
                    : 'text-[#AF6E4D] bg-[#EFE8DD] dark:bg-[#2B231D] dark:text-[#D68D65]'
                }`}
              >
                {investmentProgress.toFixed(1)}% Achieved
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#181512] dark:text-[#FAF7F2] font-heading tabular-nums mt-2">
              {formatCurrency(actualInvested, currSymbol)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E8E1D5] dark:border-[#2D2622]">
            <div className="w-full bg-[#E8E1D5] dark:bg-[#332A24] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  investmentProgress >= 100 ? 'bg-[#2A7352]' : 'bg-[#AF6E4D] dark:bg-[#C87D55]'
                }`}
                style={{ width: `${Math.min(100, investmentProgress)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Remaining Gap to Balance */}
        <div className="bg-white dark:bg-[#1C1816] rounded-2xl border border-[#E8E1D5] dark:border-[#2D2622] p-5 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#8C8478] dark:text-[#9E9589] uppercase tracking-wider">
                Remaining to Invest
              </span>
              <span className="w-2 h-2 rounded-full bg-[#AF6E4D] animate-pulse" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#181512] dark:text-[#FAF7F2] font-heading tabular-nums mt-2">
              {formatCurrency(remainingToInvest, currSymbol)}
            </div>
          </div>
          <div className="text-[11px] text-[#8C8478] dark:text-[#9E9589] mt-3 pt-3 border-t border-[#E8E1D5] dark:border-[#2D2622] flex items-center justify-between">
            <span>{remainingToInvest === 0 ? 'Monthly target met! 🎉' : 'Needs allocation'}</span>
            {remainingToInvest > 0 && (
              <button
                onClick={() => onOpenAddTransaction('expense')}
                className="text-[#AF6E4D] dark:text-[#C87D55] font-bold hover:underline"
              >
                Deposit now
              </button>
            )}
          </div>
        </div>

        {/* Card 4: Monthly Inflow Allocation Balance */}
        <div className="bg-white dark:bg-[#1C1816] rounded-2xl border border-[#E8E1D5] dark:border-[#2D2622] p-5 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#8C8478] dark:text-[#9E9589] uppercase tracking-wider">
                Unallocated Surplus
              </span>
              <ShieldCheck className="w-4 h-4 text-[#2A7352]" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#181512] dark:text-[#FAF7F2] font-heading tabular-nums mt-2">
              {formatCurrency(
                Math.max(0, effectiveSalary - actualNeedsSpent - actualWantsSpent - actualInvested),
                currSymbol
              )}
            </div>
          </div>
          <div className="text-[11px] text-[#8C8478] dark:text-[#9E9589] mt-3 pt-3 border-t border-[#E8E1D5] dark:border-[#2D2622]">
            Available liquidity in accounts
          </div>
        </div>
      </div>

      {/* Section 2: Comprehensive 3-Way Balanced Money Allocation (50 / 25 / 25) */}
      <div className="bg-white dark:bg-[#1C1816] rounded-2xl border border-[#E8E1D5] dark:border-[#2D2622] p-6 sm:p-7 shadow-xs space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E1D5] dark:border-[#2D2622]">
          <div>
            <h2 className="text-base font-bold text-[#181512] dark:text-[#FAF7F2] font-heading">
              Balanced Salary Allocation Framework
            </h2>
            <p className="text-xs text-[#665E54] dark:text-[#ACA397] mt-0.5">
              The golden rule of financial freedom: 50% for Needs, 25% for Wants, and 25% for Investments & SIP.
            </p>
          </div>

          {/* Target Percentage Adjustment Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#665E54] dark:text-[#ACA397]">
              SIP Target:
            </span>
            <select
              value={investmentPercent}
              onChange={(e) => setInvestmentPercent(parseInt(e.target.value))}
              className="px-3 py-1.5 text-xs font-bold bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E8E1D5] dark:border-[#382F28] rounded-xl text-[#181512] dark:text-[#FAF7F2] focus:outline-hidden focus:border-[#AF6E4D] cursor-pointer"
            >
              <option value={15}>15% (Conservative)</option>
              <option value={20}>20% (Standard 50/30/20)</option>
              <option value={25}>25% (Recommended - 0.25 of Salary)</option>
              <option value={30}>30% (Aggressive)</option>
              <option value={40}>40% (FIRE Goal)</option>
            </select>
          </div>
        </div>

        {/* 3 Pillars Visual Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Needs & Essentials (50%) */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E8E1D5] dark:border-[#382F28] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#181512] dark:text-[#FAF7F2]">
                1. Fixed Needs & Bills
              </span>
              <span className="text-[10px] font-mono font-bold text-[#5C554D] dark:text-[#D6C2B0] bg-[#EFE8DD] dark:bg-[#332A24] px-2 py-0.5 rounded-full">
                50% Ceiling
              </span>
            </div>

            <div>
              <div className="text-lg font-extrabold text-[#181512] dark:text-[#FAF7F2] tabular-nums">
                {formatCurrency(actualNeedsSpent, currSymbol)}
              </div>
              <div className="text-[11px] text-[#8C8478] dark:text-[#9E9589]">
                Cap: {formatCurrency(targetNeeds, currSymbol)}
              </div>
            </div>

            <div className="w-full bg-[#E8E1D5] dark:bg-[#332A24] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  actualNeedsSpent > targetNeeds ? 'bg-[#B24531]' : 'bg-[#7A6B58]'
                }`}
                style={{ width: `${Math.min(100, targetNeeds > 0 ? (actualNeedsSpent / targetNeeds) * 100 : 0)}%` }}
              />
            </div>
            <p className="text-[10px] text-[#8C8478] dark:text-[#9E9589]">
              Rent, groceries, utilities, transportation, health
            </p>
          </div>

          {/* Pillar 2: Wants & Discretionary (25%) */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E8E1D5] dark:border-[#382F28] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#181512] dark:text-[#FAF7F2]">
                2. Lifestyle & Wants
              </span>
              <span className="text-[10px] font-mono font-bold text-[#AF6E4D] dark:text-[#D68D65] bg-[#EFE8DD] dark:bg-[#332A24] px-2 py-0.5 rounded-full">
                25% Budget
              </span>
            </div>

            <div>
              <div className="text-lg font-extrabold text-[#181512] dark:text-[#FAF7F2] tabular-nums">
                {formatCurrency(actualWantsSpent, currSymbol)}
              </div>
              <div className="text-[11px] text-[#8C8478] dark:text-[#9E9589]">
                Cap: {formatCurrency(targetWants, currSymbol)}
              </div>
            </div>

            <div className="w-full bg-[#E8E1D5] dark:bg-[#332A24] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  actualWantsSpent > targetWants ? 'bg-[#B24531]' : 'bg-[#D48B63]'
                }`}
                style={{ width: `${Math.min(100, targetWants > 0 ? (actualWantsSpent / targetWants) * 100 : 0)}%` }}
              />
            </div>
            <p className="text-[10px] text-[#8C8478] dark:text-[#9E9589]">
              Dining out, shopping, leisure, entertainment
            </p>
          </div>

          {/* Pillar 3: Investments & SIP (25%) */}
          <div className="p-4 rounded-xl bg-[#FAF4ED] dark:bg-[#2A211B] border border-[#E3CEBE] dark:border-[#4D3B2E] space-y-3 ring-1 ring-[#AF6E4D]/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#181512] dark:text-[#FAF7F2]">
                3. Wealth Creation & SIP
              </span>
              <span className="text-[10px] font-mono font-bold text-[#AF6E4D] dark:text-[#C87D55] bg-[#EFE8DD] dark:bg-[#3B2E24] px-2 py-0.5 rounded-full">
                {investmentPercent}% Goal
              </span>
            </div>

            <div>
              <div className="text-lg font-extrabold text-[#AF6E4D] dark:text-[#C87D55] tabular-nums">
                {formatCurrency(actualInvested, currSymbol)}
              </div>
              <div className="text-[11px] text-[#7A6B58] dark:text-[#ACA397]">
                Target: {formatCurrency(targetInvestment, currSymbol)}
              </div>
            </div>

            <div className="w-full bg-[#E3CEBE] dark:bg-[#3B2E24] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#AF6E4D] dark:bg-[#C87D55] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, investmentProgress)}%` }}
              />
            </div>
            <p className="text-[10px] text-[#7A6B58] dark:text-[#ACA397]">
              Mutual Funds SIP, index funds, stocks, PPF, gold
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Compound Wealth Growth SIP Simulator */}
      <div className="bg-white dark:bg-[#1C1816] rounded-2xl border border-[#E8E1D5] dark:border-[#2D2622] p-6 sm:p-7 shadow-xs space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E1D5] dark:border-[#2D2622]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EFE8DD] dark:bg-[#2B231D] text-[#AF6E4D] dark:text-[#C87D55] flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#181512] dark:text-[#FAF7F2] font-heading">
                SIP & Wealth Compound Growth Projection
              </h2>
              <p className="text-xs text-[#665E54] dark:text-[#ACA397]">
                Simulate how investing {formatCurrency(targetInvestment, currSymbol)} monthly compounds over time.
              </p>
            </div>
          </div>

          {/* Time Horizon Selector */}
          <div className="flex items-center gap-1 bg-[#FAF7F2] dark:bg-[#25201C] p-1 rounded-xl border border-[#E8E1D5] dark:border-[#382F28]">
            {[1, 3, 5, 10, 15].map((yrs) => (
              <button
                key={yrs}
                onClick={() => setCalcHorizonYears(yrs)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  calcHorizonYears === yrs
                    ? 'bg-white dark:bg-[#382F28] text-[#AF6E4D] dark:text-[#C87D55] shadow-2xs'
                    : 'text-[#665E54] dark:text-[#ACA397] hover:text-[#181512] dark:hover:text-[#FAF7F2]'
                }`}
              >
                {yrs} {yrs === 1 ? 'Year' : 'Years'}
              </button>
            ))}
          </div>
        </div>

        {/* Compound Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-4 bg-[#FAF7F2] dark:bg-[#25201C] rounded-xl border border-[#E8E1D5] dark:border-[#382F28]">
            <span className="text-[11px] font-mono font-bold text-[#8C8478] dark:text-[#9E9589] uppercase tracking-wider">
              Total Amount Invested
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-[#181512] dark:text-[#FAF7F2] font-heading tabular-nums mt-1">
              {formatCurrency(sipProjection.totalInvested, currSymbol)}
            </div>
            <div className="text-[10px] text-[#8C8478] dark:text-[#9E9589] mt-1">
              {formatCurrency(targetInvestment, currSymbol)} $\times$ {calcHorizonYears * 12} monthly installments
            </div>
          </div>

          <div className="p-4 bg-[#F2F7F4] dark:bg-[#1A2C23] rounded-xl border border-[#D5E6DC] dark:border-[#2D4A3B]">
            <span className="text-[11px] font-mono font-bold text-[#2A7352] dark:text-[#4ADE80] uppercase tracking-wider">
              Estimated Compound Growth
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-[#2A7352] dark:text-[#4ADE80] font-heading tabular-nums mt-1">
              +{formatCurrency(sipProjection.wealthGain, currSymbol)}
            </div>
            <div className="text-[10px] text-[#2A7352] dark:text-[#4ADE80] mt-1">
              Compounded at {calcReturnRate}% p.a. expected returns
            </div>
          </div>

          <div className="p-4 bg-[#FAF4ED] dark:bg-[#2A211B] rounded-xl border border-[#E3CEBE] dark:border-[#4D3B2E]">
            <span className="text-[11px] font-mono font-bold text-[#AF6E4D] dark:text-[#C87D55] uppercase tracking-wider">
              Projected Portfolio Corpus
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-[#AF6E4D] dark:text-[#C87D55] font-heading tabular-nums mt-1">
              {formatCurrency(sipProjection.futureValue, currSymbol)}
            </div>
            <div className="text-[10px] text-[#7A6B58] dark:text-[#ACA397] mt-1">
              In {calcHorizonYears} years with disciplined monthly SIP
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Investments & SIP Transactions Recorded this Month */}
      <div className="bg-white dark:bg-[#1C1816] rounded-2xl border border-[#E8E1D5] dark:border-[#2D2622] p-6 sm:p-7 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] dark:border-[#2D2622]">
          <div>
            <h3 className="text-base font-bold text-[#181512] dark:text-[#FAF7F2] font-heading">
              Monthly Investment Transactions
            </h3>
            <p className="text-xs text-[#665E54] dark:text-[#ACA397] mt-0.5">
              Verified ledger items classified under Mutual Funds, Stocks, and Wealth Building.
            </p>
          </div>
          <button
            onClick={() => onOpenAddTransaction('expense')}
            className="text-xs font-semibold text-[#AF6E4D] dark:text-[#C87D55] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Investment</span>
          </button>
        </div>

        {investmentTransactions.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EFE8DD] dark:bg-[#2B231D] text-[#AF6E4D] dark:text-[#C87D55] flex items-center justify-center mx-auto">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#181512] dark:text-[#FAF7F2]">
                No investments logged this month yet
              </p>
              <p className="text-xs text-[#8C8478] dark:text-[#9E9589] mt-1 max-w-sm mx-auto">
                Record your Mutual Fund SIP, Zerodha/Groww stock purchases, or PPF deposits to track your 25% allocation.
              </p>
            </div>
            <button
              onClick={() => onOpenAddTransaction('expense')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#AF6E4D] hover:bg-[#965A39] text-white px-4 py-2 rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Record First SIP Deposit</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E1D5]/70 dark:divide-[#2D2622]">
            {investmentTransactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#EFE8DD] dark:bg-[#2B231D] text-[#AF6E4D] dark:text-[#C87D55] flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-[#181512] dark:text-[#FAF7F2] truncate">
                      {tx.description}
                    </div>
                    <div className="text-[11px] text-[#8C8478] dark:text-[#9E9589] truncate mt-0.5">
                      {formatShortDate(tx.date)} · {tx.paymentMethod}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs sm:text-sm font-extrabold text-[#AF6E4D] dark:text-[#C87D55] tabular-nums">
                    {formatCurrency(tx.amount, currSymbol)}
                  </div>
                  <span className="text-[9px] font-mono font-semibold text-[#2A7352] dark:text-[#4ADE80] bg-[#E8F2EC] dark:bg-[#1A3326] px-1.5 py-0.5 rounded">
                    Wealth Building
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
