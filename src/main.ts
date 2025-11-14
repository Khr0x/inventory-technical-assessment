import './config';
import express from 'express';
import { initDb } from './infraestructure/db/sequalize';
import storeRoutes from './application/routes/Store.routes';
import productRoutes from './application/routes/Product.routes';
import inventoryRoutes from './application/routes/Inventory.routes';
import { logger } from './config/logger';
import { requestLogger, errorLogger } from './middlewares/logger.middleware';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(requestLogger);

app.use('/api', storeRoutes);
app.use('/api', productRoutes);
app.use('/api', inventoryRoutes);

app.use(errorLogger);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


async function start() {
  try {
    await initDb();
    logger.info('Database connected');

    app.listen(PORT, () => {
      logger.info('Server started', { 
        port: PORT, 
        environment: process.env.NODE_ENV || 'development',
        healthCheck: `http://localhost:${PORT}/health`
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    process.exit(1);
  }
}

start();
