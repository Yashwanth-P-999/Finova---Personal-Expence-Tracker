import {
  User,
  Account,
  Category,
  Transaction,
  Budget,
  AnalyticsSummary,
  CashflowPoint,
  CategoryBreakdownItem,
  MLPrediction,
  MonthlyReport,
} from '../types/index.ts';

const API_BASE = '/api/v1';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('smartfin_auth_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('smartfin_auth_token', token);
    } else {
      localStorage.removeItem('smartfin_auth_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      // Let app handle re-login without infinite reload
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      let errorMessage = 'Request failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // --- Auth ---
  public async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  public async register(payload: { email: string; password: string; fullName: string; currency?: string }): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(data.token);
    return data;
  }

  public async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  public async updateProfile(payload: { fullName?: string; avatarUrl?: string; currency?: string }): Promise<{ user: User; message: string }> {
    return this.request<{ user: User; message: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async requestPasswordRecovery(email: string): Promise<{ message: string; code: string; expiresInMinutes: number }> {
    return this.request<{ message: string; code: string; expiresInMinutes: number }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  public async resetPasswordWithCode(payload: { email: string; code: string; newPassword: string }): Promise<{ message: string; token: string; user: User }> {
    const data = await this.request<{ message: string; token: string; user: User }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  public logout() {
    this.setToken(null);
  }

  // --- Accounts ---
  public async getAccounts(): Promise<{ accounts: Account[] }> {
    return this.request<{ accounts: Account[] }>('/accounts');
  }

  public async createAccount(payload: Partial<Account>): Promise<{ account: Account }> {
    return this.request<{ account: Account }>('/accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateAccount(id: string, payload: Partial<Account>): Promise<{ account: Account }> {
    return this.request<{ account: Account }>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async deleteAccount(id: string): Promise<void> {
    await this.request(`/accounts/${id}`, { method: 'DELETE' });
  }

  // --- Categories ---
  public async getCategories(): Promise<{ categories: Category[] }> {
    return this.request<{ categories: Category[] }>('/categories');
  }

  public async createCategory(payload: Partial<Category>): Promise<{ category: Category }> {
    return this.request<{ category: Category }>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Transactions ---
  public async getTransactions(params?: {
    search?: string;
    categoryId?: string;
    accountId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    transactions: Transaction[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.categoryId) query.set('categoryId', params.categoryId);
    if (params?.accountId) query.set('accountId', params.accountId);
    if (params?.type) query.set('type', params.type);
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    return this.request(`/transactions?${query.toString()}`);
  }

  public async createTransaction(payload: Partial<Transaction>): Promise<{ transaction: Transaction; updatedAccountBalance: number }> {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateTransaction(id: string, payload: Partial<Transaction>): Promise<{ transaction: Transaction; updatedAccountBalance: number }> {
    return this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async deleteTransaction(id: string): Promise<void> {
    await this.request(`/transactions/${id}`, { method: 'DELETE' });
  }

  // --- Budgets ---
  public async getBudgets(month?: number, year?: number): Promise<{
    month: number;
    year: number;
    budgets: Budget[];
    summary: { totalBudgeted: number; totalSpentInBudgets: number; totalRemaining: number; overallPercentage: number };
  }> {
    const query = new URLSearchParams();
    if (month) query.set('month', month.toString());
    if (year) query.set('year', year.toString());
    return this.request(`/budgets?${query.toString()}`);
  }

  public async createOrUpdateBudget(payload: { categoryId: string; limitAmount: number; month?: number; year?: number }): Promise<{ budget: Budget }> {
    return this.request('/budgets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async deleteBudget(id: string): Promise<void> {
    await this.request(`/budgets/${id}`, { method: 'DELETE' });
  }

  // --- Analytics ---
  public async getSummary(): Promise<AnalyticsSummary> {
    return this.request<AnalyticsSummary>('/analytics/summary');
  }

  public async getCashflow(): Promise<{ cashflow: CashflowPoint[] }> {
    return this.request<{ cashflow: CashflowPoint[] }>('/analytics/cashflow');
  }

  public async getCategoriesDistribution(): Promise<{ totalExpense: number; breakdown: CategoryBreakdownItem[] }> {
    return this.request<{ totalExpense: number; breakdown: CategoryBreakdownItem[] }>('/analytics/categories');
  }

  // --- Reports & Export ---
  public async getMonthlyReport(month?: number, year?: number): Promise<MonthlyReport> {
    const query = new URLSearchParams();
    if (month) query.set('month', month.toString());
    if (year) query.set('year', year.toString());
    return this.request<MonthlyReport>(`/reports/monthly?${query.toString()}`);
  }

  public async exportCsv(): Promise<Blob> {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}/reports/export`, { headers });
    if (!response.ok) throw new Error('Failed to export CSV');
    return response.blob();
  }

  // --- Machine Learning Categorization ---
  public async predictCategory(description: string): Promise<{ prediction: MLPrediction }> {
    return this.request<{ prediction: MLPrediction }>('/ml/categorize', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
  }

  // --- FinAI Query ---
  public async queryAI(query: string): Promise<{ query: string; answer: string; metrics: any; timestamp: string }> {
    return this.request('/ai/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  // --- Reset Ledger ---
  public async resetLedger(mode: 'demo' | 'empty' = 'demo'): Promise<{ success: boolean; message: string }> {
    return this.request('/ledger/reset', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    });
  }

  // --- Parse Document / Bill / Script ---
  public async parseDocument(payload: {
    text?: string;
    imageBase64?: string;
    mimeType?: string;
  }): Promise<{
    source: string;
    itemsCount: number;
    items: Array<{
      description: string;
      amount: number;
      date: string;
      categoryId: string;
      categoryName: string;
      confidence: number;
      type: 'expense' | 'income';
      paymentMethod: 'UPI' | 'Card' | 'Bank Transfer' | 'Cash' | 'Net Banking';
    }>;
  }> {
    return this.request('/ledger/parse-document', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Bulk Import ---
  public async bulkImport(items: any[], accountId?: string): Promise<{ message: string; importedCount: number; updatedAccountBalance: number }> {
    return this.request('/ledger/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ items, accountId }),
    });
  }

  // --- Real Excel Export (.xlsx) ---
  public async exportExcel(): Promise<Blob> {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}/reports/export-excel`, { headers });
    if (!response.ok) throw new Error('Failed to export Excel spreadsheet');
    return response.blob();
  }
}

export const api = new ApiService();
