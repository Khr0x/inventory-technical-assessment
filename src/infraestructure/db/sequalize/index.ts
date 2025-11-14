import { Sequelize } from 'sequelize-typescript';
import { DATABASE_URL } from '../../../config';
import { ProductModel } from '../models/ProductModel';
import { StoreModel } from '../models/StoreModel';
import { InventoryModel } from '../models/InventoryModel';
import { InventoryMovementModel } from '../models/InventoryMovementModel';

export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  models: [ProductModel, StoreModel, InventoryModel, InventoryMovementModel],
  logging: false,
});

export async function initDb() {
  await sequelize.authenticate();
  await sequelize.sync();
}