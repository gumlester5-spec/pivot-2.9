import { useState, useEffect, useCallback } from 'react';
import {
  setupTransactionsListener,
  setupSummaryListener,
  setupSettingsListener,
  addTransactionAtomic,
  editTransactionAtomic,
  deleteTransactionAtomic,
  updateSettingsInDB,
  addPaymentAtomic,
  recalculateSummary
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

    try {
      await addTransactionAtomic(userId, newTransaction, settings.profitPercentage);

      const typeText = {
        [TransactionType.Sale]: 'Venta',
        [TransactionType.Purchase]: 'Compra',
        [TransactionType.Expense]: 'Gasto',
      }[newTransaction.type];
      showNotification(`${typeText} registrada exitosamente`, 'success');
    } catch (err: any) {
      console.error("Failed to add transaction:", err);
      const errorMessage = err.message || "Error al guardar la transacción.";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      throw err;
    }

  }, [settings.profitPercentage, showNotification, userId]);

  const editTransaction = useCallback(async (updatedTransaction: Transaction) => {
    if (!userId) return;
    const originalTransaction = transactions.find(t => t.id === updatedTransaction.id);
    if (!originalTransaction) return;

    try {
      await editTransactionAtomic(userId, originalTransaction, updatedTransaction, settings.profitPercentage);
      showNotification('Transacción actualizada exitosamente', 'success');
    } catch (err: any) {
      console.error("Failed to edit transaction:", err);
      const errorMessage = err.message || "Error al editar la transacción.";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      throw err;
    }
  }, [settings.profitPercentage, transactions, showNotification, userId]);

  const deleteTransaction = useCallback(async (transactionToDelete: Transaction) => {
    if (!userId) return;

    try {
      await deleteTransactionAtomic(userId, transactionToDelete, settings.profitPercentage);
      showNotification('Transacción eliminada exitosamente', 'success');
    } catch (err: any) {
      console.error("Failed to delete transaction:", err);
      const errorMessage = err.message || "Error al eliminar la transacción.";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      throw err;
    }
  }, [settings.profitPercentage, showNotification, userId]);


  const updateSettings = useCallback(async (newSettings: Settings) => {
    if (!userId) return;
    try {
      await updateSettingsInDB(userId, newSettings);
      showNotification('Ajustes guardados exitosamente', 'success');
    } catch (err: any) {
      console.error("Failed to update settings:", err);
      const errorMessage = err.message || "Error al guardar los ajustes.";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      throw err;
    }
  }, [showNotification, userId]);

  const addPayment = useCallback(async (transactionId: string, amount: number, note: string) => {
    if (!userId) return;
    try {
      await addPaymentAtomic(userId, transactionId, amount, note, settings.profitPercentage);
      showNotification('Abono registrado exitosamente', 'success');
    } catch (err: any) {
      console.error("Failed to add payment:", err);
      const errorMessage = err.message || "Error al registrar el abono.";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      throw err;
    }
  }, [userId, settings.profitPercentage, showNotification]);

  const refreshSummary = useCallback(async () => {
    if (!userId) return;
    try {
      await recalculateSummary(userId);
      showNotification('Datos recalculados correctamente', 'success');
    } catch (err: any) {
      console.error("Failed to recalculate:", err);
      showNotification('Error al recalcular datos', 'error');
    }
  }, [userId, showNotification]);

  return { transactions, summary, settings, addTransaction, editTransaction, deleteTransaction, updateSettings, addPayment, refreshSummary, loading, error };
};
