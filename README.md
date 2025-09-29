Sistema  de reservas para lounges  desarrollado 
# Tecnologías Utilizadas
Frontend

    React 18

    Vite

    React Router DOM

    Recharts (gráficos)

    Axios (peticiones HTTP)

    PWA Ready

Backend

    Node.js + Express.js

    MongoDB + Mongoose

    CORS

    dotenv

 # Instalación y Configuración
 ## Prerrequisitos

    Node.js 16+

    MongoDB Atlas o local

    Cuenta en Vercel (frontend)

    Cuenta en Render (backend)
# Instalar Dependencias
# Instalar dependencias del frontend 
# Configurar Variables de Entorno
Crear archivo .env en la raíz del proyecto:
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/nombre-db
PORT=3001
VITE_API_BASE_URL=http://localhost:3001/api
# Ejecutar en Desarrollo

## Ejecutar frontend y backend simultáneamente
npm run dev:full

## O ejecutar por separado
npm run dev          # Frontend (puerto 5173)
npm run dev:server   # Backend (puerto 3001)
# Crear mesas de ejemplo
npm run seed:tables
# Despliegue en Producción
Frontend (Vercel)

    Conectar repositorio a Vercel

    Configurar variables de entorno en Vercel:

        VITE_API_BASE_URL: https://tu-backend.onrender.com/api

    Configuración de build:

        Framework: Vite

        Build Command: npm run build

        Output Directory: dist
Backend (Render)

    Crear nuevo Web Service en Render

    Configuración:

        Root Directory: server

        Build Command: npm install

        Start Command: node index.js

    Variables de entorno en Render:

        MONGODB_URI: Tu cadena de conexión de MongoDB

        PORT: 3001
# Configuración de CORS
Asegúrate de configurar CORS en server/index.js con tus URLs de producción:
const corsOptions = {
  origin: [
    'https://tu-frontend.vercel.app',
    'https://tu-backend.onrender.com',
    'http://localhost:5173'
  ],
  credentials: true
};