import React from 'react';
import { Plus, ScanLine, RotateCcw, ShieldCheck } from 'lucide-react';
import { NavTab } from './Sidebar.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';

interface TopbarProps {
  currentTab: NavTab;
  onOpenAddTransaction: () => void;
  onOpenScanner: () => void;
  onOpenReset: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentTab,
  onOpenAddTransaction,
  onOpenScanner,
  onOpenReset,
}) => {
  const { user } = useAuth();

  const getPageTitle = (tab: NavTab): string => {
    switch (tab) {
      case 'dashboard':
        return 'Financial Overview';
      case 'transactions':
        return 'Transactions Ledger';
      case 'accounts':
        return 'Accounts & Portfolios';
      case 'budgets':
        return 'Monthly Budgets';
      case 'analytics':
        return 'Financial Analytics';
      case 'reports':
        return 'Reports & Excel Export';
      case 'finai':
        return 'FinAI Assistant';
      default:
        return 'Dashboard';
    }
  };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      <div>
        <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight font-heading">
          {getPageTitle(currentTab)}
        </h1>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 hidden sm:flex">
          <span>{todayFormatted}</span>
          <span>·</span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <ShieldCheck className="w-3 h-3" /> Reconciled
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Reset Ledger Button */}
        <button
          onClick={onOpenReset}
          title="Reset or clear ledger data"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* Scan Store Bill / Script */}
        <button
          onClick={onOpenScanner}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-3 py-1.5 sm:py-2 rounded-lg transition-colors shadow-2xs"
        >
          <ScanLine className="w-3.5 h-3.5 text-indigo-600" />
          <span>Upload Bill / Script</span>
        </button>

        {/* Quick Add Transaction CTA */}
        <button
          onClick={onOpenAddTransaction}
          className="flex items-center gap-1.5 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:from-indigo-800 active:to-blue-800 text-white text-xs sm:text-sm font-semibold px-3.5 py-1.5 sm:py-2 rounded-lg transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* Currency Tag */}
        <div className="hidden md:flex items-center justify-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold font-mono">
          {user?.currency || '₹'}
        </div>
      </div>
    </header>
  );
};
