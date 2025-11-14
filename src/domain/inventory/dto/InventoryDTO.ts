import { MovementType } from "../InventoryMovement";

export interface CreateInventoryDTO {
  productId: string;
  storeId: string;
  quantity: number;
  minStock: number;
}

export interface CreateMovementDTO {
  productId: string;
  sourceStoreId: string;
  targetStoreId: string;
  quantity: number;
  type: MovementType;
  minStock?: number;
  timestamp?: Date;
}

export interface UpdateQuantityDTO {
  productId: string, 
  sourceStoreId: string, 
  targetStoreId: string,
  quantity: number,
  minStock?: number;
}