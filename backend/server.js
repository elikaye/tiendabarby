import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { sequelize } from './models/index.js';

// 📦 Importar rutas
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import favoritoRoutes from './routes/favoritoRoutes.js';
import frontendSettingsRoutes from './routes/frontendSettingsRoutes.js';

dotenv.config();
const app = express();

// 🌐 Orígenes permitidos
const allowedOrigins = [
  'http://localhost:5173',
  'https://tiendabarby.vercel.app',
  'https://www.tiendabarby.vercel.app',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

// ✅ CORS seguro
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn('🚫 Bloqueado por CORS:', origin);
        callback(new Error('No permitido por CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.options('*', cors());
app.use(express.json());

// 📦 Rutas
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/carrito', cartRoutes);
app.use('/api/v1/ordenes', orderRoutes);
app.use('/api/v1/favoritos', favoritoRoutes);
app.use('/api/v1/frontend-settings', frontendSettingsRoutes);

// 🧠 Ruta test
app.get('/', (req, res) => {
  res.send('✅ API funcionando 🚀');
});

// 🚧 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// ⚠️ Error global
app.use((err, req, res, next) => {
  console.error('🔴 Error global:', err.message);
  res.status(500).json({ message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 5000;

// 🔗 Conexión DB y arranque
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a MySQL con Sequelize');

    // 🚫 IMPORTANTE: SIN alter ni force en producción
    await sequelize.sync();
    console.log('✅ Tablas sincronizadas');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al conectar con Sequelize:', error.message);
    process.exit(1);
  }
})();