import { Inventory } from "../../domain/inventory/Inventory";
import { InventoryModel } from "../db/models/InventoryModel";
import { StoreMapper } from "./StoreMapper";

export class InventoryMapper {
    static mapModelToEntity(m: InventoryModel): Inventory {
      return {
        id: m.id,
        productId: m.productId,
        storeId: m.storeId,
        quantity: m.quantity,
        updatedAt: m.updatedAt,
        createdAt: m.createdAt,
        minStock: m.minStock,
        store: m.store ? StoreMapper.mapModelToEntity(m.store) : undefined
      };
    }
}