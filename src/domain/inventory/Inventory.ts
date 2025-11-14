import { Store } from "../store/Store";

export type Inventory = {
  id: string;
  productId: string;
  storeId: string;
  quantity: number;
  minStock: number;
  createdAt?: Date;
  updatedAt?: Date;
  store?: Store;
};