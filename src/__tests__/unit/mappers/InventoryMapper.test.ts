import { InventoryMapper } from '../../../infraestructure/mappers/InventoryMapper';
import { InventoryModel } from '../../../infraestructure/db/models/InventoryModel';
import { StoreModel } from '../../../infraestructure/db/models/StoreModel';

describe('InventoryMapper', () => {
  describe('mapModelToEntity', () => {
    it('debería mapear un InventoryModel a Inventory correctamente', () => {
      const mockInventoryModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        storeId: '550e8400-e29b-41d4-a716-446655440003',
        quantity: 100,
        minStock: 10,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
        store: undefined,
      } as any;

      const result = InventoryMapper.mapModelToEntity(mockInventoryModel);

      expect(result).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        storeId: '550e8400-e29b-41d4-a716-446655440003',
        quantity: 100,
        minStock: 10,
        createdAt: mockInventoryModel.createdAt,
        updatedAt: mockInventoryModel.updatedAt,
        store: undefined,
      });
    });

    it('debería mapear correctamente cuando incluye la tienda', () => {
      const mockStoreModel = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Tienda Principal',
        location: 'Centro',
        createdAt: new Date('2024-01-10T08:00:00Z'),
        updatedAt: new Date('2024-01-10T08:00:00Z'),
      } as any;

      const mockInventoryModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        storeId: '550e8400-e29b-41d4-a716-446655440003',
        quantity: 50,
        minStock: 5,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
        store: mockStoreModel,
      } as any;

      const result = InventoryMapper.mapModelToEntity(mockInventoryModel);

      expect(result.store).toBeDefined();
      expect(result.store).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Tienda Principal',
        location: 'Centro',
        createdAt: mockStoreModel.createdAt,
        updatedAt: mockStoreModel.updatedAt,
      });
    });

    it('debería retornar store como undefined cuando no está incluido', () => {
      const mockInventoryModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        storeId: '550e8400-e29b-41d4-a716-446655440003',
        quantity: 75,
        minStock: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
        store: undefined,
      } as any;

      const result = InventoryMapper.mapModelToEntity(mockInventoryModel);

      expect(result.store).toBeUndefined();
    });

    it('debería preservar las fechas createdAt y updatedAt', () => {
      const createdDate = new Date('2024-01-10T08:30:00Z');
      const updatedDate = new Date('2024-01-20T15:45:00Z');

      const mockInventoryModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        storeId: '550e8400-e29b-41d4-a716-446655440003',
        quantity: 200,
        minStock: 20,
        createdAt: createdDate,
        updatedAt: updatedDate,
        store: undefined,
      } as any;

      const result = InventoryMapper.mapModelToEntity(mockInventoryModel);

      expect(result.createdAt).toBe(createdDate);
      expect(result.updatedAt).toBe(updatedDate);
    });

    it('debería mapear correctamente inventarios con cantidad cero', () => {
      const mockInventoryModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        storeId: '550e8400-e29b-41d4-a716-446655440003',
        quantity: 0,
        minStock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        store: undefined,
      } as any;

      const result = InventoryMapper.mapModelToEntity(mockInventoryModel);

      expect(result.quantity).toBe(0);
      expect(result.minStock).toBe(10);
    });

    it('debería mapear correctamente inventarios con cantidades grandes', () => {
      const mockInventoryModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        storeId: '550e8400-e29b-41d4-a716-446655440003',
        quantity: 999999,
        minStock: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
        store: undefined,
      } as any;

      const result = InventoryMapper.mapModelToEntity(mockInventoryModel);

      expect(result.quantity).toBe(999999);
      expect(result.minStock).toBe(1000);
    });

    it('debería mapear todos los campos obligatorios', () => {
      const mockInventoryModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        storeId: '550e8400-e29b-41d4-a716-446655440003',
        quantity: 50,
        minStock: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        store: undefined,
      } as any;

      const result = InventoryMapper.mapModelToEntity(mockInventoryModel);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('productId');
      expect(result).toHaveProperty('storeId');
      expect(result).toHaveProperty('quantity');
      expect(result).toHaveProperty('minStock');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      expect(result).toHaveProperty('store');
    });

    it('debería mapear correctamente cuando store es null', () => {
      const mockInventoryModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        storeId: '550e8400-e29b-41d4-a716-446655440003',
        quantity: 30,
        minStock: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        store: null,
      } as any;

      const result = InventoryMapper.mapModelToEntity(mockInventoryModel);

      expect(result.store).toBeUndefined();
    });

    it('debería mapear múltiples inventarios correctamente', () => {
      const inventories = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          productId: '550e8400-e29b-41d4-a716-446655440002',
          storeId: '550e8400-e29b-41d4-a716-446655440003',
          quantity: 100,
          minStock: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
          store: undefined,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440004',
          productId: '550e8400-e29b-41d4-a716-446655440005',
          storeId: '550e8400-e29b-41d4-a716-446655440006',
          quantity: 50,
          minStock: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
          store: undefined,
        },
      ];

      const results = inventories.map((inv) => InventoryMapper.mapModelToEntity(inv as any));

      expect(results).toHaveLength(2);
      expect(results[0].quantity).toBe(100);
      expect(results[1].quantity).toBe(50);
    });

    it('debería preservar los IDs exactos sin modificaciones', () => {
      const specificIds = {
        id: '550e8400-e29b-41d4-a716-446655440999',
        productId: '550e8400-e29b-41d4-a716-446655440888',
        storeId: '550e8400-e29b-41d4-a716-446655440777',
      };

      const mockInventoryModel = {
        ...specificIds,
        quantity: 25,
        minStock: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        store: undefined,
      } as any;

      const result = InventoryMapper.mapModelToEntity(mockInventoryModel);

      expect(result.id).toBe(specificIds.id);
      expect(result.productId).toBe(specificIds.productId);
      expect(result.storeId).toBe(specificIds.storeId);
    });
  });
});
