# SmartFin — Intelligent Personal Finance & Expense Management Platform

> Final-Year Computer Science & Engineering (CSE) Capstone Project  
> Production-grade Fintech Platform with Machine Learning Expense Categorization, Real-Time Balance Reconciliation, and Financial Analytics.

---

## 1. Project Overview

**SmartFin** is a modern SaaS personal finance web platform engineered to eliminate manual financial tracking friction. Built on a resilient light-theme fintech design system inspired by Linear, Stripe, and Apple, SmartFin combines strict double-entry balance integrity, budget threshold monitoring, interactive Recharts visualizations, and an embedded natural language Machine Learning model for automated expense categorization.

### Problem Statement
Modern consumers manage distributed liquidity across multiple payment rails (UPI, credit cards, bank accounts, digital cash wallets). Existing manual spreadsheet methods suffer from:
1. High friction in typing categories for repetitive transactions.
2. Inability to guarantee atomic balance integrity upon transaction updates or deletions.
3. Lack of actionable predictive analytics and visual budget overrun warnings.

### Proposed Solution
SmartFin resolves these challenges through:
- **Real-Time Natural Language Categorization**: A calibrated TF-IDF vectorizer paired with a classifier that predicts category tags from merchant descriptions (e.g., *"Swiggy"*, *"Uber"*, *"BESCOM"*) with confidence scores.
- **Double-Entry Financial Data Integrity**: Atomic account balance adjustments ensuring $Balance_{new} = Balance_{old} \pm \Delta Amount$ on every create, edit, or delete operation.
- **Audit-Ready Financial Statements**: Instant monthly income/expense reconciliation and RFC 4180 CSV ledger exports.
- **FinAI Intelligence**: Direct conversational queries over user personal finance data.

---

## 2. System Architecture & Tech Stack

```text
┌─────────────────────────────────────────────────────────────┐
│               FRONTEND LAYER (React 19 + TypeScript)        │
│   • Vite Bundler            • Tailwind CSS (v4)             │
│   • Lucide React Icons      • Recharts Visualizations       │
│   • Responsive Breakpoints  • Custom Context State Store    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               BACKEND SERVER (Express / Node.js)            │
│   • RESTful API Endpoints   • PBKDF2 Password Hashing       │
│   • HMAC-SHA256 JWT Auth    • Atomic Transaction Locks      │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│     DATABASE ENGINE          │ │    MACHINE LEARNING ENGINE  │
│ • Users, Accounts, Budgets   │ │ • TF-IDF Vectorizer         │
│ • ACID Balance Reconciliation│ │ • Logistic / Bayesian Model │
│ • Check Constraints          │ │ • Merchant Corpus Scorer    │
└──────────────────────────────┘ └─────────────────────────────┘
```

### Technology Matrix
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Recharts.
- **Backend**: Express, Node.js, REST API Architecture, Crypto PBKDF2.
- **Machine Learning**: Scikit-Learn, Pandas, TF-IDF Vectorizer, Logistic Regression (`ml/training/train_model.py`).
- **DevOps**: Docker, Docker Compose, Multi-stage builds.

---

## 3. Database Entity-Relationship (ER) Design

- **Users**: `id` (PK), `email` (Unique), `passwordHash`, `salt`, `fullName`, `currency`.
- **Accounts**: `id` (PK), `userId` (FK), `name`, `type` (`bank` | `credit` | `cash` | `wallet`), `balance`.
- **Categories**: `id` (PK), `name`, `type` (`expense` | `income`), `icon`, `color`, `isSystem`.
- **Transactions**: `id` (PK), `userId` (FK), `accountId` (FK), `categoryId` (FK), `amount`, `type`, `paymentMethod`, `description`, `date`, `isMlCategorized`.
- **Budgets**: `id` (PK), `userId` (FK), `categoryId` (FK), `month`, `year`, `limitAmount`.

---

## 4. API Endpoints Reference (`/api/v1`)

| Endpoint | Method | Purpose |
|---|---|---|
| `/auth/login` | `POST` | User authentication & JWT issuance |
| `/auth/register` | `POST` | Account creation |
| `/auth/me` | `GET` | Active session profile |
| `/accounts` | `GET`, `POST` | Account portfolio retrieval & creation |
| `/accounts/:id` | `PUT`, `DELETE`| Account updates & safe deletion |
| `/transactions` | `GET`, `POST` | Paginated & filtered ledger; atomic creation |
| `/transactions/:id` | `PUT`, `DELETE`| Delta reconciliation & balance rollback |
| `/budgets` | `GET`, `POST` | Monthly limit allocation and utilization |
| `/analytics/summary` | `GET` | Key financial KPIs (Savings rate, surplus) |
| `/analytics/cashflow`| `GET` | 6-month inflow vs outflow trends |
| `/reports/monthly` | `GET` | Consolidated monthly financial statements |
| `/reports/export` | `GET` | RFC 4180 CSV ledger download |
| `/ml/categorize` | `POST` | Real-time merchant category inference |
| `/ai/query` | `POST` | FinAI natural language ledger answers |

---

## 5. Machine Learning Methodology

The ML categorization subsystem classifies transaction text into 12 standardized personal finance categories:
1. **Preprocessing**: Lowercase conversion, alphanumeric tokenization, and stop-word filtering (removing payment prefixes like *UPI*, *Ref*, *Txn*).
2. **Feature Extraction**: Sublinear TF-IDF vectorization with $(1, 2)$-gram ranges to capture multi-word merchants (e.g., *"Chai Point"*, *"Cafe Coffee Day"*).
3. **Classification**: Calibrated model mapping tokens to class conditional probabilities.
4. **Softmax Confidence Calibration**: Computes a normalized probability score ($0.0 \to 1.0$). When confidence exceeds $45\%$, an ML tag is suggested with instant 1-click user override.

---

## 6. Docker & Local Execution

### Option A: Standard Development Mode
```bash
# 1. Install dependencies
npm install

# 2. Run full-stack dev server
npm run dev

# App runs at: http://localhost:3000
```

### Option B: Docker Compose
```bash
docker-compose up --build
```

---

## 7. Demo Credentials

For quick evaluation, pre-seeded demo records are provided:
- **Email**: `yashwanth@smartfin.dev`
- **Password**: `smartfin123`
*(Or click "Sign in with Demo Account (Yashwanth)" on the sign-in page).*
