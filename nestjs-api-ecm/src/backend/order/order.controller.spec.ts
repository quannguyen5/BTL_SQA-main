import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { responseHandler } from 'src/Until/responseUtil';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';
import { Roles } from 'src/decorator/Role.decorator';
import { CreateOrderDto } from 'src/dto/orderDTO/order.create.dto';
import { OrderAllOrderDto } from 'src/dto/orderDTO/order.allOrder.dto';
import { UpdateOrderDTO } from 'src/dto/orderDTO/order.update.dto';
import { OrderStatus, PaymentStatus } from 'src/share/Enum/Enum';

jest.mock('src/Until/responseUtil', () => ({
  responseHandler: {
    ok: jest.fn((data) => ({ success: true, data })),
    error: jest.fn((msg) => ({ success: false, message: msg })),
  },
}));

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  const mockOrderService = {
    getAllOrder: jest.fn(),
    getOrderManagement: jest.fn(),
    createOrder: jest.fn(),
    getDetail: jest.fn(),
    updateOrder: jest.fn(),
    getOrderUserDashboard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        { provide: OrderService, useValue: mockOrderService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);

    jest.clearAllMocks();
  });

  // Kiểm tra các chức năng liên quan đến lấy danh sách tất cả đơn hàng của người dùng
  describe('getAllOrder', () => {
    // Mã: TC-OC-001
    // Test case: Lấy danh sách tất cả đơn hàng của người dùng thành công
    // Mục tiêu: Kiểm tra việc lấy danh sách đơn hàng theo user_id
    // Input: user_id = 'user123', dto với page = 1, limit = 10
    // Output mong đợi: Response với danh sách đơn hàng và success = true
    it('should return all orders for a user', async () => {
      const user_id = 'user123';
      const dto: OrderAllOrderDto = { page: 1, limit: 10 };
      const result = { list: [], total: 0 };
      mockOrderService.getAllOrder.mockResolvedValue(result);

      const response = await controller.getAllOrder(user_id, dto);

      expect(service.getAllOrder).toHaveBeenCalledWith(user_id, dto);
      expect(responseHandler.ok).toHaveBeenCalledWith(result);
      expect(response.success).toBe(true);
    });

    // Mã: TC-OC-002
    // Test case: Xử lý lỗi khi lấy danh sách đơn hàng
    // Mục tiêu: Kiểm tra xử lý lỗi khi service throw Error
    // Input: user_id = 'user', dto với page = 1, limit = 1, service throw Error('fail')
    // Output mong đợi: Response với success = false
    it('should handle errors', async () => {
      mockOrderService.getAllOrder.mockRejectedValue(new Error('fail'));
      const response = await controller.getAllOrder('user', { page: 1, limit: 1 });
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });

    // Mã: TC-OC-003
    // Test case: Xử lý lỗi với object không phải Error khi lấy danh sách đơn hàng
    // Mục tiêu: Kiểm tra xử lý khi service trả về object không phải Error
    // Input: user_id = 'user', dto với page = 1, limit = 1, service throw { foo: 'bar' }
    // Output mong đợi: Response với success = false
    it('should handle errors with non-Error object', async () => {
      mockOrderService.getAllOrder.mockRejectedValue({ foo: 'bar' });
      const response = await controller.getAllOrder('user', { page: 1, limit: 1 });
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });
  });

  // Kiểm tra các chức năng liên quan đến quản lý đơn hàng
  describe('getOrderManagement', () => {
    // Mã: TC-OC-004
    // Test case: Lấy danh sách đơn hàng được quản lý thành công
    // Mục tiêu: Kiểm tra việc lấy danh sách đơn hàng quản lý với các bộ lọc mặc định
    // Input: page = 1, limit = 10, orderStatus và paymentStatus undefined, includeExcluded = false
    // Output mong đợi: Response với danh sách đơn hàng và success = true
    it('should return managed orders', async () => {
      const page = 1, limit = 10;
      const filters = {
        orderStatus: '',
        paymentStatus: '',
        includedStatuses: [],
        excludedStatuses: [OrderStatus.Delivered, OrderStatus.Canceled],
      };
      const result = { orders: [], total: 0, orderStatusSummary: {} };
      mockOrderService.getOrderManagement.mockResolvedValue(result);

      const response = await controller.getOrderManagement(
        page,
        limit,
        undefined,
        undefined,
        false
      );

      expect(service.getOrderManagement).toHaveBeenCalled();
      expect(responseHandler.ok).toHaveBeenCalledWith(result);
      expect(response.success).toBe(true);
    });

    // Mã: TC-OC-005
    // Test case: Xử lý includeExcluded true khi không có orderStatus
    // Mục tiêu: Kiểm tra việc lấy danh sách đơn hàng với includeExcluded = true
    // Input: page = 1, limit = 10, orderStatus và paymentStatus undefined, includeExcluded = true
    // Output mong đợi: Response với danh sách đơn hàng và success = true
    it('should handle includeExcluded true and no orderStatus', async () => {
      const page = 1, limit = 10;
      const result = { orders: [], total: 0, orderStatusSummary: {} };
      mockOrderService.getOrderManagement.mockResolvedValue(result);

      const response = await controller.getOrderManagement(
        page,
        limit,
        undefined,
        undefined,
        true // includeExcluded true
      );

      expect(service.getOrderManagement).toHaveBeenCalledWith(
        page,
        limit,
        expect.objectContaining({
          includedStatuses: [OrderStatus.Delivered, OrderStatus.Canceled],
          excludedStatuses: [],
        }),
      );
      expect(response.success).toBe(true);
    });

    // Mã: TC-OC-006
    // Test case: Xử lý includeExcluded false khi không có orderStatus
    // Mục tiêu: Kiểm tra việc lấy danh sách đơn hàng với includeExcluded = false
    // Input: page = 1, limit = 10, orderStatus và paymentStatus undefined, includeExcluded = false
    // Output mong đợi: Response với danh sách đơn hàng và success = true
    it('should handle includeExcluded false and no orderStatus', async () => {
      const page = 1, limit = 10;
      const result = { orders: [], total: 0, orderStatusSummary: {} };
      mockOrderService.getOrderManagement.mockResolvedValue(result);

      const response = await controller.getOrderManagement(
        page,
        limit,
        undefined,
        undefined,
        false // includeExcluded false
      );

      expect(service.getOrderManagement).toHaveBeenCalledWith(
        page,
        limit,
        expect.objectContaining({
          includedStatuses: [],
          excludedStatuses: [OrderStatus.Delivered, OrderStatus.Canceled],
        }),
      );
      expect(response.success).toBe(true);
    });

    // Mã: TC-OC-007
    // Test case: Xử lý khi cung cấp orderStatus (included/excluded nên rỗng)
    // Mục tiêu: Kiểm tra việc lấy danh sách đơn hàng với orderStatus được cung cấp
    // Input: page = 1, limit = 10, orderStatus = Checking, includeExcluded = true
    // Output mong đợi: Response với danh sách đơn hàng và success = true
    it('should handle orderStatus provided (included/excluded should be empty)', async () => {
      const page = 1, limit = 10;
      const result = { orders: [], total: 0, orderStatusSummary: {} };
      mockOrderService.getOrderManagement.mockResolvedValue(result);

      const response = await controller.getOrderManagement(
        page,
        limit,
        OrderStatus.Checking,
        undefined,
        true // includeExcluded true, but orderStatus provided
      );

      expect(service.getOrderManagement).toHaveBeenCalledWith(
        page,
        limit,
        expect.objectContaining({
          orderStatus: OrderStatus.Checking,
          includedStatuses: [],
          excludedStatuses: [],
        }),
      );
      expect(response.success).toBe(true);
    });

    // Mã: TC-OC-008
    // Test case: Xử lý lỗi với object không phải Error khi lấy danh sách quản lý
    // Mục tiêu: Kiểm tra xử lý khi service trả về object không phải Error
    // Input: page = 1, limit = 1, service throw { foo: 'bar' }
    // Output mong đợi: Response với success = false
    it('should handle errors with non-Error object', async () => {
      mockOrderService.getOrderManagement.mockRejectedValue({ foo: 'bar' });
      const response = await controller.getOrderManagement(1, 1, undefined, undefined, false);
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });

    // Mã: TC-OC-009
    // Test case: Xử lý lỗi khi lấy danh sách quản lý
    // Mục tiêu: Kiểm tra xử lý lỗi khi service throw Error
    // Input: page = 1, limit = 1, service throw Error('fail')
    // Output mong đợi: Response với success = false
    it('should handle errors', async () => {
      mockOrderService.getOrderManagement.mockRejectedValue(new Error('fail'));
      const response = await controller.getOrderManagement(1, 1, undefined, undefined, false);
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });
  });

  // Kiểm tra các chức năng liên quan đến tạo đơn hàng
  describe('createOrder', () => {
    // Mã: TC-OC-010
    // Test case: Tạo đơn hàng thành công
    // Mục tiêu: Kiểm tra việc tạo đơn hàng với dữ liệu hợp lệ
    // Input: user_id = 'user123', dto với các trường hợp lệ
    // Output mong đợi: Response với thông tin đơn hàng mới và success = true
    it('should create an order', async () => {
      const user_id = 'user123';
      const dto: CreateOrderDto = {
        totalPrice: 100,
        paymentMethod: 'Thanh toán khi nhận hàng' as any,
        user_id,
        location_id: 'loc1',
        orderStatus: 'Đang kiểm hàng' as any,
        paymentStatus: 'Chưa thanh toán' as any,
        products: [],
      };
      const result = { id: 'order1' };
      mockOrderService.createOrder.mockResolvedValue(result);

      const response = await controller.createOrder(user_id, dto);

      expect(service.createOrder).toHaveBeenCalledWith(dto);
      expect(responseHandler.ok).toHaveBeenCalledWith(result);
      expect(response.success).toBe(true);
    });

    // Mã: TC-OC-011
    // Test case: Xử lý lỗi khi tạo đơn hàng
    // Mục tiêu: Kiểm tra xử lý lỗi khi service throw Error
    // Input: user_id = 'user', dto rỗng, service throw Error('fail')
    // Output mong đợi: Response với success = false
    it('should handle errors', async () => {
      mockOrderService.createOrder.mockRejectedValue(new Error('fail'));
      const response = await controller.createOrder('user', {} as any);
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });

    // Mã: TC-OC-012
    // Test case: Xử lý lỗi với object không phải Error khi tạo đơn hàng
    // Mục tiêu: Kiểm tra xử lý khi service trả về object không phải Error
    // Input: user_id = 'user', dto rỗng, service throw { foo: 'bar' }
    // Output mong đợi: Response với success = false
    it('should handle errors with non-Error object', async () => {
      mockOrderService.createOrder.mockRejectedValue({ foo: 'bar' });
      const response = await controller.createOrder('user', {} as any);
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });
  });

  // Kiểm tra các chức năng liên quan đến lấy chi tiết đơn hàng
  describe('getDetailOrder', () => {
    // Mã: TC-OC-013
    // Test case: Lấy chi tiết đơn hàng thành công
    // Mục tiêu: Kiểm tra việc lấy chi tiết đơn hàng theo id
    // Input: user_id = 'user123', id = 'order1'
    // Output mong đợi: Response với thông tin chi tiết đơn hàng và success = true
    it('should return order detail', async () => {
      const user_id = 'user123', id = 'order1';
      const result = { id: 'order1', detail: true };
      mockOrderService.getDetail.mockResolvedValue(result);

      const response = await controller.getDetailOrder(user_id, id);

      expect(service.getDetail).toHaveBeenCalledWith(id);
      expect(responseHandler.ok).toHaveBeenCalledWith(result);
      expect(response.success).toBe(true);
    });

    // Mã: TC-0C-014
    // Test case: Xử lý lỗi khi lấy chi tiết đơn hàng
    // Mục tiêu: Kiểm tra xử lý lỗi khi service throw Error
    // Input: user_id = 'user', id = 'order', service throw Error('fail')
    // Output mong đợi: Response với success = false
    it('should handle errors', async () => {
      mockOrderService.getDetail.mockRejectedValue(new Error('fail'));
      const response = await controller.getDetailOrder('user', 'order');
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });

    // Mã: TC-OC-015
    // Test case: Xử lý lỗi với object không phải Error khi lấy chi tiết đơn hàng
    // Mục tiêu: Kiểm tra xử lý khi service trả về object không phải Error
    // Input: user_id = 'user', id = 'order', service throw { foo: 'bar' }
    // Output mong đợi: Response với success = false
    it('should handle errors with non-Error object', async () => {
      mockOrderService.getDetail.mockRejectedValue({ foo: 'bar' });
      const response = await controller.getDetailOrder('user', 'order');
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });
  });

  // Kiểm tra các chức năng liên quan đến cập nhật đơn hàng
  describe('updateOrder', () => {
    // Mã: TC-OC-016
    // Test case: Cập nhật đơn hàng thành công
    // Mục tiêu: Kiểm tra việc cập nhật thông tin đơn hàng
    // Input: user_id = 'user123', dto với các trường hợp lệ
    // Output mong đợi: Response với thông tin đơn hàng đã cập nhật và success = true
    it('should update an order', async () => {
      const user_id = 'user123';
      const dto: UpdateOrderDTO = {
        order_id: 'order1',
        orderStatus: 'Đang kiểm hàng' as any,
        user_id,
        employee_id: 'emp1',
        paymentStatus: 'Đã thanh toán' as any,
      };
      const result = { id: 'order1', updated: true };
      mockOrderService.updateOrder.mockResolvedValue(result);

      const response = await controller.updateOrder(user_id, dto);

      expect(service.updateOrder).toHaveBeenCalledWith(dto);
      expect(responseHandler.ok).toHaveBeenCalledWith(result);
      expect(response.success).toBe(true);
    });

    // Mã: TC-OC-017
    // Test case: Xử lý lỗi khi cập nhật đơn hàng
    // Mục tiêu: Kiểm tra xử lý lỗi khi service throw Error
    // Input: user_id = 'user', dto rỗng, service throw Error('fail')
    // Output mong đợi: Response với success = false
    it('should handle errors', async () => {
      mockOrderService.updateOrder.mockRejectedValue(new Error('fail'));
      const response = await controller.updateOrder('user', {} as any);
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });

    // Mã: TC-OC-018
    // Test case: Xử lý lỗi với object không phải Error khi cập nhật đơn hàng
    // Mục tiêu: Kiểm tra xử lý khi service trả về object không phải Error
    // Input: user_id = 'user', dto rỗng, service throw { foo: 'bar' }
    // Output mong đợi: Response với success = false
    it('should handle errors with non-Error object', async () => {
      mockOrderService.updateOrder.mockRejectedValue({ foo: 'bar' });
      const response = await controller.updateOrder('user', {} as any);
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });
  });

  // Kiểm tra các chức năng liên quan đến lấy thông tin dashboard người dùng
  describe('getOrderUserDashboard', () => {
    // Mã: TC-OC-019
    // Test case: Lấy thông tin dashboard người dùng thành công
    // Mục tiêu: Kiểm tra việc lấy thông tin dashboard theo user_id
    // Input: user_id = 'user123'
    // Output mong đợi: Response với thông tin dashboard và success = true
    it('should return user dashboard', async () => {
      const user_id = 'user123';
      const result = { totalOrders: 1, statusSummary: {} };
      mockOrderService.getOrderUserDashboard.mockResolvedValue(result);

      const response = await controller.getOrderUserDashboard(user_id);

      expect(service.getOrderUserDashboard).toHaveBeenCalledWith(user_id);
      expect(responseHandler.ok).toHaveBeenCalledWith(result);
      expect(response.success).toBe(true);
    });

    // Mã: TC-OC-020
    // Test case: Xử lý lỗi khi lấy thông tin dashboard
    // Mục tiêu: Kiểm tra xử lý lỗi khi service throw Error
    // Input: user_id = 'user', service throw Error('fail')
    // Output mong đợi: Response với success = false
    it('should handle errors', async () => {
      mockOrderService.getOrderUserDashboard.mockRejectedValue(new Error('fail'));
      const response = await controller.getOrderUserDashboard('user');
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });

    // Mã: TC-OC-021
    // Test case: Xử lý lỗi với object không phải Error khi lấy thông tin dashboard
    // Mục tiêu: Kiểm tra xử lý khi service trả về object không phải Error
    // Input: user_id = 'user', service throw { foo: 'bar' }
    // Output mong đợi: Response với success = false
    it('should handle errors with non-Error object', async () => {
      mockOrderService.getOrderUserDashboard.mockRejectedValue({ foo: 'bar' });
      const response = await controller.getOrderUserDashboard('user');
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });
  });
});