import {EntityRepository, Repository} from "typeorm";
import {ProductEntity} from "src/entities/product_entity/product.entity";
import {SupplierEntity} from "src/entities/supplier_entity/supplier.entity";

@EntityRepository(SupplierEntity)
export class SupplierRepository extends Repository<SupplierEntity> {

}