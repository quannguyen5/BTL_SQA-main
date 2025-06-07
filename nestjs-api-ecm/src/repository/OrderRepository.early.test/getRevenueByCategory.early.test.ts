
/**
 * File: nestjs-api-ecm\src\repository\OrderRepository.early.test\getRevenueByCategory.early.test.ts
 * Class: OrderRepository
 * Method: getRevenueByCategory
 * 
 * Mô tả: Test suite cho phương thức getRevenueByCategory của OrderRepository
 * Chức năng: Lấy doanh thu theo danh mục sản phẩm trong khoảng thời gian
 */

import { ApplyStatus, OrderStatus, PaymentStatus } from "src/share/Enum/Enum";
import { OrderRepository } from '../OrderRepository';

// Mock class DataSource
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

describe('OrderRepository.getRevenueByCategory() getRevenueByCategory method', () => {
  let orderRepository: OrderRepository;
  let mockDataSource: MockDataSource;

  // Chuẩn bị mock data và repository trước mỗi test case
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
     * Test Case ID: TC-RP-REVENUECATEGORY-001
     * Mục tiêu: Kiểm tra lấy doanh thu theo danh mục trong khoảng thời gian hợp lệ
     * Input: 
     * - startDate: 2023-01-01
     * - endDate: 2023-12-31
     * Expected Output: Mảng chứa thông tin doanh thu của 2 danh mục:
     * - Danh mục 1: Electronics, doanh thu 1000.00
     * - Danh mục 2: Books, doanh thu 500.00
     * Ghi chú: Happy path - Trường hợp thành công với dữ liệu đầy đủ và hợp lệ
     */
    it('should return revenue by category for valid date range and statuses', async () => {
      // Arrange: Chuẩn bị dữ liệu mẫu cho test case
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      
      (orderRepository as any).getRawMany = jest.fn().mockResolvedValue([
        { categoryId: 1, categoryName: 'Electronics', totalRevenue: '1000.00' },
        { categoryId: 2, categoryName: 'Books', totalRevenue: '500.00' },
      ]);

      // Act: Gọi phương thức cần test
      const result = await orderRepository.getRevenueByCategory(startDate, endDate);

      // Assert: Kiểm tra kết quả
      expect(result).toEqual([
        { categoryId: 1, categoryName: 'Electronics', revenue: 1000.00 },
        { categoryId: 2, categoryName: 'Books', revenue: 500.00 },
      ]);

      // Kiểm tra các phương thức được gọi với đúng tham số
      expect((orderRepository as any).select).toHaveBeenCalledWith('category.id', 'categoryId');
      expect((orderRepository as any).addSelect).toHaveBeenCalledWith('category.name', 'categoryName');
      expect((orderRepository as any).addSelect).toHaveBeenCalledWith('SUM(order.total_price)', 'totalRevenue');
      expect((orderRepository as any).innerJoin).toHaveBeenCalledWith('order.orderProducts', 'order_product');
      expect((orderRepository as any).innerJoin).toHaveBeenCalledWith('order_product.product', 'product');
      expect((orderRepository as any).innerJoin).toHaveBeenCalledWith('product.category', 'category');
      expect((orderRepository as any).where).toHaveBeenCalledWith('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
      expect((orderRepository as any).andWhere).toHaveBeenCalledWith('order.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.Paid });
      expect((orderRepository as any).andWhere).toHaveBeenCalledWith('order.orderStatus = :orderStatus', { orderStatus: OrderStatus.Delivered });
      expect((orderRepository as any).andWhere).toHaveBeenCalledWith('category.status = :status', { status: ApplyStatus.True });
      expect((orderRepository as any).groupBy).toHaveBeenCalledWith('category.id');
      expect((orderRepository as any).orderBy).toHaveBeenCalledWith('totalRevenue', 'DESC');
    });
  });

  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-RP-REVENUECATEGORY-002
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
      const result = await orderRepository.getRevenueByCategory(startDate, endDate);

      // Assert: Kiểm tra kết quả là mảng rỗng
      expect(result).toEqual([]);
    });

    /**
     * Test Case ID: TC-RP-REVENUECATEGORY-003
     * Mục tiêu: Kiểm tra xử lý khi khoảng thời gian không hợp lệ (startDate > endDate)
     * Input:
     * - startDate: 2023-12-31
     * - endDate: 2023-01-01
     * Expected Output: Mảng rỗng []
     * Ghi chú: Edge case - Trường hợp đầu vào không hợp lệ
     */
    it('should handle invalid date range gracefully', async () => {
      // Arrange: Chuẩn bị dữ liệu với khoảng thời gian không hợp lệ
      const startDate = new Date('2023-12-31');
      const endDate = new Date('2023-01-01');
      
      (orderRepository as any).getRawMany = jest.fn().mockResolvedValue([]);

      // Act: Gọi phương thức cần test
      const result = await orderRepository.getRevenueByCategory(startDate, endDate);

      // Assert: Kiểm tra kết quả là mảng rỗng
      expect(result).toEqual([]);
    });
  });
});
