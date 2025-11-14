import { InventoryMovementRepository } from '../../../infraestructure/repositories/InventoryMovementRepository';
import { InventoryMovementModel, MovementType } from '../../../infraestructure/db/models/InventoryMovementModel';
import { InventoryMovementMapper } from '../../../infraestructure/mappers/InventoryMovementMapper';
import { CreateMovementDTO } from '../../../domain/inventory/dto/InventoryDTO';

// Mock del modelo de Sequelize
jest.mock('../../../infraestructure/db/models/InventoryMovementModel', () => ({
  InventoryMovementModel: {
    create: jest.fn(),
  },
  MovementType: {
    IN: 'IN',
    OUT: 'OUT',
    TRANSFER: 'TRANSFER',
  },
}));

// Mock del mapper
jest.mock('../../../infraestructure/mappers/InventoryMovementMapper');

describe('InventoryMovementRepository', () => {
  let repository: InventoryMovementRepository;
  let mockCreate: jest.Mock;
  let mockMapModelToEntity: jest.Mock;

  beforeEach(() => {
    repository = new InventoryMovementRepository();
    mockCreate = InventoryMovementModel.create as jest.Mock;
    mockMapModelToEntity = InventoryMovementMapper.mapModelToEntity as jest.Mock;
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockMovementData: CreateMovementDTO = {
      productId: '550e8400-e29b-41d4-a716-446655440001',
      sourceStoreId: '550e8400-e29b-41d4-a716-446655440002',
      targetStoreId: '550e8400-e29b-41d4-a716-446655440003',
      quantity: 10,
      type: MovementType.TRANSFER,
      timestamp: new Date('2024-01-15T10:00:00Z'),
    };

    const mockModelResponse = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      productId: '550e8400-e29b-41d4-a716-446655440001',
      sourceStoreId: '550e8400-e29b-41d4-a716-446655440002',
      targetStoreId: '550e8400-e29b-41d4-a716-446655440003',
      quantity: 10,
      type: MovementType.TRANSFER,
      timestamp: new Date('2024-01-15T10:00:00Z'),
    };

    const mockEntityResponse = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      productId: '550e8400-e29b-41d4-a716-446655440001',
      sourceStoreId: '550e8400-e29b-41d4-a716-446655440002',
      targetStoreId: '550e8400-e29b-41d4-a716-446655440003',
      quantity: 10,
      type: MovementType.TRANSFER,
      timestamp: new Date('2024-01-15T10:00:00Z'),
    };

    it('debería crear un movimiento de inventario exitosamente', async () => {
      mockCreate.mockResolvedValue(mockModelResponse);
      mockMapModelToEntity.mockReturnValue(mockEntityResponse);

      const result = await repository.create(mockMovementData);

      expect(mockCreate).toHaveBeenCalledWith(
        {
          productId: mockMovementData.productId,
          sourceStoreId: mockMovementData.sourceStoreId,
          targetStoreId: mockMovementData.targetStoreId,
          quantity: mockMovementData.quantity,
          type: mockMovementData.type,
          timestamp: mockMovementData.timestamp,
        },
        { transaction: undefined }
      );
      expect(mockMapModelToEntity).toHaveBeenCalledWith(mockModelResponse);
      expect(result).toEqual(mockEntityResponse);
    });

    it('debería crear un movimiento con timestamp actual si no se proporciona', async () => {
      const movementWithoutTimestamp = { ...mockMovementData };
      delete movementWithoutTimestamp.timestamp;

      const mockDate = new Date('2024-01-20T15:30:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      mockCreate.mockResolvedValue(mockModelResponse);
      mockMapModelToEntity.mockReturnValue(mockEntityResponse);

      await repository.create(movementWithoutTimestamp);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: mockDate,
        }),
        { transaction: undefined }
      );

      jest.restoreAllMocks();
    });

    it('debería crear un movimiento con transacción cuando se proporciona', async () => {
      const mockTransaction = { id: 'tx-123' } as any;

      mockCreate.mockResolvedValue(mockModelResponse);
      mockMapModelToEntity.mockReturnValue(mockEntityResponse);

      await repository.create(mockMovementData, mockTransaction);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.any(Object),
        { transaction: mockTransaction }
      );
    });

    it('debería crear un movimiento de tipo INGRESO', async () => {
      const ingresoMovement: CreateMovementDTO = {
        ...mockMovementData,
        type: MovementType.IN,
        sourceStoreId: '550e8400-e29b-41d4-a716-446655440002',
      };

      mockCreate.mockResolvedValue({ ...mockModelResponse, type: MovementType.IN });
      mockMapModelToEntity.mockReturnValue({ ...mockEntityResponse, type: MovementType.IN });

      const result = await repository.create(ingresoMovement);

      expect(result.type).toBe(MovementType.IN);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MovementType.IN,
        }),
        { transaction: undefined }
      );
    });

    it('debería crear un movimiento de tipo EGRESO', async () => {
      const egresoMovement: CreateMovementDTO = {
        ...mockMovementData,
        type: MovementType.OUT,
        targetStoreId: '550e8400-e29b-41d4-a716-446655440003',
      };

      mockCreate.mockResolvedValue({ ...mockModelResponse, type: MovementType.OUT });
      mockMapModelToEntity.mockReturnValue({ ...mockEntityResponse, type: MovementType.OUT });

      const result = await repository.create(egresoMovement);

      expect(result.type).toBe(MovementType.OUT);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MovementType.OUT,
        }),
        { transaction: undefined }
      );
    });

    it('debería crear un movimiento de tipo TRANSFER completo', async () => {
      const transferMovement: CreateMovementDTO = {
        ...mockMovementData,
        type: MovementType.TRANSFER,
      };

      mockCreate.mockResolvedValue({ ...mockModelResponse, type: MovementType.TRANSFER });
      mockMapModelToEntity.mockReturnValue({ ...mockEntityResponse, type: MovementType.TRANSFER });

      const result = await repository.create(transferMovement);

      expect(result.type).toBe(MovementType.TRANSFER);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MovementType.TRANSFER,
        }),
        { transaction: undefined }
      );
    });

    it('debería lanzar un error cuando el tipo de movimiento es inválido', async () => {
      const invalidMovement: CreateMovementDTO = {
        ...mockMovementData,
        type: 'TIPO_INVALIDO' as any,
      };

      await expect(repository.create(invalidMovement)).rejects.toThrow(
        'Invalid movement type: TIPO_INVALIDO'
      );

      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockMapModelToEntity).not.toHaveBeenCalled();
    });

    it('debería lanzar un error si falla la creación en la base de datos', async () => {
      const dbError = new Error('Error de conexión a la base de datos');
      mockCreate.mockRejectedValue(dbError);

      await expect(repository.create(mockMovementData)).rejects.toThrow(
        'Error de conexión a la base de datos'
      );

      expect(mockCreate).toHaveBeenCalled();
      expect(mockMapModelToEntity).not.toHaveBeenCalled();
    });

    it('debería manejar cantidades grandes correctamente', async () => {
      const largeQuantityMovement: CreateMovementDTO = {
        ...mockMovementData,
        quantity: 999999,
      };

      mockCreate.mockResolvedValue({ ...mockModelResponse, quantity: 999999 });
      mockMapModelToEntity.mockReturnValue({ ...mockEntityResponse, quantity: 999999 });

      const result = await repository.create(largeQuantityMovement);

      expect(result.quantity).toBe(999999);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 999999,
        }),
        { transaction: undefined }
      );
    });

    it('debería manejar movimientos con sourceStoreId y targetStoreId iguales (TRASLADO interno)', async () => {
      const sameStoreMovement: CreateMovementDTO = {
        ...mockMovementData,
        sourceStoreId: '550e8400-e29b-41d4-a716-446655440004',
        targetStoreId: '550e8400-e29b-41d4-a716-446655440004',
      };

      mockCreate.mockResolvedValue({ 
        ...mockModelResponse, 
        sourceStoreId: '550e8400-e29b-41d4-a716-446655440004',
        targetStoreId: '550e8400-e29b-41d4-a716-446655440004',
      });
      mockMapModelToEntity.mockReturnValue({ 
        ...mockEntityResponse, 
        sourceStoreId: '550e8400-e29b-41d4-a716-446655440004',
        targetStoreId: '550e8400-e29b-41d4-a716-446655440004',
      });

      const result = await repository.create(sameStoreMovement);

      expect(result.sourceStoreId).toBe('550e8400-e29b-41d4-a716-446655440004');
      expect(result.targetStoreId).toBe('550e8400-e29b-41d4-a716-446655440004');
    });
  });
});
