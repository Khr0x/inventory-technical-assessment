import { Request, Response } from 'express';
import { StoreController } from '../../../application/controllers/StoreController';
import { StoreUseCase } from '../../../application/use-cases/StoreUseCase';
import { HttpStatus } from '../../../enums/HttpStatus';
import { StoreNotFoundError, InvalidStoreDataError } from '../../../errors';

jest.mock('../../../application/use-cases/StoreUseCase');

describe('StoreController', () => {
  let storeController: StoreController;
  let mockStoreUseCase: jest.Mocked<StoreUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockStoreUseCase = {
      createStore: jest.fn(),
      getStoreById: jest.fn(),
      getAllStores: jest.fn(),
    } as any;

    storeController = new StoreController();
    (storeController as any).storeUseCase = mockStoreUseCase;

    mockRequest = {
      body: {},
      params: {},
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createStore', () => {
    it('debería crear una tienda exitosamente', async () => {
      const storeData = {
        name: 'Tienda de Prueba',
        location: 'Calle Principal 123',
      };

      const expectedResult = {
        id: 'store-123',
        ...storeData,
      };

      mockRequest.body = storeData;
      mockStoreUseCase.createStore.mockResolvedValue(expectedResult);

      await storeController.createStore(mockRequest as Request, mockResponse as Response);

      expect(mockStoreUseCase.createStore).toHaveBeenCalledWith(storeData);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it('debería lanzar InvalidStoreDataError cuando falta el nombre', async () => {
      const storeData = {
        location: 'Calle Principal 123',
      };

      mockRequest.body = storeData;

      await storeController.createStore(mockRequest as Request, mockResponse as Response);

      expect(mockStoreUseCase.createStore).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('debería lanzar InvalidStoreDataError cuando falta la ubicación', async () => {
      const storeData = {
        name: 'Tienda de Prueba',
      };

      mockRequest.body = storeData;

      await storeController.createStore(mockRequest as Request, mockResponse as Response);

      expect(mockStoreUseCase.createStore).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('debería manejar errores inesperados al crear una tienda', async () => {
      const storeData = {
        name: 'Tienda de Prueba',
        location: 'Calle Principal 123',
      };

      mockRequest.body = storeData;
      mockStoreUseCase.createStore.mockRejectedValue(new Error('Unexpected error'));

      await storeController.createStore(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Ha ocurrido un error interno del servidor',
      });
    });
  });

  describe('getStoreById', () => {
    it('debería obtener una tienda por id exitosamente', async () => {
      const storeId = 'store-123';
      const expectedStore = {
        id: storeId,
        name: 'Tienda de Prueba',
        location: 'Calle Principal 123',
      };

      mockRequest.params = { id: storeId };
      mockStoreUseCase.getStoreById.mockResolvedValue(expectedStore);

      await storeController.getStoreById(mockRequest as Request, mockResponse as Response);

      expect(mockStoreUseCase.getStoreById).toHaveBeenCalledWith(storeId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedStore);
    });

    it('debería lanzar StoreNotFoundError cuando no se encuentra la tienda', async () => {
      const storeId = 'store-999';

      mockRequest.params = { id: storeId };
      mockStoreUseCase.getStoreById.mockResolvedValue(null);

      await storeController.getStoreById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    it('debería manejar errores inesperados al obtener una tienda', async () => {
      const storeId = 'store-123';

      mockRequest.params = { id: storeId };
      mockStoreUseCase.getStoreById.mockRejectedValue(new Error('Unexpected error'));

      await storeController.getStoreById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Ha ocurrido un error interno del servidor',
      });
    });
  });

  describe('getAllStores', () => {
    it('debería obtener todas las tiendas exitosamente', async () => {
      const expectedStores = [
        {
          id: 'store-1',
          name: 'Tienda 1',
          location: 'Calle Principal 123',
        },
        {
          id: 'store-2',
          name: 'Tienda 2',
          location: 'Avenida Roble 456',
        },
      ];

      mockStoreUseCase.getAllStores.mockResolvedValue(expectedStores);

      await storeController.getAllStores(mockRequest as Request, mockResponse as Response);

      expect(mockStoreUseCase.getAllStores).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedStores);
    });

    it('debería retornar un array vacío cuando no existen tiendas', async () => {
      const expectedStores: any[] = [];

      mockStoreUseCase.getAllStores.mockResolvedValue(expectedStores);

      await storeController.getAllStores(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedStores);
    });

    it('debería manejar errores inesperados al obtener todas las tiendas', async () => {
      mockStoreUseCase.getAllStores.mockRejectedValue(new Error('Error inesperado'));

      await storeController.getAllStores(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Ha ocurrido un error interno del servidor',
      });
    });
  });
});
