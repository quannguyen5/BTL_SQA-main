/**
 * File: update.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức update của CategoryController
 * Module: Category
 * Chức năng: Kiểm tra chức năng cập nhật thông tin danh mục
 * Ngày tạo: 2023
 */

import { CategoryService } from 'src/backend/category/category.service';
import { categoryUpdateDTO } from 'src/dto/categoryDTO/category.update.dto';
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
 * Test Suite: CategoryController.update() update method
 * Mô tả: Kiểm thử chức năng cập nhật thông tin danh mục của CategoryController
 */
describe('CategoryController.update() update method', () => {
  // Khai báo các biến sử dụng trong test
  let categoryController: CategoryController;     // Controller cần test
  let mockCategoryService: jest.Mocked<CategoryService>; // Mock service

  /**
   * Thiết lập môi trường test trước mỗi test case
   * Khởi tạo các mock objects và controller cần test
   */
  beforeEach(() => {
    // Tạo mock cho CategoryService với phương thức update
    mockCategoryService = {
      update: jest.fn(),
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
     * Test Case ID: TC-CT-CATEGORY-UPDATE-001
     * Mục tiêu: Kiểm tra việc cập nhật thông tin danh mục thành công
     * Input:
     *   - categoryUpdateDTO:
     *     + id: "1" - ID của danh mục cần cập nhật
     *     + name: "Updated Category" - Tên mới của danh mục
     *   - Service.update trả về: { id: '1', name: 'Updated Category' } (thông tin danh mục đã cập nhật)
     * Expected Output:
     *   - Object: responseHandler.ok({ id: '1', name: 'Updated Category' })
     *   - Service.update được gọi với tham số đúng: mockCategoryUpdateDTO, "1"
     * Ghi chú: Controller phải gọi service đúng và trả về kết quả thành công
     */
    it('should successfully update a category and return a success response', async () => {
      // Sắp xếp (Arrange)
      const mockCategoryUpdateDTO: categoryUpdateDTO = { id: '1', name: 'Updated Category' }; // DTO cập nhật danh mục
      const mockUpdatedCategory = { id: '1', name: 'Updated Category' }; // Thông tin danh mục đã cập nhật
      mockCategoryService.update.mockResolvedValue(mockUpdatedCategory as any as never); // Giả lập service trả về thông tin danh mục đã cập nhật

      // Thực thi (Act)
      const result = await categoryController.update(mockCategoryUpdateDTO); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCategoryService.update).toHaveBeenCalledWith(mockCategoryUpdateDTO, '1'); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.ok(mockUpdatedCategory)); // Kiểm tra kết quả trả về đúng định dạng
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-CT-CATEGORY-UPDATE-002
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi Error
     * Input:
     *   - categoryUpdateDTO:
     *     + id: "1" - ID của danh mục cần cập nhật
     *     + name: "Updated Category" - Tên mới của danh mục
     *   - Service.update ném lỗi: Error("Update failed")
     * Expected Output:
     *   - Object: responseHandler.error("Update failed")
     *   - Service.update được gọi với tham số đúng: mockCategoryUpdateDTO, "1"
     * Ghi chú: Controller phải bắt và xử lý lỗi Error đúng cách
     */
    it('should handle errors thrown by the service and return an error response', async () => {
      // Sắp xếp (Arrange)
      const mockCategoryUpdateDTO: categoryUpdateDTO = { id: '1', name: 'Updated Category' }; // DTO cập nhật danh mục
      const errorMessage = 'Update failed'; // Thông báo lỗi
      mockCategoryService.update.mockRejectedValue(new Error(errorMessage) as never); // Giả lập service ném lỗi

      // Thực thi (Act)
      const result = await categoryController.update(mockCategoryUpdateDTO); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCategoryService.update).toHaveBeenCalledWith(mockCategoryUpdateDTO, '1'); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.error(errorMessage)); // Kiểm tra kết quả trả về là thông báo lỗi
    });

    /**
     * Test Case ID: TC-CT-CATEGORY-UPDATE-003
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi không phải Error (object lỗi)
     * Input:
     *   - categoryUpdateDTO:
     *     + id: "1" - ID của danh mục cần cập nhật
     *     + name: "Updated Category" - Tên mới của danh mục
     *   - Service.update ném lỗi: { message: "Non-error exception" }
     * Expected Output:
     *   - Object: responseHandler.error(JSON.stringify({ message: "Non-error exception" }))
     *   - Service.update được gọi với tham số đúng: mockCategoryUpdateDTO, "1"
     * Ghi chú: Controller phải bắt và xử lý cả các lỗi không phải Error
     */
    it('should handle non-Error exceptions and return an error response', async () => {
      // Sắp xếp (Arrange)
      const mockCategoryUpdateDTO: categoryUpdateDTO = { id: '1', name: 'Updated Category' }; // DTO cập nhật danh mục
      const errorObject = { message: 'Non-error exception' }; // Đối tượng lỗi
      mockCategoryService.update.mockRejectedValue(errorObject as never); // Giả lập service ném đối tượng lỗi

      // Thực thi (Act)
      const result = await categoryController.update(mockCategoryUpdateDTO); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCategoryService.update).toHaveBeenCalledWith(mockCategoryUpdateDTO, '1'); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject))); // Kiểm tra kết quả trả về là chuỗi JSON của đối tượng lỗi
    });
  });
});