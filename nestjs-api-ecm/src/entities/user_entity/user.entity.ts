import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/base/baseEntity/base.entity';
import { Location_userEntity } from 'src/entities/user_entity/location_user.entity';
import { OrderEntity } from 'src/entities/order_entity/oder.entity';
import { Cart_productEntity } from 'src/entities/cartproduct_entity/cart_product.entity';
import { ImportEntity } from 'src/entities/import_entity/import.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ type: 'text' })
  firstName: string;
  @Column({ type: 'text' })
  lastName: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text', nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 255, default: 'user' })
  role: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  url_image: string;

  @Column({ type: 'text', nullable: true })
  token: string;

  // Relation with Location_userEntity
  @OneToMany(() => Location_userEntity, (location) => location.user)
  locations: Location_userEntity[];

  // Relation with Order as the person who made the order
  @OneToMany(() => OrderEntity, (order) => order.user)
  orders: OrderEntity[];

  // Relation with Order as the employee who delivers the order
  @OneToMany(() => OrderEntity, (order) => order.employee)
  deliveries: OrderEntity[];

  // Relation with Cart_productEntity
  @OneToMany(() => Cart_productEntity, (cartProduct) => cartProduct.user)
  cartProducts: Cart_productEntity[];

  // Relation with ImportEntity as the employee who made the import
  @OneToMany(() => ImportEntity, (importEntity) => importEntity.employee)
  imports: ImportEntity[];
}
