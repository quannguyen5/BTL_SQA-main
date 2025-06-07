
import { TimeFilter } from "src/share/Enum/Enum";
import { OrderRepository } from '../OrderRepository';
import { DataSource } from 'typeorm';

describe('OrderRepository.getFinancialSummary() getFinancialSummary method', () => {
  let orderRepository: OrderRepository;
  let mockQueryBuilder: any;
  let realDate: DateConstructor;

  /**
   * Setup trước tất cả test case
   * Mock ngày hiện tại thành 01/01/2023 để đảm bảo tính nhất quán của test
   */
  beforeAll(() => {
    realDate = global.Date;
    const mockDate = new Date(2023, 0, 1);
    global.Date = class extends Date {
      constructor() {
        super();
        return mockDate;
      }
      static now() {
        return mockDate.getTime();
      }
    } as DateConstructor;
  });

  /**
   * Khôi phục lại Date constructor sau khi test xong
   */
  afterAll(() => {
    global.Date = realDate;
  });

  /**
   * Setup trước mỗi test case
   * Khởi tạo mock query builder và repository
   */
  beforeEach(() => {
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    };

    const mockDataSource = {
      createQueryBuilder: jest.fn(),
      manager: {},
    } as unknown as DataSource;

    orderRepository = new OrderRepository(mockDataSource);
    jest.spyOn(orderRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
  });

  describe('Happy Paths', () => {
    /**
     * Test Case ID: TC-RP-FINANCIALSUM-001
     * Mục tiêu: Kiểm tra lấy báo cáo tài chính theo tuần thành công
     * Input: TimeFilter.Week
     * Expected Output: Mảng chứa báo cáo tài chính của tuần hiện tại
     */
    it('should return financial summary for weeks in current month', async () => {
      // Arrange
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { time_period: '2023-W1', total_revenue: 1000, total_cost: 500, profit: 500 }
      ]);

      // Act
      const result = await orderRepository.getFinancialSummary(TimeFilter.Week);

      // Assert
      expect(result[0]).toEqual({
        time_period: '2023-W1',
        total_revenue: 1000,
        total_cost: 500,
        profit: 500
      });
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('YEAR(o.createdAt) = 2023 AND MONTH(o.createdAt) = 1');
    });

    /**
     * Test Case ID: TC-RP-FINANCIALSUM-002
     * Mục tiêu: Kiểm tra lấy báo cáo tài chính theo tháng thành công
     * Input: TimeFilter.Month
     * Expected Output: Mảng chứa báo cáo tài chính của 12 tháng
     */
    it('should return financial summary for all months in current year', async () => {
      // Arrange
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { time_period: '2023-01', total_revenue: 2000, total_cost: 1000, profit: 1000 }
      ]);

      // Act
      const result = await orderRepository.getFinancialSummary(TimeFilter.Month);

      // Assert
      expect(result.length).toBe(12);
      expect(result[0]).toEqual({
        time_period: '2023-01',
        total_revenue: 2000,
        total_cost: 1000,
        profit: 1000
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('YEAR(o.createdAt) = 2023');
    });

    /**
     * Test Case ID: TC-RP-FINANCIALSUM-003
     * Mục tiêu: Kiểm tra lấy báo cáo tài chính theo quý thành công
     * Input: TimeFilter.Quarter
     * Expected Output: Mảng chứa báo cáo tài chính của 4 quý
     */
    it('should return financial summary for all quarters in current year', async () => {
      // Arrange
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { time_period: '2023-Q1', total_revenue: 3000, total_cost: 1500, profit: 1500 }
      ]);

      // Act
      const result = await orderRepository.getFinancialSummary(TimeFilter.Quarter);

      // Assert
      expect(result.length).toBe(4);
      expect(result[0]).toEqual({
        time_period: '2023-Q1',
        total_revenue: 3000,
        total_cost: 1500,
        profit: 1500
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('YEAR(o.createdAt) = 2023');
    });

    /**
     * Test Case ID: TC-RP-FINANCIALSUM-004
     * Mục tiêu: Kiểm tra lấy báo cáo tài chính theo năm thành công
     * Input: TimeFilter.Year
     * Expected Output: Mảng chứa báo cáo tài chính của 4 năm gần nhất
     */
    it('should return financial summary for last 4 years', async () => {
      // Arrange
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { time_period: '2023', total_revenue: 4000, total_cost: 2000, profit: 2000 }
      ]);

      // Act
      const result = await orderRepository.getFinancialSummary(TimeFilter.Year);

      // Assert
      expect(result.length).toBe(4);
      expect(result[0]).toEqual({
        time_period: '2023',
        total_revenue: 4000,
        total_cost: 2000,
        profit: 2000
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('YEAR(o.createdAt) BETWEEN 2020 AND 2023');
    });
  });

  describe('Edge Cases', () => {
    /**
     * Test Case ID: TC-RP-FINANCIALSUM-005
     * Mục tiêu: Kiểm tra xử lý khi không có dữ liệu từ database
     * Input: TimeFilter.Month và database trả về mảng rỗng
     * Expected Output: Mảng chứa 12 tháng với tất cả giá trị bằng 0
     */
    it('should handle empty data from database', async () => {
      // Arrange
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      // Act
      const result = await orderRepository.getFinancialSummary(TimeFilter.Month);

      // Assert
      expect(result.length).toBe(12);
      result.forEach(item => {
        expect(item.total_revenue).toBe(0);
        expect(item.total_cost).toBe(0);
        expect(item.profit).toBe(0);
      });
    });

    /**
     * Test Case ID: TC-RP-FINANCIALSUM-006
     * Mục tiêu: Kiểm tra xử lý khi TimeFilter không hợp lệ
     * Input: TimeFilter không hợp lệ
     * Expected Output: Throw error với message 'Invalid TimeFilter'
     */
    it('should throw error for invalid TimeFilter', async () => {
      // Act & Assert
      await expect(orderRepository.getFinancialSummary('Invalid' as TimeFilter))
        .rejects.toThrow('Invalid TimeFilter');
    });

  });
});
