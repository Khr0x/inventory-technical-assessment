import { da } from "zod/v4/locales";
import { CreateInventoryDTO, CreateMovementDTO } from "../../domain/inventory/dto/InventoryDTO";
import { Inventory } from "../../domain/inventory/Inventory";
import { InvalidQuantityError, NoLowStockInventoriesError, ProductNotFoundError, SameStoreTransferError } from "../../errors";
import { SourceOrTargetStoreNotFoundError, StoreNotFoundError } from "../../errors/StoreErrors";
import { sequelize } from "../../infraestructure/db/sequalize";
import { InventoryMovementRepository } from "../../infraestructure/repositories/InventoryMovementRepository";
import { InventoryRepository } from "../../infraestructure/repositories/InventoryRepository";
import { ProductRepository } from "../../infraestructure/repositories/ProductRepository";
import { StoreRepository } from "../../infraestructure/repositories/StoreRepository";

export class InventoryUseCase {
     constructor(
      private inventoryRepository: InventoryRepository,
      private inventoryMovementRepository: InventoryMovementRepository,
      private storeRepository: StoreRepository,
      private productRepository: ProductRepository
    ) {}

  async createInventory(data: CreateInventoryDTO): Promise<Inventory> {
    const tx = await sequelize.transaction();
    try {
      const store = await this.storeRepository.findById(data.storeId);
      if (!store) {
        throw new StoreNotFoundError(data.storeId);
      }
      const product = await this.productRepository.findById(data.productId);
      if (!product) {
        throw new ProductNotFoundError(data.productId);
      }
      const inventory = await this.inventoryRepository.create(data, tx);
      await tx.commit();
      return inventory;
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  async getInventoriesByStore(storeId: string): Promise<Inventory[]> {
    try {
      const store = await this.storeRepository.findById(storeId);
      if (!store) {
        throw new StoreNotFoundError(storeId);
      }
      return await this.inventoryRepository.findByStore(storeId);
    } catch (error) {
      throw error;
    }
  }

  async transferInventory(data: CreateMovementDTO): Promise<Inventory> {
    const tx = await sequelize.transaction();
    try {
      if(data.sourceStoreId === data.targetStoreId){
        throw new SameStoreTransferError(data.sourceStoreId);
      }
      if(data.quantity <= 0){
        throw new InvalidQuantityError(data.quantity);
      }
      const storesExist = await this.storeRepository.existsAll([data.sourceStoreId, data.targetStoreId]);
      if (!storesExist) {
        throw new SourceOrTargetStoreNotFoundError(data.sourceStoreId, data.targetStoreId);
      }
      const product = await this.productRepository.findById(data.productId);
      if (!product) {
        throw new ProductNotFoundError(data.productId);
      }
      const updatedInventory = await this.inventoryRepository.transfer(
        {
          productId: data.productId,
          sourceStoreId: data.sourceStoreId,
          targetStoreId: data.targetStoreId,
          quantity: data.quantity,
          minStock: data.minStock
        },
        tx
      );
      await this.inventoryMovementRepository.create(data, tx);
      await tx.commit();
      return updatedInventory;
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  async getLowStockInventories(): Promise<Inventory[]> {
    try {
      const inventories = await this.inventoryRepository.getLowStockInventories();
      if (inventories.length <= 0) {
          throw new NoLowStockInventoriesError();
      }
      return inventories;
    } catch (error) {
      throw error;
    }
  }
}