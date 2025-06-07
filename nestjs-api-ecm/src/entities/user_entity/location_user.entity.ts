import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne, OneToMany, OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/entities/user_entity/user.entity';
import {OrderEntity} from "src/entities/order_entity/oder.entity";
import {Order_productEntity} from "src/entities/order_entity/order_product.entity";
import {BaseEntity} from "src/base/baseEntity/base.entity";

@Entity({ name: 'location_user' })
export class Location_userEntity extends BaseEntity {
  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  phone: string;

  @Column({ type: 'boolean', default: false })
  default_location: boolean;

  @Column({ type: 'varchar', length: 36 })
  user_id: string;

  // Foreign key to User using existing user_id column
  @ManyToOne(() => User, (user) => user.locations)
  @JoinColumn({ name: 'user_id' }) // Explicitly use user_id as the foreign key
  user: User;

  @OneToMany(() => OrderEntity, (order) => order.location)
  orders: OrderEntity[];
}
