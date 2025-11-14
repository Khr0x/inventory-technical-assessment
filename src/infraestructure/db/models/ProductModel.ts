import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  Unique,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { InventoryModel } from './InventoryModel';
import { InventoryMovementModel } from './InventoryMovementModel';

@Table({ tableName: 'products' })
export class ProductModel extends Model<ProductModel> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Unique
  @Column({ allowNull: false })
  sku!: string;

  @Column({ allowNull: false })
  name!: string;

  @Column({ allowNull: false })
  description!: string;

  @Column({ allowNull: false })
  category!: string;

  @Column({ type: DataType.DECIMAL, allowNull: false })
  price!: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  active!: boolean;

  @HasMany(() => InventoryModel)
  inventories?: InventoryModel[];

  @HasMany(() => InventoryMovementModel)
  movements?: InventoryMovementModel[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}