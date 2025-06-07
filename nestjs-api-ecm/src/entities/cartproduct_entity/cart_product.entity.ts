import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/base/baseEntity/base.entity';
import { User } from 'src/entities/user_entity/user.entity';
import { ProductEntity } from 'src/entities/product_entity/product.entity';
@Entity({ name: 'cart_product' })
export class Cart_productEntity extends BaseEntity {
  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', length: 36 })
  product_id: string;

  @Column({ type: 'varchar', length: 36 })
  user_id: string;

  // Foreign key to User using existing user_id column
  @ManyToOne(() => User, (user) => user.cartProducts)
  @JoinColumn({ name: 'user_id' }) // Explicitly use user_id as the foreign key
  user: User;

  // Foreign key to Product using existing product_id column
  @ManyToOne(() => ProductEntity, (product) => product.cartProducts)
  @JoinColumn({ name: 'product_id' }) // Explicitly use product_id as the foreign key
  product: ProductEntity;
}
