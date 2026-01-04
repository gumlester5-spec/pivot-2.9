import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { ArrowDownTrayIcon, DocumentTextIcon, TableCellsIcon, ClipboardDocumentListIcon } from './icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ReportsViewProps {
    transactions: Transaction[];
    profitPercentage: number;
}

const ReportsView: React.FC<ReportsViewProps> = ({ transactions, profitPercentage }) => {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            if (selectedType !== 'all' && t.type !== selectedType) return false;

            const tDate = new Date(t.date).getTime();
            if (dateRange.start && tDate < new Date(dateRange.start).getTime()) return false;
            if (dateRange.end) {
                const endDate = new Date(dateRange.end);
                endDate.setHours(23, 59, 59, 999);
                if (tDate > endDate.getTime()) return false;
            }

            return true;
        });
    }, [transactions, selectedType, dateRange]);

    const getTransactionDetails = (t: Transaction) => {
        let capital = 0;
        let profit = 0;

        if (t.type === TransactionType.Sale) {
            if (t.isExtraIncome && t.extraIncomeType) {
                if (t.extraIncomeType === 'capital') capital = t.amount;
                else if (t.extraIncomeType === 'profit') profit = t.amount;
            } else {
                profit = t.amount * (profitPercentage / 100);
                capital = t.amount - profit;
            }
        } else {
            // For simple reports, maybe we don't split expense/purchases or just list amount
        }
        return { capital, profit };
    };

    const getTableData = () => {
        return filteredTransactions.map(t => {
            const { capital, profit } = getTransactionDetails(t);
            return {
                id: t.id,
                date: new Date(t.date).toLocaleString('es-GT'),
                description: t.description,
                type: t.type,
                amount: t.amount,
                capital: t.type === TransactionType.Sale ? capital : '',
                profit: t.type === TransactionType.Sale ? profit : '',
            };
        });
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text('Informe Financiero', 14, 15);
        doc.setFontSize(10);
        doc.text(`Generado: ${new Date().toLocaleString('es-GT')}`, 14, 22);

        const tableData = getTableData().map(row => [
            row.date,
            row.description,
            row.type,
            `Q${row.amount.toFixed(2)}`,
            row.capital !== '' ? `Q${Number(row.capital).toFixed(2)}` : '-',
            row.profit !== '' ? `Q${Number(row.profit).toFixed(2)}` : '-',
        ]);

        autoTable(doc, {
            head: [['Fecha', 'Descripción', 'Tipo', 'Monto', 'Capital', 'Ganancia']],
            body: tableData,
            startY: 30,
        });

        doc.save('informe_financiero.pdf');
    };

    const exportCSV = () => {
        const headers = ['ID,Fecha,Descripción,Tipo,Monto,Capital,Ganancia'];
        const rows = getTableData().map(row =>
            `${row.id},${row.date.replace(',', '')},"${row.description.replace(/"/g, '""')}",${row.type},${row.amount},${row.capital},${row.profit}`
        );

        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'informe_financiero.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportExcel = () => {
        const data = getTableData().map(row => ({
            ID: row.id,
            Fecha: row.date,
            Descripción: row.description,
            Tipo: row.type,
            Monto: row.amount,
            Capital: row.capital,
            Ganancia: row.profit
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Informe");
        XLSX.writeFile(workbook, "informe_financiero.xlsx");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-6">
                    <ClipboardDocumentListIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Informes y Descargas</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rango de Fechas</label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Transacción</label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value as TransactionType | 'all')}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        >
                            <option value="all">Todas</option>
                            <option value={TransactionType.Sale}>Ventas</option>
                            <option value={TransactionType.Purchase}>Compras</option>
                            <option value={TransactionType.Expense}>Gastos</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                        onClick={exportPDF}
                        className="flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all transform hover:scale-105"
                    >
                        <DocumentTextIcon className="w-6 h-6" />
                        <span className="font-semibold">Descargar PDF</span>
                    </button>
                    <button
                        onClick={exportCSV}
                        className="flex items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all transform hover:scale-105"
                    >
                        <TableCellsIcon className="w-6 h-6" />
                        <span className="font-semibold">Descargar CSV</span>
                    </button>
                    <button
                        onClick={exportExcel}
                        className="flex items-center justify-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all transform hover:scale-105"
                    >
                        <TableCellsIcon className="w-6 h-6" />
                        <span className="font-semibold">Descargar Excel</span>
                    </button>
                </div>

                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Vista Previa ({filteredTransactions.length} registros)</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Capital</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ganancia</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {getTableData().slice(0, 5).map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{row.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{row.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Q{row.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{row.capital !== '' ? `Q${Number(row.capital).toFixed(2)}` : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">{row.profit !== '' ? `Q${Number(row.profit).toFixed(2)}` : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredTransactions.length > 5 && (
                            <p className="text-center text-xs text-gray-400 mt-2">... y {filteredTransactions.length - 5} más</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;
