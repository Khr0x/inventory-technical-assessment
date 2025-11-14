import request from 'supertest';
import express from 'express';
import { initDb } from '../../infraestructure/db/sequalize';
import productRoutes from '../../application/routes/Product.routes';

const app = express();
app.use(express.json());
app.use('/api', productRoutes);

describe('Tests de Integración - Productos', () => {
  let idProductoCreado: string;

  beforeAll(async () => {
    await initDb();
  });

  afterAll(async () => {
    
  });

  describe('POST /api/products - Crear Producto', () => {
    it('debería crear un nuevo producto exitosamente', async () => {
      const datosProducto = {
        name: 'Producto de Prueba Integración',
        description: 'Descripción del producto de prueba',
        price: 99.99,
        sku: `TEST-${Date.now()}`,
        category: 'Test',
      };

      const respuesta = await request(app)
        .post('/api/products')
        .send(datosProducto)
        .expect(201);

      expect(respuesta.body).toHaveProperty('id');
      expect(respuesta.body.name).toBe(datosProducto.name);
      expect(respuesta.body.price).toBe(datosProducto.price);
      expect(respuesta.body.sku).toBe(datosProducto.sku);

      idProductoCreado = respuesta.body.id;
    });

    it('debería retornar 400 con datos inválidos', async () => {
      const datosInvalidos = {
        name: '',
        price: -10,
      };

      await request(app)
        .post('/api/products')
        .send(datosInvalidos)
        .expect(400);
    });

    it('debería validar que el nombre es requerido', async () => {
      const datosInvalidos = {
        price: 100,
        sku: 'TEST-SKU',
      };

      const respuesta = await request(app)
        .post('/api/products')
        .send(datosInvalidos)
        .expect(400);

      expect(respuesta.body).toHaveProperty('error');
    });

    it('debería validar que el precio sea positivo', async () => {
      const datosInvalidos = {
        name: 'Producto Test',
        price: -50,
        sku: 'TEST-SKU',
      };

      await request(app)
        .post('/api/products')
        .send(datosInvalidos)
        .expect(400);
    });
  });

  describe('GET /api/products - Listar Productos', () => {
    it('debería retornar una lista de productos', async () => {
      const respuesta = await request(app)
        .get('/api/products')
        .expect(200);

      expect(Array.isArray(respuesta.body.products) || Array.isArray(respuesta.body)).toBe(true);
      if (respuesta.body.length > 0) {
        expect(respuesta.body[0]).toHaveProperty('id');
        expect(respuesta.body[0]).toHaveProperty('name');
        expect(respuesta.body[0]).toHaveProperty('price');
      }
    });

    it('debería incluir el producto creado en la lista', async () => {
      if (!idProductoCreado) {
        return;
      }

      const respuesta = await request(app)
        .get('/api/products')
        .expect(200);

      const productos = respuesta.body.products || respuesta.body;
      const productoEncontrado = productos.find(
        (p: any) => p.id === idProductoCreado
      );

      expect(productoEncontrado).toBeDefined();
    });
  });

  describe('GET /api/products/:id - Obtener Producto por ID', () => {
    it('debería retornar un producto específico por su id', async () => {
      if (!idProductoCreado) {
        return;
      }

      const respuesta = await request(app)
        .get(`/api/products/${idProductoCreado}`)
        .expect(200);

      expect(respuesta.body.id).toBe(idProductoCreado);
      expect(respuesta.body).toHaveProperty('name');
      expect(respuesta.body).toHaveProperty('price');
      expect(respuesta.body).toHaveProperty('sku');
    });

    it('debería retornar 404 para un producto inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      await request(app)
        .get(`/api/products/${idInexistente}`)
        .expect(404);
    });

    it('debería retornar 500 para un ID inválido', async () => {
      await request(app)
        .get('/api/products/id-invalido')
        .expect(500);
    });
  });

  describe('PUT /api/products/:id - Actualizar Producto', () => {
    it('debería actualizar el producto exitosamente', async () => {
      if (!idProductoCreado) {
        return;
      }

      const datosActualizacion = {
        name: 'Producto Actualizado',
        price: 149.99,
      };

      const respuesta = await request(app)
        .put(`/api/products/${idProductoCreado}`)
        .send(datosActualizacion)
        .expect(200);

      expect(respuesta.body.name).toBe(datosActualizacion.name);
      expect(respuesta.body.price).toBe(datosActualizacion.price);
    });

    it('debería retornar 404 al actualizar producto inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      await request(app)
        .put(`/api/products/${idInexistente}`)
        .send({ name: 'Test' })
        .expect(404);
    });

    it('debería validar datos al actualizar', async () => {
      if (!idProductoCreado) {
        return;
      }

      const datosInvalidos = {
        price: -100,
      };

      await request(app)
        .put(`/api/products/${idProductoCreado}`)
        .send(datosInvalidos)
        .expect(400);
    });
  });

  describe('DELETE /api/products/:id - Eliminar Producto', () => {
    it('debería eliminar el producto exitosamente', async () => {
      if (!idProductoCreado) {
        return;
      }

      await request(app)
        .delete(`/api/products/${idProductoCreado}`)
        .expect(204);

      await request(app)
        .get(`/api/products/${idProductoCreado}`)
        .expect(404);

      idProductoCreado = '';
    });

    it('debería retornar 404 al eliminar producto inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      await request(app)
        .delete(`/api/products/${idInexistente}`)
        .expect(404);
    });
  });
});
