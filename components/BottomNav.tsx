
import React from 'react';
import { ChartPieIcon, Cog6ToothIcon, ArrowTrendingUpIcon, ShoppingCartIcon, CreditCardIcon } from './icons';
import type { View } from '../App';

interface BottomNavProps {
  currentView: View;
  setView: (view: View) => void;
}

interface NavItemProps {
  viewName: View;
  label: string;
  icon: React.ReactNode;
  currentView: View;
  setView: (view: View) => void;
}

const NavItem: React.FC<NavItemProps> = ({ viewName, label, icon, currentView, setView }) => {
  const isActive = currentView === viewName;
  
  return (
    <button
      onClick={() => setView(viewName)}
      className="flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200"
    >
      <div className={`w-6 h-6 mb-1 ${isActive ? 'text-indigo-500' : 'text-gray-400 dark:text-gray-500'}`}>
        {icon}
      </div>
      <span className={`text-xs ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
        {label}
      </span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex justify-around max-w-lg mx-auto">
        <NavItem 
            viewName="dashboard" 
            label="Panel" 
            icon={<ChartPieIcon />} 
            currentView={currentView} 
            setView={setView} 
        />
        <NavItem 
            viewName="add-sale" 
            label="Venta" 
            icon={<ArrowTrendingUpIcon />} 
            currentView={currentView} 
            setView={setView} 
        />
        <NavItem 
            viewName="add-purchase" 
            label="Compra" 
            icon={<ShoppingCartIcon />} 
            currentView={currentView} 
            setView={setView} 
        />
        <NavItem 
            viewName="add-expense" 
            label="Gasto" 
            icon={<CreditCardIcon />} 
            currentView={currentView} 
            setView={setView} 
        />
        <NavItem 
            viewName="settings" 
            label="Ajustes" 
            icon={<Cog6ToothIcon />} 
            currentView={currentView} 
            setView={setView} 
        />
      </div>
    </nav>
  );
};

export default BottomNav;
