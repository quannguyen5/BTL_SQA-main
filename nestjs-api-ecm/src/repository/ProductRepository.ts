import {DataSource, EntityRepository, Repository} from "typeorm";
import {ProductEntity} from "src/entities/product_entity/product.entity";
import {Order_productEntity} from "src/entities/order_entity/order_product.entity";
import {ApplyStatus, OrderStatus, PaymentStatus} from "src/share/Enum/Enum";

@EntityRepository(ProductEntity)
export class ProductRepository extends Repository<ProductEntity> {
    constructor(private readonly dataSource: DataSource) {
        super(Order_productEntity, dataSource.manager);
    }
}