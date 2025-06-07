import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrderEntity } from 'src/entities/order_entity/oder.entity';
import { Order_productEntity } from 'src/entities/order_entity/order_product.entity';
import { CreateOrderDto } from 'src/dto/orderDTO/order.create.dto';
import { OrderAllOrderDto } from 'src/dto/orderDTO/order.allOrder.dto';
import { UpdateOrderDTO } from 'src/dto/orderDTO/order.update.dto';
import {
  NotificationStatus,
  NotificationType,
  OrderStatus,
  PaymentStatus,
} from 'src/share/Enum/Enum';
import { OrderRepository } from 'src/repository/OrderRepository';
import { BaseService } from 'src/base/baseService/base.service';
import { NotificationService } from 'src/backend/notification/notification.service';
import { UserRepository } from 'src/repository/UserRepository';
import { User } from 'src/entities/user_entity/user.entity';
import { EmailService } from 'src/backend/email/email.service';
import { Email_entity } from 'src/entities/helper/email_entity';
import { AccountNotify } from 'src/Until/configConst';
import { Cart_productEntity } from 'src/entities/cartproduct_entity/cart_product.entity';
import { CartRepository } from 'src/repository/CartRepository';
import {GenerateEntityCode} from "src/share/GenerateEntityCode";

@Injectable()
export class OrderService extends BaseService<OrderEntity> {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: OrderRepository,
    @InjectRepository(Order_productEntity)
    private readonly orderProductRepo: Repository<Order_productEntity>,
    @InjectRepository(User)
    private readonly userRepo: UserRepository,
    @InjectRepository(Cart_productEntity)
    private readonly cartRepo: CartRepository,
    private readonly dataSource: DataSource,
    private readonly notiService: NotificationService,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
  ) {
    super(orderRepo);
  }

  async createOrder(oderDTO: CreateOrderDto) {
    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = this.orderRepo.create({
        order_code: GenerateEntityCode.generateOrderCode("ORD"),
        total_price: oderDTO.totalPrice,
        orderStatus: OrderStatus.Checking,
        payment_method: oderDTO.paymentMethod,
        employee_id: null,
        user_id: oderDTO.user_id,
        location_id: oderDTO.location_id,
        paymentStatus: oderDTO.paymentStatus,
      });

      const orderData = await queryRunner.manager.save(order);

      const order_products = oderDTO.products.map((item) => {
        return this.orderProductRepo.create({
          quantity: item.quantity,
          priceout: item.priceout,
          product_id: item.product_id,
          order_id: orderData.id,
        });
      });

      await queryRunner.manager.save(order_products);
      // Commit transaction
      await queryRunner.commitTransaction();

      //Tạo thông báo có order mới
      // await this.createNotificationOrderSuccess(order);
      return orderData;
    } catch (e) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'ORDER.OCCUR ERROR WHEN SAVE TO DATABASE!',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createNotificationOrderSuccess(order: OrderEntity) {
    const user = await this.userRepo.findOneBy({ id: order.user_id });
    const message = `Bạn có đơn hàng mới từ khách hàng ${user.firstName + ' ' + user.lastName}`;

    const admins = await this.userRepo.find({
      where: { role: 'admin', isActive: true },
    });
    const emailList = admins.map((admin) => admin?.email);

    await this.notificationService.sendNotification(order, message, NotificationStatus.Success, NotificationType.NewOrder);

    if (emailList.length > 0) {
      const emailEntities: Email_entity[] = emailList.map((adminEmail) => {
        const email = new Email_entity();
        email.emailSend = AccountNotify.USER; // Email gửi
        email.emailReceive = adminEmail; // Email nhận
        email.header = NotificationType.NewOrder; // Tiêu đề email
        email.content = message; // Nội dung dạng text
        email.htmlContent = `<p>${message}</p>`; // Nội dung HTML
        return email;
      });

      await this.emailService.sendNotificationEmail(emailEntities); // Gửi email nếu offline
    }
  }

  async getAllOrder(user_id: string, allOderDTO: OrderAllOrderDto) {
    const [productOrders, totalOrders] = await this.orderRepo.findAndCount({
      where: { user_id: user_id },
      relations: ['orderProducts'],
      skip: (allOderDTO.page - 1) * allOderDTO.limit,
      take: allOderDTO.limit,
    });

    return {
      list: productOrders,
      total: totalOrders,
    };
  }

  async getOrderManagement(
    page: number,
    limit: number,
    filters: {
      orderStatus: string;
      paymentStatus: string;
      includedStatuses: OrderStatus[];
      excludedStatuses: OrderStatus[];
    },
  ) {
    const { orderStatus, paymentStatus, includedStatuses, excludedStatuses } =
      filters;

    const query = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.employee', 'employee')
      .leftJoinAndSelect('order.orderProducts', 'orderProduct')
      .leftJoinAndSelect('orderProduct.product', 'product')
      .leftJoinAndSelect('order.location', 'location');

    if (orderStatus) {
      query.andWhere('order.orderStatus = :orderStatus', { orderStatus });
    }
    if (paymentStatus) {
      query.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus });
    }
    if (includedStatuses.length > 0) {
      query.andWhere('order.orderStatus IN (:...includedStatuses)', {
        includedStatuses,
      });
    }
    if (excludedStatuses.length > 0) {
      query.andWhere('order.orderStatus NOT IN (:...excludedStatuses)', {
        excludedStatuses,
      });
    }

    query.skip((page - 1) * limit).take(limit);
    const [orders, total] = await query.getManyAndCount();
    const ordersWithProducts = orders.map((order) => {
      return {
        order: order
          ? {
              id: order.id,
              createdAt: order.createdAt,
              order_code: order.order_code,
              total_price: order.total_price,
              orderStatus: order.orderStatus,
              payment_method: order.payment_method,
              paymentStatus: order.paymentStatus,
              products:
                order.orderProducts?.map((orderProduct) => ({
                  productId: orderProduct.product.id,
                  productName: orderProduct.product.name,
                  priceout: orderProduct.priceout,
                  quantityBuy: orderProduct.quantity,
                  quantityInStock: orderProduct.product.stockQuantity,
                })) || [],
              user: order.user
                ? {
                    id: order.user.id,
                    firstName: order.user.firstName,
                    lastName: order.user.lastName,
                  }
                : null,
              employee: order.employee
                ? {
                    id: order.employee.id,
                    firstName: order.employee.firstName,
                    lastName: order.employee.lastName,
                  }
                : null,
              location: order.location
                ? {
                    id: order.location.id,
                    address: order.location.address,
                    phone: order.location.phone,
                    defaultLocation: order.location.default_location,
                  }
                : null,
            }
          : null,
      };
    });

    const order_ids = orders.map((order) => order.id);
    const unique_order_ids = [...new Set(order_ids)];

    if (excludedStatuses.length > 0) {
      const productInStock =
        await this.getQuantityProductInStock(unique_order_ids);
      const orderStatusCounts = await this.getOrderStatusCount(
        unique_order_ids,
        excludedStatuses,
        true,
      );
      const orderStatusSummary = orderStatusCounts.reduce((acc, item) => {
        acc[item.orderStatus] = item.count;
        return acc;
      }, {});
      return {
        orders: ordersWithProducts,
        productInStock,
        total,
        orderStatusSummary,
      };
    }

    const orderStatusCounts = await this.getOrderStatusCount(
      unique_order_ids,
      includedStatuses,
      false,
    );
    const orderStatusSummary = orderStatusCounts.reduce((acc, item) => {
      acc[item.orderStatus] = item.count;
      return acc;
    }, {});
    return { orders: ordersWithProducts, total, orderStatusSummary };
  }

  async getQuantityProductInStock(order_ids: string[]) {
    if (!order_ids || order_ids.length === 0) {
      return [];
    }
    const productQuantity = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.orderProducts', 'orderProduct')
      .leftJoin('orderProduct.product', 'product')
      .where('order.id IN (:...order_ids)', { order_ids })
      .andWhere('product.id IS NOT NULL')
      .select([
        'DISTINCT product.id AS id',
        'product.name AS name',
        'product.stockQuantity AS stockQuantity',
      ])
      .getRawMany();
    return productQuantity;
  }

  async getOrderStatusCount(
    order_ids: string[],
    statuses: OrderStatus[],
    isExclusion: boolean = false,
  ) {
    if (!order_ids || order_ids.length === 0) {
      return [];
    }

    const query = this.orderRepo
        .createQueryBuilder('order')
        .where('order.id IN (:...order_ids)', { order_ids });

    if (statuses && statuses.length > 0) {
      if (isExclusion) {
        query.andWhere('order.orderStatus NOT IN (:...statuses)', { statuses });
      } else {
        query.andWhere('order.orderStatus IN (:...statuses)', { statuses });
      }
    }

    const orderStatusCounts = await query
        .select('order.orderStatus, COUNT(order.id) AS count')
        .groupBy('order.orderStatus')
        .getRawMany();


    return orderStatusCounts;
  }

  async getDetail(order_id: string) {
    const order = await this.orderRepo.findOne({
      where: { id: order_id },
      relations: ['orderProducts', 'orderProducts.product', 'location'],
    });

    if (!order) {
      throw new Error('ORDER.ORDER DETAIL NOT EXSIST!');
    }
    return order;
  }

  async getOrderUserDashboard(user_id: string) {
    try {
      const allStatuses = Object.values(OrderStatus);

      const ordersSummary = await this.orderRepo
          .createQueryBuilder('order')
          .select('order.orderStatus', 'orderStatus')
          .addSelect('COUNT(*)', 'count')
          .where('order.user_id = :user_id', { user_id })
          .groupBy('order.orderStatus')
          .getRawMany();

      const statusSummary = allStatuses.reduce((summary, status) => {
        summary[status] = 0;
        return summary;
      }, {});

      for (const item of ordersSummary) {
        statusSummary[item.orderStatus] = parseInt(item.count, 10);
      }

      const totalOrders = await this.orderRepo.count({
        where: { user_id },
      });

      return {
          totalOrders,
          statusSummary,
      };
    } catch (error) {
      return {
        error: error.toString(),
      };
    }
  }



  async updateOrder(updateOrderDTO: UpdateOrderDTO) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await this.orderRepo.findOne({
        where: { id: updateOrderDTO.order_id },
        relations: ['orderProducts'],
      });

      if (!order) {
        throw new Error('ORDER.ORDER UPDATE NOT FOUND!');
      }
      if(updateOrderDTO.orderStatus != null) order.orderStatus = updateOrderDTO.orderStatus;
      if(updateOrderDTO.employee_id != null) order.employee_id = updateOrderDTO.employee_id;
      if(updateOrderDTO.paymentStatus != null) order.paymentStatus = Object.values(PaymentStatus).find((value) => value === updateOrderDTO.paymentStatus);;

      // Lưu thay đổi vào cơ sở dữ liệu
      return await this.orderRepo.save(order);
    } catch (e) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'ORDER.OCCUR ERROR WHEN UPDATE TO DATABASE!',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
