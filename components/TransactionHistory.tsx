import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ShoppingCartIcon, ArrowDownTrayIcon, FunnelIcon } from './icons';

interface TransactionHistoryProps {
  transactions: Transaction[];
  profitPercentage: number;
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

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, profitPercentage }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (searchTerm && !t.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      if (selectedType !== 'all' && t.type !== selectedType) return false;

      const tDate = new Date(t.date).getTime();
      if (dateRange.start && tDate < new Date(dateRange.start).getTime()) return false;
      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        if (tDate > endDate.getTime()) return false;
      }

      if (amountRange.min !== '' && t.amount < Number(amountRange.min)) return false;
      if (amountRange.max !== '' && t.amount > Number(amountRange.max)) return false;

      return true;
    });
  }, [transactions, searchTerm, selectedType, dateRange, amountRange]);

  const handleExport = () => {
    const headers = ['ID', 'Fecha', 'Descripción', 'Tipo', 'Monto', 'Capital', 'Ganancia'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => {
        let capital = '';
        let profit = '';
        if (t.type === TransactionType.Sale) {
          const details = getSaleDetails(t);
          capital = details.capital.toFixed(2);
          profit = details.profit.toFixed(2);
        }

        return [
          t.id,
          new Date(t.date).toLocaleString('es-GT').replace(',', ''),
          `"${t.description.replace(/"/g, '""')}"`,
          t.type,
          t.amount.toString(),
          capital,
          profit
        ].join(',')
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transacciones_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSaleDetails = (t: Transaction) => {
    let capital = 0;
    let profit = 0;

    if (t.isExtraIncome && t.extraIncomeType) {
      if (t.extraIncomeType === 'capital') {
        capital = t.amount;
      } else if (t.extraIncomeType === 'profit') {
        profit = t.amount;
      }
    } else {
      profit = t.amount * (profitPercentage / 100);
      capital = t.amount - profit;
    }

    return { capital, profit };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Historial</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg flex items-center gap-2 transition-colors ${showFilters ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
          >
            <FunnelIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Filtros</span>
          </button>
          <button
            onClick={handleExport}
            className="p-2 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-lg flex items-center gap-2 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
            title="Exportar CSV"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-down">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Buscar</label>
            <input
              type="text"
              placeholder="Descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-200"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Tipo</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as TransactionType | 'all')}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-200"
            >
              <option value="all">Todos</option>
              <option value={TransactionType.Sale}>Ventas</option>
              <option value={TransactionType.Purchase}>Compras</option>
              <option value={TransactionType.Expense}>Gastos</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Fecha</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-2 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-200"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-2 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Monto</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={amountRange.min}
                onChange={(e) => setAmountRange({ ...amountRange, min: e.target.value })}
                className="w-full px-2 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-200"
              />
              <input
                type="number"
                placeholder="Max"
                value={amountRange.max}
                onChange={(e) => setAmountRange({ ...amountRange, max: e.target.value })}
                className="w-full px-2 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-200"
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((t) => {
            const saleDetails = t.type === TransactionType.Sale ? getSaleDetails(t) : null;
            return (
              <div key={t.id} className="flex flex-col p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                      <TransactionIcon type={t.type} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{t.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(t.date).toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold whitespace-nowrap ${t.type === TransactionType.Sale ? 'text-green-500' : 'text-red-500'
                      }`}>
                      {t.type === TransactionType.Sale ? '+' : '-'}Q{t.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                {saleDetails && (
                  <div className="mt-2 pl-[3.25rem] flex gap-4 text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Capital: <span className="font-medium text-gray-700 dark:text-gray-300">Q{saleDetails.capital.toFixed(2)}</span>
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      Ganancia: <span className="font-medium text-green-600 dark:text-green-400">Q{saleDetails.profit.toFixed(2)}</span>
                    </span>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 dark:text-gray-500">No hay transacciones que coincidan con los filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
