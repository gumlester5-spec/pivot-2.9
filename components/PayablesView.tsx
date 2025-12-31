import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { ClipboardDocumentListIcon, BanknotesIcon } from './icons';
import { useNotification } from '../context/NotificationContext';

interface PayablesViewProps {
    transactions: Transaction[];
    addPayment: (transactionId: string, amount: number, note: string) => Promise<void>;
}

const PayablesView: React.FC<PayablesViewProps> = ({ transactions, addPayment }) => {
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentNote, setPaymentNote] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { showNotification } = useNotification();

    const creditTransactions = useMemo(() => {
        return transactions.filter(t => t.isCredit && !t.isPaid && (t.type === TransactionType.Purchase));
    }, [transactions]);

    const handleOpenPaymentModal = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setPaymentAmount('');
        setPaymentNote('');
        setIsModalOpen(true);
    };

    const handleClosePaymentModal = () => {
        setSelectedTransaction(null);
        setIsModalOpen(false);
    };

    const handleSubmitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTransaction) return;

        const amount = parseFloat(paymentAmount);
        if (!amount || amount <= 0) {
            showNotification("Por favor ingresa un monto válido", "error");
            return;
        }

        const remainingDebt = selectedTransaction.amount - (selectedTransaction.amountPaid || 0);
        if (amount > remainingDebt) {
            showNotification(`El monto no puede ser mayor a la deuda restante (Q${remainingDebt.toFixed(2)})`, "error");
            return;
        }

        await addPayment(selectedTransaction.id, amount, paymentNote);
        handleClosePaymentModal();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-24">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-6">
                    <ClipboardDocumentListIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Cuentas por Pagar</h2>
                </div>

                <div className="space-y-4">
                    {creditTransactions.length > 0 ? (
                        creditTransactions.map(t => {
                            const amountPaid = t.amountPaid || 0;
                            const remaining = t.amount - amountPaid;
                            const progress = (amountPaid / t.amount) * 100;

                            return (
                                <div key={t.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-700/30">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">{t.clientName || "Proveedor Desconocido"}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{t.description}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(t.date).toLocaleDateString('es-GT')}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Total</span>
                                            <span className="block text-xl font-bold text-gray-800 dark:text-gray-100">Q{t.amount.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-green-600 dark:text-green-400 font-medium">Pagado: Q{amountPaid.toFixed(2)}</span>
                                            <span className="text-red-600 dark:text-red-400 font-medium">Restante: Q{remaining.toFixed(2)}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden">
                                            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleOpenPaymentModal(t)}
                                        className="mt-4 w-full flex items-center justify-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                                    >
                                        <BanknotesIcon className="w-5 h-5 mr-2" />
                                        Registrar Pago
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <p>No tienes cuentas por pagar pendientes.</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && selectedTransaction && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4" onClick={handleClosePaymentModal}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-scale-up" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Registrar Pago a Proveedor</h3>
                        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-300">Proveedor: <span className="font-semibold">{selectedTransaction.clientName}</span></p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Deuda Restante: <span className="font-semibold text-red-500">Q{(selectedTransaction.amount - (selectedTransaction.amountPaid || 0)).toFixed(2)}</span></p>
                        </div>

                        <form onSubmit={handleSubmitPayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto a Pagar</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">Q</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 border"
                                        placeholder="0.00"
                                        step="0.01"
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Este monto se descontará de tu Capital Disponible.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nota (Opcional)</label>
                                <input
                                    type="text"
                                    value={paymentNote}
                                    onChange={(e) => setPaymentNote(e.target.value)}
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 border"
                                    placeholder="Ej: Transferencia bancaria"
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleClosePaymentModal}
                                    className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                >
                                    Guardar Pago
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayablesView;
