import './config';
import express from 'express';
import { initDb } from './infraestructure/db/sequalize';
import storeRoutes from './application/routes/Store.routes';
import productRoutes from './application/routes/Product.routes';
import inventoryRoutes from './application/routes/Inventory.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api', storeRoutes);
app.use('/api', productRoutes);
app.use('/api', inventoryRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Server
async function start() {
  try {
    await initDb();
    console.log('Database connected');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
