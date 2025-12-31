
export enum TransactionType {
  Sale = 'sale',
  Purchase = 'purchase',
  Expense = 'expense',
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: TransactionType;
  originalAmount?: number; // For editing purposes
  // Credit Sale Fields
  isCredit?: boolean;
  isPaid?: boolean;
  amountPaid?: number;
  clientName?: string;
  payments?: PaymentRecord[];
  // Extra Income Fields
  isExtraIncome?: boolean;
  extraIncomeType?: 'capital' | 'profit';
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  note?: string;
}

export interface FinancialSummary {
  availableCapital: number;
  accumulatedProfits: number;
}

export interface Settings {
  profitPercentage: number;
}