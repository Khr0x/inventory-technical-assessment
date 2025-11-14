import { z } from 'zod';

/**
 * Schema de validación para createProductInventoryDTO
 */
const createProductInventorySchema = z.object({
  storeId: z.string().uuid({ message: 'storeId must be a valid UUID' }),
  quantity: z.number().int().min(0, { message: 'quantity must be a non-negative integer' }),
  minStock: z.number().int().min(0, { message: 'minStock must be a non-negative integer' }),
});

/**
 * Schema de validación para CreateProductDTO
 */
export const createProductSchema = z.object({
  name: z.string().min(1, { message: 'name is required and cannot be empty' }).max(255),
  description: z.string().min(1, { message: 'description is required and cannot be empty' }),
  category: z.string().min(1, { message: 'category is required and cannot be empty' }).max(100),
  price: z.number().positive({ message: 'price must be a positive number' }),
  sku: z.string().min(1, { message: 'sku is required and cannot be empty' }).max(100),
  inventory: createProductInventorySchema,
});

/**
 * Schema de validación para UpdateProductDTO
 */
export const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  category: z.string().min(1).max(100).optional(),
  price: z.number().positive().optional(),
  sku: z.string().min(1).max(100).optional(),
});
