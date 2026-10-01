import React, { useState } from 'react';
import {
  LayoutGrid,
  Wallet,
  ArrowLeftRight,
  PieChart,
  FileText,
  Activity,
  Sparkles,
  Search,
  ScanLine,
  RotateCcw,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  Sun,
  Moon,
  Scale,
} from 'lucide-react';
import { NavTab } from './Sidebar.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useTheme } from '../../contexts/ThemeContext.tsx';
import { BrandLogo } from '../common/BrandLogo.tsx';

interface FinovaSidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenScanner: () => void;
  onOpenReset: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
}

export const FinovaSidebar: React.FC<FinovaSidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenScanner,
  onOpenReset,
  searchTerm = '',
  onSearchChange,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [searchVal, setSearchVal] = useState(searchTerm);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearchChange) onSearchChange(e.target.value);
  };

  return (
    <aside
      className={`hidden lg:flex flex-col bg-[#FAF7F2] dark:bg-[#151210] border-r border-[#E8E1D5] dark:border-[#28221D] h-screen sticky top-0 z-30 select-none transition-all duration-200 font-sans ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-18 px-5 flex items-center justify-between border-b border-[#E8E1D5] dark:border-[#28221D]">
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center cursor-pointer overflow-hidden"
          title="Finova - Private Wealth & Ledger"
        >
          <BrandLogo size={collapsed ? 'sm' : 'md'} collapsed={collapsed} showTagline={false} />
        </div>

        {/* Sidebar Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg border border-[#E8E1D5] dark:border-[#2E2722] text-[#8C8478] hover:text-[#181512] dark:hover:text-[#FAF7F2] hover:bg-[#EFE8DD] dark:hover:bg-[#201C19] transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Search Input Box */}
      {!collapsed && (
        <div className="px-5 pt-4 pb-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#9E9589] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchVal}
              onChange={handleSearch}
              placeholder="Search ledger..."
              className="w-full pl-9 pr-12 py-2 text-xs font-medium text-[#181512] dark:text-[#FAF7F2] bg-white dark:bg-[#1C1816] border border-[#E8E1D5] dark:border-[#2E2722] rounded-xl focus:outline-hidden focus:border-[#AF6E4D] focus:ring-1 focus:ring-[#AF6E4D]/30 placeholder:text-[#9E9589]"
            />
            <div className="absolute right-2.5 text-[10px] font-mono font-semibold text-[#8C8478] bg-[#F4EFE6] dark:bg-[#25201C] border border-[#E8E1D5] dark:border-[#332A24] px-1.5 py-0.5 rounded">
              ⌘ F
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-5">
        {/* Section 1: OVERVIEW */}
        <div>
          {!collapsed && (
            <div className="px-3 text-[10px] font-mono font-bold text-[#8C8478] dark:text-[#7A7165] uppercase tracking-[0.2em] mb-1.5">
              Overview
            </div>
          )}
          <div className="space-y-1">
            {/* Dashboard */}
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-[#EFE8DD] text-[#AF6E4D] dark:bg-[#2B231D] dark:text-[#C87D55] font-bold shadow-2xs'
                  : 'text-[#665E54] dark:text-[#ACA397] hover:text-[#181512] dark:hover:text-[#FAF7F2] hover:bg-[#F3EDE3] dark:hover:bg-[#1E1916]'
              }`}
            >
              <LayoutGrid className={`w-4 h-4 shrink-0 ${currentTab === 'dashboard' ? 'text-[#AF6E4D] dark:text-[#C87D55]' : 'text-[#9E9589]'}`} />
              {!collapsed && <span>Dashboard</span>}
            </button>

            {/* Wallet (Accounts) */}
            <button
              onClick={() => onSelectTab('accounts')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'accounts'
                  ? 'bg-[#EFE8DD] text-[#AF6E4D] dark:bg-[#2B231D] dark:text-[#C87D55] font-bold shadow-2xs'
                  : 'text-[#665E54] dark:text-[#ACA397] hover:text-[#181512] dark:hover:text-[#FAF7F2] hover:bg-[#F3EDE3] dark:hover:bg-[#1E1916]'
              }`}
            >
              <Wallet className={`w-4 h-4 shrink-0 ${currentTab === 'accounts' ? 'text-[#AF6E4D] dark:text-[#C87D55]' : 'text-[#9E9589]'}`} />
              {!collapsed && <span>Accounts & Cards</span>}
            </button>

            {/* Transactions Ledger */}
            <button
              onClick={() => onSelectTab('transactions')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'transactions'
                  ? 'bg-[#EFE8DD] text-[#AF6E4D] dark:bg-[#2B231D] dark:text-[#C87D55] font-bold shadow-2xs'
                  : 'text-[#665E54] dark:text-[#ACA397] hover:text-[#181512] dark:hover:text-[#FAF7F2] hover:bg-[#F3EDE3] dark:hover:bg-[#1E1916]'
              }`}
            >
              <ArrowLeftRight className={`w-4 h-4 shrink-0 ${currentTab === 'transactions' ? 'text-[#AF6E4D] dark:text-[#C87D55]' : 'text-[#9E9589]'}`} />
              {!collapsed && <span>Ledger</span>}
            </button>
          </div>
        </div>

        {/* Section 2: PLANNING */}
        <div>
          {!collapsed && (
            <div className="px-3 text-[10px] font-mono font-bold text-[#8C8478] dark:text-[#7A7165] uppercase tracking-[0.2em] mb-1.5">
              Planning
            </div>
          )}
          <div className="space-y-1">
            {/* Money Balancer & SIP Allocator */}
            <button
              onClick={() => onSelectTab('balancer')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'balancer'
                  ? 'bg-[#EFE8DD] text-[#AF6E4D] dark:bg-[#2B231D] dark:text-[#C87D55] font-bold shadow-2xs'
                  : 'text-[#665E54] dark:text-[#ACA397] hover:text-[#181512] dark:hover:text-[#FAF7F2] hover:bg-[#F3EDE3] dark:hover:bg-[#1E1916]'
              }`}
            >
              <Scale className={`w-4 h-4 shrink-0 ${currentTab === 'balancer' ? 'text-[#AF6E4D] dark:text-[#C87D55]' : 'text-[#9E9589]'}`} />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span>Money Balancer</span>
                  <span className="text-[9px] font-mono font-bold bg-[#AF6E4D]/15 text-[#AF6E4D] dark:bg-[#C87D55]/20 dark:text-[#C87D55] px-1.5 py-0.5 rounded">
                    25% SIP
                  </span>
                </div>
              )}
            </button>

            {/* Budget */}
            <button
              onClick={() => onSelectTab('budgets')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'budgets'
                  ? 'bg-[#EFE8DD] text-[#AF6E4D] dark:bg-[#2B231D] dark:text-[#C87D55] font-bold shadow-2xs'
                  : 'text-[#665E54] dark:text-[#ACA397] hover:text-[#181512] dark:hover:text-[#FAF7F2] hover:bg-[#F3EDE3] dark:hover:bg-[#1E1916]'
              }`}
            >
              <PieChart className={`w-4 h-4 shrink-0 ${currentTab === 'budgets' ? 'text-[#AF6E4D] dark:text-[#C87D55]' : 'text-[#9E9589]'}`} />
              {!collapsed && <span>Budget Limits</span>}
            </button>
          </div>
        </div>

        {/* Section 3: INSIGHTS */}
        <div>
          {!collapsed && (
            <div className="px-3 text-[10px] font-mono font-bold text-[#8C8478] dark:text-[#7A7165] uppercase tracking-[0.2em] mb-1.5">
              Insights
            </div>
          )}
          <div className="space-y-1">
            {/* Reports */}
            <button
              onClick={() => onSelectTab('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'reports'
                  ? 'bg-[#EFE8DD] text-[#AF6E4D] dark:bg-[#2B231D] dark:text-[#C87D55] font-bold shadow-2xs'
                  : 'text-[#665E54] dark:text-[#ACA397] hover:text-[#181512] dark:hover:text-[#FAF7F2] hover:bg-[#F3EDE3] dark:hover:bg-[#1E1916]'
              }`}
            >
              <FileText className={`w-4 h-4 shrink-0 ${currentTab === 'reports' ? 'text-[#AF6E4D] dark:text-[#C87D55]' : 'text-[#9E9589]'}`} />
              {!collapsed && <span>Reports & Excel</span>}
            </button>

            {/* Cashflow (Analytics) */}
            <button
              onClick={() => onSelectTab('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'analytics'
                  ? 'bg-[#EFE8DD] text-[#AF6E4D] dark:bg-[#2B231D] dark:text-[#C87D55] font-bold shadow-2xs'
                  : 'text-[#665E54] dark:text-[#ACA397] hover:text-[#181512] dark:hover:text-[#FAF7F2] hover:bg-[#F3EDE3] dark:hover:bg-[#1E1916]'
              }`}
            >
              <Activity className={`w-4 h-4 shrink-0 ${currentTab === 'analytics' ? 'text-[#AF6E4D] dark:text-[#C87D55]' : 'text-[#9E9589]'}`} />
              {!collapsed && <span>Cashflow Trends</span>}
            </button>

            {/* FinAI */}
            <button
              onClick={() => onSelectTab('finai')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'finai'
                  ? 'bg-[#EFE8DD] text-[#AF6E4D] dark:bg-[#2B231D] dark:text-[#C87D55] font-bold shadow-2xs'
                  : 'text-[#665E54] dark:text-[#ACA397] hover:text-[#181512] dark:hover:text-[#FAF7F2] hover:bg-[#F3EDE3] dark:hover:bg-[#1E1916]'
              }`}
            >
              <Sparkles className={`w-4 h-4 shrink-0 ${currentTab === 'finai' ? 'text-[#AF6E4D] dark:text-[#C87D55]' : 'text-[#9E9589]'}`} />
              {!collapsed && <span>FinAI Intelligence</span>}
            </button>

            {/* Settings */}
            <button
              onClick={() => onSelectTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'settings'
                  ? 'bg-[#EFE8DD] text-[#AF6E4D] dark:bg-[#2B231D] dark:text-[#C87D55] font-bold shadow-2xs'
                  : 'text-[#665E54] dark:text-[#ACA397] hover:text-[#181512] dark:hover:text-[#FAF7F2] hover:bg-[#F3EDE3] dark:hover:bg-[#1E1916]'
              }`}
            >
              <Settings className={`w-4 h-4 shrink-0 ${currentTab === 'settings' ? 'text-[#AF6E4D] dark:text-[#C87D55]' : 'text-[#9E9589]'}`} />
              {!collapsed && <span>Settings</span>}
            </button>
          </div>
        </div>

        {/* Section 4: SMART TOOLS */}
        <div className="pt-2 border-t border-[#E8E1D5] dark:border-[#28221D]">
          {!collapsed && (
            <div className="px-3 text-[10px] font-mono font-bold text-[#8C8478] dark:text-[#7A7165] uppercase tracking-[0.2em] mb-1.5">
              Tools
            </div>
          )}
          <div className="space-y-1">
            {/* Scan Store Bill & Handwritten Script */}
            <button
              onClick={onOpenScanner}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#AF6E4D] dark:text-[#C87D55] bg-[#EFE8DD]/70 dark:bg-[#2B231D]/60 hover:bg-[#EFE8DD] dark:hover:bg-[#2B231D] transition-all border border-[#E0D7C9] dark:border-[#3D332A]"
            >
              <div className="flex items-center gap-2.5">
                <ScanLine className="w-4 h-4 text-[#AF6E4D] dark:text-[#C87D55] shrink-0" />
                {!collapsed && <span>Scan Bill / Script</span>}
              </div>
              {!collapsed && (
                <span className="text-[9px] font-mono font-bold bg-[#AF6E4D] text-white px-1.5 py-0.5 rounded">
                  OCR
                </span>
              )}
            </button>

            {/* Reset Data */}
            <button
              onClick={onOpenReset}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#7A7165] dark:text-[#ACA397] hover:text-[#9B4834] dark:hover:text-[#E2765E] hover:bg-[#F5ECE8] dark:hover:bg-[#2A1D1A] transition-all"
            >
              <RotateCcw className="w-4 h-4 text-[#9E9589] shrink-0" />
              {!collapsed && <span>Reset Data</span>}
            </button>
          </div>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3.5 border-t border-[#E8E1D5] dark:border-[#28221D] bg-[#F4EFE6]/60 dark:bg-[#1C1816]/60">
        <div className="flex items-center justify-between">
          <div
            onClick={() => onSelectTab('settings')}
            className="flex items-center gap-2.5 overflow-hidden cursor-pointer group flex-1"
            title="Open Account Settings"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#DDD5C7] dark:border-[#3D332A] group-hover:ring-2 group-hover:ring-[#AF6E4D]/40 transition-all"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#EFE8DD] dark:bg-[#2B231D] text-[#AF6E4D] dark:text-[#C87D55] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#E5DDCF] transition-colors font-heading">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            )}
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-[#181512] dark:text-[#FAF7F2] truncate font-heading group-hover:text-[#AF6E4D] dark:group-hover:text-[#C87D55] transition-colors">
                  {user?.fullName || 'User'}
                </div>
                <div className="text-[11px] text-[#8C8478] dark:text-[#A89F94] truncate">{user?.email || ''}</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="flex items-center gap-0.5">
              {/* Theme Quick Toggle */}
              <button
                onClick={toggleTheme}
                title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
                className="p-1.5 text-[#8C8478] hover:text-[#AF6E4D] dark:hover:text-[#C87D55] hover:bg-[#EFE8DD] dark:hover:bg-[#2B231D] rounded-lg transition-colors"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-[#DCA27E]" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => onSelectTab('settings')}
                title="Settings"
                className="p-1.5 text-[#8C8478] hover:text-[#AF6E4D] dark:hover:text-[#C87D55] hover:bg-[#EFE8DD] dark:hover:bg-[#2B231D] rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={logout}
                title="Log out"
                className="p-1.5 text-[#8C8478] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
