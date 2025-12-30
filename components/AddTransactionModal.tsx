
import React from 'react';
import { TransactionType } from '../types';
import { ArrowTrendingUpIcon, ShoppingCartIcon, CreditCardIcon, XCircleIcon } from './icons';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTransactionType: (type: TransactionType) => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onSelectTransactionType }) => {
  if (!isOpen) return null;

  const handleSelect = (type: TransactionType) => {
    onSelectTransactionType(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-sm m-4 animate-fade-in-down" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Añadir Transacción</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <button onClick={() => handleSelect(TransactionType.Sale)} className="w-full flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ArrowTrendingUpIcon className="w-6 h-6 text-green-500 mr-4" />
            <span className="font-semibold text-gray-800 dark:text-gray-100">Registrar Venta</span>
          </button>
          <button onClick={() => handleSelect(TransactionType.Purchase)} className="w-full flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ShoppingCartIcon className="w-6 h-6 text-yellow-500 mr-4" />
            <span className="font-semibold text-gray-800 dark:text-gray-100">Registrar Compra</span>
          </button>
          <button onClick={() => handleSelect(TransactionType.Expense)} className="w-full flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <CreditCardIcon className="w-6 h-6 text-red-500 mr-4" />
            <span className="font-semibold text-gray-800 dark:text-gray-100">Registrar Gasto</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionModal;
