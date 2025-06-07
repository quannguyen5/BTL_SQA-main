/**
 * File: getFinancialSummary.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getFinancialSummary của DashboardController
 * Module: Dashboard
 * Chức năng: Kiểm tra chức năng lấy thống kê tài chính theo thời gian
 * Ngày tạo: 2023
 */

import { TimeFilter } from "src/share/Enum/Enum";
import { responseHandler } from "src/Until/responseUtil";
import { DashboardController } from '../dashboard.controller';
import { DashboardService } from '../dashboard.service';

/**
 * Mock cho responseHandler
 * Mô tả: Tạo mock cho responseHandler để kiểm tra các phản hồi từ controller
 */
jest.mock("src/Until/responseUtil");

/**
 * Mock cho DashboardService
 * Mô tả: Tạo mock cho DashboardService để giả lập các phương thức service
 */
const mockDashboardService = {
  getFinancialSummaryByTime: jest.fn(),
} as unknown as jest.Mocked<DashboardService>;

/**
 * Test Suite: DashboardController - getFinancialSummary
 * Mô tả: Bộ test cho phương thức getFinancialSummary của DashboardController
 */
describe('DashboardController.getFinancialSummary() method', () => {
  let dashboardController: DashboardController;

  /**
   * Thiết lập môi trường test
   * Mô tả: Khởi tạo controller với service đã được mock
   */
  beforeEach(() => {
    dashboardController = new DashboardController(mockDashboardService);
  });

  /**
   * Nhóm test case: Các trường hợp thành công
   * Mô tả: Kiểm tra các trường hợp phương thức hoạt động đúng
   */
  describe('Happy paths', () => {
    /**
     * Test case: TC-CT-DASHBOARD-FINANCIAL-001
     * Mục tiêu: Kiểm tra phương thức getFinancialSummary trả về kết quả thành công với TimeFilter.Week
     * Input: timeFilter = TimeFilter.Week
     * Expected Output: { status: 200, data: [{ time_period: '2023-W01', total_revenue: 1000000, total_cost: 700000, profit: 300000 }, { time_period: '2023-W02', total_revenue: 1200000, total_cost: 800000, profit: 400000 }] }
     * Ghi chú: Kiểm tra luồng thành công với bộ lọc theo tuần
     */
    it('TC-CT-DASHBOARD-FINANCIAL-001 - Nên trả về thống kê tài chính với bộ lọc "Tuần"', async () => {
      // Sắp xếp (Arrange)
      const mockResult = [
        { time_period: '2023-W01', total_revenue: 1000000, total_cost: 700000, profit: 300000 },
        { time_period: '2023-W02', total_revenue: 1200000, total_cost: 800000, profit: 400000 }
      ];
      mockDashboardService.getFinancialSummaryByTime.mockResolvedValue(mockResult as any as never);

      // Thực thi (Act)
      const result = await dashboardController.getFinancialSummary(TimeFilter.Week);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getFinancialSummaryByTime).toHaveBeenCalledWith(TimeFilter.Week);
      expect(responseHandler.ok).toHaveBeenCalledWith(mockResult);
      expect(result).toEqual(responseHandler.ok(mockResult));
    });

    /**
     * Test case: TC-CT-DASHBOARD-FINANCIAL-002
     * Mục tiêu: Kiểm tra phương thức getFinancialSummary trả về kết quả thành công với TimeFilter.Month
     * Input: timeFilter = TimeFilter.Month
     * Expected Output: { status: 200, data: [{ time_period: '2023-01', total_revenue: 5000000, total_cost: 3500000, profit: 1500000 }, { time_period: '2023-02', total_revenue: 5500000, total_cost: 3800000, profit: 1700000 }] }
     * Ghi chú: Kiểm tra luồng thành công với bộ lọc theo tháng
     */
    it('TC-CT-DASHBOARD-FINANCIAL-002 - Nên trả về thống kê tài chính với bộ lọc "Tháng"', async () => {
      // Sắp xếp (Arrange)
      const mockResult = [
        { time_period: '2023-01', total_revenue: 5000000, total_cost: 3500000, profit: 1500000 },
        { time_period: '2023-02', total_revenue: 5500000, total_cost: 3800000, profit: 1700000 }
      ];
      mockDashboardService.getFinancialSummaryByTime.mockResolvedValue(mockResult as any as never);

      // Thực thi (Act)
      const result = await dashboardController.getFinancialSummary(TimeFilter.Month);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getFinancialSummaryByTime).toHaveBeenCalledWith(TimeFilter.Month);
      expect(responseHandler.ok).toHaveBeenCalledWith(mockResult);
      expect(result).toEqual(responseHandler.ok(mockResult));
    });
  });

  /**
   * Nhóm test case: Các trường hợp ngoại lệ
   * Mô tả: Kiểm tra các trường hợp xử lý lỗi và ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test case: TC-CT-DASHBOARD-FINANCIAL-003
     * Mục tiêu: Kiểm tra phương thức getFinancialSummary xử lý lỗi khi service gặp lỗi
     * Input: timeFilter = TimeFilter.Quarter
     * Expected Output: { status: 500, message: 'Lỗi khi lấy dữ liệu tài chính' }
     * Ghi chú: Kiểm tra xử lý lỗi kiểu Error
     */
    it('TC-CT-DASHBOARD-FINANCIAL-003 - Nên xử lý lỗi từ service một cách hợp lý', async () => {
      // Sắp xếp (Arrange)
      const errorMessage = 'Lỗi khi lấy dữ liệu tài chính';
      mockDashboardService.getFinancialSummaryByTime.mockRejectedValue(new Error(errorMessage) as never);

      // Thực thi (Act)
      const result = await dashboardController.getFinancialSummary(TimeFilter.Quarter);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getFinancialSummaryByTime).toHaveBeenCalledWith(TimeFilter.Quarter);
      expect(responseHandler.error).toHaveBeenCalledWith(errorMessage);
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    /**
     * Test case: TC-CT-DASHBOARD-FINANCIAL-004
     * Mục tiêu: Kiểm tra phương thức getFinancialSummary xử lý lỗi không phải Error
     * Input: timeFilter = TimeFilter.Year
     * Expected Output: { status: 500, message: '{"code":500,"message":"Database connection error"}' }
     * Ghi chú: Kiểm tra xử lý lỗi không phải kiểu Error
     */
    it('TC-CT-DASHBOARD-FINANCIAL-004 - Nên xử lý ngoại lệ không phải kiểu Error', async () => {
      // Sắp xếp (Arrange)
      const errorObject = { code: 500, message: 'Database connection error' };
      mockDashboardService.getFinancialSummaryByTime.mockRejectedValue(errorObject as never);

      // Thực thi (Act)
      const result = await dashboardController.getFinancialSummary(TimeFilter.Year);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getFinancialSummaryByTime).toHaveBeenCalledWith(TimeFilter.Year);
      expect(responseHandler.error).toHaveBeenCalledWith(JSON.stringify(errorObject));
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});
