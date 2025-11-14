import { Op, Transaction } from 'sequelize';
import { InventoryModel } from '../db/models/InventoryModel';
import { Inventory } from '../../domain/inventory/Inventory';
import { InventoryRepositoryPort } from '../../domain/inventory/ports/InventoryRepositoryPort';
import { InventoryMapper } from '../mappers/InventoryMapper';
import { CreateInventoryDTO, CreateMovementDTO, UpdateQuantityDTO } from '../../domain/inventory/dto/InventoryDTO';
import { StoreModel } from '../db/models/StoreModel';
import { sequelize } from '../db/sequalize';
import { 
  InsufficientInventoryError, 
  InventoryNotFoundError 
} from '../../errors';



export class InventoryRepository implements InventoryRepositoryPort {

  async findByStore(storeId: string, tx?: Transaction): Promise<Inventory[]> {
    try {
        const rows = await InventoryModel.findAll({
            where: { storeId },
            include: [
                {
                    model: StoreModel,
                    as: 'store',
                }
            ],
            transaction: tx,
            lock: tx ? (tx as any).LOCK.UPDATE : undefined,
        });
        return rows.length > 0 ? rows.map((x) => InventoryMapper.mapModelToEntity(x)) : [];
    } catch (error) {
        throw error;
    }
  }

  async create(inventory: CreateInventoryDTO, tx?: Transaction): Promise<Inventory> {
    try {
        const raw = await InventoryModel.create(
            {
                productId: inventory.productId,
                storeId: inventory.storeId,
                quantity: inventory.quantity,
                minStock: inventory.minStock,
            } as any,
            { transaction: tx }
        );
        return InventoryMapper.mapModelToEntity(raw);
    } catch (error) {
        throw error;
    }
  }

  async transfer(data: UpdateQuantityDTO, tx?: any): Promise<Inventory> {
      try {
            let raw: InventoryModel | null;
            raw = await InventoryModel.findOne({
                where: {
                    productId: data.productId,
                    storeId: data.sourceStoreId,
                },
                transaction: tx,
                lock: tx ? (tx as any).LOCK.UPDATE : undefined,
            });
            if (!raw) {
                throw new InventoryNotFoundError(data.productId, data.sourceStoreId);
            }
            if(raw.quantity < data.quantity) {
                throw new InsufficientInventoryError(data.quantity, raw.quantity);
            }

            await raw.update(
                {
                    quantity: raw.quantity - data.quantity,
                    updatedAt: new Date(),
                } as any,
                { transaction: tx }
            );

            const targetRaw = await InventoryModel.findOne({
                where: {
                    productId: data.productId,
                    storeId: data.targetStoreId,
                },
                transaction: tx,
                lock: tx ? (tx as any).LOCK.UPDATE : undefined,
            });

            if (!targetRaw) {
                this.create({
                    productId: data.productId,
                    storeId: data.targetStoreId,
                    quantity: data.quantity,
                    minStock: data.minStock || 0,
                }, tx);
                return InventoryMapper.mapModelToEntity(raw);
            } else {
              await targetRaw.update(
                {
                    quantity: targetRaw.quantity + data.quantity,
                    updatedAt: new Date(),
                } as any,
                { transaction: tx }
              );
            }
            return InventoryMapper.mapModelToEntity(raw);
      } catch (error) {
        throw error;
      }
  }

  async getLowStockInventories(tx?: any): Promise<Inventory[]> {
      try {
            const rows = await InventoryModel.findAll({
                where: {
                    quantity: {
                        [Op.lt]: sequelize.col('minStock'),
                    },
                },
                include: [
                    {
                        model: StoreModel,
                        as: 'store',
                    }
                ],
                transaction: tx,
                lock: tx ? (tx as any).LOCK.UPDATE : undefined,
            });
            return rows.length > 0 ? rows.map((x) => InventoryMapper.mapModelToEntity(x)) : [];
      } catch (error) {
        throw error;
      }
  }

}