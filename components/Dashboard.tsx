
import React from 'react';
import type { FinancialSummary, Transaction } from '../types';
import StatCard from './StatCard';
import TransactionHistory from './TransactionHistory';
import FinancialChart from './FinancialChart';
import { DollarSignIcon, ArrowTrendingUpIcon } from './icons';

interface DashboardProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  profitPercentage: number;
}

const Dashboard: React.FC<DashboardProps> = ({ summary, transactions, profitPercentage }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Capital Disponible"
          value={summary.availableCapital}
          icon={<DollarSignIcon className="w-8 h-8 text-indigo-500" />}
        />
        <StatCard
          title="Ganancias Acumuladas"
          value={summary.accumulatedProfits}
          icon={<ArrowTrendingUpIcon className="w-8 h-8 text-indigo-500" />}
        />
      </div>

      <FinancialChart transactions={transactions} />

      <TransactionHistory transactions={transactions} profitPercentage={profitPercentage} />
    </div>
  );
};

export default Dashboard;
