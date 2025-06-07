import {DataSource, EntityRepository, Repository} from "typeorm";
import {OrderEntity} from "src/entities/order_entity/oder.entity";
import {Order_productEntity} from "src/entities/order_entity/order_product.entity";
import {OrderStatus, PaymentStatus} from "src/share/Enum/Enum";

@EntityRepository(Order_productEntity)
export class OrderProductRepository extends Repository<Order_productEntity> {
    constructor(private readonly dataSource: DataSource) {
        super(Order_productEntity, dataSource.manager);
    }

    async getTopProductsByRevenue(startDate: Date, endDate: Date): Promise<any[]> {
        const result = await this.createQueryBuilder('order_product')
            .select('order_product.product_id', 'productId')
            .addSelect('product.name', 'productName')
            .addSelect('product.priceout', 'priceout')
            .addSelect('category.name', 'categoryName')
            .addSelect('SUM(order_product.priceout * order_product.quantity)', 'totalRevenue') // Tính doanh thu
            .innerJoin('order_product.product', 'product') // Join với bảng sản phẩm
            .innerJoin('order_product.order', 'order') // Join với bảng đơn hàng
            .innerJoin('product.category', 'category') // Join Category table
            .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .andWhere('order.paymentStatus = :status', { status: PaymentStatus.Paid })
            .andWhere('order.orderStatus = :orderStatus', { orderStatus: OrderStatus.Delivered })
            .groupBy('order_product.product_id')
            .orderBy('totalRevenue', 'DESC')
            .limit(5)
            .getRawMany();

        return result.map(row => ({
            productId: row.productId,
            productName: row.productName,
            priceout: row.priceout,
            revenue: parseFloat(row.totalRevenue), // Chuyển doanh thu sang kiểu số thực
        }));
    }

    async getFeatureProductsByRevenue(): Promise<any[]> {
        const result = await this.createQueryBuilder('order_product')
            .select('order_product.product_id', 'productId')
            .addSelect('product.name', 'productName')
            .addSelect('product.url_images', 'productImage')
            .addSelect('product.priceout', 'priceout')
            .addSelect('category.name', 'categoryName')
            .addSelect('SUM(order_product.priceout * order_product.quantity)', 'totalRevenue') // Tính doanh thu
            .innerJoin('order_product.product', 'product') // Join với bảng sản phẩm
            .innerJoin('order_product.order', 'order') // Join với bảng đơn hàng
            .innerJoin('product.category', 'category') // Join Category table
            .andWhere('order.paymentStatus = :status', { status: PaymentStatus.Paid })
            .andWhere('order.orderStatus = :orderStatus', { orderStatus: OrderStatus.Delivered })
            .groupBy('order_product.product_id')
            .orderBy('totalRevenue', 'DESC')
            .limit(5)
            .getRawMany();

        return result.map(row => ({
            productId: row.productId,
            productName: row.productName,
            productImage: row.productImage,
            categoryName: row.categoryName,
            priceout: row.priceout,
        }));
    }

}