import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {SupplierEntity} from "src/entities/supplier_entity/supplier.entity";

@Module({
  imports: [TypeOrmModule.forFeature([SupplierEntity])],
  controllers: [SupplierController],
  providers: [SupplierService],
  exports: [SupplierService]
})
export class SupplierModule {}
