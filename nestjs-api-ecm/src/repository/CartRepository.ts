import {EntityRepository, Repository} from "typeorm";
import {Cart_productEntity} from "src/entities/cartproduct_entity/cart_product.entity";

@EntityRepository(Cart_productEntity)
export class CartRepository extends Repository<Cart_productEntity> {

}