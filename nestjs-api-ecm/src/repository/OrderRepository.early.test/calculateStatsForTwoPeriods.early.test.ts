
import { OrderRepository } from '../OrderRepository';
import { DataSource } from 'typeorm';
import { OrderStatus, PaymentStatus } from 'src/share/Enum/Enum';

describe('OrderRepository.calculateStatsForTwoPeriods() calculateStatsForTwoPeriods method', () => {
  let repository: OrderRepository;
  let mockQueryBuilder: any;

  /**
   * Setup trước mỗi test case
   * Khởi tạo các mock object và repository để test
   */
  beforeEach(() => {
    // Tạo mock query builder với các method cần thiết
    mockQueryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
    };

    // Tạo mock DataSource
    const mockDataSource = {
      createQueryBuilder: jest.fn(),
      manager: {},
    } as unknown as DataSource;

    // Khởi tạo repository với mock DataSource
    repository = new OrderRepository(mockDataSource);

    // Mock method createQueryBuilder của repository
    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
  });

  describe('Happy paths', () => {
    /**
     * Test Case ID: TC-RP-CAL-001
     * Mục tiêu: Kiểm tra tính toán thống kê chính xác cho hai khoảng thời gian
     * Input: 
     * - startDate: 2023-01-01
     * - endDate: 2023-01-31
     * - lastStartDate: 2022-12-01
     * - lastEndDate: 2022-12-31
     * Expected Output: Object chứa các chỉ số thống kê:
     * - currentRevenue: 1000
     * - lastRevenue: 800
     * - currentQuantity: 50
     * - lastQuantity: 40
     * - currentTotalOrders: 10
     * - lastTotalOrders: 8
     * - currentTotalCustomers: 5
     * - lastTotalCustomers: 4
     * Ghi chú: Happy path - Trường hợp thành công với dữ liệu đầy đủ và hợp lệ
     */
    it('should calculate stats correctly for given periods', async () => {
      // Arrange: Chuẩn bị dữ liệu mẫu cho test case
      mockQueryBuilder.getRawOne.mockResolvedValue({
        currentRevenue: '1000',
        lastRevenue: '800',
        currentQuantity: '50',
        lastQuantity: '40',
        currentTotalOrders: '10',
        lastTotalOrders: '8',
        currentTotalCustomers: '5',
        lastTotalCustomers: '4',
      });

      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');
      const lastStartDate = new Date('2022-12-01');
      const lastEndDate = new Date('2022-12-31');

      // Act: Gọi phương thức cần test
      const result = await repository.calculateStatsForTwoPeriods(
        startDate,
        endDate,
        lastStartDate,
        lastEndDate
      );

      // Assert: Kiểm tra kết quả
      expect(result).toEqual({
        currentRevenue: 1000,
        lastRevenue: 800,
        currentQuantity: 50,
        lastQuantity: 40,
        currentTotalOrders: 10,
        lastTotalOrders: 8,
        currentTotalCustomers: 5,
        lastTotalCustomers: 4,
      });

      // Kiểm tra các điều kiện query được áp dụng đúng
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'orders.paymentStatus = :status',
        { status: PaymentStatus.Paid }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'orders.orderStatus = :orderStatus',
        { orderStatus: OrderStatus.Delivered }
      );
      expect(mockQueryBuilder.setParameters).toHaveBeenCalledWith({
        startDate,
        endDate,
        lastStartDate,
        lastEndDate,
      });
    });
  });

  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-RP-CAL-002
     * Mục tiêu: Kiểm tra xử lý khi không có dữ liệu thống kê
     * Input: 
     * - startDate: 2023-01-01
     * - endDate: 2023-01-31
     * - lastStartDate: 2022-12-01
     * - lastEndDate: 2022-12-31
     * Expected Output: Object với tất cả giá trị bằng 0
     * Ghi chú: Edge case - Trường hợp không có dữ liệu thống kê
     */
    it('should handle empty results gracefully', async () => {
      // Arrange: Chuẩn bị dữ liệu - trả về object rỗng
      mockQueryBuilder.getRawOne.mockResolvedValue({});

      // Act: Gọi phương thức cần test
      const result = await repository.calculateStatsForTwoPeriods(
        new Date('2023-01-01'),
        new Date('2023-01-31'),
        new Date('2022-12-01'),
        new Date('2022-12-31')
      );

      // Assert: Kiểm tra kết quả - tất cả giá trị phải bằng 0
      expect(result).toEqual({
        currentRevenue: 0,
        lastRevenue: 0,
        currentQuantity: 0,
        lastQuantity: 0,
        currentTotalOrders: 0,
        lastTotalOrders: 0,
        currentTotalCustomers: 0,
        lastTotalCustomers: 0,
      });
    });

    /**
     * Test Case ID: TC-RP-CAL-003
     * Mục tiêu: Kiểm tra xử lý khi khoảng thời gian không hợp lệ
     * Input: 
     * - startDate sau endDate
     * - lastStartDate sau lastEndDate
     * Expected Output: Object với tất cả giá trị bằng 0
     * Ghi chú: Edge case - Trường hợp khoảng thời gian không hợp lệ
     */
    it('should handle invalid date ranges', async () => {
      // Arrange: Chuẩn bị dữ liệu với các giá trị null
      mockQueryBuilder.getRawOne.mockResolvedValue({
        currentRevenue: null,
        lastRevenue: null,
        currentQuantity: null,
        lastQuantity: null,
        currentTotalOrders: null,
        lastTotalOrders: null,
        currentTotalCustomers: null,
        lastTotalCustomers: null,
      });

      // Act: Gọi phương thức với khoảng thời gian không hợp lệ
      const result = await repository.calculateStatsForTwoPeriods(
        new Date('2023-01-31'),
        new Date('2023-01-01'), // Invalid range
        new Date('2022-12-31'),
        new Date('2022-12-01')  // Invalid range
      );

      // Assert: Kiểm tra kết quả - tất cả giá trị phải bằng 0
      expect(result).toEqual({
        currentRevenue: 0,
        lastRevenue: 0,
        currentQuantity: 0,
        lastQuantity: 0,
        currentTotalOrders: 0,
        lastTotalOrders: 0,
        currentTotalCustomers: 0,
        lastTotalCustomers: 0,
      });
    });
  });
});
