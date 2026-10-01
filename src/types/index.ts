export interface User {
  id: string;
  email: string;
  fullName: string;
  currency: string;
  avatarUrl?: string;
  createdAt?: string;
}

export type AccountType = 'bank' | 'cash' | 'credit' | 'wallet' | 'investment';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  accountNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId?: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  isSystem: boolean;
}

export type PaymentMethod = 'UPI' | 'Card' | 'Bank Transfer' | 'Cash' | 'Net Banking';

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: 'expense' | 'income';
  paymentMethod: PaymentMethod;
  description: string;
  date: string;
  isMlCategorized?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  month: number;
  year: number;
  limitAmount: number;
  spent: number;
  remaining: number;
  percentage: number;
  rawPercentage: number;
  isExceeded: boolean;
  isNearLimit: boolean;
}

export interface AnalyticsSummary {
  totalBalance: number;
  currentMonthIncome: number;
  currentMonthExpense: number;
  netSavings: number;
  savingsRate: number;
  expenseGrowth: number;
  balanceGrowth: number;
  accountsCount: number;
  transactionsCount: number;
}

export interface CashflowPoint {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  name: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface MLPrediction {
  categoryId: string;
  categoryName: string;
  confidence: number;
  matchedTokens: string[];
  isConfident: boolean;
}

export interface MonthlyReport {
  month: number;
  year: number;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
  transactionCount: number;
  categoryBreakdown: CategoryBreakdownItem[];
  topTransactions: {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'expense' | 'income';
    category: string;
    account: string;
  }[];
}
