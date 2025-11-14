import { Request, Response } from 'express';
import { InventoryController } from '../../../application/controllers/InventoryController';
import { InventoryUseCase } from '../../../application/use-cases/InventoryUseCase';
import { HttpStatus } from '../../../enums/HttpStatus';
import {
  NoInventoriesForStoreError,
  NoLowStockInventoriesError,
  InsufficientInventoryError,
} from '../../../errors';

jest.mock('../../../application/use-cases/InventoryUseCase');

describe('InventoryController', () => {
  let inventoryController: InventoryController;
  let mockInventoryUseCase: jest.Mocked<InventoryUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockInventoryUseCase = {
      getInventoriesByStore: jest.fn(),
      transferInventory: jest.fn(),
      getLowStockInventories: jest.fn(),
      createInventory: jest.fn(),
    } as any;

    inventoryController = new InventoryController();
    (inventoryController as any).inventoryUseCase = mockInventoryUseCase;

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

  describe('getInventoriesByStore', () => {
    it('debería obtener inventarios por tienda exitosamente', async () => {
      const storeId = 'store-123';
      const expectedInventories = [
        {
          id: 'inv-1',
          productId: 'prod-1',
          storeId: storeId,
          quantity: 50,
          minStock: 10,
        },
        {
          id: 'inv-2',
          productId: 'prod-2',
          storeId: storeId,
          quantity: 30,
          minStock: 5,
        },
      ];

      mockRequest.params = { id: storeId };
      mockInventoryUseCase.getInventoriesByStore.mockResolvedValue(expectedInventories);

      await inventoryController.getInventoriesByStore(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockInventoryUseCase.getInventoriesByStore).toHaveBeenCalledWith(storeId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedInventories);
    });

    it('debería lanzar NoInventoriesForStoreError cuando no se encuentran inventarios', async () => {
      const storeId = 'store-999';

      mockRequest.params = { id: storeId };
      mockInventoryUseCase.getInventoriesByStore.mockResolvedValue([]);

      await inventoryController.getInventoriesByStore(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    it('debería manejar AppError al obtener inventarios', async () => {
      const storeId = 'store-123';
      const error = new NoInventoriesForStoreError(storeId);

      mockRequest.params = { id: storeId };
      mockInventoryUseCase.getInventoriesByStore.mockRejectedValue(error);

      await inventoryController.getInventoriesByStore(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(error.statusCode);
      expect(mockResponse.json).toHaveBeenCalledWith(error.toJSON());
    });

    it('debería manejar errores inesperados al obtener inventarios', async () => {
      const storeId = 'store-123';

      mockRequest.params = { id: storeId };
      mockInventoryUseCase.getInventoriesByStore.mockRejectedValue(new Error('Error inesperado'));

      await inventoryController.getInventoriesByStore(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Ha ocurrido un error interno del servidor',
      });
    });
  });

  describe('transferInventory', () => {
    it('debería transferir inventario exitosamente', async () => {
      const transferData = {
        sourceStoreId: 'store-1',
        targetStoreId: 'store-2',
        productId: 'prod-123',
        quantity: 10,
      };

      const expectedResult = {
        id: 'inv-123',
        productId: transferData.productId,
        storeId: transferData.targetStoreId,
        quantity: 60,
        minStock: 15,
      };

      mockRequest.body = transferData;
      mockInventoryUseCase.transferInventory.mockResolvedValue(expectedResult);

      await inventoryController.transferInventory(mockRequest as Request, mockResponse as Response);

      expect(mockInventoryUseCase.transferInventory).toHaveBeenCalledWith(
        expect.objectContaining({
          ...transferData,
          timestamp: expect.any(Date),
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it('debería manejar InsufficientInventoryError cuando la cantidad excede lo disponible', async () => {
      const transferData = {
        sourceStoreId: 'store-1',
        targetStoreId: 'store-2',
        productId: 'prod-123',
        quantity: 150,
      };

      const error = new InsufficientInventoryError(transferData.quantity, 50);

      mockRequest.body = transferData;
      mockInventoryUseCase.transferInventory.mockRejectedValue(error);

      await inventoryController.transferInventory(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(error.statusCode);
      expect(mockResponse.json).toHaveBeenCalledWith(error.toJSON());
    });

    it('debería manejar errores inesperados al transferir inventario', async () => {
      const transferData = {
        sourceStoreId: 'store-1',
        targetStoreId: 'store-2',
        productId: 'prod-123',
        quantity: 10,
      };

      mockRequest.body = transferData;
      mockInventoryUseCase.transferInventory.mockRejectedValue(new Error('Error inesperado'));

      await inventoryController.transferInventory(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Ha ocurrido un error interno del servidor',
      });
    });
  });

  describe('getLowStockInventories', () => {
    it('debería obtener inventarios con stock bajo exitosamente', async () => {
      const expectedInventories = [
        {
          id: 'inv-1',
          productId: 'prod-1',
          storeId: 'store-1',
          quantity: 3,
          minStock: 15,
        },
        {
          id: 'inv-2',
          productId: 'prod-2',
          storeId: 'store-2',
          quantity: 5,
          minStock: 20,
        },
      ];

      mockInventoryUseCase.getLowStockInventories.mockResolvedValue(expectedInventories);

      await inventoryController.getLowStockInventories(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockInventoryUseCase.getLowStockInventories).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedInventories);
    });

    it('debería lanzar NoLowStockInventoriesError cuando no se encuentra stock bajo', async () => {
      mockInventoryUseCase.getLowStockInventories.mockResolvedValue([]);

      await inventoryController.getLowStockInventories(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    it('debería manejar AppError al obtener inventarios con stock bajo', async () => {
      const error = new NoLowStockInventoriesError();

      mockInventoryUseCase.getLowStockInventories.mockRejectedValue(error);

      await inventoryController.getLowStockInventories(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(error.statusCode);
      expect(mockResponse.json).toHaveBeenCalledWith(error.toJSON());
    });

    it('debería manejar errores inesperados al obtener inventarios con stock bajo', async () => {
      mockInventoryUseCase.getLowStockInventories.mockRejectedValue(new Error('Error inesperado'));

      await inventoryController.getLowStockInventories(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Ha ocurrido un error interno del servidor',
      });
    });
  });
});
