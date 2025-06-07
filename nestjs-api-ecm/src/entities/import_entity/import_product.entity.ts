import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ImportEntity } from 'src/entities/import_entity/import.entity';
import { ProductEntity } from 'src/entities/product_entity/product.entity';

@Entity({ name: 'import_product' })
export class Import_productEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'int' })
  quantity: number;
  @Column({ type: 'int' })
  price_in: number;
  @Column({ type: 'varchar', length: 36 })
  product_id: string;

  @Column({ type: 'varchar', length: 36 })
  import_id: string;

  @ManyToOne(() => ImportEntity, (importEntity) => importEntity.importProducts)
  @JoinColumn({ name: 'import_id' }) // Associate import_id as foreign key
  import: ImportEntity;

  // Mối quan hệ với ProductEntity
  @ManyToOne(() => ProductEntity, (product) => product.importProducts)
  @JoinColumn({ name: 'product_id' }) // Associate product_id as foreign key
  product: ProductEntity;
}
