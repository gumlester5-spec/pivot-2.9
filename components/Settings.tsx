
import React, { useState } from 'react';
import type { Settings as SettingsType } from '../types';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from './icons';
import { logout } from '../services/firebase';
import type { User } from 'firebase/auth';


interface SettingsProps {
  user: User;
  settings: SettingsType;
  updateSettings: (settings: SettingsType) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, settings, updateSettings }) => {
  const [profitPercentage, setProfitPercentage] = useState(settings.profitPercentage.toString());
  const [isSaving, setIsSaving] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const percentage = parseFloat(profitPercentage);
    if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
      setIsSaving(true);
      try {
        await updateSettings({ profitPercentage: percentage });
      } catch (e) {
        // Error is handled by the global notification system
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  const themeOptions = [
    { name: 'Claro', value: 'light', icon: <SunIcon className="w-5 h-5 mr-2" /> },
    { name: 'Oscuro', value: 'dark', icon: <MoonIcon className="w-5 h-5 mr-2" /> },
    { name: 'Sistema', value: 'system', icon: <ComputerDesktopIcon className="w-5 h-5 mr-2" /> },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Ajustes</h2>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Apariencia</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Elige cómo se ve la aplicación en tu dispositivo.
            </p>
            <div className="flex items-center space-x-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                {themeOptions.map(option => (
                    <button
                        key={option.value}
                        onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                        className={`w-full flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            theme === option.value
                            ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        {option.icon}
                        {option.name}
                    </button>
                ))}
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            <form onSubmit={handleSave} className="space-y-6">
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Finanzas</h3>
                    <label htmlFor="profitPercentage" className="block text-md font-medium text-gray-700 dark:text-gray-300">
                        Porcentaje de Ganancia
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Define qué porcentaje de cada venta se considera ganancia. El resto se agregará al capital.
                    </p>
                    <div className="mt-4 relative rounded-md shadow-sm">
                        <input
                            type="number"
                            id="profitPercentage"
                            value={profitPercentage}
                            onChange={(e) => setProfitPercentage(e.target.value)}
                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-4 pr-12 text-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                            placeholder="20"
                            min="0"
                            max="100"
                            step="0.1"
                            disabled={isSaving}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-lg">%</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                    <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Ajustes'}
                    </button>
                </div>
            </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Cuenta</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Sesión iniciada como: <span className="font-medium text-gray-700 dark:text-gray-200">{user.email}</span>
            </p>
            <div className="flex justify-end">
                <button
                    onClick={handleLogout}
                    className="inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>

    </div>
  );
};

export default Settings;
