import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from '../../entities/category_entity/category.entity';
import { In, Like, Repository } from 'typeorm';
import { CategoryCreateDTO } from '../../dto/categoryDTO/category.create.dto';
import { categoryUpdateDTO } from '../../dto/categoryDTO/category.update.dto';
import { BaseService } from '../../base/baseService/base.service';
import { ApplyStatus, ExpirationStatus } from 'src/share/Enum/Enum';
import { CategoryRepository } from 'src/repository/CategoryRepository';
import { ProductEntity } from 'src/entities/product_entity/product.entity';

@Injectable()
export class CategoryService extends BaseService<CategoryEntity> {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: CategoryRepository,
  ) {
    super(categoryRepo);
  }

  async getList(page: number = 1, limit: number = 10, filters: any) {
    if (page < 1) {
      throw new Error('PAGE NUMBER MUST BE GREATER THAN 0!');
    }

    if (limit < 1) {
      throw new Error('LIMIT MUST BE GREATER THAN 0!');
    }

    const condition: any = {};
    if (filters.status) condition.status = filters.status;
    if (filters.name) condition.name = Like(`%${filters.name}%`);

    const [list, total] = await this.categoryRepo.findAndCount({
      where: condition,
      skip: (page - 1) * limit,
      take: limit,
    });

    if (!list) throw new Error('NO CATEGORY!');

    return {
      data: list,
      total,
      page,
      limit,
    };
  }

  async create(createCate: CategoryCreateDTO) {
    if (
      createCate.status !== ApplyStatus.True &&
      createCate.status !== ApplyStatus.False
    ) {
      throw new Error('Invalid status value');
    }
    return await super.create(createCate, { name: createCate.name });
  }

  async detail(id: string) {
    return await super.findOne(id);
  }

  async update(categoryUpdateDTO: categoryUpdateDTO, id: string) {
    return await super.update(categoryUpdateDTO, id);
  }

  async delete(id: string) {
    return await super.delete(id);
  }
}
