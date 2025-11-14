import { Table, Column, Model, DataType, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { InventoryModel } from './InventoryModel';
import { InventoryMovementModel } from './InventoryMovementModel';

@Table({ tableName: 'stores' })
export class StoreModel extends Model<StoreModel> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({ allowNull: false })
  name!: string;

  @Column({ allowNull: true })
  location?: string;

  @HasMany(() => InventoryModel)
  inventories?: InventoryModel[];

  @HasMany(() => InventoryMovementModel, 'sourceStoreId')
  outgoingMovements?: InventoryMovementModel[];

  @HasMany(() => InventoryMovementModel, 'targetStoreId')
  incomingMovements?: InventoryMovementModel[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}