import { Store } from "../../domain/store/Store";
import { StoreModel } from "../db/models/StoreModel";

export class StoreMapper {
  
    static mapModelToEntity(model: StoreModel): Store {
        return {    
            id: model.id,
            name: model.name,
            location: model.location || '',
            createdAt: model.createdAt,
            updatedAt: model.updatedAt       
        }
    }
}