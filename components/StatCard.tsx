
import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  const formattedValue = new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(value);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex items-center space-x-6">
      <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{formattedValue}</p>
      </div>
    </div>
  );
};

export default StatCard;
