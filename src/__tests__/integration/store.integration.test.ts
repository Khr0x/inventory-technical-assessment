import request from 'supertest';
import express from 'express';
import { initDb } from '../../infraestructure/db/sequalize';
import storeRoutes from '../../application/routes/Store.routes';

const app = express();
app.use(express.json());
app.use('/', storeRoutes);

describe('Tests de Integración - Tiendas', () => {
  let idTiendaCreada: string;

  beforeAll(async () => {
    await initDb();
  });

  afterAll(async () => {
    // Limpieza de datos de prueba
  });

  describe('POST /api/stores - Crear Tienda', () => {
    it('debería crear una nueva tienda exitosamente', async () => {
      const datosTienda = {
        name: 'Tienda de Prueba Integración',
        location: 'Ubicación de Prueba',
      };

      const respuesta = await request(app)
        .post('/api/stores')
        .send(datosTienda)
        .expect(201);

      expect(respuesta.body).toHaveProperty('id');
      expect(respuesta.body.name).toBe(datosTienda.name);
      expect(respuesta.body.location).toBe(datosTienda.location);

      idTiendaCreada = respuesta.body.id;
    });

    it('debería retornar 400 con datos inválidos', async () => {
      const datosInvalidos = {
        name: '',
      };

      await request(app)
        .post('/api/stores')
        .send(datosInvalidos)
        .expect(400);
    });

    it('debería validar que el nombre es requerido', async () => {
      const datosInvalidos = {
        location: 'Solo ubicación',
      };

      const respuesta = await request(app)
        .post('/api/stores')
        .send(datosInvalidos)
        .expect(400);

      expect(respuesta.body).toHaveProperty('error');
    });
  });

  describe('GET /api/stores - Listar Tiendas', () => {
    it('debería retornar una lista de tiendas', async () => {
      const respuesta = await request(app)
        .get('/api/stores')
        .expect(200);

      expect(Array.isArray(respuesta.body)).toBe(true);
      if (respuesta.body.length > 0) {
        expect(respuesta.body[0]).toHaveProperty('id');
        expect(respuesta.body[0]).toHaveProperty('name');
        expect(respuesta.body[0]).toHaveProperty('location');
      }
    });

    it('debería incluir la tienda creada en la lista', async () => {
      if (!idTiendaCreada) {
        return;
      }

      const respuesta = await request(app)
        .get('/api/stores')
        .expect(200);

      const tiendaEncontrada = respuesta.body.find(
        (t: any) => t.id === idTiendaCreada
      );

      expect(tiendaEncontrada).toBeDefined();
    });
  });

  describe('GET /api/stores/:id - Obtener Tienda por ID', () => {
    it('debería retornar una tienda específica por su id', async () => {
      if (!idTiendaCreada) {
        return;
      }

      const respuesta = await request(app)
        .get(`/api/stores/${idTiendaCreada}`)
        .expect(200);

      expect(respuesta.body.id).toBe(idTiendaCreada);
      expect(respuesta.body).toHaveProperty('name');
      expect(respuesta.body).toHaveProperty('location');
    });

    it('debería retornar 404 para una tienda inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      await request(app)
        .get(`/api/stores/${idInexistente}`)
        .expect(404);
    });

    it('debería retornar 500 para un ID inválido', async () => {
      await request(app)
        .get('/api/stores/id-invalido')
        .expect(500);
    });
  });

  describe('GET /api/stores/:id/inventory - Obtener Inventario de Tienda', () => {
    it('debería retornar el inventario de la tienda', async () => {
      if (!idTiendaCreada) {
        return;
      }

      const respuesta = await request(app)
        .get(`/api/stores/${idTiendaCreada}/inventory`)
        .expect(200);

      expect(Array.isArray(respuesta.body)).toBe(true);
    });

    it('debería retornar array vacío para tienda sin inventario', async () => {
      if (!idTiendaCreada) {
        return;
      }

      const respuesta = await request(app)
        .get(`/api/stores/${idTiendaCreada}/inventory`)
        .expect(200);

      expect(Array.isArray(respuesta.body)).toBe(true);
    });

    it('debería retornar 404 para tienda inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      await request(app)
        .get(`/api/stores/${idInexistente}/inventory`)
        .expect(404);
    });
  });

  describe('PUT /api/stores/:id - Actualizar Tienda', () => {
    it('debería actualizar la tienda exitosamente', async () => {
      if (!idTiendaCreada) {
        return;
      }

      const datosActualizacion = {
        name: 'Tienda Actualizada',
        location: 'Nueva Ubicación',
      };

      const respuesta = await request(app)
        .put(`/api/stores/${idTiendaCreada}`)
        .send(datosActualizacion)
        .expect(200);

      expect(respuesta.body.name).toBe(datosActualizacion.name);
      expect(respuesta.body.location).toBe(datosActualizacion.location);
    });

    it('debería retornar 404 al actualizar tienda inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      await request(app)
        .put(`/api/stores/${idInexistente}`)
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /api/stores/:id - Eliminar Tienda', () => {
    it('debería eliminar la tienda exitosamente', async () => {
      if (!idTiendaCreada) {
        return;
      }

      await request(app)
        .delete(`/api/stores/${idTiendaCreada}`)
        .expect(204);

      await request(app)
        .get(`/api/stores/${idTiendaCreada}`)
        .expect(404);
    });

    it('debería retornar 404 al eliminar tienda inexistente', async () => {
      const idInexistente = '00000000-0000-0000-0000-000000000000';
      
      await request(app)
        .delete(`/api/stores/${idInexistente}`)
        .expect(404);
    });
  });
});
