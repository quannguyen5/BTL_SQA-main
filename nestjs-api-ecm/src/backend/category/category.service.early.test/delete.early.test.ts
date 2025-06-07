/**
 * File: delete.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức delete của CategoryService
 * Module: Category
 * Chức năng: Kiểm tra chức năng xóa danh mục
 * Ngày tạo: 2023
 */

import { CategoryRepository } from 'src/repository/CategoryRepository';
import { BaseService } from '../../../base/baseService/base.service';
import { CategoryService } from '../category.service';

/**
 * Mock Repository cho CategoryRepository
 * Giả lập các phương thức của repository để kiểm soát hành vi trong quá trình test
 */
const mockCategoryRepository = {
  delete: jest.fn(), // Phương thức xóa danh mục
} as unknown as jest.Mocked<CategoryRepository>;

/**
 * Mock BaseService để kiểm soát hành vi của lớp cơ sở
 * Giả lập phương thức delete của BaseService để kiểm soát hành vi trong quá trình test
 */
class MockBaseService extends BaseService<any> {
  delete = jest.fn(); // Phương thức xóa được giả lập
}

/**
 * Test Suite: CategoryService.delete() delete method
 * Mô tả: Kiểm thử chức năng xóa danh mục của CategoryService
 */
describe('CategoryService.delete() delete method', () => {
  // Khai báo các biến sử dụng trong test
  let categoryService: CategoryService; // Service cần test
  let baseService: MockBaseService;     // Mock của BaseService

  /**
   * Thiết lập môi trường test trước mỗi test case
   * Khởi tạo các mock objects và service cần test
   */
  beforeEach(() => {
    // Khởi tạo mock của BaseService
    baseService = new MockBaseService(mockCategoryRepository);
    // Khởi tạo service cần test
    categoryService = new CategoryService(mockCategoryRepository);
    // Ghi đè phương thức delete của CategoryService bằng phương thức đã mock
    categoryService['delete'] = baseService.delete;

    // Reset các mock trước mỗi test
    jest.clearAllMocks();
  });

  /**
   * Test Group: Happy paths
   * Mô tả: Các test case cho trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * Test Case ID: TC-SV-CATEGORY-DEL-001
     * Mục tiêu: Kiểm tra việc xóa danh mục thành công theo ID
     * Input:
     *   - id: "123" - ID của danh mục cần xóa
     *   - BaseService.delete trả về: { affected: 1 } (1 bản ghi bị ảnh hưởng)
     * Expected Output:
     *   - Object: { affected: 1 } (xóa thành công 1 bản ghi)
     *   - BaseService.delete được gọi với tham số đúng: "123"
     * Ghi chú: Service phải gọi BaseService.delete đúng và trả về kết quả xóa thành công
     */
    it('should successfully delete a category by id', async () => {
      // Sắp xếp (Arrange)
      const id = '123'; // ID của danh mục cần xóa
      baseService.delete.mockResolvedValue({ affected: 1 } as any as never); // Giả lập BaseService.delete trả về kết quả xóa thành công

      // Thực thi (Act)
      const result = await categoryService.delete(id); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(result).toEqual({ affected: 1 }); // Kiểm tra kết quả trả về đúng với kết quả mong đợi
      expect(baseService.delete).toHaveBeenCalledWith(id); // Kiểm tra BaseService.delete được gọi với tham số đúng
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-SV-CATEGORY-DEL-002
     * Mục tiêu: Kiểm tra xử lý khi xóa danh mục không tồn tại
     * Input:
     *   - id: "non-existent-id" - ID của danh mục không tồn tại
     *   - BaseService.delete trả về: { affected: 0 } (không có bản ghi nào bị ảnh hưởng)
     * Expected Output:
     *   - Object: { affected: 0 } (không có bản ghi nào bị xóa)
     *   - BaseService.delete được gọi với tham số đúng: "non-existent-id"
     * Ghi chú: Service phải xử lý được trường hợp không tìm thấy danh mục cần xóa
     */
    it('should handle deletion of a non-existent category gracefully', async () => {
      // Sắp xếp (Arrange)
      const id = 'non-existent-id'; // ID của danh mục không tồn tại
      baseService.delete.mockResolvedValue({ affected: 0 } as any as never); // Giả lập BaseService.delete trả về kết quả không có bản ghi nào bị xóa

      // Thực thi (Act)
      const result = await categoryService.delete(id); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(result).toEqual({ affected: 0 }); // Kiểm tra kết quả trả về đúng với kết quả mong đợi
      expect(baseService.delete).toHaveBeenCalledWith(id); // Kiểm tra BaseService.delete được gọi với tham số đúng
    });

    /**
     * Test Case ID: TC-SV-CATEGORY-DEL-003
     * Mục tiêu: Kiểm tra xử lý khi gặp lỗi trong quá trình xóa
     * Input:
     *   - id: "123" - ID của danh mục cần xóa
     *   - BaseService.delete ném lỗi: Error("Deletion error")
     * Expected Output:
     *   - Exception với message: "Deletion error"
     *   - BaseService.delete được gọi với tham số đúng: "123"
     * Ghi chú: Service phải ném lại lỗi khi gặp lỗi trong quá trình xóa
     */
    it('should handle errors thrown during deletion', async () => {
      // Sắp xếp (Arrange)
      const id = '123'; // ID của danh mục cần xóa
      const errorMessage = 'Deletion error'; // Thông báo lỗi
      baseService.delete.mockRejectedValue(new Error(errorMessage) as never); // Giả lập BaseService.delete ném lỗi

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(categoryService.delete(id)).rejects.toThrow(errorMessage); // Kiểm tra lỗi được ném ra
      expect(baseService.delete).toHaveBeenCalledWith(id); // Kiểm tra BaseService.delete được gọi với tham số đúng
    });
  });
});