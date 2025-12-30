
# Pivot - Gestión Financiera

Pivot es una aplicación web progresiva (PWA) diseñada para simplificar la gestión financiera de pequeños negocios y emprendedores. Permite llevar un control claro y automatizado de las finanzas, con sincronización en tiempo real y una interfaz visual e intuitiva.

## ✨ Características Principales

-   **📈 Dashboard Principal:** Visualiza de un vistazo el **Capital Disponible** y las **Ganancias Acumuladas**. Incluye un gráfico que resume las ventas, compras y gastos de los últimos 6 meses.
-   **🧾 Registro de Movimientos:**
    -   **Ventas:** Registra tus ventas. El sistema calcula automáticamente la ganancia (basado en un porcentaje configurable) y la añade a las "Ganancias", mientras que el resto se suma al "Capital".
    -   **Compras:** Registra las compras de inventario o materia prima. El monto se descuenta directamente del "Capital Disponible".
    -   **Gastos:** Registra gastos operativos (alquiler, servicios, etc.). El monto se descuenta de las "Ganancias Acumuladas".
-   **🔐 Autenticación Segura:** Sistema de inicio de sesión y registro utilizando Firebase Authentication. Los usuarios pueden acceder con su cuenta de Google o con correo y contraseña.
-   **☁️ Sincronización en la Nube:** Toda la información financiera se asocia a la cuenta del usuario y se almacena de forma segura en Firebase Realtime Database, garantizando la privacidad y el acceso desde cualquier dispositivo.
-   **⚙️ Ajustes Personalizables:**
    -   Define el **porcentaje de ganancia** que se aplicará a todas las ventas.
    -   Cambia el tema de la aplicación entre modo claro, oscuro o el predeterminado del sistema.
-   **📱 Diseño Responsivo y PWA:** Interfaz moderna y adaptable a cualquier tamaño de pantalla (móvil y escritorio). Puede ser "instalada" en el dispositivo para una experiencia similar a una app nativa.
-   **📝 Edición y Eliminación:** Gestiona tu historial de transacciones con la capacidad de editar o eliminar cualquier registro, recalculando automáticamente los balances.

## 🛠️ Tecnologías Utilizadas

-   **Frontend:** React, TypeScript, Tailwind CSS
-   **Backend & Base de Datos:** Firebase (Realtime Database, Authentication)
-   **Gráficos:** Recharts
-   **Despliegue:** Netlify

## 🚀 Cómo Empezar

Sigue estos pasos para ejecutar una copia del proyecto en tu máquina local.

### Prerrequisitos

-   Node.js (versión 18 o superior)
-   `npm` o `yarn`

### Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/pivot.git
    cd pivot
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    # o
    yarn install
    ```

3.  **Configura Firebase:**
    -   Ve a la [Consola de Firebase](https://console.firebase.google.com/) y crea un nuevo proyecto.
    -   En tu proyecto, ve a la sección **Authentication** y habilita los proveedores de "Correo electrónico/contraseña" y "Google".
    -   Ve a la sección **Realtime Database** y crea una base de datos en modo de prueba o producción (asegúrate de configurar las reglas de seguridad si eliges producción).
    -   En la configuración de tu proyecto (`Project Settings`), busca la sección "Tus apps" y crea una nueva aplicación web.
    -   Firebase te proporcionará un objeto de configuración (`firebaseConfig`). Copia estos valores.

4.  **Configura las variables de entorno:**
    -   En la raíz del proyecto, crea un archivo llamado `.env` (puedes copiar el contenido de `.env.example`).
    -   Abre el archivo `.env` y pega los valores que copiaste de tu configuración de Firebase.

    ```env
    VITE_FIREBASE_API_KEY=tu_api_key
    VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
    VITE_FIREBASE_DATABASE_URL=tu_database_url
    VITE_FIREBASE_PROJECT_ID=tu_project_id
    VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
    VITE_FIREBASE_APP_ID=tu_app_id
    ```

5.  **Ejecuta la aplicación:**
    
    Asumiendo que estás en un entorno de desarrollo que soporta `vite`, ejecuta:
    ```bash
    npm run dev
    # o
    yarn dev
    ```
    La aplicación debería estar corriendo localmente.

## 📦 Despliegue en Netlify

1.  **Sube tu código a un repositorio de GitHub.**
2.  **Crea un nuevo sitio en Netlify** y conéctalo a tu repositorio de GitHub.
3.  **Configura las variables de entorno en Netlify:**
    -   Ve a `Site settings > Build & deploy > Environment > Environment variables`.
    -   Añade las mismas variables que configuraste en tu archivo `.env` local. Netlify las inyectará de forma segura durante el proceso de `build`.
4.  **Despliega tu sitio.**
