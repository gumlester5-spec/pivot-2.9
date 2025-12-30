
import React from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ShoppingCartIcon } from './icons';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionIcon: React.FC<{ type: TransactionType }> = ({ type }) => {
  switch (type) {
    case TransactionType.Sale:
      return <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />;
    case TransactionType.Expense:
      return <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />;
    case TransactionType.Purchase:
      return <ShoppingCartIcon className="w-5 h-5 text-yellow-500" />;
    default:
      return null;
  }
};

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Historial</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {transactions.length > 0 ? (
          transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-full">
                  <TransactionIcon type={t.type} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{t.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(t.date).toLocaleString('es-GT')}
                  </p>
                </div>
              </div>
              <p className={`font-semibold ${
                t.type === TransactionType.Sale ? 'text-green-500' : 'text-red-500'
              }`}>
                {t.type === TransactionType.Sale ? '+' : '-'}Q{t.amount.toFixed(2)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Aún no hay transacciones.</p>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
