import { CreateMovementDTO } from '../dto/InventoryDTO';
import { InventoryMovement } from '../InventoryMovement';



export interface InventoryMovementRepositoryPort {
  create(movement: CreateMovementDTO, tx?: any): Promise<InventoryMovement>;
}
