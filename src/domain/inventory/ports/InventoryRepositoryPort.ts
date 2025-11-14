import { CreateInventoryDTO, UpdateQuantityDTO } from "../dto/InventoryDTO";
import { Inventory } from "../Inventory";

export interface InventoryRepositoryPort {
  findByStore(storeId: string, tx?: any): Promise<Inventory[]>;
  create(inventory: CreateInventoryDTO, tx?: any): Promise<Inventory>;
  transfer(data: UpdateQuantityDTO, tx?: any): Promise<Inventory>;
  getLowStockInventories(tx?: any): Promise<Inventory[]>;
}