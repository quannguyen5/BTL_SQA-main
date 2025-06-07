/**
 * File: getTopProducts.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getTopProducts của DashboardController
 * Module: Dashboard
 * Chức năng: Kiểm tra chức năng lấy danh sách sản phẩm bán chạy nhất
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
  getTopProductsByRevenue: jest.fn(),
} as unknown as jest.Mocked<DashboardService>;

/**
 * Test Suite: DashboardController - getTopProducts
 * Mô tả: Bộ test cho phương thức getTopProducts của DashboardController
 */
describe('DashboardController.getTopProducts() method', () => {
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
     * Test case: TC-CT-DASHBOARD-TOPPRODUCTS-001
     * Mục tiêu: Kiểm tra phương thức getTopProducts trả về kết quả thành công với TimeFilter.Week
     * Input: timeFilter = TimeFilter.Week
     * Expected Output: { status: 200, data: [{ product_id: 'P001', product_name: 'Sản phẩm 1', total_revenue: 5000000, quantity_sold: 50 }, { product_id: 'P002', product_name: 'Sản phẩm 2', total_revenue: 3000000, quantity_sold: 30 }] }
     * Ghi chú: Kiểm tra luồng thành công với bộ lọc theo tuần
     */
    it('TC-CT-DASHBOARD-TOPPRODUCTS-001 - Nên trả về danh sách sản phẩm bán chạy với bộ lọc "Tuần"', async () => {
      // Sắp xếp (Arrange)
      const mockResult = [
        { product_id: 'P001', product_name: 'Sản phẩm 1', total_revenue: 5000000, quantity_sold: 50 },
        { product_id: 'P002', product_name: 'Sản phẩm 2', total_revenue: 3000000, quantity_sold: 30 }
      ];
      mockDashboardService.getTopProductsByRevenue.mockResolvedValue(mockResult as any as never);

      // Thực thi (Act)
      const result = await dashboardController.getTopProducts(TimeFilter.Week);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getTopProductsByRevenue).toHaveBeenCalledWith(TimeFilter.Week);
      expect(responseHandler.ok).toHaveBeenCalledWith(mockResult);
      expect(result).toEqual(responseHandler.ok(mockResult));
    });

    /**
     * Test case: TC-CT-DASHBOARD-TOPPRODUCTS-002
     * Mục tiêu: Kiểm tra phương thức getTopProducts trả về kết quả thành công với TimeFilter.Month
     * Input: timeFilter = TimeFilter.Month
     * Expected Output: { status: 200, data: [{ product_id: 'P001', product_name: 'Sản phẩm 1', total_revenue: 15000000, quantity_sold: 150 }, { product_id: 'P003', product_name: 'Sản phẩm 3', total_revenue: 12000000, quantity_sold: 120 }] }
     * Ghi chú: Kiểm tra luồng thành công với bộ lọc theo tháng
     */
    it('TC-CT-DASHBOARD-TOPPRODUCTS-002 - Nên trả về danh sách sản phẩm bán chạy với bộ lọc "Tháng"', async () => {
      // Sắp xếp (Arrange)
      const mockResult = [
        { product_id: 'P001', product_name: 'Sản phẩm 1', total_revenue: 15000000, quantity_sold: 150 },
        { product_id: 'P003', product_name: 'Sản phẩm 3', total_revenue: 12000000, quantity_sold: 120 }
      ];
      mockDashboardService.getTopProductsByRevenue.mockResolvedValue(mockResult as any as never);

      // Thực thi (Act)
      const result = await dashboardController.getTopProducts(TimeFilter.Month);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getTopProductsByRevenue).toHaveBeenCalledWith(TimeFilter.Month);
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
     * Test case: TC-CT-DASHBOARD-TOPPRODUCTS-003
     * Mục tiêu: Kiểm tra phương thức getTopProducts xử lý lỗi khi service gặp lỗi
     * Input: timeFilter = TimeFilter.Quarter
     * Expected Output: { status: 500, message: 'Lỗi khi lấy danh sách sản phẩm bán chạy' }
     * Ghi chú: Kiểm tra xử lý lỗi kiểu Error
     */
    it('TC-CT-DASHBOARD-TOPPRODUCTS-003 - Nên xử lý lỗi từ service một cách hợp lý', async () => {
      // Sắp xếp (Arrange)
      const errorMessage = 'Lỗi khi lấy danh sách sản phẩm bán chạy';
      mockDashboardService.getTopProductsByRevenue.mockRejectedValue(new Error(errorMessage) as never);

      // Thực thi (Act)
      const result = await dashboardController.getTopProducts(TimeFilter.Quarter);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getTopProductsByRevenue).toHaveBeenCalledWith(TimeFilter.Quarter);
      expect(responseHandler.error).toHaveBeenCalledWith(errorMessage);
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    /**
     * Test case: TC-CT-DASHBOARD-TOPPRODUCTS-004
     * Mục tiêu: Kiểm tra phương thức getTopProducts xử lý lỗi không phải Error
     * Input: timeFilter = TimeFilter.Year
     * Expected Output: { status: 500, message: '{"code":500,"message":"Database query failed"}' }
     * Ghi chú: Kiểm tra xử lý lỗi không phải kiểu Error
     */
    it('TC-CT-DASHBOARD-TOPPRODUCTS-004 - Nên xử lý ngoại lệ không phải kiểu Error', async () => {
      // Sắp xếp (Arrange)
      const errorObject = { code: 500, message: 'Database query failed' };
      mockDashboardService.getTopProductsByRevenue.mockRejectedValue(errorObject as never);

      // Thực thi (Act)
      const result = await dashboardController.getTopProducts(TimeFilter.Year);

      // Kiểm tra (Assert)
      expect(mockDashboardService.getTopProductsByRevenue).toHaveBeenCalledWith(TimeFilter.Year);
      expect(responseHandler.error).toHaveBeenCalledWith(JSON.stringify(errorObject));
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});
