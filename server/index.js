import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { router as reservationRoutes } from './routes/reservations.js';
import { router as tableRoutes } from './routes/tables.js';
import { router as notificationRoutes } from './routes/notifications.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de CORS actualizada para producción
const corsOptions = {
  origin: [
    'https://frontendv1-mu.vercel.app', // Tu frontend en Vercel
    'https://backendv1-bbin.onrender.com', // Tu backend en Render
    'http://localhost:5173', // Desarrollo local Vite
    'http://127.0.0.1:5173', // Alternativa local
    'https://localhost:5173' // HTTPS local
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Middleware para manejar preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/reservations', reservationRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/notifications', notificationRoutes);

// Conexión a MongoDB Atlas - Configuración optimizada
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reservations', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // Timeout aumentado a 10 segundos
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0
})
.then(() => {
  console.log('✅ Conectado a MongoDB Atlas');
  console.log('📊 Base de datos:', mongoose.connection.name);
})
.catch((error) => {
  console.error('❌ Error conectando a MongoDB:', error);
  console.log('ℹ️  Verifica tu cadena de conexión MONGODB_URI en el archivo .env');
  process.exit(1);
});

// Middleware de manejo de errores mejorado
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  
  // Manejar errores de MongoDB
  if (err.name === 'MongoNetworkError') {
    return res.status(503).json({ 
      message: 'Error de conexión con la base de datos',
      error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
  
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Ruta de prueba mejorada
app.get('/api/health', async (req, res) => {
  try {
    // Verificar conexión a MongoDB
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const dbName = mongoose.connection.name || 'No conectada';
    
    res.json({ 
      status: 'OK', 
      message: 'Servidor funcionando correctamente',
      database: {
        status: dbStatus,
        name: dbName
      },
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cors: {
        enabled: true,
        allowedOrigins: corsOptions.origin
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Error en el servidor',
      error: error.message 
    });
  }
});

// Ruta específica para probar CORS - Actualizada
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS está funcionando correctamente',
    allowedOrigins: corsOptions.origin,
    currentOrigin: req.headers.origin || 'No origin header',
    timestamp: new Date().toISOString(),
    endpoints: {
      reservations: '/api/reservations',
      tables: '/api/tables',
      notifications: '/api/notifications',
      health: '/api/health'
    }
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Backend Coco Bongo API',
    version: '1.0.0',
    status: 'Activo',
    documentation: {
      health: '/api/health',
      corsTest: '/api/cors-test',
      api: {
        reservations: '/api/reservations',
        tables: '/api/tables',
        notifications: '/api/notifications'
      }
    },
    deployment: {
      frontend: 'https://frontendv1-mu.vercel.app',
      backend: 'https://backendv1-bbin.onrender.com'
    }
  });
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    availableEndpoints: {
      health: '/api/health',
      corsTest: '/api/cors-test',
      reservations: '/api/reservations',
      tables: '/api/tables',
      notifications: '/api/notifications'
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🌐 Health check disponible en: https://backendv1-bbin.onrender.com/api/health`);
  console.log(`🔧 CORS configurado para:`);
  console.log(`   - https://frontendv1-mu.vercel.app (Producción)`);
  console.log(`   - https://backendv1-bbin.onrender.com (Backend)`);
  console.log(`   - http://localhost:5173 (Desarrollo)`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Base de datos: ${process.env.MONGODB_URI ? 'MongoDB Atlas' : 'Local'}`);
});

// Manejo graceful de shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Recibido SIGINT. Cerrando servidor...');
  await mongoose.connection.close();
  console.log('✅ Conexión a MongoDB cerrada');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Recibido SIGTERM. Cerrando servidor...');
  await mongoose.connection.close();
  console.log('✅ Conexión a MongoDB cerrada');
  process.exit(0);
});

export default app;