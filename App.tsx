
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import AddTransactionView from './components/AddTransactionView';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import { useFinancialData } from './hooks/useFinancialData';
import { ArrowPathIcon } from './components/icons';
import { TransactionType } from './types';
import { NotificationProvider } from './context/NotificationContext';
import Notification from './components/Notification';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Login';
import { onAuthUserChanged } from './services/firebase';
import type { User } from 'firebase/auth';


export type View = 'dashboard' | 'add-sale' | 'add-purchase' | 'add-expense' | 'settings';

const AppContent: React.FC<{ user: User }> = ({ user }) => {
  const [view, setView] = useState<View>('dashboard');
  const { 
    summary, 
    settings, 
    transactions, 
    addTransaction,
    editTransaction,
    deleteTransaction, 
    updateSettings,
    loading,
    error 
  } = useFinancialData(user.uid);

  const returnToDashboard = () => {
    setView('dashboard');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full pt-16">
          <ArrowPathIcon className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
      );
    }
    if (error && transactions.length === 0) { // Only show big error on initial load fail
        return <div className="text-center text-red-500">{error}</div>
    }
    
    const transactionViewProps = {
      transactions,
      addTransaction,
      editTransaction,
      deleteTransaction,
      profitPercentage: settings.profitPercentage,
      onReturn: returnToDashboard,
    };

    switch (view) {
      case 'dashboard':
        return <Dashboard summary={summary} transactions={transactions} />;
      case 'add-sale':
        return <AddTransactionView initialType={TransactionType.Sale} {...transactionViewProps} />;
      case 'add-purchase':
        return <AddTransactionView initialType={TransactionType.Purchase} {...transactionViewProps} />;
      case 'add-expense':
        return <AddTransactionView initialType={TransactionType.Expense} {...transactionViewProps} />;
      case 'settings':
        return <Settings user={user} settings={settings} updateSettings={updateSettings} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Notification />
      <Header summary={summary} />
      <main className="p-4 sm:p-6 lg:p-8 pt-20 pb-24">
        {renderContent()}
      </main>
      <BottomNav currentView={view} setView={setView} />
    </div>
  );
}

const AuthHandler: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthUserChanged(authUser => {
      setUser(authUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <ArrowPathIcon className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <AppContent user={user} />;
}


const App: React.FC = () => (
  <ThemeProvider>
    <NotificationProvider>
      <AuthHandler />
    </NotificationProvider>
  </ThemeProvider>
);

export default App;
