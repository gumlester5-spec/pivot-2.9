
import React, { useState, useMemo } from 'react';
import TransactionForm from './TransactionForm';
import { TransactionType } from '../types';
import type { Transaction } from '../types';
import { PlusCircleIcon, PencilIcon, TrashIcon } from './icons';

interface AddTransactionViewProps {
    initialType: TransactionType;
    transactions: Transaction[];
    addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
    editTransaction: (transaction: Transaction) => Promise<void>;
    deleteTransaction: (transaction: Transaction) => Promise<void>;
    profitPercentage: number;
    onReturn: () => void;
}

const viewTitles: Record<TransactionType, string> = {
    [TransactionType.Sale]: 'Ventas',
    [TransactionType.Purchase]: 'Compras',
    [TransactionType.Expense]: 'Gastos',
};

const AddTransactionView: React.FC<AddTransactionViewProps> = ({ 
    initialType, 
    transactions,
    addTransaction, 
    editTransaction,
    deleteTransaction,
    profitPercentage, 
    onReturn 
}) => {
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => t.type === initialType);
    }, [transactions, initialType]);
    
    const openFormModal = (transaction: Transaction | null = null) => {
        setTransactionToEdit(transaction);
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setTransactionToEdit(null);
        setIsFormModalOpen(false);
    };

    const openDeleteModal = (transaction: Transaction) => {
        setTransactionToDelete(transaction);
        setIsDeleteModalOpen(true);
    };
    
    const closeDeleteModal = () => {
        setTransactionToDelete(null);
        setIsDeleteModalOpen(false);
    };
    
    const handleDelete = async () => {
        if (transactionToDelete) {
            await deleteTransaction(transactionToDelete);
            closeDeleteModal();
        }
    };

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{viewTitles[initialType]}</h2>
                        <button
                            onClick={() => openFormModal()}
                            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 dark:bg-indigo-500 rounded-lg text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all transform hover:scale-105"
                            aria-label={`Añadir ${viewTitles[initialType]}`}
                        >
                            <PlusCircleIcon className="w-6 h-6 mr-2" />
                            <span>Añadir {initialType}</span>
                        </button>
                    </div>

                    {/* Transaction History for this view */}
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map(t => (
                                <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{t.description}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(t.date).toLocaleString('es-GT')} - <span className="font-medium text-gray-700 dark:text-gray-300">Q{t.amount.toFixed(2)}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                        <button onClick={() => openFormModal(t)} className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => openDeleteModal(t)} className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay transacciones de este tipo.</p>
                        )}
                    </div>
                </div>

                <button onClick={onReturn} className="w-full text-center mt-4 py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:underline">
                    Volver al Panel Principal
                </button>
            </div>

            {isFormModalOpen && (
                 <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeFormModal}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-scale-up" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{transactionToEdit ? 'Editar' : 'Registrar'} {initialType}</h3>
                        <TransactionForm 
                            initialType={initialType}
                            addTransaction={addTransaction}
                            editTransaction={editTransaction}
                            profitPercentage={profitPercentage}
                            onSuccess={closeFormModal}
                            transactionToEdit={transactionToEdit}
                        />
                        <button onClick={closeFormModal} className="w-full text-center mt-2 py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
            
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeDeleteModal}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-scale-up text-center" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">Confirmar Eliminación</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={closeDeleteModal} className="px-6 py-2 rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleDelete} className="px-6 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors">
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddTransactionView;