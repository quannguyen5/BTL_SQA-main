/**
 * File: getRevenueBySupplier.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getRevenueBySupplier của DashboardController
 * Module: Dashboard
 * Chức năng: Kiểm tra chức năng lấy doanh thu theo nhà cung cấp
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
  getRevenueBySupplier: jest.fn(),
} as unknown as jest.Mocked<DashboardService>;

/**
 * Test Suite: DashboardController - getRevenueBySupplier
 * Mô tả: Bộ test cho phương thức getRevenueBySupplier của DashboardController
 */
describe('DashboardController.getRevenueBySupplier() method', () => {
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
     * Test case: TC-CT-DASHBOARD-REVENUESUPPLIER-001
     * Mục tiêu: Kiểm tra phương thức getRevenueBySupplier trả về kết quả thành công với TimeFilter.Week
     * Input: timeFilter = TimeFilter.Week
     * Expected Output: { status: 200, data: [{ supplier_id: 'S001', supplier_name: 'Nhà cung cấp A', total_revenue: 12000000 }, { supplier_id: 'S002', supplier_name: 'Nhà cung cấp B', total_revenue: 8000000 }] }
     * Ghi chú: Kiểm tra luồng thành công với bộ lọc theo tuần
     */
    it('TC-CT-DASHBOARD-REVENUESUPPLIER-001 - Nên trả về doanh thu theo nhà cung cấp với bộ lọc "Tuần"', async () => {
      // Sắp xếp (Arrange)
      const mockResult = [
        { supplier_id: 'S001', supplier_name: 'Nhà cung cấp A', total_revenue: 12000000 },
        { supplier_id: 'S002', supplier_name: 'Nhà cung cấp B', total_revenue: 8000000 }
      ];
      mockDashboardService.getRevenueBySupplier.mockResolvedValue(mockResult as any as never);

      // Thực thi (Act)
      const result = await dashboardController.getRevenueBySupplier(TimeFilter.Week);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getRevenueBySupplier).toHaveBeenCalledWith(TimeFilter.Week);
      expect(responseHandler.ok).toHaveBeenCalledWith(mockResult);
      expect(result).toEqual(responseHandler.ok(mockResult));
    });

    /**
     * Test case: TC-CT-DASHBOARD-REVENUESUPPLIER-002
     * Mục tiêu: Kiểm tra phương thức getRevenueBySupplier trả về kết quả thành công với TimeFilter.Month
     * Input: timeFilter = TimeFilter.Month
     * Expected Output: { status: 200, data: [{ supplier_id: 'S001', supplier_name: 'Nhà cung cấp A', total_revenue: 45000000 }, { supplier_id: 'S003', supplier_name: 'Nhà cung cấp C', total_revenue: 30000000 }] }
     * Ghi chú: Kiểm tra luồng thành công với bộ lọc theo tháng
     */
    it('TC-CT-DASHBOARD-REVENUESUPPLIER-002 - Nên trả về doanh thu theo nhà cung cấp với bộ lọc "Tháng"', async () => {
      // Sắp xếp (Arrange)
      const mockResult = [
        { supplier_id: 'S001', supplier_name: 'Nhà cung cấp A', total_revenue: 45000000 },
        { supplier_id: 'S003', supplier_name: 'Nhà cung cấp C', total_revenue: 30000000 }
      ];
      mockDashboardService.getRevenueBySupplier.mockResolvedValue(mockResult as any as never);

      // Thực thi (Act)
      const result = await dashboardController.getRevenueBySupplier(TimeFilter.Month);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getRevenueBySupplier).toHaveBeenCalledWith(TimeFilter.Month);
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
     * Test case: TC-CT-DASHBOARD-REVENUESUPPLIER-003
     * Mục tiêu: Kiểm tra phương thức getRevenueBySupplier xử lý lỗi khi service gặp lỗi
     * Input: timeFilter = TimeFilter.Quarter
     * Expected Output: { status: 500, message: 'Lỗi khi lấy doanh thu theo nhà cung cấp' }
     * Ghi chú: Kiểm tra xử lý lỗi kiểu Error
     */
    it('TC-CT-DASHBOARD-REVENUESUPPLIER-003 - Nên xử lý lỗi từ service một cách hợp lý', async () => {
      // Sắp xếp (Arrange)
      const errorMessage = 'Lỗi khi lấy doanh thu theo nhà cung cấp';
      mockDashboardService.getRevenueBySupplier.mockRejectedValue(new Error(errorMessage) as never);

      // Thực thi (Act)
      const result = await dashboardController.getRevenueBySupplier(TimeFilter.Quarter);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getRevenueBySupplier).toHaveBeenCalledWith(TimeFilter.Quarter);
      expect(responseHandler.error).toHaveBeenCalledWith(errorMessage);
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    /**
     * Test case: TC-CT-DASHBOARD-REVENUESUPPLIER-004
     * Mục tiêu: Kiểm tra phương thức getRevenueBySupplier xử lý lỗi không phải Error
     * Input: timeFilter = TimeFilter.Year
     * Expected Output: { status: 500, message: '{"code":500,"message":"Supplier repository error"}' }
     * Ghi chú: Kiểm tra xử lý lỗi không phải kiểu Error
     */
    it('TC-CT-DASHBOARD-REVENUESUPPLIER-004 - Nên xử lý ngoại lệ không phải kiểu Error', async () => {
      // Sắp xếp (Arrange)
      const errorObject = { code: 500, message: 'Supplier repository error' };
      mockDashboardService.getRevenueBySupplier.mockRejectedValue(errorObject as never);

      // Thực thi (Act)
      const result = await dashboardController.getRevenueBySupplier(TimeFilter.Year);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getRevenueBySupplier).toHaveBeenCalledWith(TimeFilter.Year);
      expect(responseHandler.error).toHaveBeenCalledWith(JSON.stringify(errorObject));
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});
