/**
 * File: getRevenueByCategory.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getRevenueByCategory của DashboardController
 * Module: Dashboard
 * Chức năng: Kiểm tra chức năng lấy doanh thu theo danh mục sản phẩm
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
  getRevenueByCategory: jest.fn(),
} as unknown as jest.Mocked<DashboardService>;

/**
 * Test Suite: DashboardController - getRevenueByCategory
 * Mô tả: Bộ test cho phương thức getRevenueByCategory của DashboardController
 */
describe('DashboardController.getRevenueByCategory() method', () => {
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
     * Test case: TC-CT-DASHBOARD-REVENUECATEGORY-001
     * Mục tiêu: Kiểm tra phương thức getRevenueByCategory trả về kết quả thành công với TimeFilter.Week
     * Input: timeFilter = TimeFilter.Week
     * Expected Output: { status: 200, data: [{ category_id: 'C001', category_name: 'Điện thoại', total_revenue: 15000000 }, { category_id: 'C002', category_name: 'Laptop', total_revenue: 25000000 }] }
     * Ghi chú: Kiểm tra luồng thành công với bộ lọc theo tuần
     */
    it('TC-CT-DASHBOARD-REVENUECATEGORY-001 - Nên trả về doanh thu theo danh mục với bộ lọc "Tuần"', async () => {
      // Sắp xếp (Arrange)
      const mockResult = [
        { category_id: 'C001', category_name: 'Điện thoại', total_revenue: 15000000 },
        { category_id: 'C002', category_name: 'Laptop', total_revenue: 25000000 }
      ];
      mockDashboardService.getRevenueByCategory.mockResolvedValue(mockResult as any as never);

      // Thực thi (Act)
      const result = await dashboardController.getRevenueByCategory(TimeFilter.Week);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getRevenueByCategory).toHaveBeenCalledWith(TimeFilter.Week);
      expect(responseHandler.ok).toHaveBeenCalledWith(mockResult);
      expect(result).toEqual(responseHandler.ok(mockResult));
    });

    /**
     * Test case: TC-CT-DASHBOARD-REVENUECATEGORY-002
     * Mục tiêu: Kiểm tra phương thức getRevenueByCategory trả về kết quả thành công với TimeFilter.Month
     * Input: timeFilter = TimeFilter.Month
     * Expected Output: { status: 200, data: [{ category_id: 'C002', category_name: 'Laptop', total_revenue: 80000000 }, { category_id: 'C003', category_name: 'Phụ kiện', total_revenue: 35000000 }] }
     * Ghi chú: Kiểm tra luồng thành công với bộ lọc theo tháng
     */
    it('TC-CT-DASHBOARD-REVENUECATEGORY-002 - Nên trả về doanh thu theo danh mục với bộ lọc "Tháng"', async () => {
      // Sắp xếp (Arrange)
      const mockResult = [
        { category_id: 'C002', category_name: 'Laptop', total_revenue: 80000000 },
        { category_id: 'C003', category_name: 'Phụ kiện', total_revenue: 35000000 }
      ];
      mockDashboardService.getRevenueByCategory.mockResolvedValue(mockResult as any as never);

      // Thực thi (Act)
      const result = await dashboardController.getRevenueByCategory(TimeFilter.Month);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getRevenueByCategory).toHaveBeenCalledWith(TimeFilter.Month);
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
     * Test case: TC-CT-DASHBOARD-REVENUECATEGORY-003
     * Mục tiêu: Kiểm tra phương thức getRevenueByCategory xử lý lỗi khi service gặp lỗi
     * Input: timeFilter = TimeFilter.Quarter
     * Expected Output: { status: 500, message: 'Lỗi khi lấy doanh thu theo danh mục' }
     * Ghi chú: Kiểm tra xử lý lỗi kiểu Error
     */
    it('TC-CT-DASHBOARD-REVENUECATEGORY-003 - Nên xử lý lỗi từ service một cách hợp lý', async () => {
      // Sắp xếp (Arrange)
      const errorMessage = 'Lỗi khi lấy doanh thu theo danh mục';
      mockDashboardService.getRevenueByCategory.mockRejectedValue(new Error(errorMessage) as never);

      // Thực thi (Act)
      const result = await dashboardController.getRevenueByCategory(TimeFilter.Quarter);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getRevenueByCategory).toHaveBeenCalledWith(TimeFilter.Quarter);
      expect(responseHandler.error).toHaveBeenCalledWith(errorMessage);
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    /**
     * Test case: TC-CT-DASHBOARD-REVENUECATEGORY-004
     * Mục tiêu: Kiểm tra phương thức getRevenueByCategory xử lý lỗi không phải Error
     * Input: timeFilter = TimeFilter.Year
     * Expected Output: { status: 500, message: '{"code":500,"message":"Category repository error"}' }
     * Ghi chú: Kiểm tra xử lý lỗi không phải kiểu Error
     */
    it('TC-CT-DASHBOARD-REVENUECATEGORY-004 - Nên xử lý ngoại lệ không phải kiểu Error', async () => {
      // Sắp xếp (Arrange)
      const errorObject = { code: 500, message: 'Category repository error' };
      mockDashboardService.getRevenueByCategory.mockRejectedValue(errorObject as never);

      // Thực thi (Act)
      const result = await dashboardController.getRevenueByCategory(TimeFilter.Year);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getRevenueByCategory).toHaveBeenCalledWith(TimeFilter.Year);
      expect(responseHandler.error).toHaveBeenCalledWith(JSON.stringify(errorObject));
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});
