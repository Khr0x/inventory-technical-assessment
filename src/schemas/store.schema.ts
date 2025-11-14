import { z } from 'zod';

/**
 * Schema de validación para CreateStoreDTO
 */
export const createStoreSchema = z.object({
  name: z.string().min(1, { message: 'name is required and cannot be empty' }).max(255),
  location: z.string().min(1, { message: 'location is required and cannot be empty' }).max(255),
});

/**
 * Schema de validación para el parámetro ID de Store
 */
export const storeIdParamSchema = z.object({
  id: z.string().uuid({ message: 'id must be a valid UUID'}),
});
