import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  Index,
} from 'sequelize-typescript';
import { ProductModel } from './ProductModel';
import { StoreModel } from './StoreModel';

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  TRANSFER = 'TRANSFER',
}

@Table({ tableName: 'inventory_movements' })
export class InventoryMovementModel extends Model<InventoryMovementModel> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => ProductModel)
  @Column({ type: DataType.UUID, allowNull: false })
  @Index('idx_movement_product')
  productId!: string;

  @BelongsTo(() => ProductModel)
  product?: ProductModel;

  @ForeignKey(() => StoreModel)
  @Column({ type: DataType.UUID, allowNull: true })
  @Index('idx_movement_source_store')
  sourceStoreId?: string;

  @BelongsTo(() => StoreModel, 'sourceStoreId')
  sourceStore?: StoreModel;

  @ForeignKey(() => StoreModel)
  @Column({ type: DataType.UUID, allowNull: true })
  @Index('idx_movement_target_store')
  targetStoreId?: string;

  @BelongsTo(() => StoreModel, 'targetStoreId')
  targetStore?: StoreModel;

  @Column({ type: DataType.INTEGER, allowNull: false })
  quantity!: number;

  @Column({ 
    type: DataType.ENUM(...Object.values(MovementType)), 
    allowNull: false 
  })
  @Index('idx_movement_type')
  type!: MovementType;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  @Index('idx_movement_timestamp')
  timestamp!: Date;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
