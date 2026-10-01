import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PieChart,
  TrendingUp,
  FileText,
  Sparkles,
  LogOut,
  ScanLine,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';

export type NavTab =
  | 'dashboard'
  | 'transactions'
  | 'accounts'
  | 'budgets'
  | 'balancer'
  | 'analytics'
  | 'reports'
  | 'finai'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenScanner: () => void;
  onOpenReset: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenScanner,
  onOpenReset,
}) => {
  const { user, logout } = useAuth();

  const navSections = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Finance',
      items: [
        { id: 'transactions' as NavTab, label: 'Transactions', icon: ArrowLeftRight },
        { id: 'accounts' as NavTab, label: 'Accounts', icon: Wallet },
        { id: 'budgets' as NavTab, label: 'Budgets', icon: PieChart },
      ],
    },
    {
      title: 'Insights',
      items: [
        { id: 'analytics' as NavTab, label: 'Analytics', icon: TrendingUp },
        { id: 'reports' as NavTab, label: 'Reports & Excel', icon: FileText },
      ],
    },
    {
      title: 'Intelligence',
      items: [
        { id: 'finai' as NavTab, label: 'FinAI Assistant', icon: Sparkles },
      ],
    },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200 h-screen sticky top-0 select-none z-30 shadow-xs">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 bg-linear-to-r from-white via-indigo-50/20 to-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-600 via-indigo-700 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-xs tracking-tight font-heading">
            SF
          </div>
          <div>
            <div className="font-bold text-slate-900 tracking-tight text-sm font-heading">
              SMARTFIN
            </div>
            <div className="text-[10px] text-indigo-600 font-semibold tracking-wider uppercase">
              Fintech Platform
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-50/80 text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}

        {/* Quick Tools Section */}
        <div className="pt-2 border-t border-slate-100 space-y-1">
          <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Smart Tools
          </div>

          <button
            onClick={onOpenScanner}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 transition-colors border border-indigo-100/60"
          >
            <div className="flex items-center gap-2.5">
              <ScanLine className="w-4 h-4 text-indigo-600" />
              <span>Bill & Script OCR</span>
            </div>
            <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">
              New
            </span>
          </button>

          <button
            onClick={onOpenReset}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-amber-700 hover:bg-amber-50/60 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* User Status & Logout Footer */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-100 to-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-200/60">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-800 truncate font-heading">
                {user?.fullName || 'User'}
              </div>
              <div className="text-[11px] text-slate-500 truncate">{user?.email || ''}</div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
