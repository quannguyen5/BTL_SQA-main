/**
 * File: delete.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức delete của CategoryController
 * Module: Category
 * Chức năng: Kiểm tra chức năng xóa danh mục
 * Ngày tạo: 2023
 */

import { CategoryService } from 'src/backend/category/category.service';
import { responseHandler } from 'src/Until/responseUtil';
import { CategoryController } from '../category.controller';

// Mock responseHandler để kiểm tra các cuộc gọi
jest.mock('src/Until/responseUtil', () => ({
  responseHandler: {
    ok: jest.fn().mockReturnValue('ok-response'),
    error: jest.fn().mockReturnValue('error-response'),
  },
}));

/**
 * Test Suite: CategoryController.delete() delete method
 * Mô tả: Kiểm thử chức năng xóa danh mục của CategoryController
 */
describe('CategoryController.delete() delete method', () => {
  // Khai báo các biến sử dụng trong test
  let categoryController: CategoryController;     // Controller cần test
  let mockCategoryService: jest.Mocked<CategoryService>; // Mock service

  /**
   * Thiết lập môi trường test trước mỗi test case
   * Khởi tạo các mock objects và controller cần test
   */
  beforeEach(() => {
    // Tạo mock cho CategoryService với phương thức delete
    mockCategoryService = {
      delete: jest.fn(),
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
     * Test Case ID: TC-CT-CATEGORY-DEL-001
     * Mục tiêu: Kiểm tra việc xóa danh mục thành công
     * Input:
     *   - categoryId: "123" - ID của danh mục cần xóa
     *   - Service.delete trả về: undefined (xóa thành công)
     * Expected Output:
     *   - Object: responseHandler.ok(undefined)
     *   - Service.delete được gọi với tham số đúng: "123"
     * Ghi chú: Controller phải gọi service đúng và trả về kết quả thành công
     */
    it('should successfully delete a category and return a success response', async () => {
      // Sắp xếp (Arrange)
      const categoryId = '123'; // ID của danh mục cần xóa
      mockCategoryService.delete.mockResolvedValue(undefined as never); // Giả lập service trả về undefined (xóa thành công)

      // Thực thi (Act)
      const result = await categoryController.delete(categoryId); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCategoryService.delete).toHaveBeenCalledWith(categoryId); // Kiểm tra service được gọi với tham số đúng
      expect(responseHandler.ok).toHaveBeenCalledWith(undefined); // Kiểm tra responseHandler.ok được gọi với kết quả từ service
      expect(result).toBe('ok-response'); // Kiểm tra kết quả trả về đúng với giá trị từ responseHandler.ok
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-CT-CATEGORY-DEL-002
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi Error
     * Input:
     *   - categoryId: "123" - ID của danh mục cần xóa
     *   - Service.delete ném lỗi: Error("Category not found")
     * Expected Output:
     *   - Object: responseHandler.error("Category not found")
     *   - Service.delete được gọi với tham số đúng: "123"
     * Ghi chú: Controller phải bắt và xử lý lỗi Error đúng cách
     */
    it('should handle errors thrown by the service and return an error response', async () => {
      // Sắp xếp (Arrange)
      const categoryId = '123'; // ID của danh mục cần xóa
      const errorMessage = 'Category not found'; // Thông báo lỗi
      mockCategoryService.delete.mockRejectedValue(new Error(errorMessage) as never); // Giả lập service ném lỗi

      // Thực thi (Act)
      const result = await categoryController.delete(categoryId); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCategoryService.delete).toHaveBeenCalledWith(categoryId); // Kiểm tra service được gọi với tham số đúng
      expect(responseHandler.error).toHaveBeenCalledWith(errorMessage); // Kiểm tra responseHandler.error được gọi với thông báo lỗi
      expect(result).toBe('error-response'); // Kiểm tra kết quả trả về đúng với giá trị từ responseHandler.error
    });

    /**
     * Test Case ID: TC-CT-CATEGORY-DEL-003
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi không phải Error (object lỗi)
     * Input:
     *   - categoryId: "123" - ID của danh mục cần xóa
     *   - Service.delete ném lỗi: { message: "Unexpected error" }
     * Expected Output:
     *   - Object: responseHandler.error(JSON.stringify({ message: "Unexpected error" }))
     *   - Service.delete được gọi với tham số đúng: "123"
     * Ghi chú: Controller phải bắt và xử lý cả các lỗi không phải Error
     */
    it('should handle non-error objects thrown by the service and return an error response', async () => {
      // Sắp xếp (Arrange)
      const categoryId = '123'; // ID của danh mục cần xóa
      const errorObject = { message: 'Unexpected error' }; // Đối tượng lỗi
      mockCategoryService.delete.mockRejectedValue(errorObject as never); // Giả lập service ném đối tượng lỗi

      // Thực thi (Act)
      const result = await categoryController.delete(categoryId); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCategoryService.delete).toHaveBeenCalledWith(categoryId); // Kiểm tra service được gọi với tham số đúng
      expect(responseHandler.error).toHaveBeenCalledWith(JSON.stringify(errorObject)); // Kiểm tra responseHandler.error được gọi với chuỗi JSON của đối tượng lỗi
      expect(result).toBe('error-response'); // Kiểm tra kết quả trả về đúng với giá trị từ responseHandler.error
    });
  });
});