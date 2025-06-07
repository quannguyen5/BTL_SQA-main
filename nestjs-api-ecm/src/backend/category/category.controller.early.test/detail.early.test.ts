/**
 * File: detail.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức detail của CategoryController
 * Module: Category
 * Chức năng: Kiểm tra chức năng lấy thông tin chi tiết của danh mục
 * Ngày tạo: 2023
 */

import { CategoryService } from 'src/backend/category/category.service';
import { responseHandler } from 'src/Until/responseUtil';
import { CategoryController } from '../category.controller';

// Mock responseHandler để kiểm tra các cuộc gọi
jest.mock('src/Until/responseUtil', () => ({
  responseHandler: {
    ok: jest.fn(data => ({ status: 'success', data })),
    error: jest.fn(message => ({ status: 'error', message })),
  },
}));

/**
 * Test Suite: CategoryController.detail() detail method
 * Mô tả: Kiểm thử chức năng lấy thông tin chi tiết của danh mục của CategoryController
 */
describe('CategoryController.detail() detail method', () => {
  // Khai báo các biến sử dụng trong test
  let categoryController: CategoryController;     // Controller cần test
  let mockCategoryService: jest.Mocked<CategoryService>; // Mock service

  /**
   * Thiết lập môi trường test trước mỗi test case
   * Khởi tạo các mock objects và controller cần test
   */
  beforeEach(() => {
    // Tạo mock cho CategoryService với phương thức detail
    mockCategoryService = {
      detail: jest.fn(),
    } as unknown as jest.Mocked<CategoryService>;

    // Khởi tạo controller với service đã mock
    categoryController = new CategoryController(mockCategoryService);

    // Reset các mock trước mỗi test
    jest.clearAllMocks();
  });

  /**
   * Test Group: Happy paths
   * Mô tả: Các test case cho trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * Test Case ID: TC-CT-CATEGORY-DETAIL-001
     * Mục tiêu: Kiểm tra việc lấy thông tin chi tiết của danh mục thành công
     * Input:
     *   - categoryId: "1" - ID của danh mục cần lấy thông tin
     *   - Service.detail trả về: { id: '1', name: 'Electronics' } (thông tin danh mục)
     * Expected Output:
     *   - Object: responseHandler.ok({ id: '1', name: 'Electronics' })
     *   - Service.detail được gọi với tham số đúng: "1"
     * Ghi chú: Controller phải gọi service đúng và trả về kết quả thành công
     */
    it('should return category details successfully', async () => {
      // Sắp xếp (Arrange)
      const mockCategoryEntity = { id: '1', name: 'Electronics' }; // Thông tin danh mục mẫu
      mockCategoryService.detail.mockResolvedValue(mockCategoryEntity as any as never); // Giả lập service trả về thông tin danh mục

      // Thực thi (Act)
      const result = await categoryController.detail('1'); // Gọi phương thức cần test với ID danh mục

      // Kiểm tra (Assert)
      expect(result).toEqual(responseHandler.ok(mockCategoryEntity)); // Kiểm tra kết quả trả về đúng định dạng
      expect(mockCategoryService.detail).toHaveBeenCalledWith('1'); // Kiểm tra service được gọi với tham số đúng
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-CT-CATEGORY-DETAIL-002
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi Error
     * Input:
     *   - categoryId: "999" - ID của danh mục không tồn tại
     *   - Service.detail ném lỗi: Error("Category not found")
     * Expected Output:
     *   - Object: responseHandler.error("Category not found")
     *   - Service.detail được gọi với tham số đúng: "999"
     * Ghi chú: Controller phải bắt và xử lý lỗi Error đúng cách
     */
    it('should handle service throwing an error gracefully', async () => {
      // Sắp xếp (Arrange)
      const errorMessage = 'Category not found'; // Thông báo lỗi
      mockCategoryService.detail.mockRejectedValue(new Error(errorMessage) as never); // Giả lập service ném lỗi

      // Thực thi (Act)
      const result = await categoryController.detail('999'); // Gọi phương thức cần test với ID không tồn tại

      // Kiểm tra (Assert)
      expect(result).toEqual(responseHandler.error(errorMessage)); // Kiểm tra kết quả trả về là thông báo lỗi
      expect(mockCategoryService.detail).toHaveBeenCalledWith('999'); // Kiểm tra service được gọi với tham số đúng
    });

    /**
     * Test Case ID: TC-CT-CATEGORY-DETAIL-003
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi không phải Error (object lỗi)
     * Input:
     *   - categoryId: "999" - ID của danh mục không tồn tại
     *   - Service.detail ném lỗi: { error: "Unexpected error" }
     * Expected Output:
     *   - Object: responseHandler.error(JSON.stringify({ error: "Unexpected error" }))
     *   - Service.detail được gọi với tham số đúng: "999"
     * Ghi chú: Controller phải bắt và xử lý cả các lỗi không phải Error
     */
    it('should handle non-error objects thrown by the service', async () => {
      // Sắp xếp (Arrange)
      const errorObject = { error: 'Unexpected error' }; // Đối tượng lỗi
      mockCategoryService.detail.mockRejectedValue(errorObject as never); // Giả lập service ném đối tượng lỗi

      // Thực thi (Act)
      const result = await categoryController.detail('999'); // Gọi phương thức cần test với ID không tồn tại

      // Kiểm tra (Assert)
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject))); // Kiểm tra kết quả trả về là chuỗi JSON của đối tượng lỗi
      expect(mockCategoryService.detail).toHaveBeenCalledWith('999'); // Kiểm tra service được gọi với tham số đúng
    });
  });
});