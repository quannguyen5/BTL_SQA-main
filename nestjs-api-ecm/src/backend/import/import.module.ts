import { Module } from '@nestjs/common';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportEntity } from 'src/entities/import_entity/import.entity';
import { Import_productEntity } from 'src/entities/import_entity/import_product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ImportEntity, Import_productEntity])],
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}
