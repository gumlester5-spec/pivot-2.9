import React, { useMemo, useState } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { ChartBarIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

interface AnalysisViewProps {
    transactions: Transaction[];
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ transactions }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const startDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // Aggregate sales for the current month
    const salesData = useMemo(() => {
        const map = new Map<number, number>();
        let maxVal = 0;

        // Filter transactions for the current viewing month
        const currentMonthTransactions = transactions.filter(t => {
            if (t.type !== TransactionType.Sale) return false;
            const tDate = new Date(t.date);
            return tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear();
        });

        currentMonthTransactions.forEach(t => {
            const day = new Date(t.date).getDate();
            const current = map.get(day) || 0;
            const newVal = current + t.amount;
            map.set(day, newVal);
            if (newVal > maxVal) maxVal = newVal;
        });

        return { map, maxVal };
    }, [transactions, currentDate]);

    const getColor = (day: number) => {
        const amount = salesData.map.get(day) || 0;

        if (amount === 0) return 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600';

        const intensity = Math.min(Math.ceil((amount / salesData.maxVal) * 10), 10);

        // Red gradient scale
        const colors = [
            'bg-red-50 dark:bg-red-900/10 text-gray-800 dark:text-gray-200',
            'bg-red-100 dark:bg-red-900/20 text-gray-800 dark:text-gray-200',
            'bg-red-200 dark:bg-red-900/30 text-gray-800 dark:text-gray-200',
            'bg-red-300 dark:bg-red-900/40 text-gray-900 dark:text-gray-100',
            'bg-red-400 dark:bg-red-900/50 text-white',
            'bg-red-500 dark:bg-red-800 text-white',
            'bg-red-600 dark:bg-red-700 text-white',
            'bg-red-700 dark:bg-red-600 text-white',
            'bg-red-800 dark:bg-red-500 text-white',
            'bg-red-900 dark:bg-red-400 text-white',
        ];

        return colors[Math.max(0, intensity - 1)] || colors[9];
    };

    const renderCalendar = () => {
        const totalDays = daysInMonth(currentDate);
        const startOffset = startDayOfMonth(currentDate);
        const calendarDays = [];

        // Empty slots for previous month days
        for (let i = 0; i < startOffset; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="h-24 bg-transparent"></div>);
        }

        // Days of the month
        for (let day = 1; day <= totalDays; day++) {
            const amount = salesData.map.get(day) || 0;

            calendarDays.push(
                <div key={day} className={`h-24 p-2 rounded-xl flex flex-col justify-between transition-all hover:scale-[1.02] shadow-sm ${getColor(day)}`}>
                    <span className="font-semibold text-sm">{day}</span>
                    {amount > 0 && (
                        <div className="text-xs font-bold text-center">
                            Q{amount.toLocaleString('es-GT', { maximumFractionDigits: 0 })}
                        </div>
                    )}
                </div>
            );
        }
        return calendarDays;
    };

    const weekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <ChartBarIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Análisis Mensual</h2>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 p-1.5 rounded-lg">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md shadow-sm transition-all text-gray-600 dark:text-gray-300">
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <span className="text-lg font-semibold min-w-[150px] text-center capitalize text-gray-800 dark:text-gray-100">
                            {currentDate.toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md shadow-sm transition-all text-gray-600 dark:text-gray-300">
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-4 mb-4 text-center">
                    {weekDays.map(d => (
                        <div key={d} className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider py-2">
                            {d.slice(0, 3)}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-4">
                    {renderCalendar()}
                </div>

                {/* Legend */}
                <div className="mt-8 flex justify-end items-center gap-2">
                    <span className="text-xs text-gray-400">Menos Ventas</span>
                    <div className="flex gap-1">
                        <div className="w-4 h-4 bg-red-100 rounded-sm"></div>
                        <div className="w-4 h-4 bg-red-300 rounded-sm"></div>
                        <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                        <div className="w-4 h-4 bg-red-700 rounded-sm"></div>
                        <div className="w-4 h-4 bg-red-900 rounded-sm"></div>
                    </div>
                    <span className="text-xs text-gray-400">Más Ventas</span>
                </div>

            </div>
        </div>
    );
};

export default AnalysisView;
