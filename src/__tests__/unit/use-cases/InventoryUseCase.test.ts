import { InventoryUseCase } from '../../../application/use-cases/InventoryUseCase';
import { InventoryRepository } from '../../../infraestructure/repositories/InventoryRepository';
import { InventoryMovementRepository } from '../../../infraestructure/repositories/InventoryMovementRepository';
import { StoreRepository } from '../../../infraestructure/repositories/StoreRepository';
import { ProductRepository } from '../../../infraestructure/repositories/ProductRepository';
import { CreateInventoryDTO, CreateMovementDTO } from '../../../domain/inventory/dto/InventoryDTO';
import {
  StoreNotFoundError,
  ProductNotFoundError,
  InvalidQuantityError,
  NoLowStockInventoriesError,
  SameStoreTransferError,
  SourceOrTargetStoreNotFoundError,
} from '../../../errors';
import { sequelize } from '../../../infraestructure/db/sequalize';
import { MovementType } from '../../../domain/inventory/InventoryMovement';

jest.mock('../../../infraestructure/db/sequalize', () => ({
  sequelize: {
    transaction: jest.fn(),
  },
}));

jest.mock('../../../infraestructure/repositories/InventoryRepository');
jest.mock('../../../infraestructure/repositories/InventoryMovementRepository');
jest.mock('../../../infraestructure/repositories/StoreRepository');
jest.mock('../../../infraestructure/repositories/ProductRepository');

describe('InventoryUseCase', () => {
  let inventoryUseCase: InventoryUseCase;
  let mockInventoryRepository: jest.Mocked<InventoryRepository>;
  let mockInventoryMovementRepository: jest.Mocked<InventoryMovementRepository>;
  let mockStoreRepository: jest.Mocked<StoreRepository>;
  let mockProductRepository: jest.Mocked<ProductRepository>;
  let mockTransaction: any;

  beforeEach(() => {

    mockInventoryRepository = new InventoryRepository() as jest.Mocked<InventoryRepository>;
    mockInventoryMovementRepository = new InventoryMovementRepository() as jest.Mocked<InventoryMovementRepository>;
    mockStoreRepository = new StoreRepository() as jest.Mocked<StoreRepository>;
    mockProductRepository = new ProductRepository() as jest.Mocked<ProductRepository>;

    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    (sequelize.transaction as jest.Mock).mockResolvedValue(mockTransaction);

    inventoryUseCase = new InventoryUseCase(
      mockInventoryRepository,
      mockInventoryMovementRepository,
      mockStoreRepository,
      mockProductRepository
    );

    jest.clearAllMocks();
  });

  describe('createInventory', () => {
    const mockCreateInventoryDTO: CreateInventoryDTO = {
      productId: '550e8400-e29b-41d4-a716-446655440001',
      storeId: '550e8400-e29b-41d4-a716-446655440002',
      quantity: 100,
      minStock: 10,
    };

    const mockStore = {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Tienda Principal',
      location: 'Centro',
    };

    const mockProduct = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Producto de Prueba',
      sku: 'PROD-001',
      price: 99.99,
      category: 'Electrónica',
      isActive: true,
    };

    const mockInventory = {
      id: '550e8400-e29b-41d4-a716-446655440003',
      productId: mockCreateInventoryDTO.productId,
      storeId: mockCreateInventoryDTO.storeId,
      quantity: mockCreateInventoryDTO.quantity,
      minStock: mockCreateInventoryDTO.minStock,
    };

    it('debería crear un inventario exitosamente', async () => {
      mockStoreRepository.findById.mockResolvedValue(mockStore as any);
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);
      mockInventoryRepository.create.mockResolvedValue(mockInventory as any);

      const result = await inventoryUseCase.createInventory(mockCreateInventoryDTO);

      expect(mockStoreRepository.findById).toHaveBeenCalledWith(mockCreateInventoryDTO.storeId);
      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockCreateInventoryDTO.productId);
      expect(mockInventoryRepository.create).toHaveBeenCalledWith(mockCreateInventoryDTO, mockTransaction);
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockInventory);
    });

    it('debería lanzar StoreNotFoundError cuando la tienda no existe', async () => {
      mockStoreRepository.findById.mockResolvedValue(null);

      await expect(inventoryUseCase.createInventory(mockCreateInventoryDTO)).rejects.toThrow(
        StoreNotFoundError
      );

      expect(mockStoreRepository.findById).toHaveBeenCalledWith(mockCreateInventoryDTO.storeId);
      expect(mockProductRepository.findById).not.toHaveBeenCalled();
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('debería lanzar ProductNotFoundError cuando el producto no existe', async () => {
      mockStoreRepository.findById.mockResolvedValue(mockStore as any);
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(inventoryUseCase.createInventory(mockCreateInventoryDTO)).rejects.toThrow(
        ProductNotFoundError
      );

      expect(mockStoreRepository.findById).toHaveBeenCalled();
      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockCreateInventoryDTO.productId);
      expect(mockInventoryRepository.create).not.toHaveBeenCalled();
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('debería hacer rollback cuando falla la creación', async () => {
      const error = new Error('Error en la base de datos');
      mockStoreRepository.findById.mockResolvedValue(mockStore as any);
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);
      mockInventoryRepository.create.mockRejectedValue(error);

      await expect(inventoryUseCase.createInventory(mockCreateInventoryDTO)).rejects.toThrow(error);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
  });

  describe('getInventoriesByStore', () => {
    const storeId = '550e8400-e29b-41d4-a716-446655440001';
    const mockStore = {
      id: storeId,
      name: 'Tienda Principal',
      location: 'Centro',
    };

    const mockInventories = [
      {
        id: '1',
        productId: 'prod-1',
        storeId: storeId,
        quantity: 100,
        minStock: 10,
      },
      {
        id: '2',
        productId: 'prod-2',
        storeId: storeId,
        quantity: 50,
        minStock: 5,
      },
    ];

    it('debería obtener inventarios por tienda exitosamente', async () => {
      mockStoreRepository.findById.mockResolvedValue(mockStore as any);
      mockInventoryRepository.findByStore.mockResolvedValue(mockInventories as any);

      const result = await inventoryUseCase.getInventoriesByStore(storeId);

      expect(mockStoreRepository.findById).toHaveBeenCalledWith(storeId);
      expect(mockInventoryRepository.findByStore).toHaveBeenCalledWith(storeId);
      expect(result).toEqual(mockInventories);
    });

    it('debería lanzar StoreNotFoundError cuando la tienda no existe', async () => {
      mockStoreRepository.findById.mockResolvedValue(null);

      await expect(inventoryUseCase.getInventoriesByStore(storeId)).rejects.toThrow(
        StoreNotFoundError
      );

      expect(mockStoreRepository.findById).toHaveBeenCalledWith(storeId);
      expect(mockInventoryRepository.findByStore).not.toHaveBeenCalled();
    });

    it('debería retornar array vacío cuando no hay inventarios', async () => {
      mockStoreRepository.findById.mockResolvedValue(mockStore as any);
      mockInventoryRepository.findByStore.mockResolvedValue([]);

      const result = await inventoryUseCase.getInventoriesByStore(storeId);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('debería lanzar un error si falla la búsqueda', async () => {
      const error = new Error('Error en la base de datos');
      mockStoreRepository.findById.mockResolvedValue(mockStore as any);
      mockInventoryRepository.findByStore.mockRejectedValue(error);

      await expect(inventoryUseCase.getInventoriesByStore(storeId)).rejects.toThrow(error);
    });
  });

  describe('transferInventory', () => {
    const mockTransferDTO: CreateMovementDTO = {
      productId: '550e8400-e29b-41d4-a716-446655440001',
      sourceStoreId: '550e8400-e29b-41d4-a716-446655440002',
      targetStoreId: '550e8400-e29b-41d4-a716-446655440003',
      quantity: 50,
      type: MovementType.TRANSFER,
    };

    const mockProduct = {
      id: mockTransferDTO.productId,
      name: 'Producto de Prueba',
      sku: 'PROD-001',
      price: 99.99,
      category: 'Electrónica',
      isActive: true,
    };

    const mockUpdatedInventory = {
      id: '1',
      productId: mockTransferDTO.productId,
      storeId: mockTransferDTO.targetStoreId,
      quantity: 150,
      minStock: 10,
    };

    it('debería transferir inventario exitosamente', async () => {
      mockStoreRepository.existsAll.mockResolvedValue(true);
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);
      mockInventoryRepository.transfer.mockResolvedValue(mockUpdatedInventory as any);
      mockInventoryMovementRepository.create.mockResolvedValue({} as any);

      const result = await inventoryUseCase.transferInventory(mockTransferDTO);

      expect(mockStoreRepository.existsAll).toHaveBeenCalledWith([
        mockTransferDTO.sourceStoreId,
        mockTransferDTO.targetStoreId,
      ]);
      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockTransferDTO.productId);
      expect(mockInventoryRepository.transfer).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: mockTransferDTO.productId,
          sourceStoreId: mockTransferDTO.sourceStoreId,
          targetStoreId: mockTransferDTO.targetStoreId,
          quantity: mockTransferDTO.quantity,
        }),
        mockTransaction
      );
      expect(mockInventoryMovementRepository.create).toHaveBeenCalledWith(mockTransferDTO, mockTransaction);
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedInventory);
    });

    it('debería lanzar SameStoreTransferError cuando origen y destino son iguales', async () => {
      const sameStoreDTO: CreateMovementDTO = {
        ...mockTransferDTO,
        sourceStoreId: '550e8400-e29b-41d4-a716-446655440002',
        targetStoreId: '550e8400-e29b-41d4-a716-446655440002',
      };

      await expect(inventoryUseCase.transferInventory(sameStoreDTO)).rejects.toThrow(
        SameStoreTransferError
      );

      expect(mockStoreRepository.existsAll).not.toHaveBeenCalled();
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('debería lanzar InvalidQuantityError cuando la cantidad es cero', async () => {
      const invalidQuantityDTO: CreateMovementDTO = {
        ...mockTransferDTO,
        quantity: 0,
      };

      await expect(inventoryUseCase.transferInventory(invalidQuantityDTO)).rejects.toThrow(
        InvalidQuantityError
      );

      expect(mockStoreRepository.existsAll).not.toHaveBeenCalled();
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('debería lanzar InvalidQuantityError cuando la cantidad es negativa', async () => {
      const negativeQuantityDTO: CreateMovementDTO = {
        ...mockTransferDTO,
        quantity: -10,
      };

      await expect(inventoryUseCase.transferInventory(negativeQuantityDTO)).rejects.toThrow(
        InvalidQuantityError
      );

      expect(mockStoreRepository.existsAll).not.toHaveBeenCalled();
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('debería lanzar SourceOrTargetStoreNotFoundError cuando las tiendas no existen', async () => {
      mockStoreRepository.existsAll.mockResolvedValue(false);

      await expect(inventoryUseCase.transferInventory(mockTransferDTO)).rejects.toThrow(
        SourceOrTargetStoreNotFoundError
      );

      expect(mockStoreRepository.existsAll).toHaveBeenCalled();
      expect(mockProductRepository.findById).not.toHaveBeenCalled();
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('debería lanzar ProductNotFoundError cuando el producto no existe', async () => {
      mockStoreRepository.existsAll.mockResolvedValue(true);
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(inventoryUseCase.transferInventory(mockTransferDTO)).rejects.toThrow(
        ProductNotFoundError
      );

      expect(mockStoreRepository.existsAll).toHaveBeenCalled();
      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockTransferDTO.productId);
      expect(mockInventoryRepository.transfer).not.toHaveBeenCalled();
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('debería hacer rollback cuando falla la transferencia', async () => {
      const error = new Error('Error en la base de datos');
      mockStoreRepository.existsAll.mockResolvedValue(true);
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);
      mockInventoryRepository.transfer.mockRejectedValue(error);

      await expect(inventoryUseCase.transferInventory(mockTransferDTO)).rejects.toThrow(error);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
  });

  describe('getLowStockInventories', () => {
    const mockLowStockInventories = [
      {
        id: '1',
        productId: 'prod-1',
        storeId: 'store-1',
        quantity: 5,
        minStock: 10,
      },
      {
        id: '2',
        productId: 'prod-2',
        storeId: 'store-2',
        quantity: 3,
        minStock: 15,
      },
    ];

    it('debería obtener inventarios con stock bajo exitosamente', async () => {
      mockInventoryRepository.getLowStockInventories.mockResolvedValue(mockLowStockInventories as any);

      const result = await inventoryUseCase.getLowStockInventories();

      expect(mockInventoryRepository.getLowStockInventories).toHaveBeenCalled();
      expect(result).toEqual(mockLowStockInventories);
      expect(result).toHaveLength(2);
    });

    it('debería lanzar NoLowStockInventoriesError cuando no hay inventarios con stock bajo', async () => {
      mockInventoryRepository.getLowStockInventories.mockResolvedValue([]);

      await expect(inventoryUseCase.getLowStockInventories()).rejects.toThrow(
        NoLowStockInventoriesError
      );

      expect(mockInventoryRepository.getLowStockInventories).toHaveBeenCalled();
    });

    it('debería lanzar un error si falla la búsqueda', async () => {
      const error = new Error('Error en la base de datos');
      mockInventoryRepository.getLowStockInventories.mockRejectedValue(error);

      await expect(inventoryUseCase.getLowStockInventories()).rejects.toThrow(error);

      expect(mockInventoryRepository.getLowStockInventories).toHaveBeenCalled();
    });

    it('debería verificar que los inventarios tienen cantidad menor al mínimo', async () => {
      mockInventoryRepository.getLowStockInventories.mockResolvedValue(mockLowStockInventories as any);

      const result = await inventoryUseCase.getLowStockInventories();

      result.forEach((inventory) => {
        expect(inventory.quantity).toBeLessThan(inventory.minStock);
      });
    });
  });
});
