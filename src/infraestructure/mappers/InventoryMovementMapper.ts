import { InventoryMovement } from '../../domain/inventory/InventoryMovement';
import { InventoryMovementModel } from '../db/models/InventoryMovementModel';

export class InventoryMovementMapper {
  static mapModelToEntity(model: InventoryMovementModel): InventoryMovement {
    return {
      id: model.id,
      productId: model.productId,
      sourceStoreId: model.sourceStoreId || '',
      targetStoreId: model.targetStoreId || '',
      quantity: model.quantity,
      type: model.type,
      timestamp: model.timestamp,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }

  static mapEntityToModel(entity: Partial<InventoryMovement>): Partial<InventoryMovementModel> {
    return {
      id: entity.id,
      productId: entity.productId,
      sourceStoreId: entity.sourceStoreId || undefined,
      targetStoreId: entity.targetStoreId || undefined,
      quantity: entity.quantity,
      type: entity.type,
      timestamp: entity.timestamp,
    };
  }
}
