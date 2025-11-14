import { HttpStatus } from "../enums/HttpStatus";
import { AppError } from "./AppError";

export class SourceOrTargetStoreNotFoundError extends AppError {
  constructor(sourceStoreId: string, targetStoreId: string) {
    super(
      'source_or_target_store_not_found',
      'La tienda de origen o destino especificada no existe',
      HttpStatus.NOT_FOUND,
      {
        sourceStoreId,
        targetStoreId,
      }
    );
  }
}

/**
 * Error cuando la tienda no existe
 */
export class StoreNotFoundError extends AppError {
  constructor(storeId: string) {
    super(
      'store_not_found',
      'La tienda especificada no existe',
      HttpStatus.NOT_FOUND,
      {
        storeId,
      }
    );
  }
}

/**
 * Error cuando se intenta crear una tienda duplicada
 */
export class DuplicateStoreError extends AppError {
  constructor(name: string) {
    super(
      'duplicate_store',
      'Ya existe una tienda con este nombre',
      HttpStatus.CONFLICT,
      {
        name,
      }
    );
  }
}

/**
 * Error cuando los datos de la tienda son inválidos
 */
export class InvalidStoreDataError extends AppError {
  constructor(message: string, details?: any) {
    super(
      'invalid_store_data',
      message,
      HttpStatus.BAD_REQUEST,
      details
    );
  }
}

