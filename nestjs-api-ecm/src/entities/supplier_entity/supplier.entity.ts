import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from 'src/entities/product_entity/product.entity';

@Entity({ name: 'suppliers' })
export class SupplierEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  url_image: string;

  @Column({ type: 'text' })
  phone: string;

  @Column({ type: 'text' })
  address: string;

  // Mối quan hệ với ProductEntity
  @OneToMany(() => ProductEntity, (product) => product.supplier)
  products: ProductEntity[]; // Danh sách sản phẩm thuộc về nhà cung cấp
}
