import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  fullName: string;
  currency: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'bank' | 'cash' | 'credit' | 'wallet' | 'investment';
  balance: number;
  accountNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId?: string; // null for system categories
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  isSystem: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: 'expense' | 'income';
  paymentMethod: 'UPI' | 'Card' | 'Bank Transfer' | 'Cash' | 'Net Banking';
  description: string;
  date: string; // YYYY-MM-DD
  isMlCategorized?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  month: number; // 1-12
  year: number;
  limitAmount: number;
  createdAt: string;
}

// In-memory persistent database store
class SmartFinDB {
  users: Map<string, User> = new Map();
  accounts: Map<string, Account> = new Map();
  categories: Map<string, Category> = new Map();
  transactions: Map<string, Transaction> = new Map();
  budgets: Map<string, Budget> = new Map();

  constructor() {
    this.seedSystemCategories();
    this.seedDemoUser();
  }

  private seedSystemCategories() {
    const defaultCategories: Omit<Category, 'id'>[] = [
      { name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#EF4444', isSystem: true },
      { name: 'Transportation', type: 'expense', icon: 'Car', color: '#F97316', isSystem: true },
      { name: 'Groceries', type: 'expense', icon: 'ShoppingBag', color: '#84CC16', isSystem: true },
      { name: 'Housing & Rent', type: 'expense', icon: 'Home', color: '#6366F1', isSystem: true },
      { name: 'Utilities & Bills', type: 'expense', icon: 'Zap', color: '#EC4899', isSystem: true },
      { name: 'Entertainment', type: 'expense', icon: 'Film', color: '#8B5CF6', isSystem: true },
      { name: 'Healthcare', type: 'expense', icon: 'Activity', color: '#06B6D4', isSystem: true },
      { name: 'Shopping', type: 'expense', icon: 'Gift', color: '#14B8A6', isSystem: true },
      { name: 'Salary', type: 'income', icon: 'Briefcase', color: '#10B981', isSystem: true },
      { name: 'Freelance & Bonus', type: 'income', icon: 'DollarSign', color: '#059669', isSystem: true },
      { name: 'SIP & Investments', type: 'expense', icon: 'TrendingUp', color: '#2563EB', isSystem: true },
      { name: 'Investments', type: 'income', icon: 'TrendingUp', color: '#2563EB', isSystem: true },
      { name: 'Other', type: 'expense', icon: 'MoreHorizontal', color: '#64748B', isSystem: true },
    ];

    for (const cat of defaultCategories) {
      const id = 'cat_' + cat.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      this.categories.set(id, { ...cat, id });
    }
  }

  private hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  }

  private seedDemoUser() {
    const demoSalt = crypto.randomBytes(16).toString('hex');
    const demoPasswordHash = this.hashPassword('smartfin123', demoSalt);
    const demoUserId = 'user_demo_01';

    const demoUser: User = {
      id: demoUserId,
      email: 'yashwanth@smartfin.dev',
      passwordHash: demoPasswordHash,
      salt: demoSalt,
      fullName: 'Yashwanth',
      currency: '₹',
      createdAt: '2026-08-01T00:00:00.000Z',
    };
    this.users.set(demoUserId, demoUser);

    // Seed Demo Accounts
    const accHDFC: Account = {
      id: 'acc_hdfc',
      userId: demoUserId,
      name: 'HDFC Salary Account',
      type: 'bank',
      balance: 32450,
      accountNumber: '•••• 4128',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    };
    const accSBI: Account = {
      id: 'acc_sbi',
      userId: demoUserId,
      name: 'SBI Savings',
      type: 'bank',
      balance: 18200,
      accountNumber: '•••• 8901',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    };
    const accCash: Account = {
      id: 'acc_cash',
      userId: demoUserId,
      name: 'Wallet Cash',
      type: 'cash',
      balance: 2500,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    };
    const accCard: Account = {
      id: 'acc_credit',
      userId: demoUserId,
      name: 'ICICI Amazon Pay Card',
      type: 'credit',
      balance: -4250,
      accountNumber: '•••• 9932',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    };

    this.accounts.set(accHDFC.id, accHDFC);
    this.accounts.set(accSBI.id, accSBI);
    this.accounts.set(accCash.id, accCash);
    this.accounts.set(accCard.id, accCard);

    // Seed Budgets for October 2026
    const foodCatId = 'cat_food___dining';
    const transportCatId = 'cat_transportation';
    const shoppingCatId = 'cat_shopping';
    const utilitiesCatId = 'cat_utilities___bills';

    this.budgets.set('bud_01', {
      id: 'bud_01',
      userId: demoUserId,
      categoryId: foodCatId,
      month: 10,
      year: 2026,
      limitAmount: 5000,
      createdAt: '2026-10-01T00:00:00.000Z',
    });
    this.budgets.set('bud_02', {
      id: 'bud_02',
      userId: demoUserId,
      categoryId: transportCatId,
      month: 10,
      year: 2026,
      limitAmount: 3000,
      createdAt: '2026-10-01T00:00:00.000Z',
    });
    this.budgets.set('bud_03', {
      id: 'bud_03',
      userId: demoUserId,
      categoryId: shoppingCatId,
      month: 10,
      year: 2026,
      limitAmount: 4000,
      createdAt: '2026-10-01T00:00:00.000Z',
    });
    this.budgets.set('bud_04', {
      id: 'bud_04',
      userId: demoUserId,
      categoryId: utilitiesCatId,
      month: 10,
      year: 2026,
      limitAmount: 2500,
      createdAt: '2026-10-01T00:00:00.000Z',
    });

    // Seed Transactions for demo user
    const sampleTransactions: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
      {
        accountId: accHDFC.id,
        categoryId: 'cat_food___dining',
        amount: 420,
        type: 'expense',
        paymentMethod: 'UPI',
        description: 'Swiggy Gourmet Feast',
        date: '2026-10-01',
        isMlCategorized: true,
      },
      {
        accountId: accSBI.id,
        categoryId: 'cat_salary',
        amount: 45000,
        type: 'income',
        paymentMethod: 'Bank Transfer',
        description: 'Monthly Tech Salary',
        date: '2026-09-30',
        isMlCategorized: false,
      },
      {
        accountId: accHDFC.id,
        categoryId: 'cat_transportation',
        amount: 280,
        type: 'expense',
        paymentMethod: 'UPI',
        description: 'Uber Ride to Tech Park',
        date: '2026-09-29',
        isMlCategorized: true,
      },
      {
        accountId: accCard.id,
        categoryId: 'cat_groceries',
        amount: 1850,
        type: 'expense',
        paymentMethod: 'Card',
        description: 'Blinkit Monthly Essentials',
        date: '2026-09-28',
        isMlCategorized: true,
      },
      {
        accountId: accHDFC.id,
        categoryId: 'cat_utilities___bills',
        amount: 1450,
        type: 'expense',
        paymentMethod: 'UPI',
        description: 'BESCOM Electricity Bill',
        date: '2026-09-26',
        isMlCategorized: true,
      },
      {
        accountId: accCard.id,
        categoryId: 'cat_shopping',
        amount: 2400,
        type: 'expense',
        paymentMethod: 'Card',
        description: 'Amazon Electronics & Accessories',
        date: '2026-09-24',
        isMlCategorized: true,
      },
      {
        accountId: accSBI.id,
        categoryId: 'cat_freelance___bonus',
        amount: 8500,
        type: 'income',
        paymentMethod: 'Net Banking',
        description: 'Freelance UI/UX Consultation',
        date: '2026-09-20',
        isMlCategorized: false,
      },
      {
        accountId: accHDFC.id,
        categoryId: 'cat_entertainment',
        amount: 649,
        type: 'expense',
        paymentMethod: 'UPI',
        description: 'Netflix Premium Subscription',
        date: '2026-09-18',
        isMlCategorized: true,
      },
      {
        accountId: accCash.id,
        categoryId: 'cat_food___dining',
        amount: 350,
        type: 'expense',
        paymentMethod: 'Cash',
        description: 'Starbucks Coffee & Croissant',
        date: '2026-09-15',
        isMlCategorized: true,
      },
      {
        accountId: accHDFC.id,
        categoryId: 'cat_housing___rent',
        amount: 16000,
        type: 'expense',
        paymentMethod: 'Bank Transfer',
        description: 'Apartment Monthly Rent',
        date: '2026-09-05',
        isMlCategorized: false,
      },
    ];

    sampleTransactions.forEach((tx, idx) => {
      const id = `tx_${Date.now()}_${idx}`;
      this.transactions.set(id, {
        ...tx,
        id,
        userId: demoUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
  }

  // Double-entry accounting integrity methods
  public recordTransaction(tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
    const account = this.accounts.get(tx.accountId);
    if (!account) {
      throw new Error(`Account ${tx.accountId} not found`);
    }

    if (tx.amount <= 0) {
      throw new Error('Transaction amount must be strictly greater than zero');
    }

    // Adjust Account Balance atomically
    if (tx.type === 'expense') {
      account.balance -= tx.amount;
    } else if (tx.type === 'income') {
      account.balance += tx.amount;
    }
    account.updatedAt = new Date().toISOString();

    const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTx: Transaction = {
      ...tx,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.transactions.set(id, newTx);
    return newTx;
  }

  public updateTransaction(id: string, userId: string, updates: Partial<Transaction>): Transaction {
    const existingTx = this.transactions.get(id);
    if (!existingTx || existingTx.userId !== userId) {
      throw new Error('Transaction not found or unauthorized');
    }

    const currentAccount = this.accounts.get(existingTx.accountId);
    if (!currentAccount) {
      throw new Error('Associated account not found');
    }

    // 1. Revert the old transaction from current account
    if (existingTx.type === 'expense') {
      currentAccount.balance += existingTx.amount;
    } else if (existingTx.type === 'income') {
      currentAccount.balance -= existingTx.amount;
    }

    // Target account (could be changed or unchanged)
    const targetAccountId = updates.accountId || existingTx.accountId;
    const targetAccount = targetAccountId === existingTx.accountId ? currentAccount : this.accounts.get(targetAccountId);
    if (!targetAccount) {
      // rollback
      if (existingTx.type === 'expense') currentAccount.balance -= existingTx.amount;
      else currentAccount.balance += existingTx.amount;
      throw new Error('Target account not found');
    }

    const newAmount = updates.amount !== undefined ? updates.amount : existingTx.amount;
    const newType = updates.type || existingTx.type;

    if (newAmount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    // 2. Apply new transaction impact
    if (newType === 'expense') {
      targetAccount.balance -= newAmount;
    } else if (newType === 'income') {
      targetAccount.balance += newAmount;
    }

    currentAccount.updatedAt = new Date().toISOString();
    if (targetAccount !== currentAccount) {
      targetAccount.updatedAt = new Date().toISOString();
    }

    const updatedTx: Transaction = {
      ...existingTx,
      ...updates,
      amount: newAmount,
      type: newType,
      updatedAt: new Date().toISOString(),
    };

    this.transactions.set(id, updatedTx);
    return updatedTx;
  }

  public deleteTransaction(id: string, userId: string): boolean {
    const existingTx = this.transactions.get(id);
    if (!existingTx || existingTx.userId !== userId) {
      throw new Error('Transaction not found or unauthorized');
    }

    const account = this.accounts.get(existingTx.accountId);
    if (account) {
      // Roll back balance
      if (existingTx.type === 'expense') {
        account.balance += existingTx.amount;
      } else if (existingTx.type === 'income') {
        account.balance -= existingTx.amount;
      }
      account.updatedAt = new Date().toISOString();
    }

    return this.transactions.delete(id);
  }

  public resetUserLedger(userId: string, mode: 'demo' | 'empty'): void {
    // 1. Delete all transactions for this user
    for (const [id, tx] of this.transactions.entries()) {
      if (tx.userId === userId) {
        this.transactions.delete(id);
      }
    }

    // 2. Delete all budgets for this user
    for (const [id, b] of this.budgets.entries()) {
      if (b.userId === userId) {
        this.budgets.delete(id);
      }
    }

    // 3. Delete existing accounts for this user
    for (const [id, acc] of this.accounts.entries()) {
      if (acc.userId === userId) {
        this.accounts.delete(id);
      }
    }

    if (mode === 'empty') {
      // Re-create a single clean primary bank account with 0 balance
      const cleanAcc: Account = {
        id: `acc_${Date.now()}_clean`,
        userId,
        name: 'Primary Bank Account',
        type: 'bank',
        balance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.accounts.set(cleanAcc.id, cleanAcc);
      return;
    }

    // Otherwise, seed rich sample demo data for this user
    const accHDFC: Account = {
      id: `acc_${userId}_hdfc`,
      userId,
      name: 'HDFC Salary Account',
      type: 'bank',
      balance: 32450,
      accountNumber: '•••• 4128',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    };
    const accSBI: Account = {
      id: `acc_${userId}_sbi`,
      userId,
      name: 'SBI Savings',
      type: 'bank',
      balance: 18200,
      accountNumber: '•••• 8901',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    };
    const accCash: Account = {
      id: `acc_${userId}_cash`,
      userId,
      name: 'Wallet Cash',
      type: 'cash',
      balance: 2500,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    };
    const accCard: Account = {
      id: `acc_${userId}_credit`,
      userId,
      name: 'ICICI Amazon Pay Card',
      type: 'credit',
      balance: -4250,
      accountNumber: '•••• 9932',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    };

    this.accounts.set(accHDFC.id, accHDFC);
    this.accounts.set(accSBI.id, accSBI);
    this.accounts.set(accCash.id, accCash);
    this.accounts.set(accCard.id, accCard);

    // Budgets
    this.budgets.set(`bud_${userId}_1`, {
      id: `bud_${userId}_1`,
      userId,
      categoryId: 'cat_food___dining',
      month: 10,
      year: 2026,
      limitAmount: 5000,
      createdAt: '2026-10-01T00:00:00.000Z',
    });
    this.budgets.set(`bud_${userId}_2`, {
      id: `bud_${userId}_2`,
      userId,
      categoryId: 'cat_transportation',
      month: 10,
      year: 2026,
      limitAmount: 3000,
      createdAt: '2026-10-01T00:00:00.000Z',
    });
    this.budgets.set(`bud_${userId}_3`, {
      id: `bud_${userId}_3`,
      userId,
      categoryId: 'cat_shopping',
      month: 10,
      year: 2026,
      limitAmount: 4000,
      createdAt: '2026-10-01T00:00:00.000Z',
    });
    this.budgets.set(`bud_${userId}_4`, {
      id: `bud_${userId}_4`,
      userId,
      categoryId: 'cat_utilities___bills',
      month: 10,
      year: 2026,
      limitAmount: 2500,
      createdAt: '2026-10-01T00:00:00.000Z',
    });

    // Sample Transactions
    const sampleTxs = [
      {
        accountId: accHDFC.id,
        categoryId: 'cat_food___dining',
        amount: 420,
        type: 'expense' as const,
        paymentMethod: 'UPI' as const,
        description: 'Swiggy Gourmet Feast',
        date: '2026-10-01',
        isMlCategorized: true,
      },
      {
        accountId: accSBI.id,
        categoryId: 'cat_salary',
        amount: 45000,
        type: 'income' as const,
        paymentMethod: 'Bank Transfer' as const,
        description: 'Monthly Tech Salary',
        date: '2026-09-30',
        isMlCategorized: false,
      },
      {
        accountId: accHDFC.id,
        categoryId: 'cat_transportation',
        amount: 280,
        type: 'expense' as const,
        paymentMethod: 'UPI' as const,
        description: 'Uber Ride to Tech Park',
        date: '2026-09-29',
        isMlCategorized: true,
      },
      {
        accountId: accCard.id,
        categoryId: 'cat_groceries',
        amount: 1850,
        type: 'expense' as const,
        paymentMethod: 'Card' as const,
        description: 'Blinkit Monthly Essentials',
        date: '2026-09-28',
        isMlCategorized: true,
      },
      {
        accountId: accHDFC.id,
        categoryId: 'cat_utilities___bills',
        amount: 1450,
        type: 'expense' as const,
        paymentMethod: 'UPI' as const,
        description: 'BESCOM Electricity Bill',
        date: '2026-09-26',
        isMlCategorized: true,
      },
      {
        accountId: accCard.id,
        categoryId: 'cat_shopping',
        amount: 2400,
        type: 'expense' as const,
        paymentMethod: 'Card' as const,
        description: 'Amazon Electronics & Accessories',
        date: '2026-09-24',
        isMlCategorized: true,
      },
      {
        accountId: accSBI.id,
        categoryId: 'cat_freelance___bonus',
        amount: 8500,
        type: 'income' as const,
        paymentMethod: 'Net Banking' as const,
        description: 'Freelance UI/UX Consultation',
        date: '2026-09-20',
        isMlCategorized: false,
      },
      {
        accountId: accHDFC.id,
        categoryId: 'cat_entertainment',
        amount: 649,
        type: 'expense' as const,
        paymentMethod: 'UPI' as const,
        description: 'Netflix Premium Subscription',
        date: '2026-09-18',
        isMlCategorized: true,
      },
      {
        accountId: accCash.id,
        categoryId: 'cat_food___dining',
        amount: 350,
        type: 'expense' as const,
        paymentMethod: 'Cash' as const,
        description: 'Starbucks Coffee & Croissant',
        date: '2026-09-15',
        isMlCategorized: true,
      },
      {
        accountId: accHDFC.id,
        categoryId: 'cat_housing___rent',
        amount: 16000,
        type: 'expense' as const,
        paymentMethod: 'Bank Transfer' as const,
        description: 'Apartment Monthly Rent',
        date: '2026-09-05',
        isMlCategorized: false,
      },
    ];

    sampleTxs.forEach((tx, idx) => {
      const id = `tx_${userId}_${idx}_${Date.now()}`;
      this.transactions.set(id, {
        ...tx,
        id,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
  }

  public bulkRecordTransactions(
    userId: string,
    items: Array<{
      accountId: string;
      categoryId: string;
      amount: number;
      type: 'expense' | 'income';
      paymentMethod: 'UPI' | 'Card' | 'Bank Transfer' | 'Cash' | 'Net Banking';
      description: string;
      date: string;
      isMlCategorized?: boolean;
    }>
  ): Transaction[] {
    const created: Transaction[] = [];

    for (const item of items) {
      if (item.amount <= 0) continue;
      const tx = this.recordTransaction({
        userId,
        accountId: item.accountId,
        categoryId: item.categoryId,
        amount: item.amount,
        type: item.type,
        paymentMethod: item.paymentMethod,
        description: item.description,
        date: item.date,
        isMlCategorized: item.isMlCategorized,
      });
      created.push(tx);
    }

    return created;
  }
}

export const db = new SmartFinDB();
