/**
 * File: getTopCustomers.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getTopCustomers của DashboardController
 * Module: Dashboard
 * Chức năng: Kiểm tra chức năng lấy danh sách khách hàng có doanh thu cao nhất
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
  getTopCustomersByRevenue: jest.fn(),
} as unknown as jest.Mocked<DashboardService>;

/**
 * Test Suite: DashboardController - getTopCustomers
 * Mô tả: Bộ test cho phương thức getTopCustomers của DashboardController
 */
describe('DashboardController.getTopCustomers() method', () => {
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
     * Test case: TC-CT-DASHBOARD-TOPCUSTOMERS-001
     * Mục tiêu: Kiểm tra phương thức getTopCustomers trả về kết quả thành công với TimeFilter.Week
     * Input: timeFilter = TimeFilter.Week
     * Expected Output: { status: 200, data: [{ user_id: 'U001', user_name: 'Nguyễn Văn A', total_revenue: 8000000, order_count: 5 }, { user_id: 'U002', user_name: 'Trần Thị B', total_revenue: 6000000, order_count: 4 }] }
     * Ghi chú: Kiểm tra luồng thành công với bộ lọc theo tuần
     */
    it('TC-CT-DASHBOARD-TOPCUSTOMERS-001 - Nên trả về danh sách khách hàng có doanh thu cao với bộ lọc "Tuần"', async () => {
      // Sắp xếp (Arrange)
      const mockResult = [
        { user_id: 'U001', user_name: 'Nguyễn Văn A', total_revenue: 8000000, order_count: 5 },
        { user_id: 'U002', user_name: 'Trần Thị B', total_revenue: 6000000, order_count: 4 }
      ];
      mockDashboardService.getTopCustomersByRevenue.mockResolvedValue(mockResult as any as never);

      // Thực thi (Act)
      const result = await dashboardController.getTopCustomers(TimeFilter.Week);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getTopCustomersByRevenue).toHaveBeenCalledWith(TimeFilter.Week);
      expect(responseHandler.ok).toHaveBeenCalledWith(mockResult);
      expect(result).toEqual(responseHandler.ok(mockResult));
    });

    /**
     * Test case: TC-CT-DASHBOARD-TOPCUSTOMERS-002
     * Mục tiêu: Kiểm tra phương thức getTopCustomers trả về kết quả thành công với TimeFilter.Month
     * Input: timeFilter = TimeFilter.Month
     * Expected Output: { status: 200, data: [{ user_id: 'U003', user_name: 'Lê Văn C', total_revenue: 25000000, order_count: 15 }, { user_id: 'U001', user_name: 'Nguyễn Văn A', total_revenue: 20000000, order_count: 12 }] }
     * Ghi chú: Kiểm tra luồng thành công với bộ lọc theo tháng
     */
    it('TC-CT-DASHBOARD-TOPCUSTOMERS-002 - Nên trả về danh sách khách hàng có doanh thu cao với bộ lọc "Tháng"', async () => {
      // Sắp xếp (Arrange)
      const mockResult = [
        { user_id: 'U003', user_name: 'Lê Văn C', total_revenue: 25000000, order_count: 15 },
        { user_id: 'U001', user_name: 'Nguyễn Văn A', total_revenue: 20000000, order_count: 12 }
      ];
      mockDashboardService.getTopCustomersByRevenue.mockResolvedValue(mockResult as any as never);

      // Thực thi (Act)
      const result = await dashboardController.getTopCustomers(TimeFilter.Month);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getTopCustomersByRevenue).toHaveBeenCalledWith(TimeFilter.Month);
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
     * Test case: TC-CT-DASHBOARD-TOPCUSTOMERS-003
     * Mục tiêu: Kiểm tra phương thức getTopCustomers xử lý lỗi khi service gặp lỗi
     * Input: timeFilter = TimeFilter.Quarter
     * Expected Output: { status: 500, message: 'Lỗi khi lấy danh sách khách hàng' }
     * Ghi chú: Kiểm tra xử lý lỗi kiểu Error
     */
    it('TC-CT-DASHBOARD-TOPCUSTOMERS-003 - Nên xử lý lỗi từ service một cách hợp lý', async () => {
      // Sắp xếp (Arrange)
      const errorMessage = 'Lỗi khi lấy danh sách khách hàng';
      mockDashboardService.getTopCustomersByRevenue.mockRejectedValue(new Error(errorMessage) as never);

      // Thực thi (Act)
      const result = await dashboardController.getTopCustomers(TimeFilter.Quarter);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getTopCustomersByRevenue).toHaveBeenCalledWith(TimeFilter.Quarter);
      expect(responseHandler.error).toHaveBeenCalledWith(errorMessage);
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    /**
     * Test case: TC-CT-DASHBOARD-TOPCUSTOMERS-004
     * Mục tiêu: Kiểm tra phương thức getTopCustomers xử lý lỗi không phải Error
     * Input: timeFilter = TimeFilter.Year
     * Expected Output: { status: 500, message: '{"code":500,"message":"User repository error"}' }
     * Ghi chú: Kiểm tra xử lý lỗi không phải kiểu Error
     */
    it('TC-CT-DASHBOARD-TOPCUSTOMERS-004 - Nên xử lý ngoại lệ không phải kiểu Error', async () => {
      // Sắp xếp (Arrange)
      const errorObject = { code: 500, message: 'User repository error' };
      mockDashboardService.getTopCustomersByRevenue.mockRejectedValue(errorObject as never);

      // Thực thi (Act)
      const result = await dashboardController.getTopCustomers(TimeFilter.Year);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getTopCustomersByRevenue).toHaveBeenCalledWith(TimeFilter.Year);
      expect(responseHandler.error).toHaveBeenCalledWith(JSON.stringify(errorObject));
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});
