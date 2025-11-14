import { InventoryRepository } from '../../../infraestructure/repositories/InventoryRepository';
import { InventoryModel } from '../../../infraestructure/db/models/InventoryModel';
import { StoreModel } from '../../../infraestructure/db/models/StoreModel';
import { InventoryMapper } from '../../../infraestructure/mappers/InventoryMapper';
import { InsufficientInventoryError, InventoryNotFoundError } from '../../../errors';

jest.mock('../../../infraestructure/db/models/InventoryModel');
jest.mock('../../../infraestructure/db/models/StoreModel');
jest.mock('../../../infraestructure/mappers/InventoryMapper');
jest.mock('../../../infraestructure/db/sequalize', () => ({
  sequelize: {
    col: jest.fn((column: string) => column),
  },
}));

describe('InventoryRepository', () => {
  let inventoryRepository: InventoryRepository;
  let mockTransaction: any;

  beforeEach(() => {
    inventoryRepository = new InventoryRepository();
    mockTransaction = { LOCK: { UPDATE: 'UPDATE' } };
    jest.clearAllMocks();
  });

  describe('findByStore', () => {
    it('debería encontrar inventarios por tienda', async () => {
      const storeId = 'store-123';
      const mockInventories = [
        {
          id: 'inv-1',
          productId: 'prod-1',
          storeId: storeId,
          quantity: 50,
          minStock: 10,
          store: { id: storeId, name: 'Tienda 1' },
        },
        {
          id: 'inv-2',
          productId: 'prod-2',
          storeId: storeId,
          quantity: 30,
          minStock: 5,
          store: { id: storeId, name: 'Tienda 1' },
        },
      ];

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

      (InventoryModel.findAll as jest.Mock).mockResolvedValue(mockInventories);
      (InventoryMapper.mapModelToEntity as jest.Mock)
        .mockReturnValueOnce(expectedInventories[0])
        .mockReturnValueOnce(expectedInventories[1]);

      const result = await inventoryRepository.findByStore(storeId, mockTransaction);

      expect(InventoryModel.findAll).toHaveBeenCalledWith({
        where: { storeId },
        include: [
          {
            model: StoreModel,
            as: 'store',
          },
        ],
        transaction: mockTransaction,
        lock: mockTransaction.LOCK.UPDATE,
      });
      expect(result).toEqual(expectedInventories);
      expect(result).toHaveLength(2);
    });

    it('debería retornar array vacío cuando no hay inventarios', async () => {
      const storeId = 'store-999';

      (InventoryModel.findAll as jest.Mock).mockResolvedValue([]);

      const result = await inventoryRepository.findByStore(storeId);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('debería lanzar un error si falla la búsqueda', async () => {
      const storeId = 'store-123';
      const error = new Error('Error de base de datos');

      (InventoryModel.findAll as jest.Mock).mockRejectedValue(error);

      await expect(inventoryRepository.findByStore(storeId)).rejects.toThrow(error);
    });
  });

  describe('create', () => {
    it('debería crear un inventario exitosamente', async () => {
      const inventoryData = {
        productId: 'prod-123',
        storeId: 'store-123',
        quantity: 100,
        minStock: 20,
      };

      const mockInventoryModel = {
        id: 'inv-123',
        productId: inventoryData.productId,
        storeId: inventoryData.storeId,
        quantity: inventoryData.quantity,
        minStock: inventoryData.minStock,
      };

      const expectedInventory = {
        id: 'inv-123',
        productId: inventoryData.productId,
        storeId: inventoryData.storeId,
        quantity: inventoryData.quantity,
        minStock: inventoryData.minStock,
      };

      (InventoryModel.create as jest.Mock).mockResolvedValue(mockInventoryModel);
      (InventoryMapper.mapModelToEntity as jest.Mock).mockReturnValue(expectedInventory);

      const result = await inventoryRepository.create(inventoryData, mockTransaction);

      expect(InventoryModel.create).toHaveBeenCalledWith(
        {
          productId: inventoryData.productId,
          storeId: inventoryData.storeId,
          quantity: inventoryData.quantity,
          minStock: inventoryData.minStock,
        },
        { transaction: mockTransaction }
      );
      expect(result).toEqual(expectedInventory);
    });

    it('debería lanzar un error si falla la creación', async () => {
      const inventoryData = {
        productId: 'prod-123',
        storeId: 'store-123',
        quantity: 100,
        minStock: 20,
      };

      const error = new Error('Error de base de datos');
      (InventoryModel.create as jest.Mock).mockRejectedValue(error);

      await expect(inventoryRepository.create(inventoryData)).rejects.toThrow(error);
    });
  });

  describe('transfer', () => {
    it('debería transferir inventario exitosamente cuando la tienda destino existe', async () => {
      const transferData = {
        productId: 'prod-123',
        sourceStoreId: 'store-1',
        targetStoreId: 'store-2',
        quantity: 10,
        minStock: 5,
      };

      const mockSourceInventory = {
        id: 'inv-source',
        productId: transferData.productId,
        storeId: transferData.sourceStoreId,
        quantity: 50,
        minStock: 5,
        update: jest.fn().mockResolvedValue(true),
      };

      const mockTargetInventory = {
        id: 'inv-target',
        productId: transferData.productId,
        storeId: transferData.targetStoreId,
        quantity: 30,
        minStock: 5,
        update: jest.fn().mockResolvedValue(true),
      };

      const expectedInventory = {
        id: 'inv-source',
        productId: transferData.productId,
        storeId: transferData.sourceStoreId,
        quantity: 40,
        minStock: 5,
      };

      (InventoryModel.findOne as jest.Mock)
        .mockResolvedValueOnce(mockSourceInventory)
        .mockResolvedValueOnce(mockTargetInventory);

      (InventoryMapper.mapModelToEntity as jest.Mock).mockReturnValue(expectedInventory);

      const result = await inventoryRepository.transfer(transferData, mockTransaction);

      expect(mockSourceInventory.update).toHaveBeenCalledWith(
        {
          quantity: 40,
          updatedAt: expect.any(Date),
        },
        { transaction: mockTransaction }
      );

      expect(mockTargetInventory.update).toHaveBeenCalledWith(
        {
          quantity: 40,
          updatedAt: expect.any(Date),
        },
        { transaction: mockTransaction }
      );

      expect(result).toEqual(expectedInventory);
    });

    it('debería lanzar InventoryNotFoundError cuando no existe el inventario origen', async () => {
      const transferData = {
        productId: 'prod-123',
        sourceStoreId: 'store-1',
        targetStoreId: 'store-2',
        quantity: 10,
        minStock: 5,
      };

      (InventoryModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(inventoryRepository.transfer(transferData)).rejects.toThrow(InventoryNotFoundError);
    });

    it('debería lanzar InsufficientInventoryError cuando no hay suficiente cantidad', async () => {
      const transferData = {
        productId: 'prod-123',
        sourceStoreId: 'store-1',
        targetStoreId: 'store-2',
        quantity: 100,
        minStock: 5,
      };

      const mockSourceInventory = {
        id: 'inv-source',
        productId: transferData.productId,
        storeId: transferData.sourceStoreId,
        quantity: 50,
        minStock: 5,
        update: jest.fn(),
      };

      (InventoryModel.findOne as jest.Mock).mockResolvedValue(mockSourceInventory);

      await expect(inventoryRepository.transfer(transferData)).rejects.toThrow(InsufficientInventoryError);
    });
  });

  describe('getLowStockInventories', () => {
    it('debería obtener inventarios con stock bajo', async () => {
      const mockInventories = [
        {
          id: 'inv-1',
          productId: 'prod-1',
          storeId: 'store-1',
          quantity: 3,
          minStock: 10,
          store: { id: 'store-1', name: 'Tienda 1' },
        },
        {
          id: 'inv-2',
          productId: 'prod-2',
          storeId: 'store-2',
          quantity: 5,
          minStock: 20,
          store: { id: 'store-2', name: 'Tienda 2' },
        },
      ];

      const expectedInventories = [
        {
          id: 'inv-1',
          productId: 'prod-1',
          storeId: 'store-1',
          quantity: 3,
          minStock: 10,
        },
        {
          id: 'inv-2',
          productId: 'prod-2',
          storeId: 'store-2',
          quantity: 5,
          minStock: 20,
        },
      ];

      (InventoryModel.findAll as jest.Mock).mockResolvedValue(mockInventories);
      (InventoryMapper.mapModelToEntity as jest.Mock)
        .mockReturnValueOnce(expectedInventories[0])
        .mockReturnValueOnce(expectedInventories[1]);

      const result = await inventoryRepository.getLowStockInventories(mockTransaction);

      expect(InventoryModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: [
            {
              model: StoreModel,
              as: 'store',
            },
          ],
          transaction: mockTransaction,
          lock: mockTransaction.LOCK.UPDATE,
        })
      );
      expect(result).toEqual(expectedInventories);
      expect(result).toHaveLength(2);
    });

    it('debería retornar array vacío cuando no hay inventarios con stock bajo', async () => {
      (InventoryModel.findAll as jest.Mock).mockResolvedValue([]);

      const result = await inventoryRepository.getLowStockInventories();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('debería lanzar un error si falla la búsqueda', async () => {
      const error = new Error('Error de base de datos');

      (InventoryModel.findAll as jest.Mock).mockRejectedValue(error);

      await expect(inventoryRepository.getLowStockInventories()).rejects.toThrow(error);
    });
  });
});
