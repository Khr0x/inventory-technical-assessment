import { CreateStoreDTO } from "../../domain/store/dto/StoreDTO";
import { HttpStatus } from "../../enums/HttpStatus";
import { StoreRepository } from "../../infraestructure/repositories/StoreRepository";
import { StoreUseCase } from "../use-cases/StoreUseCase";
import { Request, Response } from 'express';
import { 
  AppError, 
  StoreNotFoundError, 
  InvalidStoreDataError 
} from "../../errors";

export class StoreController {
  private storeUseCase: StoreUseCase;

  constructor() {
    const storeRepository = new StoreRepository();
    this.storeUseCase = new StoreUseCase(storeRepository);
  }

  async createStore(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateStoreDTO;

      if (!data.name || !data.location) {
        throw new InvalidStoreDataError('Nombre y ubicación son obligatorios');
      }

      const result = await this.storeUseCase.createStore(data);

      res.status(HttpStatus.CREATED).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(error.toJSON());
      } else {
        console.error('Unexpected error in createStore:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'Internal server error',
          message: 'Ha ocurrido un error interno del servidor'
        });
      }
    }
  }

  async getStoreById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const store = await this.storeUseCase.getStoreById(id);

      if (!store) {
        throw new StoreNotFoundError(id);
      }

      res.status(HttpStatus.OK).json(store);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(error.toJSON());
      } else {
        console.error('Unexpected error in getStoreById:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'Internal server error',
          message: 'Ha ocurrido un error interno del servidor'
        });
      }
    }
  }

async getAllStores(req: Request, res: Response): Promise<void> {
    try {
      const stores = await this.storeUseCase.getAllStores();
      res.status(HttpStatus.OK).json(stores);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(error.toJSON());
      } else {
        console.error('Unexpected error in getAllStores:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'Internal server error',
          message: 'Ha ocurrido un error interno del servidor'
        });
      }
    }
  }

}