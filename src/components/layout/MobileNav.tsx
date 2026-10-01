import React, { useState } from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  TrendingUp,
  MoreHorizontal,
  Wallet,
  FileText,
  Sparkles,
  LogOut,
  X,
  ScanLine,
  RotateCcw,
  Settings,
  Scale,
} from 'lucide-react';
import { NavTab } from './Sidebar.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';

interface MobileNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenScanner: () => void;
  onOpenReset: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenScanner,
  onOpenReset,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleTabClick = (tab: NavTab) => {
    onSelectTab(tab);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Menu for More Options */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end lg:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-t-2xl p-5 border-t border-slate-200 dark:border-slate-800 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
                Finova Menu & Tools
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 space-y-1">
              {/* Scan Store Bill or Script */}
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  onOpenScanner();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
              >
                <div className="flex items-center gap-3">
                  <ScanLine className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Scan Bill or Script</span>
                </div>
                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold">
                  OCR
                </span>
              </button>

              <button
                onClick={() => handleTabClick('accounts')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentTab === 'accounts' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Wallet className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Accounts & Cards</span>
              </button>

              <button
                onClick={() => handleTabClick('balancer')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentTab === 'balancer' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Money Balancer & SIP</span>
              </button>

              <button
                onClick={() => handleTabClick('reports')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentTab === 'reports' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Reports & Excel Export</span>
              </button>

              <button
                onClick={() => handleTabClick('finai')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentTab === 'finai' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>FinAI Assistant</span>
              </button>

              <button
                onClick={() => handleTabClick('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentTab === 'settings' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Account Settings & Theme</span>
              </button>

              {/* Reset Data Option */}
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  onOpenReset();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              >
                <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Reset Ledger Data</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Logged in as <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.fullName}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  setDrawerOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 px-2 py-1 rounded"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-sm">
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`flex flex-col items-center py-1 px-3 text-[11px] font-semibold transition-colors ${
            currentTab === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => handleTabClick('transactions')}
          className={`flex flex-col items-center py-1 px-3 text-[11px] font-semibold transition-colors ${
            currentTab === 'transactions' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ArrowLeftRight className="w-5 h-5 mb-0.5" />
          <span>Ledger</span>
        </button>

        <button
          onClick={() => handleTabClick('budgets')}
          className={`flex flex-col items-center py-1 px-3 text-[11px] font-semibold transition-colors ${
            currentTab === 'budgets' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <PieChart className="w-5 h-5 mb-0.5" />
          <span>Budgets</span>
        </button>

        <button
          onClick={() => handleTabClick('analytics')}
          className={`flex flex-col items-center py-1 px-3 text-[11px] font-semibold transition-colors ${
            currentTab === 'analytics' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center py-1 px-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span>Tools</span>
        </button>
      </nav>
    </>
  );
};
