import {DataSource, EntityRepository, Repository} from 'typeorm';
import {ImportEntity} from "src/entities/import_entity/import.entity";
import {Order_productEntity} from "src/entities/order_entity/order_product.entity";
import {OrderStatus, PaymentStatus} from "src/share/Enum/Enum";

@EntityRepository(ImportEntity)
export class ImportRepository extends Repository<ImportEntity> {
    constructor(private readonly dataSource: DataSource) {
        super(ImportEntity, dataSource.manager);
    }
}
