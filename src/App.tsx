import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { FinovaSidebar } from './components/layout/FinovaSidebar.tsx';
import { MobileNav } from './components/layout/MobileNav.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { TransactionsPage } from './pages/TransactionsPage.tsx';
import { AccountsPage } from './pages/AccountsPage.tsx';
import { BudgetsPage } from './pages/BudgetsPage.tsx';
import { MoneyBalancerPage } from './pages/MoneyBalancerPage.tsx';
import { AnalyticsPage } from './pages/AnalyticsPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { FinAIPage } from './pages/FinAIPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { TransactionModal } from './components/transactions/TransactionModal.tsx';
import { AccountModal } from './components/accounts/AccountModal.tsx';
import { BudgetModal } from './components/budgets/BudgetModal.tsx';
import { DocumentScannerModal } from './components/scanner/DocumentScannerModal.tsx';
import { ResetModal } from './components/common/ResetModal.tsx';
import { Account, Category, Transaction, Budget } from './types/index.ts';
import { NavTab } from './components/layout/Sidebar.tsx';
import { api } from './services/api.ts';

function MainApp() {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Shared state for accounts & categories
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [modalDefaultType, setModalDefaultType] = useState<'expense' | 'income'>('expense');

  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<Account | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Tools: Scanner & Reset
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  const refreshAppData = async () => {
    try {
      if (user) {
        const [accsRes, catsRes] = await Promise.all([
          api.getAccounts(),
          api.getCategories(),
        ]);
        setAccounts(accsRes.accounts);
        setCategories(catsRes.categories);
        setRefreshKey((k) => k + 1);
      }
    } catch (err) {
      console.error('Error refreshing app metadata:', err);
    }
  };

  useEffect(() => {
    if (user) {
      refreshAppData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 animate-pulse mx-auto shadow-xs" />
          <p className="text-xs font-semibold text-slate-600 font-heading">
            Loading Finova ledger...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleOpenAddTx = (type: 'expense' | 'income' = 'expense') => {
    setEditingTx(null);
    setModalDefaultType(type);
    setIsTxModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#13110F] text-[#181512] dark:text-[#FAF7F2] flex flex-row antialiased selection:bg-[#EFE8DD] dark:selection:bg-[#3D332A]">
      {/* Finova Left Sidebar */}
      <FinovaSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenScanner={() => setIsScannerModalOpen(true)}
        onOpenReset={() => setIsResetModalOpen(true)}
      />

      {/* Main Application Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#FAF7F2] dark:bg-[#13110F]">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentTab === 'dashboard' && (
            <DashboardPage
              key={refreshKey}
              onOpenAddTransaction={handleOpenAddTx}
              onNavigateToTransactions={() => setCurrentTab('transactions')}
              onNavigateToBudgets={() => setCurrentTab('budgets')}
              onNavigateToAccounts={() => setCurrentTab('accounts')}
              onNavigateToBalancer={() => setCurrentTab('balancer')}
              onOpenScanner={() => setIsScannerModalOpen(true)}
              onOpenReset={() => setIsResetModalOpen(true)}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsPage
              key={refreshKey}
              onOpenAddTransaction={() => handleOpenAddTx('expense')}
              onEditTransaction={(tx) => {
                setEditingTx(tx);
                setIsTxModalOpen(true);
              }}
            />
          )}

          {currentTab === 'accounts' && (
            <AccountsPage
              key={refreshKey}
              onOpenAddAccount={() => {
                setEditingAcc(null);
                setIsAccModalOpen(true);
              }}
              onEditAccount={(acc) => {
                setEditingAcc(acc);
                setIsAccModalOpen(true);
              }}
            />
          )}

          {currentTab === 'budgets' && (
            <BudgetsPage
              key={refreshKey}
              onOpenAddBudget={() => {
                setEditingBudget(null);
                setIsBudgetModalOpen(true);
              }}
            />
          )}

          {currentTab === 'balancer' && (
            <MoneyBalancerPage
              key={refreshKey}
              onOpenAddTransaction={handleOpenAddTx}
            />
          )}

          {currentTab === 'analytics' && <AnalyticsPage key={refreshKey} />}

          {currentTab === 'reports' && <ReportsPage key={refreshKey} />}

          {currentTab === 'finai' && <FinAIPage key={refreshKey} />}

          {currentTab === 'settings' && <SettingsPage key={refreshKey} />}
        </main>
      </div>

      {/* Mobile Navigation Drawer for narrow screens */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenScanner={() => setIsScannerModalOpen(true)}
        onOpenReset={() => setIsResetModalOpen(true)}
      />

      {/* Global Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSuccess={refreshAppData}
        accounts={accounts}
        categories={categories}
        initialData={editingTx}
        defaultType={modalDefaultType}
      />

      <AccountModal
        isOpen={isAccModalOpen}
        onClose={() => {
          setIsAccModalOpen(false);
          setEditingAcc(null);
        }}
        onSuccess={refreshAppData}
        initialData={editingAcc}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setEditingBudget(null);
        }}
        onSuccess={refreshAppData}
        categories={categories}
        initialBudget={editingBudget}
        selectedMonth={10}
        selectedYear={2026}
      />

      {/* Document & Receipt OCR Scanner Modal */}
      <DocumentScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onSuccess={refreshAppData}
        accounts={accounts}
        categories={categories}
      />

      {/* Reset Ledger Modal */}
      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onSuccess={refreshAppData}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
