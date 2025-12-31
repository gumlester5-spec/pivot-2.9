import { Transaction, TransactionType } from '../types';

export const validateTransaction = (transaction: Partial<Transaction>): { success: boolean; error?: string } => {
    if (typeof transaction.amount !== 'number' || transaction.amount <= 0) {
        return { success: false, error: "El monto debe ser un número positivo" };
    }

    if (!transaction.description || transaction.description.trim().length === 0) {
        return { success: false, error: "La descripción es requerida" };
    }

    if (!transaction.type || !Object.values(TransactionType).includes(transaction.type)) {
        return { success: false, error: "Tipo de transacción inválido" };
    }

    return { success: true };
};
