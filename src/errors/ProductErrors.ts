import { HttpStatus } from "../enums/HttpStatus";
import { AppError } from "./AppError";

/**
 * Error cuando el producto no existe
 */
export class ProductNotFoundError extends AppError {
  constructor(productId: string) {
    super(
      'product_not_found',
      'El producto especificado no existe',
      HttpStatus.NOT_FOUND,
      {
        productId,
      }
    );
  }
}

export class DuplicateProductError extends AppError {
  constructor(sku: string) {
    super(
      'duplicate_product',
      'Ya existe un producto con este SKU',
      HttpStatus.CONFLICT,
      {
        sku,
      }
    );
  }
}

export class InactiveProductError extends AppError {
  constructor(productId: string) {
    super(
      'inactive_product',
      'No se puede actualizar un producto inactivo',
      HttpStatus.BAD_REQUEST,
      {
        productId,
      }
    );
  }
}
