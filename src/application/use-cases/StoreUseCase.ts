import { CreateStoreDTO } from "../../domain/store/dto/StoreDTO";
import { Store } from "../../domain/store/Store";
import { sequelize } from "../../infraestructure/db/sequalize";
import { StoreRepository } from "../../infraestructure/repositories/StoreRepository";

export class StoreUseCase {
  constructor(private storeRepository: StoreRepository) {}

  async createStore(data: CreateStoreDTO): Promise<Store> {
     const tx = await sequelize.transaction();
    try {
        const store = await this.storeRepository.create(data, tx);
        await tx.commit();
        return store;
    } catch (error) {
        await tx.rollback();
        throw error;
    }
   
   
  }

  async getStoreById(id: string): Promise<Store | null> {
    try {
        return await this.storeRepository.findById(id);
    } catch (error) {
        throw error;
    }
  }

  async getAllStores(): Promise<Store[]> {
    try {
        return await this.storeRepository.findAll();
    } catch (error) {
        throw error;
    }
  }
}