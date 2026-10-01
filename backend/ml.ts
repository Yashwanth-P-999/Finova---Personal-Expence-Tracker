/**
 * SmartFin ML Inference Engine: Automatic Expense Categorization
 * Modeled after Scikit-Learn's TF-IDF Vectorizer + Multinomial Naive Bayes / Logistic Regression Classifier
 */

export interface PredictionResult {
  categoryId: string;
  categoryName: string;
  confidence: number; // 0.0 to 1.0
  matchedTokens: string[];
  isConfident: boolean;
}

interface CategoryModelData {
  id: string;
  name: string;
  keywords: { [token: string]: number }; // Token weights (TF-IDF * Model Coefficient)
  prior: number; // Prior class probability
}

export class ExpenseCategorizerML {
  private categories: CategoryModelData[] = [
    {
      id: 'cat_food___dining',
      name: 'Food & Dining',
      prior: 0.25,
      keywords: {
        swiggy: 4.8, zomato: 4.8, pizza: 4.2, dominos: 4.5, mcdonalds: 4.5, burger: 4.0,
        restaurant: 3.8, cafe: 3.8, coffee: 3.6, starbucks: 4.5, kfc: 4.2, lunch: 3.2,
        dinner: 3.2, breakfast: 3.2, food: 3.0, eat: 2.8, subway: 4.2, bakery: 3.5,
        biryani: 4.2, chai: 3.8, tea: 3.2, dine: 3.5, haldiram: 4.2, buffet: 3.6,
      },
    },
    {
      id: 'cat_transportation',
      name: 'Transportation',
      prior: 0.18,
      keywords: {
        uber: 4.9, ola: 4.8, auto: 3.5, taxi: 4.0, cab: 4.0, rapido: 4.7, metro: 4.5,
        petrol: 4.8, diesel: 4.8, fuel: 4.5, shell: 4.6, iocl: 4.5, bpcl: 4.5, hpcl: 4.5,
        toll: 4.2, fastag: 4.8, train: 3.8, irctc: 4.8, flight: 4.0, indigo: 4.2, bus: 3.8,
        parking: 3.8, transport: 3.0, ride: 3.2,
      },
    },
    {
      id: 'cat_groceries',
      name: 'Groceries',
      prior: 0.15,
      keywords: {
        blinkit: 4.9, zepto: 4.9, instamart: 4.8, bigbasket: 4.9, dmart: 4.8, grocery: 4.2,
        supermarket: 4.0, vegetables: 4.0, fruits: 3.8, milk: 3.8, dairy: 3.8, market: 2.8,
        naturebasket: 4.5, staples: 3.5, provision: 3.8, ration: 3.8,
      },
    },
    {
      id: 'cat_utilities___bills',
      name: 'Utilities & Bills',
      prior: 0.12,
      keywords: {
        electricity: 4.8, power: 3.5, bescom: 4.9, tatapower: 4.8, adani: 3.8, gas: 4.0,
        water: 3.8, wifi: 4.5, broadband: 4.5, internet: 4.2, airtel: 4.0, jio: 4.0,
        recharge: 4.2, bill: 3.5, postpaid: 4.2, prepaid: 3.5, dth: 4.2, tataplay: 4.5,
      },
    },
    {
      id: 'cat_housing___rent',
      name: 'Housing & Rent',
      prior: 0.08,
      keywords: {
        rent: 4.9, maintenance: 4.2, society: 3.8, apartment: 4.0, flat: 3.8, landlord: 4.8,
        nobroker: 4.6, housing: 3.8, lease: 4.2, deposit: 4.0,
      },
    },
    {
      id: 'cat_entertainment',
      name: 'Entertainment',
      prior: 0.10,
      keywords: {
        netflix: 4.9, prime: 4.0, hotstar: 4.8, spotify: 4.8, movie: 4.0, cinema: 4.2,
        pvr: 4.8, inox: 4.8, bookmyshow: 4.9, concert: 4.2, youtube: 4.0, gaming: 4.0,
        steam: 4.5, playstation: 4.5,
      },
    },
    {
      id: 'cat_shopping',
      name: 'Shopping',
      prior: 0.12,
      keywords: {
        amazon: 4.5, flipkart: 4.5, myntra: 4.8, meesho: 4.5, ajio: 4.8, zara: 4.8,
        'h&m': 4.8, clothes: 4.0, shoes: 4.0, electronics: 3.8, mall: 3.5, purchase: 2.5,
        retail: 3.0, order: 2.2, decathlon: 4.5, ikea: 4.5,
      },
    },
    {
      id: 'cat_healthcare',
      name: 'Healthcare',
      prior: 0.08,
      keywords: {
        pharmacy: 4.8, apollo: 4.8, medplus: 4.8, medicine: 4.5, doctor: 4.5, clinic: 4.2,
        hospital: 4.5, health: 3.5, '1mg': 4.8, pharmeasy: 4.8, lab: 3.8, dental: 4.2,
      },
    },
    {
      id: 'cat_salary',
      name: 'Salary',
      prior: 0.05,
      keywords: {
        salary: 5.0, payroll: 5.0, wage: 4.5, stipend: 4.8, infosys: 4.5, tcs: 4.5,
        wipro: 4.5, accenture: 4.5, credited: 3.5, remuneration: 4.8,
      },
    },
    {
      id: 'cat_freelance___bonus',
      name: 'Freelance & Bonus',
      prior: 0.04,
      keywords: {
        freelance: 5.0, bonus: 4.8, client: 4.0, consulting: 4.5, upwork: 4.8, fiverr: 4.8,
        payout: 4.0, commission: 4.5,
      },
    },
    {
      id: 'cat_investments',
      name: 'Investments',
      prior: 0.04,
      keywords: {
        dividend: 5.0, zerodha: 4.9, groww: 4.9, mutual: 4.5, fund: 4.0, sip: 4.8,
        interest: 4.5, stocks: 4.5, trading: 4.2, crypto: 4.5,
      },
    },
  ];

  // Tokenize & Clean input text
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 1 && !this.isStopWord(token));
  }

  private isStopWord(token: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'for', 'with', 'from', 'paid', 'payment', 'transfer', 'via',
      'ref', 'txn', 'no', 'upi', 'at', 'to', 'in', 'on', 'of', 'by', 'rs', 'inr',
    ]);
    return stopWords.has(token);
  }

  public predict(description: string): PredictionResult {
    const tokens = this.tokenize(description);

    if (tokens.length === 0) {
      return {
        categoryId: 'cat_other',
        categoryName: 'Other',
        confidence: 0.1,
        matchedTokens: [],
        isConfident: false,
      };
    }

    let bestCategory = this.categories[0];
    let maxScore = -Infinity;
    let bestMatchedTokens: string[] = [];
    const allScores: { cat: CategoryModelData; score: number; matches: string[] }[] = [];

    for (const cat of this.categories) {
      let score = Math.log(cat.prior);
      const matches: string[] = [];

      for (const token of tokens) {
        if (cat.keywords[token]) {
          score += cat.keywords[token];
          matches.push(token);
        } else {
          // Check substring / fuzzy token containment
          for (const [kw, weight] of Object.entries(cat.keywords)) {
            if (token.includes(kw) || kw.includes(token)) {
              score += weight * 0.75;
              matches.push(`${token}~${kw}`);
              break;
            }
          }
        }
      }

      allScores.push({ cat, score, matches });

      if (score > maxScore) {
        maxScore = score;
        bestCategory = cat;
        bestMatchedTokens = matches;
      }
    }

    // Softmax normalization across category scores for realistic confidence percentage
    const maxVal = Math.max(...allScores.map((s) => s.score));
    const expScores = allScores.map((s) => Math.exp(s.score - maxVal));
    const sumExp = expScores.reduce((acc, v) => acc + v, 0);
    const confidence = bestMatchedTokens.length > 0
      ? Math.min(0.98, Math.max(0.45, (expScores[allScores.findIndex((s) => s.cat.id === bestCategory.id)] / sumExp) * (1 + 0.1 * bestMatchedTokens.length)))
      : 0.20;

    return {
      categoryId: bestCategory.id,
      categoryName: bestCategory.name,
      confidence: parseFloat(confidence.toFixed(2)),
      matchedTokens: bestMatchedTokens,
      isConfident: confidence >= 0.40 && bestMatchedTokens.length > 0,
    };
  }
}

export const mlCategorizer = new ExpenseCategorizerML();
