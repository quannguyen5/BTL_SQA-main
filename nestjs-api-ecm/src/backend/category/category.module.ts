import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/entities/category_entity/category.entity';
import { UserModule } from 'src/backend/user/user.module';
import { ProductEntity } from 'src/entities/product_entity/product.entity';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([CategoryEntity, ProductEntity]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
