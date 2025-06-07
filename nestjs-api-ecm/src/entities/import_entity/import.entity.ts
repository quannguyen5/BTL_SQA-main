import {
  Column, CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/entities/user_entity/user.entity';
import { Import_productEntity } from 'src/entities/import_entity/import_product.entity';

@Entity({ name: 'import' })
export class ImportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar', length: 36, nullable: true })
  import_code: string;
  @Column({ type: 'int' })
  total_amount: number;
  @Column({ type: 'varchar', length: 36 })
  employee_id: string;
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.imports)
  @JoinColumn({ name: 'employee_id' }) // Associate employee_id as foreign key
  employee: User;

  // Relation with Import_productEntity
  @OneToMany(
    () => Import_productEntity,
    (importProduct) => importProduct.import,
  )
  importProducts: Import_productEntity[];
}
