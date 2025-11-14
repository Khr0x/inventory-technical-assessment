import { CreateStoreDTO } from "../dto/StoreDTO";
import { Store } from "../Store";

export interface StoreRepositoryPort {
  create(store: CreateStoreDTO, tx?: any): Promise<Store>;
  findById(id: string): Promise<Store | null>;
  findAll(): Promise<Store[]>;
  existsAll(ids: string[]): Promise<boolean> 
}