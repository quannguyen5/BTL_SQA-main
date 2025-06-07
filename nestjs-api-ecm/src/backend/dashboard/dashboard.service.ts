import { Injectable } from '@nestjs/common';
import {OrderAllOrderDto} from "src/dto/orderDTO/order.allOrder.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {OrderEntity} from "src/entities/order_entity/oder.entity";
import {OrderRepository} from "src/repository/OrderRepository";
import {Order_productEntity} from "src/entities/order_entity/order_product.entity";
import {DataSource, Repository} from "typeorm";
import {OrderStatus, TimeFilter} from "src/share/Enum/Enum";
import {endOfMonth, endOfWeek, endOfYear, startOfMonth, startOfWeek, startOfYear} from "date-fns";
import {OrderProductRepository} from "src/repository/OrderProductRepository";
import {ImportRepository} from "src/repository/ImportRepository";
import {ImportProductRepository} from "src/repository/ImportProductRepository";
import {UserRepository} from "src/repository/UserRepository";

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(OrderRepository)
        private readonly orderRepo: OrderRepository,
        @InjectRepository(OrderProductRepository)
        private readonly orderProductRepo: OrderProductRepository,
        @InjectRepository(ImportRepository)
        private readonly importRepo: ImportRepository,
        @InjectRepository(ImportProductRepository)
        private readonly importProRepo: ImportProductRepository,
        @InjectRepository(UserRepository)
        private readonly userRepo: UserRepository
    ) {}

    async getSummaryStatistic(timeFilter: TimeFilter) {
        const { startDate, endDate } = this.timeFilterCreate(timeFilter);
        const { lastStartDate, lastEndDate } = this.lastTimeFilterCreate(startDate, endDate, timeFilter);

        const {
            currentRevenue,
            lastRevenue,
            currentQuantity,
            lastQuantity,
            currentTotalOrders,
            lastTotalOrders,
            currentTotalCustomers,
            lastTotalCustomers,
        } = await this.orderRepo.calculateStatsForTwoPeriods(startDate, endDate, lastStartDate, lastEndDate);


        return {
            thisTime: {
                revenue: currentRevenue,
                product: currentQuantity,
                customer: currentTotalCustomers,
                order: currentTotalOrders
            },
            lastTime: {
                revenue: lastRevenue,
                product: lastQuantity,
                customer: lastTotalCustomers,
                order: lastTotalOrders
            },
        };
    }

    async getFinancialSummaryByTime(timeFilter: TimeFilter) {
        const financialData = await this.orderRepo.getFinancialSummary(timeFilter);
        return financialData.map((data) => ({
            time_period: data.time_period,
            total_revenue: Number(data.total_revenue) || 0,
            total_cost: Number(data.total_cost) || 0,
            profit: Number(data.profit) || 0,
        }));
    }

    async getTopProductsByRevenue(timeFilter: TimeFilter) {
        const { startDate, endDate } = this.timeFilterCreate(timeFilter);
        const { lastStartDate, lastEndDate } = this.lastTimeFilterCreate(startDate, endDate, timeFilter);

        const top10Products = await this.orderProductRepo.getTopProductsByRevenue(startDate, endDate);
        return top10Products;
    }

    async getTopCustomersByRevenue(timeFilter: TimeFilter) {
        const { startDate, endDate } = this.timeFilterCreate(timeFilter);
        const { lastStartDate, lastEndDate } = this.lastTimeFilterCreate(startDate, endDate, timeFilter);

        const topCustomers = await this.orderRepo.getTopCustomersByRevenue(startDate, endDate);
        return topCustomers;
    }

    async getRevenueBySupplier(timeFilter: TimeFilter) {
        const { startDate, endDate } = this.timeFilterCreate(timeFilter);
        const { lastStartDate, lastEndDate } = this.lastTimeFilterCreate(startDate, endDate, timeFilter);

        const revenueBySupplier = await this.orderRepo.getRevenueBySupplier(startDate, endDate);
        return revenueBySupplier;
    }

    async getRevenueByCategory(timeFilter: TimeFilter) {
        const { startDate, endDate } = this.timeFilterCreate(timeFilter);
        const { lastStartDate, lastEndDate } = this.lastTimeFilterCreate(startDate, endDate, timeFilter);

        const revenueByCategory = await this.orderRepo.getRevenueByCategory(startDate, endDate);
        return revenueByCategory;
    }

    async getLatestProduct() {
        const products = await this.importProRepo.findLatestProducts();
        return products;
    }

    async getFeatureProduct() {
        const products = await this.orderProductRepo.getFeatureProductsByRevenue();
        return products;
    }

    async getManageUserDashBoard() {
        try {
            const today = new Date();
            const startOfThisWeek = new Date(today);
            startOfThisWeek.setDate(today.getDate() - today.getDay()); // Chủ nhật đầu tuần này

            const startOfLastWeek = new Date(startOfThisWeek);
            startOfLastWeek.setDate(startOfThisWeek.getDate() - 7); // Chủ nhật tuần trước
            const endOfLastWeek = new Date(startOfThisWeek);
            endOfLastWeek.setDate(startOfThisWeek.getDate() - 1); // Thứ Bảy tuần trước

            const totalUsers = await this.userRepo
                .createQueryBuilder('user')
                .where('user.role = :role', { role: 'user' })
                .getCount();

            const usersThisWeek = await this.userRepo
                .createQueryBuilder('user')
                .where('user.role = :role', { role: 'user' })
                .andWhere('user.createdAt >= :startOfThisWeek', { startOfThisWeek })
                .getCount();

            const usersLastWeek = await this.userRepo
                .createQueryBuilder('user')
                .where('user.role = :role', { role: 'user' })
                .andWhere('user.createdAt >= :startOfLastWeek', { startOfLastWeek })
                .andWhere('user.createdAt < :endOfLastWeek', { endOfLastWeek })
                .getCount();

            // the number user who bought
            const userBoughtCount = await this.orderRepo
                .createQueryBuilder('order')
                .select('COUNT(DISTINCT order.user_id)', 'userCount')
                .where('order.orderStatus IN (:...statuses)', {
                    statuses: [OrderStatus.Delivered, OrderStatus.Canceled],
                })
                .getRawOne();

            // Get user counts for this week
            const usersBoughtThisWeek = await this.orderRepo
                .createQueryBuilder('order')
                .select('COUNT(DISTINCT order.user_id)', 'userCount') // Count distinct user IDs
                .where('order.createdAt  >= :startOfThisWeek', {startOfThisWeek})
                .andWhere('order.orderStatus IN (:...statuses)', {
                    statuses: [OrderStatus.Delivered, OrderStatus.Canceled],
                })
                .getRawOne();

            // Get user counts for last week
            const usersBoughtLastWeek = await this.orderRepo
                .createQueryBuilder('order')
                .select('COUNT(DISTINCT order.user_id)', 'userCount') // Count distinct user IDs
                .andWhere('order.createdAt >= :startOfLastWeek', { startOfLastWeek })
                .andWhere('order.createdAt < :endOfLastWeek', { endOfLastWeek })
                .andWhere('order.orderStatus IN (:...statuses)', {
                    statuses: [OrderStatus.Delivered, OrderStatus.Canceled],
                })
                .getRawOne();

            return {
                totalUsers,
                usersThisWeek,
                usersLastWeek,
                usersBoughtThisWeek,
                usersBoughtLastWeek
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            return {
                error: error.toString(),
            };
        }
    }




    timeFilterCreate(timeFilter: TimeFilter): { startDate: Date; endDate: Date } {
        const now = new Date();
        if (timeFilter === TimeFilter.Week) {
            return {
                startDate: startOfWeek(now, { weekStartsOn: 1 }),
                endDate: endOfWeek(now, { weekStartsOn: 1 }),
            };
        } else if (timeFilter === TimeFilter.Month) {
            return {
                startDate: startOfMonth(now),
                endDate: endOfMonth(now),
            };
        } else if (timeFilter === TimeFilter.Year) {
            return {
                startDate: startOfYear(now),
                endDate: endOfYear(now),
            };
        } else if (timeFilter === TimeFilter.Quarter) {
            const quarter = Math.floor((now.getMonth() / 3));
            const startMonth = quarter * 3;
            const startDate = new Date(now.getFullYear(), startMonth, 1);
            const endDate = new Date(now.getFullYear(), startMonth + 3, 0);

            return { startDate, endDate };
        } else {
            throw new Error('Invalid time filter');
        }
    }

    lastTimeFilterCreate(startDate: Date, endDate: Date, timeFilter: TimeFilter): { lastStartDate: Date, lastEndDate: Date } {
        let lastStartDate: Date;
        let lastEndDate: Date;

        if (timeFilter === TimeFilter.Week) {
            lastStartDate = this.addDays(startDate, -7);
            lastEndDate = this.addDays(endDate, -7);
        } else if (timeFilter === TimeFilter.Month) {
            lastStartDate = this.addMonths(startDate, -1);
            lastEndDate = this.addMonths(endDate, -1);
        } else if (timeFilter === TimeFilter.Quarter) {
            lastStartDate = this.addMonths(startDate, -3);
            lastEndDate = this.addMonths(endDate, -3);
        } else if (timeFilter === TimeFilter.Year) {
            lastStartDate = this.addYears(startDate, -1);
            lastEndDate = this.addYears(endDate, -1);
        } else {
            throw new Error('Unsupported time period for lastTimeFilterCreate.');
        }

        return { lastStartDate, lastEndDate };
    }

    addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    addMonths(date: Date, months: number): Date {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }

    addYears(date: Date, years: number): Date {
        const result = new Date(date);
        result.setFullYear(result.getFullYear() + years);
        return result;
    }
}
