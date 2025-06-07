
/**
 * File: nestjs-api-ecm\src\repository\OrderRepository.early.test\getRevenueBySupplier.early.test.ts
 * Class: OrderRepository
 * Method: getRevenueBySupplier
 * 
 * Mô tả: Test suite cho phương thức getRevenueBySupplier của OrderRepository
 * Chức năng: Lấy doanh thu theo nhà cung cấp trong khoảng thời gian
 */

import { OrderStatus, PaymentStatus } from "src/share/Enum/Enum";
import { OrderRepository } from '../OrderRepository';

// Mock class DataSource để giả lập kết nối database
class MockDataSource {
  manager = {
    createQueryBuilder: jest.fn(),
  };
  getMetadata: jest.Mock;
  constructor() {
    this.getMetadata = jest.fn().mockReturnValue({
      name: 'Order',
      tableName: 'orders',
      columns: [],
      relations: []
    });
  }
}

describe('OrderRepository.getRevenueBySupplier() getRevenueBySupplier method', () => {
  let orderRepository: OrderRepository;
  let mockDataSource: MockDataSource;

  // Khởi tạo các mock object trước mỗi test case
  beforeEach(() => {
    mockDataSource = new MockDataSource();
    orderRepository = new OrderRepository(mockDataSource as any);
    // Mock các phương thức của queryBuilder
    (orderRepository as any).createQueryBuilder = jest.fn().mockReturnThis();
    (orderRepository as any).select = jest.fn().mockReturnThis();
    (orderRepository as any).addSelect = jest.fn().mockReturnThis();
    (orderRepository as any).innerJoin = jest.fn().mockReturnThis();
    (orderRepository as any).where = jest.fn().mockReturnThis();
    (orderRepository as any).andWhere = jest.fn().mockReturnThis();
    (orderRepository as any).groupBy = jest.fn().mockReturnThis();
    (orderRepository as any).orderBy = jest.fn().mockReturnThis();
  });

  describe('Happy paths', () => {
    /**
     * Test Case ID: TC-RP-REVENUESUPPLIER-001
     * Mục tiêu: Kiểm tra lấy doanh thu theo nhà cung cấp trong khoảng thời gian hợp lệ
     * Input: 
     * - startDate: 2023-01-01
     * - endDate: 2023-12-31
     * Expected Output: Mảng chứa thông tin doanh thu của 2 nhà cung cấp:
     * - Supplier A: doanh thu 1000.00
     * - Supplier B: doanh thu 2000.00
     * Ghi chú: Happy path - Trường hợp thành công với dữ liệu đầy đủ và hợp lệ
     */
    it('should return revenue data for suppliers within the given date range', async () => {
      // Arrange: Chuẩn bị dữ liệu mẫu cho test case
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      
      (orderRepository as any).getRawMany = jest.fn().mockResolvedValue([
        { supplierId: 1, supplierName: 'Supplier A', totalRevenue: '1000.00' },
        { supplierId: 2, supplierName: 'Supplier B', totalRevenue: '2000.00' },
      ]);

      // Act: Gọi phương thức cần test
      const result = await orderRepository.getRevenueBySupplier(startDate, endDate);

      // Assert: Kiểm tra kết quả và các phương thức được gọi
      expect(result).toEqual([
        { supplierId: 1, supplierName: 'Supplier A', revenue: 1000.00 },
        { supplierId: 2, supplierName: 'Supplier B', revenue: 2000.00 },
      ]);

      // Kiểm tra các phương thức được gọi với đúng tham số
      expect((orderRepository as any).select).toHaveBeenCalledWith('supplier.id', 'supplierId');
      expect((orderRepository as any).addSelect).toHaveBeenCalledWith('supplier.name', 'supplierName');
      expect((orderRepository as any).addSelect).toHaveBeenCalledWith('SUM(order.total_price)', 'totalRevenue');
      expect((orderRepository as any).innerJoin).toHaveBeenCalledWith('order.orderProducts', 'order_product');
      expect((orderRepository as any).innerJoin).toHaveBeenCalledWith('order_product.product', 'product');
      expect((orderRepository as any).innerJoin).toHaveBeenCalledWith('product.supplier', 'supplier');
      expect((orderRepository as any).where).toHaveBeenCalledWith('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
      expect((orderRepository as any).andWhere).toHaveBeenCalledWith('order.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.Paid });
      expect((orderRepository as any).andWhere).toHaveBeenCalledWith('order.orderStatus = :orderStatus', { orderStatus: OrderStatus.Delivered });
      expect((orderRepository as any).groupBy).toHaveBeenCalledWith('supplier.id');
      expect((orderRepository as any).orderBy).toHaveBeenCalledWith('totalRevenue', 'DESC');
    });
  });

  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-RP-REVENUESUPPLIER-002
     * Mục tiêu: Kiểm tra xử lý khi không có đơn hàng nào trong khoảng thời gian
     * Input:
     * - startDate: 2023-01-01
     * - endDate: 2023-12-31
     * Expected Output: Mảng rỗng []
     * Ghi chú: Edge case - Trường hợp không có dữ liệu thỏa mãn điều kiện
     */
    it('should return an empty array if no orders match the criteria', async () => {
      // Arrange: Chuẩn bị dữ liệu - trả về mảng rỗng
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      
      (orderRepository as any).getRawMany = jest.fn().mockResolvedValue([]);

      // Act: Gọi phương thức cần test
      const result = await orderRepository.getRevenueBySupplier(startDate, endDate);

      // Assert: Kiểm tra kết quả là mảng rỗng
      expect(result).toEqual([]);
    });

    /**
     * Test Case ID: TC-RP-REVENUESUPPLIER-003
     * Mục tiêu: Kiểm tra xử lý khi doanh thu trả về null hoặc undefined
     * Input:
     * - startDate: 2023-01-01
     * - endDate: 2023-12-31
     * Expected Output: Mảng chứa các nhà cung cấp với doanh thu = 0
     * Ghi chú: Edge case - Trường hợp dữ liệu doanh thu không hợp lệ
     */
    it('should handle cases where totalRevenue is null or undefined', async () => {
      // Arrange: Chuẩn bị dữ liệu với totalRevenue không hợp lệ
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      
      (orderRepository as any).getRawMany = jest.fn().mockResolvedValue([
        { supplierId: 1, supplierName: 'Supplier A', totalRevenue: null },
        { supplierId: 2, supplierName: 'Supplier B', totalRevenue: undefined },
      ]);

      // Act: Gọi phương thức cần test
      const result = await orderRepository.getRevenueBySupplier(startDate, endDate);

      // Assert: Kiểm tra kết quả với doanh thu = 0
      expect(result).toEqual([
        { supplierId: 1, supplierName: 'Supplier A', revenue: 0 },
        { supplierId: 2, supplierName: 'Supplier B', revenue: 0 },
      ]);
    });
  });
});
