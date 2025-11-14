import { AppError } from './AppError';
import { HttpStatus } from '../enums/HttpStatus';

/**
 * Error cuando no hay suficiente inventario para realizar una operación
 */
export class InsufficientInventoryError extends AppError {
  constructor(requested: number, available: number, message?: string) {
    super(
      'insufficient_inventory',
      message || 'La tienda origen no tiene suficiente inventario para realizar la transferencia',
      HttpStatus.BAD_REQUEST,
      {
        requested,
        available,
      }
    );
  }
}

/**
 * Error cuando no se encuentra un inventario
 */
export class InventoryNotFoundError extends AppError {
  constructor(productId?: string, storeId?: string) {
    super(
      'inventory_not_found',
      'El inventario solicitado no existe',
      HttpStatus.NOT_FOUND,
      {
        ...(productId && { productId }),
        ...(storeId && { storeId }),
      }
    );
  }
}


/**
 * Error cuando se intenta transferir inventario entre la misma tienda
 */
export class SameStoreTransferError extends AppError {
  constructor(storeId: string) {
    super(
      'invalid_transfer',
      'No se puede transferir inventario a la misma tienda',
      HttpStatus.BAD_REQUEST,
      {
        storeId,
      }
    );
  }
}

/**
 * Error cuando la cantidad es inválida
 */
export class InvalidQuantityError extends AppError {
  constructor(quantity: number, reason?: string) {
    super(
      'invalid_quantity',
      reason || 'La cantidad debe ser un número positivo',
      HttpStatus.BAD_REQUEST,
      {
        quantity,
      }
    );
  }
}

/**
 * Error cuando no hay inventarios con stock bajo
 */
export class NoLowStockInventoriesError extends AppError {
  constructor() {
    super(
      'no_low_stock_inventories',
      'No se encontraron inventarios con stock bajo',
      HttpStatus.NOT_FOUND
    );
  }
}

/**
 * Error cuando no hay inventarios para una tienda
 */
export class NoInventoriesForStoreError extends AppError {
  constructor(storeId: string) {
    super(
      'no_inventories_for_store',
      'No se encontraron inventarios para la tienda especificada',
      HttpStatus.NOT_FOUND,
      {
        storeId,
      }
    );
  }
}
