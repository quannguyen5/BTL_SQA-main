import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/base/baseEntity/base.entity';
import { ProductEntity } from 'src/entities/product_entity/product.entity';
import { ApplyStatus } from 'src/share/Enum/Enum';

@Entity('categories')
export class CategoryEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  url_image: string;

  @Column()
  banner: string;

  @Column()
  description: string;

  @Column()
  status: ApplyStatus;

  // Mối quan hệ với ProductEntity
  @OneToMany(() => ProductEntity, (product) => product.category)
  products: ProductEntity[]; // Danh sách sản phẩm thuộc về danh mục
}
