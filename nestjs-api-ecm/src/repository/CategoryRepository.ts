import {EntityRepository, Repository} from "typeorm";
import {CategoryEntity} from "src/entities/category_entity/category.entity";

@EntityRepository(CategoryEntity)
export class CategoryRepository extends Repository<CategoryEntity> {

}