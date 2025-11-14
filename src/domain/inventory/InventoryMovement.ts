export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  TRANSFER = 'TRANSFER',
}

export interface InventoryMovement {
  id: string;
  productId: string;
  sourceStoreId: string;
  targetStoreId: string;
  quantity: number;
  type: MovementType;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
