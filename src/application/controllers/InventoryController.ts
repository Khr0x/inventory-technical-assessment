import { CreateInventoryDTO, CreateMovementDTO } from "../../domain/inventory/dto/InventoryDTO";
import { HttpStatus } from "../../enums/HttpStatus";
import { InventoryMovementRepository } from "../../infraestructure/repositories/InventoryMovementRepository";
import { InventoryRepository } from "../../infraestructure/repositories/InventoryRepository";
import { StoreRepository } from "../../infraestructure/repositories/StoreRepository";
import { InventoryUseCase } from "../use-cases/InventoryUseCase";
import { Request, Response } from 'express';
import { 
  AppError,
  NoInventoriesForStoreError, 
  NoLowStockInventoriesError
} from "../../errors";
import { ProductRepository } from "../../infraestructure/repositories/ProductRepository";

export class InventoryController {
    private inventoryUseCase: InventoryUseCase
    
    constructor() {
        const inventoryRepository = new InventoryRepository();
        const inventoryMovementRepository = new InventoryMovementRepository();
        const storeRepository = new StoreRepository();
        const productRepository = new ProductRepository();
        this.inventoryUseCase = new InventoryUseCase(inventoryRepository, inventoryMovementRepository, storeRepository, productRepository);
    }
        
    async getInventoriesByStore(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const inventories = await this.inventoryUseCase.getInventoriesByStore(id);
            if(inventories.length <= 0){
                throw new NoInventoriesForStoreError(id);
            }
            res.status(HttpStatus.OK).json(inventories);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json(error.toJSON());
            } else {
                console.error('Unexpected error in getInventoriesByStore:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    error: 'Internal server error',
                    message: 'Ha ocurrido un error interno del servidor'
                });
            }
        }
    }

    async transferInventory(req: Request, res: Response): Promise<void> {
        try {
            let data = req.body as CreateMovementDTO;
            data.timestamp = new Date();
            const updatedInventory = await this.inventoryUseCase.transferInventory(data);
            res.status(HttpStatus.OK).json(updatedInventory);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json(error.toJSON());
            } else {
                console.error('Unexpected error in transferInventory:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    error: 'Internal server error',
                    message: 'Ha ocurrido un error interno del servidor'
                });
            }
        }
    }

    async getLowStockInventories(req: Request, res: Response): Promise<void> {
        try {
           const lowStockInventories = await this.inventoryUseCase.getLowStockInventories();
              if(lowStockInventories.length <= 0){
                throw new NoLowStockInventoriesError();
              }
              res.status(HttpStatus.OK).json(lowStockInventories);  
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json(error.toJSON());
            } else {
                console.error('Unexpected error in getLowStockInventories:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    error: 'Internal server error',
                    message: 'Ha ocurrido un error interno del servidor'
                });
            }
        }
    }

}