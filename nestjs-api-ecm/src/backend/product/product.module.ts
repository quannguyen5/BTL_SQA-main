import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ProductEntity} from "src/entities/product_entity/product.entity";
import {ImportRepository} from "src/repository/ImportRepository";
import {ImportEntity} from "src/entities/import_entity/import.entity";
import {ImportProductRepository} from "src/repository/ImportProductRepository";
import {Import_productEntity} from "src/entities/import_entity/import_product.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, Import_productEntity])],
  controllers: [ProductController],
  providers: [ProductService, ImportProductRepository],
  exports: [ProductService, ImportProductRepository]
})
export class ProductModule {}
