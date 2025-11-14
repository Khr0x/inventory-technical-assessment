import { InventoryMovementMapper } from '../../../infraestructure/mappers/InventoryMovementMapper';
import { InventoryMovementModel, MovementType } from '../../../infraestructure/db/models/InventoryMovementModel';
import { InventoryMovement } from '../../../domain/inventory/InventoryMovement';

describe('InventoryMovementMapper', () => {
  describe('mapModelToEntity', () => {
    it('debería mapear un InventoryMovementModel a InventoryMovement correctamente', () => {
      const mockMovementModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        sourceStoreId: '550e8400-e29b-41d4-a716-446655440003',
        targetStoreId: '550e8400-e29b-41d4-a716-446655440004',
        quantity: 50,
        type: MovementType.TRANSFER,
        timestamp: new Date('2024-01-15T10:00:00Z'),
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      } as any;

      const result = InventoryMovementMapper.mapModelToEntity(mockMovementModel);

      expect(result).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        sourceStoreId: '550e8400-e29b-41d4-a716-446655440003',
        targetStoreId: '550e8400-e29b-41d4-a716-446655440004',
        quantity: 50,
        type: MovementType.TRANSFER,
        timestamp: mockMovementModel.timestamp,
        createdAt: mockMovementModel.createdAt,
        updatedAt: mockMovementModel.updatedAt,
      });
    });

    it('debería convertir sourceStoreId null a string vacío', () => {
      const mockMovementModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        sourceStoreId: null,
        targetStoreId: '550e8400-e29b-41d4-a716-446655440004',
        quantity: 100,
        type: MovementType.IN,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      const result = InventoryMovementMapper.mapModelToEntity(mockMovementModel);

      expect(result.sourceStoreId).toBe('');
    });

    it('debería convertir targetStoreId null a string vacío', () => {
      const mockMovementModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        sourceStoreId: '550e8400-e29b-41d4-a716-446655440003',
        targetStoreId: null,
        quantity: 30,
        type: MovementType.OUT,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      const result = InventoryMovementMapper.mapModelToEntity(mockMovementModel);

      expect(result.targetStoreId).toBe('');
    });

    it('debería mapear correctamente un movimiento de tipo IN', () => {
      const mockMovementModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        sourceStoreId: null,
        targetStoreId: '550e8400-e29b-41d4-a716-446655440004',
        quantity: 200,
        type: MovementType.IN,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      const result = InventoryMovementMapper.mapModelToEntity(mockMovementModel);

      expect(result.type).toBe(MovementType.IN);
      expect(result.sourceStoreId).toBe('');
    });

    it('debería mapear correctamente un movimiento de tipo OUT', () => {
      const mockMovementModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        sourceStoreId: '550e8400-e29b-41d4-a716-446655440003',
        targetStoreId: null,
        quantity: 75,
        type: MovementType.OUT,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      const result = InventoryMovementMapper.mapModelToEntity(mockMovementModel);

      expect(result.type).toBe(MovementType.OUT);
      expect(result.targetStoreId).toBe('');
    });

    it('debería preservar todas las fechas correctamente', () => {
      const timestamp = new Date('2024-01-15T14:30:00Z');
      const createdAt = new Date('2024-01-15T14:30:00Z');
      const updatedAt = new Date('2024-01-20T10:00:00Z');

      const mockMovementModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        sourceStoreId: '550e8400-e29b-41d4-a716-446655440003',
        targetStoreId: '550e8400-e29b-41d4-a716-446655440004',
        quantity: 25,
        type: MovementType.TRANSFER,
        timestamp: timestamp,
        createdAt: createdAt,
        updatedAt: updatedAt,
      } as any;

      const result = InventoryMovementMapper.mapModelToEntity(mockMovementModel);

      expect(result.timestamp).toBe(timestamp);
      expect(result.createdAt).toBe(createdAt);
      expect(result.updatedAt).toBe(updatedAt);
    });

    it('debería mapear todos los campos obligatorios', () => {
      const mockMovementModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        sourceStoreId: '550e8400-e29b-41d4-a716-446655440003',
        targetStoreId: '550e8400-e29b-41d4-a716-446655440004',
        quantity: 15,
        type: MovementType.TRANSFER,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      const result = InventoryMovementMapper.mapModelToEntity(mockMovementModel);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('productId');
      expect(result).toHaveProperty('sourceStoreId');
      expect(result).toHaveProperty('targetStoreId');
      expect(result).toHaveProperty('quantity');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });

  describe('mapEntityToModel', () => {
    it('debería mapear un InventoryMovement a InventoryMovementModel correctamente', () => {
      const mockEntity: Partial<InventoryMovement> = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        sourceStoreId: '550e8400-e29b-41d4-a716-446655440003',
        targetStoreId: '550e8400-e29b-41d4-a716-446655440004',
        quantity: 50,
        type: MovementType.TRANSFER,
        timestamp: new Date('2024-01-15T10:00:00Z'),
      };

      const result = InventoryMovementMapper.mapEntityToModel(mockEntity);

      expect(result).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        sourceStoreId: '550e8400-e29b-41d4-a716-446655440003',
        targetStoreId: '550e8400-e29b-41d4-a716-446655440004',
        quantity: 50,
        type: MovementType.TRANSFER,
        timestamp: mockEntity.timestamp,
      });
    });

    it('debería convertir sourceStoreId vacío a undefined', () => {
      const mockEntity: Partial<InventoryMovement> = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        sourceStoreId: '',
        targetStoreId: '550e8400-e29b-41d4-a716-446655440004',
        quantity: 100,
        type: MovementType.IN,
        timestamp: new Date(),
      };

      const result = InventoryMovementMapper.mapEntityToModel(mockEntity);

      expect(result.sourceStoreId).toBeUndefined();
    });

    it('debería convertir targetStoreId vacío a undefined', () => {
      const mockEntity: Partial<InventoryMovement> = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        sourceStoreId: '550e8400-e29b-41d4-a716-446655440003',
        targetStoreId: '',
        quantity: 30,
        type: MovementType.OUT,
        timestamp: new Date(),
      };

      const result = InventoryMovementMapper.mapEntityToModel(mockEntity);

      expect(result.targetStoreId).toBeUndefined();
    });

    it('debería mapear correctamente un movimiento parcial', () => {
      const mockEntity: Partial<InventoryMovement> = {
        productId: '550e8400-e29b-41d4-a716-446655440002',
        quantity: 25,
        type: MovementType.TRANSFER,
      };

      const result = InventoryMovementMapper.mapEntityToModel(mockEntity);

      expect(result.productId).toBe('550e8400-e29b-41d4-a716-446655440002');
      expect(result.quantity).toBe(25);
      expect(result.type).toBe(MovementType.TRANSFER);
      expect(result.id).toBeUndefined();
      expect(result.timestamp).toBeUndefined();
    });

    it('debería preservar el timestamp cuando está presente', () => {
      const timestamp = new Date('2024-01-15T14:30:00Z');

      const mockEntity: Partial<InventoryMovement> = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        sourceStoreId: '550e8400-e29b-41d4-a716-446655440003',
        targetStoreId: '550e8400-e29b-41d4-a716-446655440004',
        quantity: 10,
        type: MovementType.TRANSFER,
        timestamp: timestamp,
      };

      const result = InventoryMovementMapper.mapEntityToModel(mockEntity);

      expect(result.timestamp).toBe(timestamp);
    });

    it('debería manejar entidad sin sourceStoreId y targetStoreId', () => {
      const mockEntity: Partial<InventoryMovement> = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        quantity: 40,
        type: MovementType.IN,
        timestamp: new Date(),
      };

      const result = InventoryMovementMapper.mapEntityToModel(mockEntity);

      expect(result.sourceStoreId).toBeUndefined();
      expect(result.targetStoreId).toBeUndefined();
    });

    it('debería mapear todos los campos cuando están presentes', () => {
      const mockEntity: Partial<InventoryMovement> = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        productId: '550e8400-e29b-41d4-a716-446655440002',
        sourceStoreId: '550e8400-e29b-41d4-a716-446655440003',
        targetStoreId: '550e8400-e29b-41d4-a716-446655440004',
        quantity: 60,
        type: MovementType.TRANSFER,
        timestamp: new Date(),
      };

      const result = InventoryMovementMapper.mapEntityToModel(mockEntity);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('productId');
      expect(result).toHaveProperty('sourceStoreId');
      expect(result).toHaveProperty('targetStoreId');
      expect(result).toHaveProperty('quantity');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('timestamp');
    });
  });
});
