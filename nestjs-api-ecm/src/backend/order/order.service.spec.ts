import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrderService } from './order.service';
import { OrderEntity } from 'src/entities/order_entity/oder.entity';
import { Order_productEntity } from 'src/entities/order_entity/order_product.entity';
import { User } from 'src/entities/user_entity/user.entity';
import { Cart_productEntity } from 'src/entities/cartproduct_entity/cart_product.entity';
import { CreateOrderDto } from 'src/dto/orderDTO/order.create.dto';
import { OrderAllOrderDto } from 'src/dto/orderDTO/order.allOrder.dto';
import { UpdateOrderDTO } from 'src/dto/orderDTO/order.update.dto';
import { OrderStatus, PaymentMethod, PaymentStatus, NotificationStatus, NotificationType } from 'src/share/Enum/Enum';
import { NotificationService } from 'src/backend/notification/notification.service';
import { EmailService } from 'src/backend/email/email.service';
import { OrderRepository } from 'src/repository/OrderRepository';
import { UserRepository } from 'src/repository/UserRepository';
import { CartRepository } from 'src/repository/CartRepository';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepo: jest.Mocked<OrderRepository>;
  let orderProductRepo: jest.Mocked<Repository<Order_productEntity>>;
  let userRepo: jest.Mocked<UserRepository>;
  let cartRepo: jest.Mocked<CartRepository>;
  let dataSource: jest.Mocked<DataSource>;
  let notificationService: jest.Mocked<NotificationService>;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            findAndCount: jest.fn(),
            createQueryBuilder: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Order_productEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Cart_productEntity),
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              manager: {
                save: jest.fn(),
              },
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
            }),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            sendNotification: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendNotificationEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepo = module.get(getRepositoryToken(OrderEntity));
    orderProductRepo = module.get(getRepositoryToken(Order_productEntity));
    userRepo = module.get(getRepositoryToken(User));
    cartRepo = module.get(getRepositoryToken(Cart_productEntity));
    dataSource = module.get(DataSource);
    notificationService = module.get(NotificationService);
    emailService = module.get(EmailService);
  });

  /**
   * Mã: TC-OS-001
   * Test case: Kiểm tra khởi tạo service
   * Mục tiêu: Đảm bảo service được khởi tạo thành công
   * Input: Không có
   * Output mong đợi: Service được định nghĩa
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test chức năng createOrder của OrderService
  describe('createOrder', () => {
    // Mã: TC-OS-002
    // Test case: Tạo đơn hàng thành công
    // Mục tiêu: Kiểm tra xem hàm createOrder có tạo và lưu đơn hàng thành công không
    // Input: CreateOrderDto với thông tin hợp lệ
    // Output mong đợi: Đơn hàng được tạo với các thông tin khớp với mockOrder
    it('should successfully create an order', async () => {
      const mockOrderDto: CreateOrderDto = {
        user_id: 'user1',
        location_id: 'loc1',
        totalPrice: 100,
        paymentMethod: PaymentMethod.CashOnDelivery,
        paymentStatus: PaymentStatus.Unpaid,
        orderStatus: OrderStatus.Checking,
        products: [
          { product_id: 'prod1', quantity: 2, priceout: 50 },
          { product_id: 'prod2', quantity: 1, priceout: 50 },
        ],
      };

      const mockOrder = {
        id: 'order1',
        order_code: 'ORD123',
        ...mockOrderDto,
        orderStatus: OrderStatus.Checking,
        employee_id: null,
      };

      const mockOrderProducts = mockOrderDto.products.map((p) => ({
        ...p,
        order_id: 'order1',
      }));

      orderRepo.create.mockReturnValue(mockOrder as any);
      orderProductRepo.create.mockImplementation((p) => p as any);

      const queryRunner = dataSource.createQueryRunner();
      (queryRunner.manager.save as any)
        .mockResolvedValueOnce(mockOrder)
        .mockResolvedValueOnce(mockOrderProducts);

      const result = await service.createOrder(mockOrderDto);

      expect(result).toEqual(mockOrder);
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    // Mã: TC-OS-003
    // Test case: Xử lý lỗi khi tạo đơn hàng
    // Mục tiêu: Kiểm tra xem hàm createOrder có rollback transaction và throw lỗi khi xảy ra lỗi không
    // Input: CreateOrderDto hợp lệ nhưng mock lỗi khi lưu vào database
    // Output mong đợi: Throw InternalServerErrorException với message 'ORDER.OCCUR ERROR WHEN SAVE TO DATABASE!'
    it('should handle errors during order creation', async () => {
      const mockOrderDto: CreateOrderDto = {
        user_id: 'user1',
        location_id: 'loc1',
        totalPrice: 100,
        paymentMethod: PaymentMethod.CashOnDelivery,
        paymentStatus: PaymentStatus.Unpaid,
        orderStatus: OrderStatus.Checking,
        products: [
          { product_id: 'prod1', quantity: 2, priceout: 50 },
          { product_id: 'prod2', quantity: 1, priceout: 50 },
        ],
      };

      const queryRunner = dataSource.createQueryRunner();
      (queryRunner.manager.save as any).mockRejectedValue(new Error('DB error'));

      await expect(service.createOrder(mockOrderDto)).rejects.toThrow(
        'ORDER.OCCUR ERROR WHEN SAVE TO DATABASE!',
      );

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  // Test chức năng createNotificationOrderSuccess của OrderService
  describe('createNotificationOrderSuccess', () => {
    // Mã: TC-OS-004
    // Test case: Tạo thông báo thành công với admin
    // Mục tiêu: Kiểm tra xem hàm createNotificationOrderSuccess có gửi thông báo và email cho admin không
    // Input: OrderEntity với user_id hợp lệ và có admin
    // Output mong đợi: Gửi thông báo và email thành công
    it('should create notification and send emails for new order with admins', async () => {
      const mockOrder = {
        id: 'order1',
        user_id: 'user1',
        orderStatus: OrderStatus.Checking,
        paymentStatus: PaymentStatus.Unpaid,
      } as OrderEntity;

      const mockUser = {
        id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
      } as User;

      const mockAdmins = [
        { id: 'admin1', email: 'admin1@test.com', role: 'admin', isActive: true },
        { id: 'admin2', email: 'admin2@test.com', role: 'admin', isActive: true },
      ] as User[];

      (userRepo.findOneBy as any).mockResolvedValue(mockUser);
      (userRepo.find as any).mockResolvedValue(mockAdmins);

      await service.createNotificationOrderSuccess(mockOrder);

      expect(notificationService.sendNotification).toHaveBeenCalledWith(
        mockOrder,
        expect.stringContaining('John Doe'),
        NotificationStatus.Success,
        NotificationType.NewOrder,
      );
      expect(emailService.sendNotificationEmail).toHaveBeenCalled();
    });

    // Mã: TC-OS-005
    // Test case: Tạo thông báo khi không có admin
    // Mục tiêu: Kiểm tra xem hàm createNotificationOrderSuccess có chỉ gửi thông báo mà không gửi email khi không có admin không
    // Input: OrderEntity với user_id hợp lệ nhưng không có admin
    // Output mong đợi: Chỉ gửi thông báo, không gửi email
    it('should handle case with no admins', async () => {
      const mockOrder = {
        id: 'order1',
        user_id: 'user1',
      } as OrderEntity;

      const mockUser = {
        id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
      } as User;

      (userRepo.findOneBy as any).mockResolvedValue(mockUser);
      (userRepo.find as any).mockResolvedValue([]);

      await service.createNotificationOrderSuccess(mockOrder);

      expect(notificationService.sendNotification).toHaveBeenCalled();
      expect(emailService.sendNotificationEmail).not.toHaveBeenCalled();
    });
  });

  // Test chức năng getAllOrder của OrderService
  describe('getAllOrder', () => {
    // Mã: TC-OS-006
    // Test case: Lấy danh sách đơn hàng phân trang thành công
    // Mục tiêu: Kiểm tra xem hàm getAllOrder có trả về danh sách đơn hàng phân trang đúng không
    // Input: userId và OrderAllOrderDto với page=1, limit=10
    // Output mong đợi: Danh sách đơn hàng và tổng số đơn hàng
    it('should return paginated orders for a user', async () => {
      const userId = 'user1';
      const mockDto: OrderAllOrderDto = {
        page: 1,
        limit: 10,
      };

      const mockOrders = [
        { id: 'order1', user_id: userId },
        { id: 'order2', user_id: userId },
      ] as OrderEntity[];

      (orderRepo.findAndCount as any).mockResolvedValue([mockOrders, 2]);

      const result = await service.getAllOrder(userId, mockDto);

      expect(result).toEqual({
        list: mockOrders,
        total: 2,
      });
      expect(orderRepo.findAndCount).toHaveBeenCalledWith({
        where: { user_id: userId },
        relations: ['orderProducts'],
        skip: 0,
        take: 10,
      });
    });

    // Mã: TC-OS-007
    // Test case: Lấy danh sách đơn hàng khi không có đơn hàng nào
    // Mục tiêu: Kiểm tra xem hàm getAllOrder có trả về danh sách rỗng khi không có đơn hàng không
    // Input: userId và OrderAllOrderDto với page=1, limit=10
    // Output mong đợi: Danh sách rỗng và tổng số là 0
    it('should return empty list if no orders', async () => {
      const userId = 'user1';
      const mockDto: OrderAllOrderDto = {
        page: 1,
        limit: 10,
      };

      (orderRepo.findAndCount as any).mockResolvedValue([[], 0]);

      const result = await service.getAllOrder(userId, mockDto);

      expect(result).toEqual({
        list: [],
        total: 0,
      });
    });
  });

  // Test chức năng getOrderManagement của OrderService
  describe('getOrderManagement', () => {
    // Mã: TC-OS-008
    // Test case: Lấy danh sách đơn hàng với bộ lọc trạng thái
    // Mục tiêu: Kiểm tra xem hàm getOrderManagement có trả về danh sách đơn hàng với bộ lọc trạng thái và tóm tắt trạng thái không
    // Input: page=1, limit=10, filters với orderStatus, paymentStatus và includedStatuses
    // Output mong đợi: Danh sách đơn hàng, tổng số và tóm tắt trạng thái
    it('should return filtered orders with status summary', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([
          [
            {
              id: 'order1',
              orderStatus: OrderStatus.Checking,
              paymentStatus: PaymentStatus.Unpaid,
              orderProducts: [
                {
                  product: { id: 'prod1', name: 'Product 1', stockQuantity: 10 },
                  priceout: 50,
                  quantity: 2,
                },
              ],
              user: { id: 'user1', firstName: 'John', lastName: 'Doe' },
              employee: null,
              location: { id: 'loc1', address: '123 Street', phone: '123456', default_location: true },
            },
          ],
          1,
        ]),
        getRawMany: jest.fn().mockResolvedValue([
          { orderStatus: OrderStatus.Checking, count: '1' },
        ]),
      };

      (orderRepo.createQueryBuilder as any).mockReturnValue(mockQueryBuilder);

      const result = await service.getOrderManagement(1, 10, {
        orderStatus: OrderStatus.Checking,
        paymentStatus: PaymentStatus.Unpaid,
        includedStatuses: [OrderStatus.Checking],
        excludedStatuses: [],
      });

      expect(result).toEqual({
        orders: expect.any(Array),
        total: 1,
        orderStatusSummary: expect.any(Object),
      });
      expect(result.orders[0].order.products).toEqual([
        {
          productId: 'prod1',
          productName: 'Product 1',
          priceout: 50,
          quantityBuy: 2,
          quantityInStock: 10,
        },
      ]);
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.orderStatus = :orderStatus',
        { orderStatus: OrderStatus.Checking },
      );
    });

    // Mã: TC-OS-009
    // Test case: Lấy danh sách đơn hàng với trạng thái bị loại trừ
    // Mục tiêu: Kiểm tra xem hàm getOrderManagement có trả về danh sách đơn hàng với trạng thái bị loại trừ không
    // Input: page=1, limit=10, filters với excludedStatuses
    // Output mong đợi: Danh sách đơn hàng, số lượng sản phẩm trong kho và tóm tắt trạng thái
    it('should return orders with excluded statuses', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([
          [
            {
              id: 'order1',
              orderStatus: OrderStatus.Checking,
              paymentStatus: PaymentStatus.Unpaid,
              orderProducts: [],
              user: { id: 'user1', firstName: 'John', lastName: 'Doe' },
              employee: { id: 'emp1', firstName: 'Emp', lastName: 'One' },
              location: { id: 'loc1', address: '123 Street', phone: '123456', default_location: true },
            },
          ],
          1,
        ]),
        getRawMany: jest.fn().mockResolvedValue([
          { orderStatus: OrderStatus.Checking, count: '1' },
        ]),
      };

      (orderRepo.createQueryBuilder as any).mockReturnValue(mockQueryBuilder);

      const result = await service.getOrderManagement(1, 10, {
        orderStatus: '',
        paymentStatus: '',
        includedStatuses: [],
        excludedStatuses: [OrderStatus.Delivered],
      });

      expect(result).toHaveProperty('productInStock');
      expect(result).toHaveProperty('orderStatusSummary');
      expect(result.total).toBe(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.orderStatus NOT IN (:...excludedStatuses)',
        { excludedStatuses: [OrderStatus.Delivered] },
      );
    });

    // Mã: TC-OS-010
    // Test case: Lấy danh sách đơn hàng khi không có đơn hàng nào
    // Mục tiêu: Kiểm tra xem hàm getOrderManagement có trả về danh sách rỗng và bao phủ nhánh trong getQuantityProductInStock và getOrderStatusCount không
    // Input: page=1, limit=10, filters với excludedStatuses
    // Output mong đợi: Danh sách rỗng, productInStock rỗng và orderStatusSummary rỗng
    it('should handle case with no orders to cover getQuantityProductInStock and getOrderStatusCount', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      (orderRepo.createQueryBuilder as any).mockReturnValue(mockQueryBuilder);

      const result = await service.getOrderManagement(1, 10, {
        orderStatus: '',
        paymentStatus: '',
        includedStatuses: [],
        excludedStatuses: [OrderStatus.Delivered],
      });

      expect(result).toEqual({
        orders: [],
        productInStock: [],
        total: 0,
        orderStatusSummary: {},
      });
    });

    // Mã: TC-OS-011
    // Test case: Lấy danh sách đơn hàng với employee và location là null
    // Mục tiêu: Kiểm tra xem hàm getOrderManagement có xử lý đúng khi employee và location là null không (bao phủ nhánh trong ordersWithProducts)
    // Input: page=1, limit=10, filters với excludedStatuses
    // Output mong đợi: Danh sách đơn hàng với employee và location là null
    it('should handle case with null employee and location', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([
          [
            {
              id: 'order1',
              orderStatus: OrderStatus.Checking,
              paymentStatus: PaymentStatus.Unpaid,
              orderProducts: [],
              user: { id: 'user1', firstName: 'John', lastName: 'Doe' },
              employee: null,
              location: null,
            },
          ],
          1,
        ]),
        getRawMany: jest.fn().mockResolvedValue([
          { orderStatus: OrderStatus.Checking, count: '1' },
        ]),
      };

      (orderRepo.createQueryBuilder as any).mockReturnValue(mockQueryBuilder);

      const result = await service.getOrderManagement(1, 10, {
        orderStatus: '',
        paymentStatus: '',
        includedStatuses: [],
        excludedStatuses: [],
      });

      expect(result).toEqual({
        orders: expect.any(Array),
        total: 1,
        orderStatusSummary: expect.any(Object),
      });
      expect(result.orders[0].order.employee).toBeNull();
      expect(result.orders[0].order.location).toBeNull();
    });

    // Mã: TC-OS-012
    // Test case: Lấy danh sách đơn hàng với bộ lọc kết hợp orderStatus và includedStatuses
    // Mục tiêu: Kiểm tra xem hàm getOrderManagement có xử lý đúng khi kết hợp nhiều bộ lọc không (bao phủ các nhánh trong điều kiện lọc)
    // Input: page=1, limit=10, filters với orderStatus và includedStatuses
    // Output mong đợi: Danh sách đơn hàng và tóm tắt trạng thái
    it('should handle case with combined filters', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([
          [
            {
              id: 'order1',
              orderStatus: OrderStatus.Checking,
              paymentStatus: PaymentStatus.Unpaid,
              orderProducts: [],
              user: { id: 'user1', firstName: 'John', lastName: 'Doe' },
              employee: null,
              location: null,
            },
          ],
          1,
        ]),
        getRawMany: jest.fn().mockResolvedValue([
          { orderStatus: OrderStatus.Checking, count: '1' },
        ]),
      };

      (orderRepo.createQueryBuilder as any).mockReturnValue(mockQueryBuilder);

      const result = await service.getOrderManagement(1, 10, {
        orderStatus: OrderStatus.Checking,
        paymentStatus: '',
        includedStatuses: [OrderStatus.Checking, OrderStatus.WaitingForDelivered],
        excludedStatuses: [],
      });

      expect(result).toEqual({
        orders: expect.any(Array),
        total: 1,
        orderStatusSummary: expect.any(Object),
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.orderStatus = :orderStatus',
        { orderStatus: OrderStatus.Checking },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.orderStatus IN (:...includedStatuses)',
        { includedStatuses: [OrderStatus.Checking, OrderStatus.WaitingForDelivered] },
      );
    });
  });

  // Test chức năng getDetail của OrderService
  describe('getDetail', () => {
    // Mã: TC-OS-013
    // Test case: Lấy chi tiết đơn hàng thành công
    // Mục tiêu: Kiểm tra xem hàm getDetail có trả về chi tiết đơn hàng đúng không
    // Input: orderId hợp lệ
    // Output mong đợi: Chi tiết đơn hàng khớp với mockOrder
    it('should return order details', async () => {
      const orderId = 'order1';
      const mockOrder = {
        id: orderId,
        orderProducts: [],
        location: { id: 'loc1' },
      } as OrderEntity;

      (orderRepo.findOne as any).mockResolvedValue(mockOrder);

      const result = await service.getDetail(orderId);

      expect(result).toEqual(mockOrder);
      expect(orderRepo.findOne).toHaveBeenCalledWith({
        where: { id: orderId },
        relations: ['orderProducts', 'orderProducts.product', 'location'],
      });
    });

    // Mã: TC-OS-014
    // Test case: Lấy chi tiết đơn hàng không tồn tại
    // Mục tiêu: Kiểm tra xem hàm getDetail có throw lỗi khi không tìm thấy đơn hàng không
    // Input: orderId không tồn tại
    // Output mong đợi: Throw Error với message 'ORDER.ORDER DETAIL NOT EXSIST!'
    it('should throw error when order not found', async () => {
      (orderRepo.findOne as any).mockResolvedValue(null);

      await expect(service.getDetail('nonexistent')).rejects.toThrow(
        'ORDER.ORDER DETAIL NOT EXSIST!',
      );
    });

    // Mã: TC-OS-015
    // Test case: Lấy chi tiết đơn hàng với các quan hệ null
    // Mục tiêu: Kiểm tra xem hàm getDetail có xử lý đúng khi orderProducts và location là null không
    // Input: orderId hợp lệ nhưng orderProducts và location là null
    // Output mong đợi: Chi tiết đơn hàng với orderProducts và location là null
    it('should handle order with null relations', async () => {
      const orderId = 'order1';
      const mockOrder = {
        id: orderId,
        orderProducts: null,
        location: null,
      } as OrderEntity;

      (orderRepo.findOne as any).mockResolvedValue(mockOrder);

      const result = await service.getDetail(orderId);

      expect(result).toEqual(mockOrder);
      expect(orderRepo.findOne).toHaveBeenCalledWith({
        where: { id: orderId },
        relations: ['orderProducts', 'orderProducts.product', 'location'],
      });
    });
  });

  // Test chức năng getOrderUserDashboard của OrderService
  describe('getOrderUserDashboard', () => {
    // Mã: TC-OS-016
    // Test case: Lấy tóm tắt đơn hàng cho dashboard người dùng
    // Mục tiêu: Kiểm tra xem hàm getOrderUserDashboard có trả về tóm tắt trạng thái đơn hàng không
    // Input: userId hợp lệ
    // Output mong đợi: Tổng số đơn hàng và tóm tắt trạng thái
    it('should return order summary for user dashboard', async () => {
      const userId = 'user1';
      const mockStatusCounts = [
        { orderStatus: OrderStatus.Checking, count: '2' },
        { orderStatus: OrderStatus.Delivered, count: '1' },
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStatusCounts),
      };

      (orderRepo.createQueryBuilder as any).mockReturnValue(mockQueryBuilder);
      (orderRepo.count as any).mockResolvedValue(3);

      const result = await service.getOrderUserDashboard(userId);

      expect(result).toEqual({
        totalOrders: 3,
        statusSummary: expect.objectContaining({
          [OrderStatus.Checking]: 2,
          [OrderStatus.Delivered]: 1,
        }),
      });
    });

    // Mã: TC-OS-017
    // Test case: Xử lý lỗi khi lấy tóm tắt đơn hàng
    // Mục tiêu: Kiểm tra xem hàm getOrderUserDashboard có trả về lỗi khi query thất bại không
    // Input: userId hợp lệ nhưng query thất bại
    // Output mong đợi: Đối tượng chứa thông tin lỗi
    it('should return error for getOrderUserDashboard on error', async () => {
      const userId = 'user1';
      (orderRepo.createQueryBuilder as any).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockRejectedValue(new Error('Query failed')),
      });
      (orderRepo.count as any).mockResolvedValue(0);

      const result = await service.getOrderUserDashboard(userId);

      expect(result).toEqual({ error: 'Error: Query failed' });
    });

    // Mã: TC-OS-018
    // Test case: Lấy tóm tắt đơn hàng khi không có đơn hàng nào
    // Mục tiêu: Kiểm tra xem hàm getOrderUserDashboard có trả về số 0 khi không có đơn hàng không
    // Input: userId hợp lệ nhưng không có đơn hàng
    // Output mong đợi: Tổng số đơn hàng là 0 và tóm tắt trạng thái với tất cả giá trị là 0
    it('should return zero counts if no orders', async () => {
      const userId = 'user1';
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      (orderRepo.createQueryBuilder as any).mockReturnValue(mockQueryBuilder);
      (orderRepo.count as any).mockResolvedValue(0);

      const result = await service.getOrderUserDashboard(userId);

      expect(result).toEqual({
        totalOrders: 0,
        statusSummary: expect.objectContaining({
          [OrderStatus.Checking]: 0,
          [OrderStatus.Delivered]: 0,
        }),
      });
    });
  });

  // Test chức năng updateOrder của OrderService
  describe('updateOrder', () => {
    // Mã: TC-OS-019
    // Test case: Cập nhật đơn hàng thành công
    // Mục tiêu: Kiểm tra xem hàm updateOrder có cập nhật đơn hàng thành công không
    // Input: UpdateOrderDTO với thông tin hợp lệ
    // Output mong đợi: Đơn hàng được cập nhật với thông tin mới
    it('should successfully update an order', async () => {
      const mockUpdateDto: UpdateOrderDTO = {
        order_id: 'order1',
        orderStatus: OrderStatus.WaitingForDelivered,
        user_id: 'user1',
        employee_id: 'emp1',
        paymentStatus: PaymentStatus.Paid,
      };

      const mockOrder: Partial<OrderEntity> = {
        id: 'order1',
        orderStatus: OrderStatus.Checking,
        employee_id: null,
        paymentStatus: PaymentStatus.Unpaid,
        orderProducts: [],
      };

      const updatedOrder = {
        ...mockOrder,
        orderStatus: mockUpdateDto.orderStatus,
        employee_id: mockUpdateDto.employee_id,
        paymentStatus: mockUpdateDto.paymentStatus,
      };

      (orderRepo.findOne as any).mockResolvedValue(mockOrder as OrderEntity);
      (orderRepo.save as any).mockResolvedValue(updatedOrder as OrderEntity);

      const queryRunner = dataSource.createQueryRunner();
      (queryRunner.connect as any).mockResolvedValue(undefined);
      (queryRunner.startTransaction as any).mockResolvedValue(undefined);
      (queryRunner.commitTransaction as any).mockResolvedValue(undefined);
      (queryRunner.release as any).mockResolvedValue(undefined);

      const result = await service.updateOrder(mockUpdateDto);

      expect(result).toEqual(updatedOrder);
      expect(result.orderStatus).toBe(OrderStatus.WaitingForDelivered);
      expect(result.employee_id).toBe('emp1');
      expect(result.paymentStatus).toBe(PaymentStatus.Paid);
      expect(orderRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockUpdateDto.order_id },
        relations: ['orderProducts'],
      });
      expect(orderRepo.save).toHaveBeenCalledWith(mockOrder);
    });

    // Mã: TC-OS-020
    // Test case: Cập nhật đơn hàng không tồn tại
    // Mục tiêu: Kiểm tra xem hàm updateOrder có throw lỗi khi đơn hàng không tồn tại không
    // Input: UpdateOrderDTO với order_id không tồn tại
    // Output mong đợi: Throw Error với message 'ORDER.OCCUR ERROR WHEN UPDATE TO DATABASE!'
    it('should throw error when order not found', async () => {
      (orderRepo.findOne as any).mockResolvedValue(null);

      const queryRunner = dataSource.createQueryRunner();
      (queryRunner.connect as any).mockResolvedValue(undefined);
      (queryRunner.startTransaction as any).mockResolvedValue(undefined);
      (queryRunner.rollbackTransaction as any).mockResolvedValue(undefined);
      (queryRunner.release as any).mockResolvedValue(undefined);

      await expect(
        service.updateOrder({ order_id: 'nonexistent' } as UpdateOrderDTO),
      ).rejects.toThrow('ORDER.OCCUR ERROR WHEN UPDATE TO DATABASE!');
    });

    // Mã: TC-OS-021
    // Test case: Xử lý lỗi khi cập nhật đơn hàng
    // Mục tiêu: Kiểm tra xem hàm updateOrder có rollback transaction và throw lỗi khi xảy ra lỗi không
    // Input: UpdateOrderDTO hợp lệ nhưng mock lỗi khi lưu vào database
    // Output mong đợi: Throw InternalServerErrorException với message 'ORDER.OCCUR ERROR WHEN UPDATE TO DATABASE!'
    it('should throw InternalServerErrorException on save error', async () => {
      const mockUpdateDto: UpdateOrderDTO = {
        order_id: 'order1',
        orderStatus: OrderStatus.WaitingForDelivered,
        user_id: 'user1',
        employee_id: 'emp1',
        paymentStatus: PaymentStatus.Paid,
      };

      const mockOrder: Partial<OrderEntity> = {
        id: 'order1',
        orderStatus: OrderStatus.Checking,
        employee_id: null,
        paymentStatus: PaymentStatus.Unpaid,
        orderProducts: [],
      };

      (orderRepo.findOne as any).mockResolvedValue(mockOrder as OrderEntity);
      (orderRepo.save as any).mockRejectedValue(new Error('Save failed'));

      const queryRunner = dataSource.createQueryRunner();
      (queryRunner.connect as any).mockResolvedValue(undefined);
      (queryRunner.startTransaction as any).mockResolvedValue(undefined);
      (queryRunner.rollbackTransaction as any).mockResolvedValue(undefined);
      (queryRunner.release as any).mockResolvedValue(undefined);

      await expect(service.updateOrder(mockUpdateDto)).rejects.toThrow(
        'ORDER.OCCUR ERROR WHEN UPDATE TO DATABASE!',
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    // Mã: TC-OS-022
    // Test case: Cập nhật đơn hàng với paymentStatus là null
    // Mục tiêu: Kiểm tra xem hàm updateOrder có bỏ qua cập nhật paymentStatus khi nó là null không (bao phủ nhánh tại dòng 276)
    // Input: UpdateOrderDTO với paymentStatus là null
    // Output mong đợi: Đơn hàng được cập nhật nhưng paymentStatus không thay đổi
    it('should handle case with null paymentStatus', async () => {
      const mockUpdateDto: UpdateOrderDTO = {
        order_id: 'order1',
        orderStatus: OrderStatus.WaitingForDelivered,
        user_id: 'user1',
        employee_id: 'emp1',
        paymentStatus: null,
      };

      const mockOrder: Partial<OrderEntity> = {
        id: 'order1',
        orderStatus: OrderStatus.Checking,
        employee_id: null,
        paymentStatus: PaymentStatus.Unpaid,
        orderProducts: [],
      };

      const updatedOrder = {
        ...mockOrder,
        orderStatus: mockUpdateDto.orderStatus,
        employee_id: mockUpdateDto.employee_id,
        paymentStatus: PaymentStatus.Unpaid, // Không thay đổi vì paymentStatus là null
      };

      (orderRepo.findOne as any).mockResolvedValue(mockOrder as OrderEntity);
      (orderRepo.save as any).mockResolvedValue(updatedOrder as OrderEntity);

      const queryRunner = dataSource.createQueryRunner();
      (queryRunner.connect as any).mockResolvedValue(undefined);
      (queryRunner.startTransaction as any).mockResolvedValue(undefined);
      (queryRunner.commitTransaction as any).mockResolvedValue(undefined);
      (queryRunner.release as any).mockResolvedValue(undefined);

      const result = await service.updateOrder(mockUpdateDto);

      expect(result).toEqual(updatedOrder);
      expect(result.orderStatus).toBe(OrderStatus.WaitingForDelivered);
      expect(result.employee_id).toBe('emp1');
      expect(result.paymentStatus).toBe(PaymentStatus.Unpaid);
      expect(orderRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockUpdateDto.order_id },
        relations: ['orderProducts'],
      });
      expect(orderRepo.save).toHaveBeenCalledWith(mockOrder);
    });

    // Mã: TC-OS-023
    // Test case: Cập nhật đơn hàng với paymentStatus không hợp lệ
    // Mục tiêu: Kiểm tra xem hàm updateOrder có xử lý đúng khi paymentStatus không thuộc enum PaymentStatus không (bao phủ nhánh tại dòng 276)
    // Input: UpdateOrderDTO với paymentStatus không hợp lệ
    // Output mong đợi: Đơn hàng được cập nhật nhưng paymentStatus sẽ là undefined
    it('should handle case with invalid paymentStatus', async () => {
      const mockUpdateDto: UpdateOrderDTO = {
        order_id: 'order1',
        orderStatus: OrderStatus.WaitingForDelivered,
        user_id: 'user1',
        employee_id: 'emp1',
        paymentStatus: 'INVALID_STATUS' as PaymentStatus,
      };

      const mockOrder: Partial<OrderEntity> = {
        id: 'order1',
        orderStatus: OrderStatus.Checking,
        employee_id: null,
        paymentStatus: PaymentStatus.Unpaid,
        orderProducts: [],
      };

      const updatedOrder = {
        ...mockOrder,
        orderStatus: mockUpdateDto.orderStatus,
        employee_id: mockUpdateDto.employee_id,
        paymentStatus: undefined, // Vì paymentStatus không hợp lệ, find sẽ trả về undefined
      };

      (orderRepo.findOne as any).mockResolvedValue(mockOrder as OrderEntity);
      (orderRepo.save as any).mockResolvedValue(updatedOrder as OrderEntity);

      const queryRunner = dataSource.createQueryRunner();
      (queryRunner.connect as any).mockResolvedValue(undefined);
      (queryRunner.startTransaction as any).mockResolvedValue(undefined);
      (queryRunner.commitTransaction as any).mockResolvedValue(undefined);
      (queryRunner.release as any).mockResolvedValue(undefined);

      const result = await service.updateOrder(mockUpdateDto);

      expect(result).toEqual(updatedOrder);
      expect(result.orderStatus).toBe(OrderStatus.WaitingForDelivered);
      expect(result.employee_id).toBe('emp1');
      expect(result.paymentStatus).toBeUndefined();
      expect(orderRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockUpdateDto.order_id },
        relations: ['orderProducts'],
      });
      expect(orderRepo.save).toHaveBeenCalledWith(mockOrder);
    });

    // Mã: TC-OS-024
    // Test case: Cập nhật đơn hàng với orderStatus là null
    // Mục tiêu: Kiểm tra xem hàm updateOrder có bỏ qua cập nhật orderStatus khi nó là null không
    // Input: UpdateOrderDTO với orderStatus là null
    // Output mong đợi: Đơn hàng được cập nhật nhưng orderStatus không thay đổi
    it('should handle case with null orderStatus', async () => {
      const mockUpdateDto: UpdateOrderDTO = {
        order_id: 'order1',
        orderStatus: null,
        user_id: 'user1',
        employee_id: 'emp1',
        paymentStatus: PaymentStatus.Paid,
      };

      const mockOrder: Partial<OrderEntity> = {
        id: 'order1',
        orderStatus: OrderStatus.Checking,
        employee_id: null,
        paymentStatus: PaymentStatus.Unpaid,
        orderProducts: [],
      };

      const updatedOrder = {
        ...mockOrder,
        employee_id: mockUpdateDto.employee_id,
        paymentStatus: mockUpdateDto.paymentStatus,
      };

      (orderRepo.findOne as any).mockResolvedValue(mockOrder as OrderEntity);
      (orderRepo.save as any).mockResolvedValue(updatedOrder as OrderEntity);

      const queryRunner = dataSource.createQueryRunner();
      (queryRunner.connect as any).mockResolvedValue(undefined);
      (queryRunner.startTransaction as any).mockResolvedValue(undefined);
      (queryRunner.commitTransaction as any).mockResolvedValue(undefined);
      (queryRunner.release as any).mockResolvedValue(undefined);

      const result = await service.updateOrder(mockUpdateDto);

      expect(result).toEqual(updatedOrder);
      expect(result.orderStatus).toBe(OrderStatus.Checking);
      expect(result.employee_id).toBe('emp1');
      expect(result.paymentStatus).toBe(PaymentStatus.Paid);
      expect(orderRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockUpdateDto.order_id },
        relations: ['orderProducts'],
      });
      expect(orderRepo.save).toHaveBeenCalledWith(mockOrder);
    });

    // Mã: TC-OS-025
    // Test case: Cập nhật đơn hàng với employee_id là null
    // Mục tiêu: Kiểm tra xem hàm updateOrder có bỏ qua cập nhật employee_id khi nó là null không
    // Input: UpdateOrderDTO với employee_id là null
    // Output mong đợi: Đơn hàng được cập nhật nhưng employee_id không thay đổi
    it('should handle case with null employee_id', async () => {
      const mockUpdateDto: UpdateOrderDTO = {
        order_id: 'order1',
        orderStatus: OrderStatus.WaitingForDelivered,
        user_id: 'user1',
        employee_id: null,
        paymentStatus: PaymentStatus.Paid,
      };

      const mockOrder: Partial<OrderEntity> = {
        id: 'order1',
        orderStatus: OrderStatus.Checking,
        employee_id: 'emp0',
        paymentStatus: PaymentStatus.Unpaid,
        orderProducts: [],
      };

      const updatedOrder = {
        ...mockOrder,
        orderStatus: mockUpdateDto.orderStatus,
        paymentStatus: mockUpdateDto.paymentStatus,
      };

      (orderRepo.findOne as any).mockResolvedValue(mockOrder as OrderEntity);
      (orderRepo.save as any).mockResolvedValue(updatedOrder as OrderEntity);

      const queryRunner = dataSource.createQueryRunner();
      (queryRunner.connect as any).mockResolvedValue(undefined);
      (queryRunner.startTransaction as any).mockResolvedValue(undefined);
      (queryRunner.commitTransaction as any).mockResolvedValue(undefined);
      (queryRunner.release as any).mockResolvedValue(undefined);

      const result = await service.updateOrder(mockUpdateDto);

      expect(result).toEqual(updatedOrder);
      expect(result.orderStatus).toBe(OrderStatus.WaitingForDelivered);
      expect(result.employee_id).toBe('emp0');
      expect(result.paymentStatus).toBe(PaymentStatus.Paid);
      expect(orderRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockUpdateDto.order_id },
        relations: ['orderProducts'],
      });
      expect(orderRepo.save).toHaveBeenCalledWith(mockOrder);
    });
  });
});