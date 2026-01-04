
import React, { useState, useRef, useEffect } from 'react';
import {
  ChartPieIcon,
  Cog6ToothIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  EllipsisHorizontalIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  BellIcon,
  ChartBarIcon,
  QuestionMarkCircleIcon
} from './icons';
import type { View } from '../App';

interface BottomNavProps {
  currentView: View;
  setView: (view: View) => void;
}

interface NavItemProps {
  viewName: View | 'more';
  label: string;
  icon: React.ReactNode;
  currentView: View;
  setView: (view: View) => void;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ viewName, label, icon, currentView, setView, onClick }) => {
  const isActive = currentView === viewName;

  return (
    <button
      onClick={onClick ? onClick : () => setView(viewName as View)}
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleMenuClick = (view: View | string) => {
    // Navigate to the view if it is a valid view type
    if (view === 'settings' || view === 'receivables' || view === 'payables' || view === 'help') {
      setView(view as View);
    } else {
      console.log(`Navigating to ${view}... (Not implemented yet)`);
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const menuItems = [
    { id: 'settings', label: 'Ajustes', icon: <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" /> },
    { id: 'receivables', label: 'Cuentas por cobrar', icon: <ClipboardDocumentListIcon className="w-5 h-5 mr-3 text-blue-500" /> },
    { id: 'payables', label: 'Cuentas por pagar', icon: <ClipboardDocumentListIcon className="w-5 h-5 mr-3 text-orange-500" /> },
    { id: 'payments', label: 'Pagos', icon: <BanknotesIcon className="w-5 h-5 mr-3 text-green-600" /> },
    { id: 'profits', label: 'Ganancias', icon: <ArrowTrendingUpIcon className="w-5 h-5 mr-3 text-green-500" /> },
    { id: 'losses', label: 'Pérdidas', icon: <ArrowTrendingDownIcon className="w-5 h-5 mr-3 text-red-500" /> },
    { id: 'savings', label: 'Metas de ahorro', icon: <BanknotesIcon className="w-5 h-5 mr-3 text-purple-500" /> }, // Reusing BanknotesIcon
    { id: 'reminders', label: 'Recordatorios', icon: <BellIcon className="w-5 h-5 mr-3 text-yellow-500" /> },
    { id: 'analysis', label: 'Análisis', icon: <ChartBarIcon className="w-5 h-5 mr-3 text-indigo-500" /> },
    { id: 'projections', label: 'Proyecciones', icon: <ChartBarIcon className="w-5 h-5 mr-3 text-cyan-500" /> },
    { id: 'reports', label: 'Informes', icon: <ClipboardDocumentListIcon className="w-5 h-5 mr-3 text-gray-600" /> },
    { id: 'help', label: 'Ayuda', icon: <QuestionMarkCircleIcon className="w-5 h-5 mr-3 text-teal-500" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="flex justify-around max-w-lg mx-auto relative">
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

        {/* More Button */}
        <div className="relative w-full" ref={menuRef}>
          <button
            onClick={toggleMenu}
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${isMenuOpen ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}
          >
            <div className={`w-6 h-6 mb-1 ${isMenuOpen ? 'text-indigo-500' : 'text-gray-400 dark:text-gray-500'}`}>
              <EllipsisHorizontalIcon />
            </div>
            <span className={`text-xs ${isMenuOpen ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
              Más
            </span>
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute bottom-full right-2 mb-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-scale-up max-h-[80vh] overflow-y-auto custom-scrollbar">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  {item.icon}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
