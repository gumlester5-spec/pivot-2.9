
import { useState, useEffect, useCallback } from 'react';
import {
  setupTransactionsListener,
  setupSummaryListener,
  setupSettingsListener,
  addTransactionToDB,
  updateTransactionInDB,
  deleteTransactionInDB,
  updateSummaryInDB,
  updateSettingsInDB,
} from '../services/firebase';
import type { Transaction, FinancialSummary, Settings } from '../types';
import { TransactionType } from '../types';
import { useNotification } from '../context/NotificationContext';

export const useFinancialData = (userId: string | null) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({ availableCapital: 0, accumulatedProfits: 0 });
  const [settings, setSettings] = useState<Settings>({ profitPercentage: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!userId) {
      setTransactions([]);
      setSummary({ availableCapital: 0, accumulatedProfits: 0 });
      setSettings({ profitPercentage: 20 });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const unsubTransactions = setupTransactionsListener(userId, setTransactions);
      const unsubSummary = setupSummaryListener(userId, setSummary);
      const unsubSettings = setupSettingsListener(userId, setSettings);
      
      // Give it a moment to load initial data
      setTimeout(() => setLoading(false), 1000);

      return () => {
        unsubTransactions();
        unsubSummary();
        unsubSettings();
      };
    } catch (err) {
      setError("Error al conectar con la base de datos.");
      showNotification("Error al conectar con la base de datos.", 'error');
      setLoading(false);
    }
  }, [userId, showNotification]);

  const addTransaction = useCallback(async (newTransactionData: Omit<Transaction, 'id' | 'date'>) => {
    if (!userId) return;
    const newTransaction = {
      ...newTransactionData,
      date: new Date().toISOString(),
    };

    let newCapital = summary.availableCapital;
    let newProfits = summary.accumulatedProfits;

    switch (newTransaction.type) {
      case TransactionType.Sale:
        const profit = newTransaction.amount * (settings.profitPercentage / 100);
        const capitalIncrease = newTransaction.amount - profit;
        newProfits += profit;
        newCapital += capitalIncrease;
        break;
      case TransactionType.Purchase:
        newCapital -= newTransaction.amount;
        break;
      case TransactionType.Expense:
        newProfits -= newTransaction.amount;
        break;
    }
    
    try {
        await addTransactionToDB(userId, newTransaction);
        await updateSummaryInDB(userId, { availableCapital: newCapital, accumulatedProfits: newProfits });
        const typeText = {
            [TransactionType.Sale]: 'Venta',
            [TransactionType.Purchase]: 'Compra',
            [TransactionType.Expense]: 'Gasto',
        }[newTransaction.type];
        showNotification(`${typeText} registrada exitosamente`, 'success');
    } catch (err) {
        console.error("Failed to add transaction:", err);
        const errorMessage = "Error al guardar la transacción.";
        setError(errorMessage);
        showNotification(errorMessage, 'error');
        throw err;
    }

  }, [summary, settings.profitPercentage, showNotification, userId]);
  
  const editTransaction = useCallback(async (updatedTransaction: Transaction) => {
    if (!userId) return;
    const originalTransaction = transactions.find(t => t.id === updatedTransaction.id);
    if (!originalTransaction) return;

    let newCapital = summary.availableCapital;
    let newProfits = summary.accumulatedProfits;
    
    // Revert original transaction
    switch (originalTransaction.type) {
        case TransactionType.Sale:
            const oldProfit = originalTransaction.amount * (settings.profitPercentage / 100);
            const oldCapitalIncrease = originalTransaction.amount - oldProfit;
            newProfits -= oldProfit;
            newCapital -= oldCapitalIncrease;
            break;
        case TransactionType.Purchase:
            newCapital += originalTransaction.amount;
            break;
        case TransactionType.Expense:
            newProfits += originalTransaction.amount;
            break;
    }

    // Apply updated transaction
    switch (updatedTransaction.type) {
        case TransactionType.Sale:
            const newProfit = updatedTransaction.amount * (settings.profitPercentage / 100);
            const newCapitalIncrease = updatedTransaction.amount - newProfit;
            newProfits += newProfit;
            newCapital += newCapitalIncrease;
            break;
        case TransactionType.Purchase:
            newCapital -= updatedTransaction.amount;
            break;
        case TransactionType.Expense:
            newProfits -= updatedTransaction.amount;
            break;
    }

    try {
        await updateTransactionInDB(userId, {id: updatedTransaction.id, amount: updatedTransaction.amount, description: updatedTransaction.description });
        await updateSummaryInDB(userId, { availableCapital: newCapital, accumulatedProfits: newProfits });
        showNotification('Transacción actualizada exitosamente', 'success');
    } catch (err) {
        console.error("Failed to edit transaction:", err);
        const errorMessage = "Error al editar la transacción.";
        setError(errorMessage);
        showNotification(errorMessage, 'error');
        throw err;
    }
  }, [summary, settings.profitPercentage, transactions, showNotification, userId]);

  const deleteTransaction = useCallback(async (transactionToDelete: Transaction) => {
    if (!userId) return;
    let newCapital = summary.availableCapital;
    let newProfits = summary.accumulatedProfits;

    // Revert transaction
    switch (transactionToDelete.type) {
        case TransactionType.Sale:
            const profit = transactionToDelete.amount * (settings.profitPercentage / 100);
            const capitalIncrease = transactionToDelete.amount - profit;
            newProfits -= profit;
            newCapital -= capitalIncrease;
            break;
        case TransactionType.Purchase:
            newCapital += transactionToDelete.amount;
            break;
        case TransactionType.Expense:
            newProfits += transactionToDelete.amount;
            break;
    }

    try {
        await deleteTransactionInDB(userId, transactionToDelete.id);
        await updateSummaryInDB(userId, { availableCapital: newCapital, accumulatedProfits: newProfits });
        showNotification('Transacción eliminada exitosamente', 'success');
    } catch (err) {
        console.error("Failed to delete transaction:", err);
        const errorMessage = "Error al eliminar la transacción.";
        setError(errorMessage);
        showNotification(errorMessage, 'error');
        throw err;
    }
  }, [summary, settings.profitPercentage, showNotification, userId]);


  const updateSettings = useCallback(async (newSettings: Settings) => {
    if (!userId) return;
    try {
        await updateSettingsInDB(userId, newSettings);
        showNotification('Ajustes guardados exitosamente', 'success');
    } catch (err) {
        console.error("Failed to update settings:", err);
        const errorMessage = "Error al guardar los ajustes.";
        setError(errorMessage);
        showNotification(errorMessage, 'error');
        throw err;
    }
  }, [showNotification, userId]);

  return { transactions, summary, settings, addTransaction, editTransaction, deleteTransaction, updateSettings, loading, error };
};
