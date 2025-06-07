import {DataSource, EntityRepository, Repository} from "typeorm";
import {OrderEntity} from "src/entities/order_entity/oder.entity";
import {ApplyStatus, OrderStatus, PaymentStatus, TimeFilter} from "src/share/Enum/Enum";

@EntityRepository(OrderEntity)
export class OrderRepository extends Repository<OrderEntity> {
    constructor(private readonly dataSource: DataSource) {
        super(OrderEntity, dataSource.manager);
    }

    async calculateStatsForTwoPeriods(
        startDate: Date,
        endDate: Date,
        lastStartDate: Date,
        lastEndDate: Date
    ): Promise<{
        currentRevenue: number;
        lastRevenue: number;
        currentQuantity: number;
        lastQuantity: number;
        currentTotalOrders: number;
        lastTotalOrders: number;
        currentTotalCustomers: number;
        lastTotalCustomers: number;
    }> {
        const result = await this.createQueryBuilder('orders')
            .leftJoin('orders.orderProducts', 'orderProduct')
            .select([
                // Total Revenue for current and last periods
                'SUM(CASE WHEN orders.createdAt BETWEEN :startDate AND :endDate THEN orderProduct.quantity * orderProduct.priceout ELSE 0 END) AS currentRevenue',
                'SUM(CASE WHEN orders.createdAt BETWEEN :lastStartDate AND :lastEndDate THEN orderProduct.quantity * orderProduct.priceout ELSE 0 END) AS lastRevenue',

                // Total Quantity for current and last periods
                'SUM(CASE WHEN orders.createdAt BETWEEN :startDate AND :endDate THEN orderProduct.quantity ELSE 0 END) AS currentQuantity',
                'SUM(CASE WHEN orders.createdAt BETWEEN :lastStartDate AND :lastEndDate THEN orderProduct.quantity ELSE 0 END) AS lastQuantity',

                // Total Orders for current and last periods
                'COUNT(CASE WHEN orders.createdAt BETWEEN :startDate AND :endDate THEN orders.id ELSE NULL END) AS currentTotalOrders',
                'COUNT(CASE WHEN orders.createdAt BETWEEN :lastStartDate AND :lastEndDate THEN orders.id ELSE NULL END) AS lastTotalOrders',

                // Total Customers for current and last periods
                'COUNT(DISTINCT CASE WHEN orders.createdAt BETWEEN :startDate AND :endDate THEN orders.user_id ELSE NULL END) AS currentTotalCustomers',
                'COUNT(DISTINCT CASE WHEN orders.createdAt BETWEEN :lastStartDate AND :lastEndDate THEN orders.user_id ELSE NULL END) AS lastTotalCustomers',
            ])
            .where('orders.paymentStatus = :status', { status: PaymentStatus.Paid })
            .andWhere('orders.orderStatus = :orderStatus', { orderStatus: OrderStatus.Delivered })
            .setParameters({ startDate, endDate, lastStartDate, lastEndDate })
            .getRawOne();

        return {
            currentRevenue: parseFloat(result.currentRevenue || '0'),
            lastRevenue: parseFloat(result.lastRevenue || '0'),
            currentQuantity: parseFloat(result.currentQuantity || '0'),
            lastQuantity: parseFloat(result.lastQuantity || '0'),
            currentTotalOrders: parseFloat(result.currentTotalOrders || '0'),
            lastTotalOrders: parseFloat(result.lastTotalOrders || '0'),
            currentTotalCustomers: parseFloat(result.currentTotalCustomers || '0'),
            lastTotalCustomers: parseFloat(result.lastTotalCustomers || '0'),
        };
    }

    async getTopCustomersByRevenue(startDate: Date, endDate: Date): Promise<any[]> {
        const result = await this.createQueryBuilder('orders')
            .select('orders.user_id', 'userId')
            .addSelect('CONCAT(user.firstName, " ", user.lastName)', 'userName')
            .addSelect('SUM(orders.total_price)', 'totalRevenue')
            .innerJoin('orders.user', 'user')
            .where('orders.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .andWhere('orders.paymentStatus = :status', { status: PaymentStatus.Paid })
            .andWhere('orders.orderStatus = :orderStatus', { orderStatus: OrderStatus.Delivered })
            .groupBy('orders.user_id')
            .orderBy('totalRevenue', 'DESC')
            .limit(5)
            .getRawMany();

        return result.map(row => ({
            userId: row.userId,
            userName: row.userName,
            revenue: parseFloat(row.totalRevenue),
        }));
    }

    async getFinancialSummary(timeFilter: TimeFilter): Promise<any[]> {
        let dateTruncUnit: string;
        let dateFormat: string;
        let whereCondition: string;
        let timePeriods: string[] = [];
        const now = new Date();

        switch (timeFilter) {
            case TimeFilter.Week:
                dateTruncUnit = 'WEEK';
                dateFormat = "CONCAT(YEAR(o.createdAt), '-W', WEEK(o.createdAt))";

                // Tính tuần bắt đầu và kết thúc của tháng hiện tại
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                const startWeek = Math.ceil((startOfMonth.getDate() - startOfMonth.getDay() + 1) / 7);
                const endWeek = Math.ceil((endOfMonth.getDate() - endOfMonth.getDay() + 1) / 7);

                whereCondition = `YEAR(o.createdAt) = ${now.getFullYear()} AND MONTH(o.createdAt) = ${now.getMonth() + 1}`;
                for (let i = startWeek; i <= endWeek; i++) {
                    timePeriods.push(`${now.getFullYear()}-W${i}`);
                }
                break;

            case TimeFilter.Month:
                dateTruncUnit = 'MONTH';
                dateFormat = "DATE_FORMAT(o.createdAt, '%Y-%m')";
                whereCondition = `YEAR(o.createdAt) = ${now.getFullYear()}`;
                for (let i = 1; i <= 12; i++) {
                    timePeriods.push(`${now.getFullYear()}-${i.toString().padStart(2, '0')}`);
                }
                break;

            case TimeFilter.Quarter:
                dateTruncUnit = 'QUARTER';
                dateFormat = "CONCAT(YEAR(o.createdAt), '-Q', QUARTER(o.createdAt))";
                whereCondition = `YEAR(o.createdAt) = ${now.getFullYear()}`;
                for (let i = 1; i <= 4; i++) {
                    timePeriods.push(`${now.getFullYear()}-Q${i}`);
                }
                break;

            case TimeFilter.Year:
                dateTruncUnit = 'YEAR';
                dateFormat = "YEAR(o.createdAt)";
                const currentYear = now.getFullYear();
                whereCondition = `YEAR(o.createdAt) BETWEEN ${currentYear - 3} AND ${currentYear}`;
                for (let i = 0; i < 4; i++) {
                    timePeriods.push(`${currentYear - i}`);
                }
                break;

            default:
                throw new Error('Invalid TimeFilter');
        }

        const rawData = await this.createQueryBuilder('o')
            .select([
                `${dateFormat} AS time_period`,
                'COALESCE(SUM(op.priceout * op.quantity), 0) AS total_revenue',
                'COALESCE(SUM(ip.price_in * ip.quantity), 0) AS total_cost',
                'COALESCE(SUM(op.priceout * op.quantity) - SUM(ip.price_in * ip.quantity), 0) AS profit',
            ])
            .leftJoin('o.orderProducts', 'op')
            .leftJoin('op.product', 'p')
            .leftJoin('p.importProducts', 'ip')
            .leftJoin('ip.import', 'imp')
            .where(whereCondition)
            .groupBy('time_period')
            .orderBy('time_period', 'ASC')
            .getRawMany();

        const filledData = timePeriods.map((period) => {
            const existing = rawData.find((d) => d.time_period === period);
            return (
                existing || {
                    time_period: period,
                    total_revenue: 0,
                    total_cost: 0,
                    profit: 0,
                }
            );
        });

        return filledData;
    }

    async getRevenueByCategory(startDate: Date, endDate: Date): Promise<any[]> {
        const result = await this.createQueryBuilder('order')
            .select('category.id', 'categoryId')
            .addSelect('category.name', 'categoryName')
            .addSelect('SUM(order.total_price)', 'totalRevenue')
            .innerJoin('order.orderProducts', 'order_product') // Join với bảng order_product
            .innerJoin('order_product.product', 'product') // Join với bảng products
            .innerJoin('product.category', 'category') // Join với bảng categories
            .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.Paid }) // Lọc theo status thanh toán
            .andWhere('order.orderStatus = :orderStatus', { orderStatus: OrderStatus.Delivered })
            .andWhere('category.status = :status', { status: ApplyStatus.True })
            .groupBy('category.id')
            .orderBy('totalRevenue', 'DESC')
            .getRawMany();

        return result.map(row => ({
            categoryId: row.categoryId,
            categoryName: row.categoryName,
            revenue: parseFloat(row.totalRevenue),
        }));
    }

    async getRevenueBySupplier(startDate: Date, endDate: Date): Promise<any[]> {
        const result = await this.createQueryBuilder('order')
            .select('supplier.id', 'supplierId')
            .addSelect('supplier.name', 'supplierName')
            .addSelect('SUM(order.total_price)', 'totalRevenue')
            .innerJoin('order.orderProducts', 'order_product') // Join với bảng order_product
            .innerJoin('order_product.product', 'product') // Join với bảng products
            .innerJoin('product.supplier', 'supplier') // Join với bảng suppliers
            .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.Paid }) // Lọc theo status thanh toán
            .andWhere('order.orderStatus = :orderStatus', { orderStatus: OrderStatus.Delivered })
            .groupBy('supplier.id')
            .orderBy('totalRevenue', 'DESC')
            .getRawMany();

        return result.map(row => ({
            supplierId: row.supplierId,
            supplierName: row.supplierName,
            revenue: parseFloat(row.totalRevenue),
        }));
    }
}