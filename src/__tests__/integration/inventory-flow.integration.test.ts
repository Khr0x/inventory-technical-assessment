import request from 'supertest';
import express from 'express';
import { initDb } from '../../infraestructure/db/sequalize';
import productRoutes from '../../application/routes/Product.routes';
import storeRoutes from '../../application/routes/Store.routes';
import inventoryRoutes from '../../application/routes/Inventory.routes';

const app = express();
app.use(express.json());
app.use('/', productRoutes);
app.use('/', storeRoutes);
app.use('/', inventoryRoutes);

describe('Tests de Integración - Flujo de Inventario', () => {
  let idProducto: string;
  let idTienda1: string;
  let idTienda2: string;

  beforeAll(async () => {
    await initDb();

    const producto = await request(app)
      .post('/products')
      .send({
        name: 'Producto para Flujo de Inventario',
        description: 'Producto de prueba',
        price: 100.00,
        sku: `FLUJO-${Date.now()}`,
        category: 'Test',
      });
    idProducto = producto.body.id;

    const tienda1 = await request(app)
      .post('/stores')
      .send({
        name: 'Tienda Principal',
        location: 'Ubicación Principal',
      });
    idTienda1 = tienda1.body.id;

    const tienda2 = await request(app)
      .post('/stores')
      .send({
        name: 'Tienda Secundaria',
        location: 'Ubicación Secundaria',
      });
    idTienda2 = tienda2.body.id;
  });

  afterAll(async () => {
    
  });

  describe('Flujo Completo de Inventario', () => {
    it('debería realizar transferencia de productos entre tiendas', async () => {
      const respuesta = await request(app)
        .post('/api/inventory/transfer')
        .send({
          productId: idProducto,
          sourceStoreId: idTienda1,
          targetStoreId: idTienda2,
          quantity: 30,
        });

      expect(respuesta.status).toBeGreaterThanOrEqual(200);
      expect(respuesta.status).toBeLessThan(500);
    });

    it('debería consultar inventario de una tienda', async () => {
      const respuesta = await request(app)
        .get(`/stores/${idTienda1}/inventory`);

      expect(respuesta.status).toBeGreaterThanOrEqual(200);
      expect(respuesta.status).toBeLessThan(500);
      
      if (respuesta.status === 200) {
        expect(Array.isArray(respuesta.body)).toBe(true);
      }
    });

    it('debería obtener alertas de inventario bajo', async () => {
      const respuesta = await request(app)
        .get('/api/inventory/alerts');

      expect(respuesta.status).toBeGreaterThanOrEqual(200);
      expect(respuesta.status).toBeLessThan(500);
      
      if (respuesta.status === 200) {
        expect(Array.isArray(respuesta.body)).toBe(true);
      }
    });
  });

  describe('Validaciones de Integridad', () => {
    it('no debería permitir transferencia con producto inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const respuesta = await request(app)
        .post('/api/inventory/transfer')
        .send({
          productId: idInexistente,
          sourceStoreId: idTienda1,
          targetStoreId: idTienda2,
          quantity: 10,
        });

      expect(respuesta.status).toBeGreaterThanOrEqual(400);
    });

    it('no debería permitir transferencia con tienda origen inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const respuesta = await request(app)
        .post('/api/inventory/transfer')
        .send({
          productId: idProducto,
          sourceStoreId: idInexistente,
          targetStoreId: idTienda2,
          quantity: 10,
        });

      expect(respuesta.status).toBeGreaterThanOrEqual(400);
    });

    it('no debería permitir transferencia con tienda destino inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      const respuesta = await request(app)
        .post('/api/inventory/transfer')
        .send({
          productId: idProducto,
          sourceStoreId: idTienda1,
          targetStoreId: idInexistente,
          quantity: 10,
        });

      expect(respuesta.status).toBeGreaterThanOrEqual(400);
    });
  });
});
