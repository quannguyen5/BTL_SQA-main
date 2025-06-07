import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/base/baseEntity/base.entity';
import { Order_productEntity } from 'src/entities/order_entity/order_product.entity';
import { Cart_productEntity } from 'src/entities/cartproduct_entity/cart_product.entity';
import { Import_productEntity } from 'src/entities/import_entity/import_product.entity';
import { CategoryEntity } from 'src/entities/category_entity/category.entity';
import { SupplierEntity } from 'src/entities/supplier_entity/supplier.entity';

@Entity({ name: 'products' })
export class ProductEntity extends BaseEntity {
  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'int' })
  priceout: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  stockQuantity: number;

  @Column({ type: 'int' })
  weight: number;

  @Column({ type: 'text', nullable: true })
  url_images: string;

  @Column({ type: 'varchar', length: 36 })
  category_id: string;

  @Column({ type: 'varchar', length: 36 })
  supplier_id: string;

  @Column({ 
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP' 
  })
  expire_date: Date;

  // Relation with Order_Product
  @OneToMany(() => Order_productEntity, (orderProduct) => orderProduct.product)
  orderProducts: Order_productEntity[];

  // Relation with Cart_productEntity
  @OneToMany(() => Cart_productEntity, (cartProduct) => cartProduct.product)
  cartProducts: Cart_productEntity[];

  // Relation with Import_productEntity
  @OneToMany(
    () => Import_productEntity,
    (importProduct) => importProduct.product,
  )
  importProducts: Import_productEntity[];

  // Mối quan hệ với CategoryEntity
  @ManyToOne(() => CategoryEntity, (category) => category.products)
  @JoinColumn({ name: 'category_id' }) // Associate category_id as foreign key
  category: CategoryEntity; // Mối quan hệ với Category

  // Mối quan hệ với SupplierEntity
  @ManyToOne(() => SupplierEntity, (supplier) => supplier.products)
  @JoinColumn({ name: 'supplier_id' }) // Associate supplier_id as foreign key
  supplier: SupplierEntity; // Mối quan hệ với Supplier
}
