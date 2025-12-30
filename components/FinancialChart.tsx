
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Transaction } from '../types';
import { TransactionType } from '../types';

interface FinancialChartProps {
  transactions: Transaction[];
}

const FinancialChart: React.FC<FinancialChartProps> = ({ transactions }) => {
  const chartData = useMemo(() => {
    const data: { [key: string]: { name: string; sales: number; expenses: number, purchases: number } } = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    transactions.forEach(t => {
        const transactionDate = new Date(t.date);
        if (transactionDate >= sixMonthsAgo) {
            const month = transactionDate.toLocaleString('es-ES', { month: 'short', year: '2-digit' });
            if (!data[month]) {
                data[month] = { name: month, sales: 0, expenses: 0, purchases: 0 };
            }
            if (t.type === TransactionType.Sale) data[month].sales += t.amount;
            if (t.type === TransactionType.Expense) data[month].expenses += t.amount;
            if (t.type === TransactionType.Purchase) data[month].purchases += t.amount;
        }
    });

    return Object.values(data).reverse();
  }, [transactions]);

  if (chartData.length === 0) {
    return (
       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex items-center justify-center min-h-[300px]">
         <p className="text-gray-500 dark:text-gray-400">No hay datos suficientes para mostrar el gráfico. ¡Añade algunas transacciones!</p>
       </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Resumen de los Últimos 6 Meses</h3>
        <ResponsiveContainer width="100%" height={300}>
        <BarChart
            data={chartData}
            margin={{
            top: 5, right: 20, left: -10, bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
                contentStyle={{ 
                    backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                    border: 'none',
                    borderRadius: '0.5rem' 
                }}
                labelStyle={{ color: '#f3f4f6' }}
            />
            <Legend />
            <Bar dataKey="sales" name="Ventas" fill="#10b981" />
            <Bar dataKey="purchases" name="Compras" fill="#f59e0b" />
            <Bar dataKey="expenses" name="Gastos" fill="#ef4444" />
        </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default FinancialChart;
