import { parse } from "node:path";
import { Product } from "../../domain/product/Product";
import { ProductModel } from "../db/models/ProductModel";

export class ProductMapper {
  static mapModelToEntity(raw: ProductModel): Product {
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      category: raw.category,
      price: parseFloat(raw.price as any),
      sku: raw.sku,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  static mapModelToEntityFind(raw: ProductModel | null ): Product | null {
    if(!raw) return null;
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      category: raw.category,
      price: parseFloat(raw.price as any),
      sku: raw.sku,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    }
  }
}