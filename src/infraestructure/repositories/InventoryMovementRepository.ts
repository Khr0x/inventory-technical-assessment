import { Transaction, Op } from 'sequelize';
import { InventoryMovementModel, MovementType } from '../db/models/InventoryMovementModel';
import { InventoryMovement } from '../../domain/inventory/InventoryMovement';
import { 
  InventoryMovementRepositoryPort
} from '../../domain/inventory/ports/InventoryMovementRepositoryPort';
import { InventoryMovementMapper } from '../mappers/InventoryMovementMapper';
import { CreateMovementDTO } from '../../domain/inventory/dto/InventoryDTO';

export class InventoryMovementRepository implements InventoryMovementRepositoryPort {
  
  async create(movement: CreateMovementDTO, tx?: Transaction): Promise<InventoryMovement> {
    try {
      if(!Object.values(MovementType).includes(movement.type as MovementType)) {
        throw new Error(`Invalid movement type: ${movement.type}. Valid types are: ${Object.values(MovementType).join(', ')}`);
      }
      const row = await InventoryMovementModel.create(
        {
          productId: movement.productId,
          sourceStoreId: movement.sourceStoreId,
          targetStoreId: movement.targetStoreId,
          quantity: movement.quantity,
          type: movement.type,
          timestamp: movement.timestamp || new Date(),
        } as any,
        { transaction: tx }
      );
      return InventoryMovementMapper.mapModelToEntity(row);
    } catch (error) {
      throw error;
    }
  }
}
