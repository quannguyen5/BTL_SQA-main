import { BaseEntity } from 'src/base/baseEntity/base.entity';
import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from 'typeorm';
import { User } from 'src/entities/user_entity/user.entity';
import { Order_productEntity } from 'src/entities/order_entity/order_product.entity';
import {OrderStatus, PaymentMethod, PaymentStatus} from "src/share/Enum/Enum";
import {Location_userEntity} from "src/entities/user_entity/location_user.entity";
@Entity({ name: 'orders' })
export class OrderEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  order_code: string;
  @Column({ type: 'int' })
  total_price: number;
  @Column({ type: 'varchar' })
  orderStatus: OrderStatus;
  @Column({ type: 'varchar' })
  payment_method: PaymentMethod;
  @Column({ nullable: true, type: 'varchar', length: 36 })
  employee_id: string;
  @Column({ type: 'varchar', length: 36 })
  user_id: string;
  @Column({ type: 'varchar', length: 36 })
  location_id: string;
  @Column({ type: 'varchar' })
  paymentStatus: PaymentStatus;

  // user_id: ID of the person who placed the order
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' }) // Foreign key for the user who placed the order
  user: User;

  // employee_id: ID of the employee who delivers the order
  @ManyToOne(() => User, (user) => user.deliveries)
  @JoinColumn({ name: 'employee_id' }) // Foreign key for the employee who delivers the order
  employee: User;

  @ManyToOne(() => Location_userEntity, (location) => location.orders)
  @JoinColumn({ name: 'location_id' })
  location: Location_userEntity;

  // Relation with Order_Product
  @OneToMany(() => Order_productEntity, (orderProduct) => orderProduct.order)
  orderProducts: Order_productEntity[];
}
