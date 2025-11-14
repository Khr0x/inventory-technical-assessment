import { ProductInventory } from "./ProductInventory";

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  sku: string;
  inventories?: ProductInventory[]
  totalStock?: number;
  createdAt?: Date;
  updatedAt?: Date;
};