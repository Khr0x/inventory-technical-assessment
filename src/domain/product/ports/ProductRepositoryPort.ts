import { CreateProductDTO, UpdateProductDTO } from "../dto/ProductDTO";
import { Product } from "../Product";

export type ProductFilter = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  includeInventory?: boolean;
  storeId?: string;
};

export type Pagination = { limit?: number; offset?: number };

export interface ProductRepositoryPort {
  create(data: CreateProductDTO, tx?: any): Promise<Product>;
  update(id: string, data: UpdateProductDTO, tx?: any): Promise<Product | null>;
  findAll(filter?: ProductFilter, pagination?: Pagination): Promise<{ rows: Product[]; count: number }>;
  findById(id: string): Promise<Product | null>;
  delete(id: string, tx?: any): Promise<boolean>;
  findBySku(sku: string): Promise<Product | null>;
  getProductMovements(productId: string): Promise<any[]>;
}