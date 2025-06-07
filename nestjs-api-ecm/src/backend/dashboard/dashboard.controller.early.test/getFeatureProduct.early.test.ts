/**
 * File: getFeatureProduct.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getFeatureProduct của DashboardController
 * Module: Dashboard
 * Chức năng: Kiểm tra chức năng lấy danh sách sản phẩm nổi bật
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
  getFeatureProduct: jest.fn(),
} as unknown as jest.Mocked<DashboardService>;

/**
 * Test Suite: DashboardController - getFeatureProduct
 * Mô tả: Bộ test cho phương thức getFeatureProduct của DashboardController
 */
describe('DashboardController.getFeatureProduct() method', () => {
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
     * Test case: TC-CT-DASHBOARD-FEATUREPRODUCT-001
     * Mục tiêu: Kiểm tra phương thức getFeatureProduct trả về kết quả thành công
     * Input: Không có tham số đầu vào
     * Expected Output: { status: 200, data: [{ product_id: 'P001', product_name: 'Sản phẩm nổi bật 1', total_sold: 150, rating: 4.8 }, { product_id: 'P002', product_name: 'Sản phẩm nổi bật 2', total_sold: 120, rating: 4.7 }] }
     * Ghi chú: Kiểm tra luồng thành công cơ bản
     */
    it('TC-CT-DASHBOARD-FEATUREPRODUCT-001 - Nên trả về danh sách sản phẩm nổi bật', async () => {
      // Sắp xếp (Arrange)
      const mockResult = [
        { product_id: 'P001', product_name: 'Sản phẩm nổi bật 1', total_sold: 150, rating: 4.8 },
        { product_id: 'P002', product_name: 'Sản phẩm nổi bật 2', total_sold: 120, rating: 4.7 }
      ];
      mockDashboardService.getFeatureProduct.mockResolvedValue(mockResult as any as never);

      // Thực thi (Act)
      const result = await dashboardController.getFeatureProduct();

      // Kiểm tra (Assert)
      expect(mockDashboardService.getFeatureProduct).toHaveBeenCalled();
      expect(responseHandler.ok).toHaveBeenCalledWith(mockResult);
      expect(result).toEqual(responseHandler.ok(mockResult));
    });

    /**
     * Test case: TC-CT-DASHBOARD-FEATUREPRODUCT-002
     * Mục tiêu: Kiểm tra phương thức getFeatureProduct trả về danh sách rỗng khi không có sản phẩm nổi bật
     * Input: Không có tham số đầu vào
     * Expected Output: { status: 200, data: [] }
     * Ghi chú: Kiểm tra trường hợp không có sản phẩm nổi bật
     */
    it('TC-CT-DASHBOARD-FEATUREPRODUCT-002 - Nên trả về danh sách rỗng khi không có sản phẩm nổi bật', async () => {
      // Sắp xếp (Arrange)
      const mockResult = [];
      mockDashboardService.getFeatureProduct.mockResolvedValue(mockResult as any as never);

      // Thực thi (Act)
      const result = await dashboardController.getFeatureProduct();

      // Kiểm tra (Assert)
      expect(mockDashboardService.getFeatureProduct).toHaveBeenCalled();
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
     * Test case: TC-CT-DASHBOARD-FEATUREPRODUCT-003
     * Mục tiêu: Kiểm tra phương thức getFeatureProduct xử lý lỗi khi service gặp lỗi
     * Input: Không có tham số đầu vào
     * Expected Output: { status: 500, message: 'Lỗi khi lấy danh sách sản phẩm nổi bật' }
     * Ghi chú: Kiểm tra xử lý lỗi kiểu Error
     */
    it('TC-CT-DASHBOARD-FEATUREPRODUCT-003 - Nên xử lý lỗi từ service một cách hợp lý', async () => {
      // Sắp xếp (Arrange)
      const errorMessage = 'Lỗi khi lấy danh sách sản phẩm nổi bật';
      mockDashboardService.getFeatureProduct.mockRejectedValue(new Error(errorMessage) as never);

      // Thực thi (Act)
      const result = await dashboardController.getFeatureProduct();

      // Kiểm tra (Assert)
      expect(mockDashboardService.getFeatureProduct).toHaveBeenCalled();
      expect(responseHandler.error).toHaveBeenCalledWith(errorMessage);
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    /**
     * Test case: TC-CT-DASHBOARD-FEATUREPRODUCT-004
     * Mục tiêu: Kiểm tra phương thức getFeatureProduct xử lý lỗi không phải Error
     * Input: Không có tham số đầu vào
     * Expected Output: { status: 500, message: '{"code":500,"message":"Product repository error"}' }
     * Ghi chú: Kiểm tra xử lý lỗi không phải kiểu Error
     */
    it('TC-CT-DASHBOARD-FEATUREPRODUCT-004 - Nên xử lý ngoại lệ không phải kiểu Error', async () => {
      // Sắp xếp (Arrange)
      const errorObject = { code: 500, message: 'Product repository error' };
      mockDashboardService.getFeatureProduct.mockRejectedValue(errorObject as never);

      // Thực thi (Act)
      const result = await dashboardController.getFeatureProduct();

      // Kiểm tra (Assert)
      expect(mockDashboardService.getFeatureProduct).toHaveBeenCalled();
      expect(responseHandler.error).toHaveBeenCalledWith(JSON.stringify(errorObject));
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});
