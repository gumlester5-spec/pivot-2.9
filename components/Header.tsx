
import React from 'react';
import type { FinancialSummary } from '../types';

interface HeaderProps {
  summary: FinancialSummary;
}

const Header: React.FC<HeaderProps> = ({ summary }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(value);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Pivot</h1>
          <div className="flex items-center space-x-4 md:space-x-6">
              <div className="text-right">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Capital</span>
                  <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white">{formatCurrency(summary.availableCapital)}</p>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
              <div className="text-right">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Ganancias</span>
                  <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white">{formatCurrency(summary.accumulatedProfits)}</p>
              </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
