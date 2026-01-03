
import React, { useState, useEffect } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { useNotification } from '../context/NotificationContext';

interface TransactionFormProps {
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  editTransaction?: (transaction: Transaction) => Promise<void>;
  profitPercentage: number;
  initialType: TransactionType;
  onSuccess: () => void;
  transactionToEdit?: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ addTransaction, editTransaction, profitPercentage, initialType, onSuccess, transactionToEdit }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!transactionToEdit;

  const [isCredit, setIsCredit] = useState(false);
  const [clientName, setClientName] = useState('');

  const [isExtraIncome, setIsExtraIncome] = useState(false);
  const [extraIncomeType, setExtraIncomeType] = useState<'capital' | 'profit'>('capital');

  useEffect(() => {
    if (isEditing) {
      setAmount(String(transactionToEdit.amount));
      setDescription(transactionToEdit.description);
      setIsCredit(!!transactionToEdit.isCredit);
      setClientName(transactionToEdit.clientName || '');
      setIsExtraIncome(!!transactionToEdit.isExtraIncome);
      setExtraIncomeType(transactionToEdit.extraIncomeType || 'capital');
    }
  }, [transactionToEdit, isEditing]);


  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    // Credit Sale/Purchase Validation
    if ((initialType === TransactionType.Sale || initialType === TransactionType.Purchase) && isCredit && !clientName.trim()) {
      showNotification(`El nombre del ${initialType === TransactionType.Sale ? 'cliente' : 'proveedor'} es obligatorio.`, "error");
      return;
    }

    if (!parsedAmount || parsedAmount <= 0 || !description.trim()) {
      setError('Por favor, ingrese un monto y descripción válidos.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      if (isEditing && editTransaction) {
        const updateData: any = {
          ...transactionToEdit,
          amount: parsedAmount,
          description,
          type: initialType,
          isCredit: (initialType === TransactionType.Sale || initialType === TransactionType.Purchase) ? isCredit : false,
          isExtraIncome: initialType === TransactionType.Sale ? isExtraIncome : false,
        };

        if (initialType === TransactionType.Sale && isExtraIncome) {
          updateData.extraIncomeType = extraIncomeType;
        }

        if ((initialType === TransactionType.Sale || initialType === TransactionType.Purchase) && isCredit) {
          updateData.clientName = clientName;
        }

        await editTransaction(updateData);
      } else {
        const transactionData: any = {
          amount: parsedAmount,
          description,
          type: initialType,
          isCredit: (initialType === TransactionType.Sale || initialType === TransactionType.Purchase) ? isCredit : false,
          isExtraIncome: initialType === TransactionType.Sale ? isExtraIncome : false,
        };

        if (initialType === TransactionType.Sale && isExtraIncome) {
          transactionData.extraIncomeType = extraIncomeType;
        }

        if ((initialType === TransactionType.Sale || initialType === TransactionType.Purchase) && isCredit) {
          transactionData.clientName = clientName;
          transactionData.isPaid = false;
          transactionData.amountPaid = 0;
        }

        await addTransaction(transactionData);
      }
      setAmount('');
      setDescription('');
      onSuccess();
    } catch (e) {
      // Error is handled globally by the notification context
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDynamicHint = () => {
    const parsedAmount = parseFloat(amount) || 0;
    if (initialType === TransactionType.Sale && parsedAmount > 0) {
      const profit = (parsedAmount * (profitPercentage / 100)).toFixed(2);
      const capital = (parsedAmount - parseFloat(profit)).toFixed(2);
      return `Ganancia: Q${profit} | Capital: Q${capital}`;
    }
    if (initialType === TransactionType.Purchase) return "Esto se deducirá del Capital.";
    if (initialType === TransactionType.Expense) return "Esto se deducirá de las Ganancias.";
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monto</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">Q</span>
          </div>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            placeholder="0.00"
            step="0.01"
            disabled={isSubmitting}
          />
        </div>
        {getDynamicHint() && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{getDynamicHint()}</p>}
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
          placeholder="Ej: Venta de Producto X"
          disabled={isSubmitting}
        />
      </div>

      {(initialType === TransactionType.Sale || initialType === TransactionType.Purchase) && !isExtraIncome && (
        <div className="flex items-center mb-4">
          <input
            id="isCredit"
            type="checkbox"
            checked={isCredit}
            onChange={(e) => setIsCredit(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            disabled={isSubmitting}
          />
          <label htmlFor="isCredit" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            {initialType === TransactionType.Sale ? 'Venta a crédito' : 'Compra a crédito'}
          </label>
        </div>
      )}

      {initialType === TransactionType.Sale && !isCredit && (
        <div className="mb-4 space-y-3">
          <div className="flex items-center">
            <input
              id="isExtraIncome"
              type="checkbox"
              checked={isExtraIncome}
              onChange={(e) => setIsExtraIncome(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="isExtraIncome" className="ml-2 block text-sm text-gray-900 dark:text-gray-300 font-medium">
              Ingreso Extra (100% Capital o Ganancia)
            </label>
          </div>

          {isExtraIncome && (
            <div className="pl-6 space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Destino de los fondos:</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <input
                    id="extra-capital"
                    name="extraIncomeType"
                    type="radio"
                    checked={extraIncomeType === 'capital'}
                    onChange={() => setExtraIncomeType('capital')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="extra-capital" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Capital Base
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="extra-profit"
                    name="extraIncomeType"
                    type="radio"
                    checked={extraIncomeType === 'profit'}
                    onChange={() => setExtraIncomeType('profit')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="extra-profit" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Ganancia Neta
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isCredit && (
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {initialType === TransactionType.Sale ? 'Nombre del Cliente' : 'Nombre del Proveedor'}
          </label>
          <input
            type="text"
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            placeholder="Ej: Juan Pérez"
            disabled={isSubmitting}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Transacción' : 'Añadir Transacción')}
      </button>
    </form>
  );
};

export default TransactionForm;