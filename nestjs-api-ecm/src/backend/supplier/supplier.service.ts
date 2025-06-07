import { Injectable } from '@nestjs/common';
import { CreateSupplierDto } from '../../dto/supplierDTO/create-supplier.dto';
import { UpdateSupplierDto } from '../../dto/supplierDTO/update-supplier.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from 'src/entities/product_entity/product.entity';
import { EntityManager, Like, Repository } from 'typeorm';
import { SupplierEntity } from 'src/entities/supplier_entity/supplier.entity';
import { BaseService } from 'src/base/baseService/base.service';
import { SupplierRepository } from 'src/repository/SupplierRepository';
import { User } from 'src/entities/user_entity/user.entity';

@Injectable()
export class SupplierService extends BaseService<SupplierEntity> {
  constructor(
    @InjectRepository(SupplierEntity)
    private readonly supplierRepo: SupplierRepository,
    private readonly entityManager: EntityManager,
  ) {
    super(supplierRepo);
  }

  async getList(page: number = 1, limit: number = 10, filters: any) {
    if (page < 1 || limit < 1) {
      throw new Error('Page and limit must be greater than 0.');
    }

    const condition: any = {};
    if (filters.phone) condition.phone = Like(`%${filters.phone}%`);
    if (filters.name) condition.name = Like(`%${filters.name}%`);
    const [list, total] = await this.supplierRepo.findAndCount({
      where: condition,
      skip: (page - 1) * limit,
      take: limit,
    });

    if (!list) throw new Error('NO PRODUCT!');

    return {
      data: list,
      total,
      page,
      limit,
    };
  }

  async create(createSupplierDto: CreateSupplierDto) {
    return await super.create(createSupplierDto, {
      phone: createSupplierDto.phone,
    });
  }

  async detail(id: string) {
    return await super.findOne(id);
  }

  async update(
    updateSupplierDto: UpdateSupplierDto,
    id: string,
  ): Promise<SupplierEntity> {
    return super.update(updateSupplierDto, id);
  }

  async delete(id: string) {
    return super.delete(id);
  }
}
