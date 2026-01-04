import React from 'react';

const HelpView: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in-up pb-20">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                    <span className="text-3xl mr-2">💡</span> ¿Cómo funciona?
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
                    <p>
                        Esta aplicación, <strong>Pivot</strong>, es tu centro de control financiero personal diseñada para ser rápida y fácil de usar.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong>Registra Ventas:</strong> Anota lo que vendes para incrementar tu capital y calcular tus ganancias automáticamente.
                        </li>
                        <li>
                            <strong>Registra Compras:</strong> Lleva el control de tu inventario o insumos. El sistema descontará esto de tu capital disponible.
                        </li>
                        <li>
                            <strong>Control de Gastos:</strong> Registra gastos operativos que se descuentan directamente de tus ganancias, manteniéndote realista sobre tu rentabilidad.
                        </li>
                        <li>
                            <strong>Ingresos Extras:</strong> ¿Recibiste dinero fuera de una venta normal? Regístralo como un aumento directo a tu capital o ganancia.
                        </li>
                    </ul>
                </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl shadow-lg p-6 border border-indigo-100 dark:border-indigo-800">
                <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center">
                    <span className="text-3xl mr-2">🚀</span> ¿Por qué es útil?
                </h2>
                <p className="text-indigo-800 dark:text-indigo-200 leading-relaxed">
                    Te ayuda a separar tu <strong>Capital</strong> (el dinero que necesitas para seguir operando) de tus <strong>Ganancias</strong> (el dinero que realmente puedes gastar). Al tener claridad sobre estos dos números, evitas "comerte" el dinero del negocio y aseguras su crecimiento a largo plazo.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                    <span className="text-3xl mr-2">☁️</span> ¿Dónde se guarda mi información?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Tus datos están **100% seguros en la nube** utilizando la tecnología de Google (Firebase).
                </p>
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <p className="text-green-800 dark:text-green-200 text-sm">
                        ✅ <strong>Acceso Universal:</strong> Puedes entrar desde tu teléfono, tablet o computadora y verás siempre la misma información actualizada al instante. Si pierdes tu teléfono, no pierdes tus datos.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HelpView;
