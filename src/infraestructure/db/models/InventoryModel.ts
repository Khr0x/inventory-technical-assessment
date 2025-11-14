import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { ProductModel } from './ProductModel';
import { StoreModel } from './StoreModel';

@Table({ tableName: 'inventories' })
export class InventoryModel extends Model<InventoryModel> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => ProductModel)
  @Column({ type: DataType.UUID })
  @Index({ name: 'idx_product_store', unique: true })
  productId!: string;

  @BelongsTo(() => ProductModel)
  product?: ProductModel;

  @ForeignKey(() => StoreModel)
  @Column({ type: DataType.UUID })
  @Index({ name: 'idx_product_store', unique: true })
  storeId!: string;

  @BelongsTo(() => StoreModel)
  store?: StoreModel;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  quantity!: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  minStock!: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}