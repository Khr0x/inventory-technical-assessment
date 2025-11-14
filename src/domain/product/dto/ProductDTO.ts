export interface createProductInventoryDTO {
  storeId: string;
  quantity: number;
  minStock: number;
}

export interface CreateProductDTO {
  name: string;
  description: string;
  category: string;
  price: number;
  sku: string;
  inventory: createProductInventoryDTO;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  sku?: string;
}