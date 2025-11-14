import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateSchema } from '../../../middlewares/validate.middleware';

describe('validateSchema Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    mockRequest = {
      body: {},
    };
    
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
    
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validación exitosa', () => {
    it('debería llamar next() cuando el body es válido', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      mockRequest.body = {
        name: 'Juan',
        age: 25,
      };

      const middleware = validateSchema(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('debería validar correctamente un objeto complejo', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
        age: z.number().min(18),
      });

      mockRequest.body = {
        user: {
          name: 'María',
          email: 'maria@ejemplo.com',
        },
        age: 30,
      };

      const middleware = validateSchema(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('debería validar correctamente un array', () => {
      const schema = z.object({
        items: z.array(z.string()),
      });

      mockRequest.body = {
        items: ['item1', 'item2', 'item3'],
      };

      const middleware = validateSchema(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('debería validar correctamente campos opcionales', () => {
      const schema = z.object({
        name: z.string(),
        description: z.string().optional(),
      });

      mockRequest.body = {
        name: 'Producto',
      };

      const middleware = validateSchema(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe('errores de validación', () => {
    it('debería retornar error 400 cuando falta un campo requerido', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      mockRequest.body = {
        name: 'Juan',
        // falta age
      };

      const middleware = validateSchema(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation error',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: 'age',
            message: expect.any(String),
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería retornar error 400 cuando el tipo de dato es incorrecto', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      mockRequest.body = {
        name: 'Juan',
        age: 'veinticinco', // debería ser número
      };

      const middleware = validateSchema(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation error',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: 'age',
            message: expect.any(String),
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería retornar múltiples errores cuando hay varios campos inválidos', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
        email: z.string().email(),
      });

      mockRequest.body = {
        name: 123, // debería ser string
        age: 'veinte', // debería ser número
        email: 'correo-invalido', // debería ser email válido
      };

      const middleware = validateSchema(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation error',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: expect.any(String),
            message: expect.any(String),
          }),
        ]),
      });
      
      const callDetails = jsonMock.mock.calls[0][0].details;
      expect(callDetails.length).toBeGreaterThanOrEqual(2);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería validar restricciones personalizadas (min/max)', () => {
      const schema = z.object({
        age: z.number().min(18).max(100),
      });

      mockRequest.body = {
        age: 150, // mayor que max
      };

      const middleware = validateSchema(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation error',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: 'age',
            message: expect.any(String),
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería validar formato de email incorrecto', () => {
      const schema = z.object({
        email: z.string().email(),
      });

      mockRequest.body = {
        email: 'no-es-un-email',
      };

      const middleware = validateSchema(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation error',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: 'email',
            message: expect.any(String),
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería validar errores en objetos anidados', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          age: z.number(),
        }),
      });

      mockRequest.body = {
        user: {
          name: 'Juan',
          age: 'treinta', // debería ser número
        },
      };

      const middleware = validateSchema(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation error',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: 'user.age',
            message: expect.any(String),
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería validar arrays con elementos inválidos', () => {
      const schema = z.object({
        items: z.array(z.number()),
      });

      mockRequest.body = {
        items: [1, 2, 'tres', 4], // 'tres' debería ser número
      };

      const middleware = validateSchema(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation error',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: expect.stringContaining('items'),
            message: expect.any(String),
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('manejo de errores inesperados', () => {
    it('debería llamar next(error) cuando ocurre un error no ZodError', () => {
      const schema = z.object({
        name: z.string(),
      });

      // Simulamos un error en el proceso de parsing
      const mockSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error('Error inesperado');
        }),
      } as any;

      mockRequest.body = {
        name: 'Juan',
      };

      const middleware = validateSchema(mockSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe('casos edge', () => {
    it('debería manejar body vacío cuando se requieren campos', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      mockRequest.body = {};

      const middleware = validateSchema(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation error',
        details: expect.any(Array),
      });
      
      const callDetails = jsonMock.mock.calls[0][0].details;
      expect(callDetails.length).toBe(2); // name y age faltantes
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería validar correctamente cuando el body es null', () => {
      const schema = z.object({
        name: z.string(),
      });

      mockRequest.body = null as any;

      const middleware = validateSchema(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería validar correctamente campos con valores null no permitidos', () => {
      const schema = z.object({
        name: z.string(),
      });

      mockRequest.body = {
        name: null,
      };

      const middleware = validateSchema(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation error',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: 'name',
            message: expect.any(String),
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería permitir campos adicionales si el schema lo permite', () => {
      const schema = z.object({
        name: z.string(),
      });

      mockRequest.body = {
        name: 'Juan',
        extraField: 'valor extra',
      };

      const middleware = validateSchema(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusMock).not.toHaveBeenCalled();
    });
  });
});
