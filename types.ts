
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
}

export interface FinancialSummary {
  availableCapital: number;
  accumulatedProfits: number;
}

export interface Settings {
  profitPercentage: number;
}