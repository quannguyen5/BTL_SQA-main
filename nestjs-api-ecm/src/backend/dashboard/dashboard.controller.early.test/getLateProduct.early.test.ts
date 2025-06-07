/**
 * File: getLateProduct.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getLateProduct của DashboardController
 * Module: Dashboard
 * Chức năng: Kiểm tra chức năng lấy danh sách sản phẩm mới nhất
 * Ngày tạo: 2023
 */

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
  getLatestProduct: jest.fn(),
} as unknown as jest.Mocked<DashboardService>;

/**
 * Test Suite: DashboardController - getLateProduct
 * Mô tả: Bộ test cho phương thức getLateProduct của DashboardController
 */
describe('DashboardController.getLateProduct() method', () => {
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
     * Test case: TC-CT-DASHBOARD-LATESTPRODUCT-001
     * Mục tiêu: Kiểm tra phương thức getLateProduct trả về kết quả thành công
     * Input: Không có tham số đầu vào
     * Expected Output: { status: 200, data: [{ product_id: 'P001', product_name: 'Sản phẩm mới 1', created_at: '2023-04-15T10:00:00Z', price: 1500000 }, { product_id: 'P002', product_name: 'Sản phẩm mới 2', created_at: '2023-04-14T09:30:00Z', price: 2000000 }] }
     * Ghi chú: Kiểm tra luồng thành công cơ bản
     */
    it('TC-CT-DASHBOARD-LATESTPRODUCT-001 - Nên trả về danh sách sản phẩm mới nhất', async () => {
      // Sắp xếp (Arrange)
      const mockResult = [
        { product_id: 'P001', product_name: 'Sản phẩm mới 1', created_at: '2023-04-15T10:00:00Z', price: 1500000 },
        { product_id: 'P002', product_name: 'Sản phẩm mới 2', created_at: '2023-04-14T09:30:00Z', price: 2000000 }
      ];
      mockDashboardService.getLatestProduct.mockResolvedValue(mockResult as any as never);

      // Thực thi (Act)
      const result = await dashboardController.getLateProduct();

      // Kiểm tra (Assert)
      expect(mockDashboardService.getLatestProduct).toHaveBeenCalled();
      expect(responseHandler.ok).toHaveBeenCalledWith(mockResult);
      expect(result).toEqual(responseHandler.ok(mockResult));
    });

    /**
     * Test case: TC-CT-DASHBOARD-LATESTPRODUCT-002
     * Mục tiêu: Kiểm tra phương thức getLateProduct trả về danh sách rỗng khi không có sản phẩm mới
     * Input: Không có tham số đầu vào
     * Expected Output: { status: 200, data: [] }
     * Ghi chú: Kiểm tra trường hợp không có sản phẩm mới
     */
    it('TC-CT-DASHBOARD-LATESTPRODUCT-002 - Nên trả về danh sách rỗng khi không có sản phẩm mới', async () => {
      // Sắp xếp (Arrange)
      const mockResult = [];
      mockDashboardService.getLatestProduct.mockResolvedValue(mockResult as any as never);

      // Thực thi (Act)
      const result = await dashboardController.getLateProduct();

      // Kiểm tra (Assert)
      expect(mockDashboardService.getLatestProduct).toHaveBeenCalled();
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
     * Test case: TC-CT-DASHBOARD-LATESTPRODUCT-003
     * Mục tiêu: Kiểm tra phương thức getLateProduct xử lý lỗi khi service gặp lỗi
     * Input: Không có tham số đầu vào
     * Expected Output: { status: 500, message: 'Lỗi khi lấy danh sách sản phẩm mới nhất' }
     * Ghi chú: Kiểm tra xử lý lỗi kiểu Error
     */
    it('TC-CT-DASHBOARD-LATESTPRODUCT-003 - Nên xử lý lỗi từ service một cách hợp lý', async () => {
      // Sắp xếp (Arrange)
      const errorMessage = 'Lỗi khi lấy danh sách sản phẩm mới nhất';
      mockDashboardService.getLatestProduct.mockRejectedValue(new Error(errorMessage) as never);

      // Thực thi (Act)
      const result = await dashboardController.getLateProduct();

      // Kiểm tra (Assert)
      expect(mockDashboardService.getLatestProduct).toHaveBeenCalled();
      expect(responseHandler.error).toHaveBeenCalledWith(errorMessage);
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    /**
     * Test case: TC-CT-DASHBOARD-LATESTPRODUCT-004
     * Mục tiêu: Kiểm tra phương thức getLateProduct xử lý lỗi không phải Error
     * Input: Không có tham số đầu vào
     * Expected Output: { status: 500, message: '{"code":500,"message":"Product repository error"}' }
     * Ghi chú: Kiểm tra xử lý lỗi không phải kiểu Error
     */
    it('TC-CT-DASHBOARD-LATESTPRODUCT-004 - Nên xử lý ngoại lệ không phải kiểu Error', async () => {
      // Sắp xếp (Arrange)
      const errorObject = { code: 500, message: 'Product repository error' };
      mockDashboardService.getLatestProduct.mockRejectedValue(errorObject as never);

      // Thực thi (Act)
      const result = await dashboardController.getLateProduct();

      // Kiểm tra (Assert)
      expect(mockDashboardService.getLatestProduct).toHaveBeenCalled();
      expect(responseHandler.error).toHaveBeenCalledWith(JSON.stringify(errorObject));
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});
