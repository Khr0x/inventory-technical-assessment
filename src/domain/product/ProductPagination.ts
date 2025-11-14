import { Product } from "./Product";

export interface ProductPagination {
  rows: Product[]; 
  count: number; 
}