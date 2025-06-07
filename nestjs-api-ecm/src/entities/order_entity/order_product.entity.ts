import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderEntity } from 'src/entities/order_entity/oder.entity';
import { ProductEntity } from 'src/entities/product_entity/product.entity';
@Entity({ name: 'order_product' })
export class Order_productEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  priceout: number;

  @Column({ type: 'varchar', length: 36 })
  order_id: string;

  @Column({ type: 'varchar', length: 36 })
  product_id: string;

  @ManyToOne(() => OrderEntity, (order) => order.orderProducts)
  @JoinColumn({ name: 'order_id' }) // Foreign key for the order
  order: OrderEntity;

  // Many-to-One relation with Product
  @ManyToOne(() => ProductEntity, (product) => product.orderProducts)
  @JoinColumn({ name: 'product_id' }) // Foreign key for the product
  product: ProductEntity;
}
