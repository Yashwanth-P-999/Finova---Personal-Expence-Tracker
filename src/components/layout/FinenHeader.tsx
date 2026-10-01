import React from 'react';
import {
  BarChart2,
  CreditCard,
  CheckCircle2,
  ArrowLeftRight,
  TrendingUp,
  FileText,
  Sparkles,
  Plus,
  ScanLine,
  RotateCcw,
  LogOut,
} from 'lucide-react';
import { NavTab } from './Sidebar.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';

interface FinenHeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAddTransaction: () => void;
  onOpenScanner: () => void;
  onOpenReset: () => void;
}

export const FinenHeader: React.FC<FinenHeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddTransaction,
  onOpenScanner,
  onOpenReset,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Overview', icon: BarChart2 },
    { id: 'accounts' as NavTab, label: 'Account', icon: CreditCard },
    { id: 'budgets' as NavTab, label: 'Planning', icon: CheckCircle2 },
    { id: 'transactions' as NavTab, label: 'Ledger', icon: ArrowLeftRight },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: TrendingUp },
    { id: 'reports' as NavTab, label: 'Reports', icon: FileText },
    { id: 'finai' as NavTab, label: 'FinAI', icon: Sparkles },
  ];

  return (
    <header className="h-16 px-4 sm:px-8 border-b border-slate-200/80 bg-white flex items-center justify-between sticky top-0 z-30">
      {/* Left: Brand Logo & Segmented Tabs */}
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-1">
        {/* Finen / SmartFin Brand Logo */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2 cursor-pointer shrink-0 select-none"
        >
          {/* Angular brand mark matching the screenshot */}
          <div className="flex items-center tracking-tighter">
            <span className="text-indigo-800 font-extrabold text-lg sm:text-xl font-heading -mr-0.5">
              /
            </span>
            <span className="text-slate-900 font-extrabold text-lg sm:text-xl font-heading">
              /
            </span>
          </div>
          <span className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight font-heading">
            SmartFin
          </span>
        </div>

        {/* Segmented Pill Navigation Tabs (Exact appearance from reference image) */}
        <nav className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-50/90 text-indigo-950 border border-indigo-300 shadow-2xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-indigo-800' : 'text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right: Quick Action CTAs */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Reset Ledger */}
        <button
          onClick={onOpenReset}
          title="Reset or clear ledger"
          className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-300 px-2.5 py-1.5 rounded-xl transition-colors shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
          <span>Reset</span>
        </button>

        {/* Scan Bill / Script OCR */}
        <button
          onClick={onOpenScanner}
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
        >
          <ScanLine className="w-3.5 h-3.5 text-emerald-700" />
          <span>Scan Bill</span>
        </button>

        {/* Quick Add CTA */}
        <button
          onClick={onOpenAddTransaction}
          className="flex items-center gap-1 text-xs font-semibold bg-indigo-800 hover:bg-indigo-900 active:bg-indigo-950 text-white px-3.5 py-1.5 rounded-xl transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </button>

        {/* User Profile Avatar with Logout */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
          <div
            title={`${user?.fullName} (${user?.email})`}
            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
          >
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
