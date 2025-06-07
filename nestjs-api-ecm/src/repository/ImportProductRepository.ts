import {DataSource, EntityRepository, Repository} from 'typeorm';
import {Import_productEntity} from "src/entities/import_entity/import_product.entity";
import {Injectable} from "@nestjs/common";
import {ImportEntity} from "src/entities/import_entity/import.entity";

@EntityRepository(Import_productEntity)
export class ImportProductRepository extends Repository<Import_productEntity> {
    constructor(private readonly dataSource: DataSource) {
        super(Import_productEntity, dataSource.manager);
    }

    async findLatestProducts(): Promise<any[]> {
        return await this.createQueryBuilder('import_product')
            .select('product.id', 'productId')
            .addSelect('product.name', 'productName')
            .addSelect('product.url_images', 'productImages')
            .addSelect('product.priceout', 'priceOut')
            .addSelect('product.weight', 'productWeight')
            .addSelect('category.name', 'categoryName')
            .innerJoin('import_product.product', 'product') // Join Product table
            .innerJoin('product.category', 'category') // Join Category table
            .innerJoin('import_product.import', 'import') // Join Import table
            .orderBy('import.createdAt', 'DESC') // Sort by creation time descending
            .limit(8) // Limit to 8 products
            .getRawMany();
    }
}
