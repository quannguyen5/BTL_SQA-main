
import { OrderStatus, PaymentStatus } from "src/share/Enum/Enum";
import { OrderProductRepository } from '../OrderProductRepository';
import { DataSource } from 'typeorm';

describe('OrderProductRepository.getTopProductsByRevenue() getTopProductsByRevenue method', () => {
  let repository: OrderProductRepository;
  let mockQueryBuilder: any;

  /**
   * Setup trước mỗi test case
   * Khởi tạo các mock object và repository để test
   */
  beforeEach(() => {
    // Tạo mock query builder với các method cần thiết
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn()
    };

    // Tạo mock DataSource
    const mockDataSource = {
      createQueryBuilder: jest.fn(),
      manager: {},
    } as unknown as DataSource;

    // Khởi tạo repository với mock DataSource
    repository = new OrderProductRepository(mockDataSource);

    // Mock method createQueryBuilder của repository
    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
  });

  describe('Happy paths', () => {
    /**
     * Test Case ID: TC-RP-TOPPROD-001
     * Mục tiêu: Kiểm tra lấy danh sách sản phẩm có doanh thu cao nhất trong khoảng thời gian
     * Input: 
     * - startDate: 2023-01-01
     * - endDate: 2023-12-31
     * Expected Output: Mảng chứa thông tin của 2 sản phẩm với các trường:
     * - productId, productName, priceout, revenue
     * Ghi chú: Happy path - Trường hợp thành công với dữ liệu đầy đủ và hợp lệ
     */
    it('should return top products by revenue within the given date range', async () => {
      // Arrange: Chuẩn bị dữ liệu mẫu cho test case
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      mockQueryBuilder.getRawMany.mockResolvedValue([
        {
          productId: 1,
          productName: 'Product A',
          priceout: 100,
          totalRevenue: '1000',
        },
        {
          productId: 2,
          productName: 'Product B',
          priceout: 200,
          totalRevenue: '2000',
        },
      ]);

      // Act: Gọi phương thức cần test
      const result = await repository.getTopProductsByRevenue(startDate, endDate);

      // Assert: Kiểm tra kết quả
      expect(result).toEqual([
        {
          productId: 1,
          productName: 'Product A',
          priceout: 100,
          revenue: 1000,
        },
        {
          productId: 2,
          productName: 'Product B',
          priceout: 200,
          revenue: 2000,
        },
      ]);
      // Kiểm tra các điều kiện query được áp dụng đúng
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('order.paymentStatus = :status', { status: PaymentStatus.Paid });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('order.orderStatus = :orderStatus', { orderStatus: OrderStatus.Delivered });
    });
  });

  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-RP-TOPPROD-002
     * Mục tiêu: Kiểm tra xử lý khi không có sản phẩm nào trong khoảng thời gian
     * Input:
     * - startDate: 2023-01-01
     * - endDate: 2023-12-31
     * Expected Output: Mảng rỗng []
     * Ghi chú: Edge case - Trường hợp không có dữ liệu trong khoảng thời gian
     */
    it('should return an empty array if no products are found within the date range', async () => {
      // Arrange: Chuẩn bị dữ liệu - trả về mảng rỗng
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      // Act: Gọi phương thức cần test
      const result = await repository.getTopProductsByRevenue(startDate, endDate);

      // Assert: Kiểm tra kết quả là mảng rỗng
      expect(result).toEqual([]);
    });

    /**
     * Test Case ID: TC-RP-TOPPROD-003
     * Mục tiêu: Kiểm tra xử lý khi dữ liệu doanh thu không phải số hợp lệ
     * Input:
     * - startDate: 2023-01-01
     * - endDate: 2023-12-31
     * Expected Output: Mảng chứa sản phẩm với revenue là NaN
     * Ghi chú: Edge case - Trường hợp dữ liệu doanh thu không hợp lệ
     */
    it('should handle cases where totalRevenue is not a number', async () => {
      // Arrange: Chuẩn bị dữ liệu với totalRevenue không hợp lệ
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      mockQueryBuilder.getRawMany.mockResolvedValue([
        {
          productId: 1,
          productName: 'Product A',
          priceout: 100,
          totalRevenue: 'not-a-number',
        },
      ]);

      // Act: Gọi phương thức cần test
      const result = await repository.getTopProductsByRevenue(startDate, endDate);

      // Assert: Kiểm tra kết quả với revenue là NaN
      expect(result).toEqual([
        {
          productId: 1,
          productName: 'Product A',
          priceout: 100,
          revenue: NaN,
        },
      ]);
    });
  });
});
