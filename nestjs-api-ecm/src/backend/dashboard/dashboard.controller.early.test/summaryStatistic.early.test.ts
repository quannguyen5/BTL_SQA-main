
/**
 * File: summaryStatistic.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức summaryStatistic của DashboardController
 * Module: Dashboard
 * Chức năng: Kiểm tra chức năng lấy thống kê tổng quan cho dashboard
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
  getSummaryStatistic: jest.fn(),
} as unknown as jest.Mocked<DashboardService>;

/**
 * Test Suite: DashboardController - summaryStatistic
 * Mô tả: Bộ test cho phương thức summaryStatistic của DashboardController
 */
describe('DashboardController.summaryStatistic() summaryStatistic method', () => {
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
     * Test case: TC-CT-DASHBOARD-SUMMARY-001
     * Mục tiêu: Kiểm tra phương thức summaryStatistic trả về kết quả thành công với TimeFilter.Week
     * Input: timeFilter = TimeFilter.Week
     * Expected Output: { status: 200, data: { thisTime: { revenue: 1000, product: 50, customer: 20, order: 10 }, lastTime: { revenue: 800, product: 40, customer: 15, order: 8 } } }
     * Ghi chú: Kiểm tra luồng thành công với bộ lọc theo tuần
     */
    it('TC-CT-DASHBOARD-SUMMARY-001 - Nên trả về thống kê tổng quan với bộ lọc "Tuần"', async () => {
      // Sắp xếp (Arrange)
      const mockResult = {
        thisTime: { revenue: 1000, product: 50, customer: 20, order: 10 },
        lastTime: { revenue: 800, product: 40, customer: 15, order: 8 },
      };
      mockDashboardService.getSummaryStatistic.mockResolvedValue(mockResult as any as never);

      // Thực thi (Act)
      const result = await dashboardController.summaryStatistic(TimeFilter.Week);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getSummaryStatistic).toHaveBeenCalledWith(TimeFilter.Week);
      expect(responseHandler.ok).toHaveBeenCalledWith(mockResult);
      expect(result).toEqual(responseHandler.ok(mockResult));
    });

    /**
     * Test case: TC-CT-DASHBOARD-SUMMARY-002
     * Mục tiêu: Kiểm tra phương thức summaryStatistic trả về kết quả thành công với TimeFilter.Month
     * Input: timeFilter = TimeFilter.Month
     * Expected Output: { status: 200, data: { thisTime: { revenue: 2000, product: 100, customer: 40, order: 20 }, lastTime: { revenue: 1800, product: 90, customer: 35, order: 18 } } }
     * Ghi chú: Kiểm tra luồng thành công với bộ lọc theo tháng
     */
    it('TC-CT-DASHBOARD-SUMMARY-002 - Nên trả về thống kê tổng quan với bộ lọc "Tháng"', async () => {
      // Sắp xếp (Arrange)
      const mockResult = {
        thisTime: { revenue: 2000, product: 100, customer: 40, order: 20 },
        lastTime: { revenue: 1800, product: 90, customer: 35, order: 18 },
      };
      mockDashboardService.getSummaryStatistic.mockResolvedValue(mockResult as any as never);

      // Thực thi (Act)
      const result = await dashboardController.summaryStatistic(TimeFilter.Month);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getSummaryStatistic).toHaveBeenCalledWith(TimeFilter.Month);
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
     * Test case: TC-CT-DASHBOARD-SUMMARY-003
     * Mục tiêu: Kiểm tra phương thức summaryStatistic xử lý lỗi khi service gặp lỗi
     * Input: timeFilter = TimeFilter.Quarter
     * Expected Output: { status: 500, message: 'Service error' }
     * Ghi chú: Kiểm tra xử lý lỗi kiểu Error
     */
    it('TC-CT-DASHBOARD-SUMMARY-003 - Nên xử lý lỗi từ service một cách hợp lý', async () => {
      // Sắp xếp (Arrange)
      const errorMessage = 'Service error';
      mockDashboardService.getSummaryStatistic.mockRejectedValue(new Error(errorMessage) as never);

      // Thực thi (Act)
      const result = await dashboardController.summaryStatistic(TimeFilter.Quarter);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getSummaryStatistic).toHaveBeenCalledWith(TimeFilter.Quarter);
      expect(responseHandler.error).toHaveBeenCalledWith(errorMessage);
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    /**
     * Test case: TC-CT-DASHBOARD-SUMMARY-004
     * Mục tiêu: Kiểm tra phương thức summaryStatistic xử lý lỗi không phải Error
     * Input: timeFilter = TimeFilter.Year
     * Expected Output: { status: 500, message: '{"message":"Non-error exception"}' }
     * Ghi chú: Kiểm tra xử lý lỗi không phải kiểu Error
     */
    it('TC-CT-DASHBOARD-SUMMARY-004 - Nên xử lý ngoại lệ không phải kiểu Error', async () => {
      // Sắp xếp (Arrange)
      const errorObject = { message: 'Non-error exception' };
      mockDashboardService.getSummaryStatistic.mockRejectedValue(errorObject as never);

      // Thực thi (Act)
      const result = await dashboardController.summaryStatistic(TimeFilter.Year);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getSummaryStatistic).toHaveBeenCalledWith(TimeFilter.Year);
      expect(responseHandler.error).toHaveBeenCalledWith(JSON.stringify(errorObject));
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});