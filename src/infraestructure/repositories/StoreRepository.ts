import { CreateStoreDTO } from "../../domain/store/dto/StoreDTO";
import { StoreRepositoryPort } from "../../domain/store/ports/StoreRepositoryPort";
import { Store } from "../../domain/store/Store";
import { StoreModel } from "../db/models/StoreModel";
import { StoreMapper } from "../mappers/StoreMapper";

export class StoreRepository implements StoreRepositoryPort  {

    /**
     * Funcion para crear una tienda
     * @param store Datos de la tienda a crear
     * @param tx Transaccion opcional
     * @returns 
     */
    async create(store: CreateStoreDTO, tx?: any): Promise<Store> {
        try {
            const raw = await StoreModel.create(
                {
                    name: store.name,
                    location: store.location,
                } as any,
                { transaction: tx }
            );
            return StoreMapper.mapModelToEntity(raw);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Funcion para buscar una tienda por su ID
     * @param id ID de la tienda
     * @returns 
     */
    async findById(id: string): Promise<Store | null> {
        try {
            const store = await StoreModel.findByPk(id);
            return store ? StoreMapper.mapModelToEntity(store) : null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Funcion para obtener todas las tiendas
     * @returns 
     */
    async findAll(): Promise<Store[]> {
        try {
            const stores = await StoreModel.findAll();
            return stores.map(store => StoreMapper.mapModelToEntity(store));
        } catch (error) {
            throw error;
        }
    }

    /**
     * Funcion para verificar si existen todas las tiendas de una lista de IDs
     * @param ids Lista de IDs de tiendas a verificar
     * @returns true si existen todas las tiendas, false si falta alguna
     */
    async existsAll(ids: string[]): Promise<boolean> {
        try {
            if (ids.length === 0) {
                return true;
            }
            
            const count = await StoreModel.count({
                where: {
                    id: ids
                }
            });
            
            return count === ids.length;
        } catch (error) {
            throw error;
        }
    }

}