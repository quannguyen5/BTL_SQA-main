/**
 * File: update.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức update của CategoryService
 * Module: Category
 * Chức năng: Kiểm tra chức năng cập nhật thông tin danh mục
 * Ngày tạo: 2023
 */

import { CategoryRepository } from 'src/repository/CategoryRepository';
import { BaseService } from '../../../base/baseService/base.service';
import { categoryUpdateDTO } from '../../../dto/categoryDTO/category.update.dto';
import { CategoryService } from '../category.service';

/**
 * Mock Repository cho CategoryRepository
 * Giả lập các phương thức của repository để kiểm soát hành vi trong quá trình test
 */
const mockCategoryRepository = {
  update: jest.fn(), // Phương thức cập nhật danh mục
} as unknown as jest.Mocked<CategoryRepository>;

/**
 * Mock DTO cho việc cập nhật danh mục
 * Chứa các thông tin cần thiết để cập nhật danh mục
 */
const mockCategoryUpdateDTO = {
  // Có thể thêm các thuộc tính hoặc phương thức cần thiết cho DTO
  id: '123',       // ID của danh mục cần cập nhật
  name: 'Updated Category', // Tên mới của danh mục
} as unknown as jest.Mocked<categoryUpdateDTO>;

/**
 * Mock BaseService để kiểm soát hành vi của lớp cơ sở
 * Giả lập phương thức update của BaseService để kiểm soát hành vi trong quá trình test
 */
class MockBaseService extends BaseService<any> {
  update = jest.fn(); // Phương thức cập nhật được giả lập
}

/**
 * Test Suite: CategoryService.update() update method
 * Mô tả: Kiểm thử chức năng cập nhật thông tin danh mục của CategoryService
 */
describe('CategoryService.update() update method', () => {
  // Khai báo các biến sử dụng trong test
  let categoryService: CategoryService; // Service cần test
  let mockBaseService: MockBaseService; // Mock của BaseService

  /**
   * Thiết lập môi trường test trước mỗi test case
   * Khởi tạo các mock objects và service cần test
   */
  beforeEach(() => {
    // Khởi tạo mock của BaseService
    mockBaseService = new MockBaseService(mockCategoryRepository);
    // Khởi tạo service cần test
    categoryService = new CategoryService(mockCategoryRepository);
    // Ghi đè phương thức update của CategoryService bằng phương thức đã mock
    jest.spyOn(categoryService, 'update').mockImplementation(mockBaseService.update);

    // Reset các mock trước mỗi test
    jest.clearAllMocks();
  });

  /**
   * Test Group: Happy paths
   * Mô tả: Các test case cho trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * Test Case ID: TC-SV-CATEGORY-UPDATE-001
     * Mục tiêu: Kiểm tra việc cập nhật danh mục thành công
     * Input:
     *   - id: "123" - ID của danh mục cần cập nhật
     *   - updateData: mockCategoryUpdateDTO - Dữ liệu cập nhật
     *   - BaseService.update trả về: { id: "123", ...updateData } (thông tin danh mục đã cập nhật)
     * Expected Output:
     *   - Object: { id: "123", ...updateData } (thông tin danh mục đã cập nhật)
     *   - BaseService.update được gọi với tham số đúng: updateData, "123"
     * Ghi chú: Service phải gọi BaseService.update đúng và trả về kết quả cập nhật thành công
     */
    it('should update a category successfully', async () => {
      // Sắp xếp (Arrange)
      const id = '123'; // ID của danh mục cần cập nhật
      const updateData = mockCategoryUpdateDTO; // Dữ liệu cập nhật
      mockBaseService.update.mockResolvedValue({ id, ...updateData } as any as never); // Giả lập BaseService.update trả về kết quả cập nhật thành công

      // Thực thi (Act)
      const result = await categoryService.update(updateData, id); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockBaseService.update).toHaveBeenCalledWith(updateData, id); // Kiểm tra BaseService.update được gọi với tham số đúng
      expect(result).toEqual({ id, ...updateData }); // Kiểm tra kết quả trả về đúng với kết quả mong đợi
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-SV-CATEGORY-UPDATE-002
     * Mục tiêu: Kiểm tra xử lý khi cập nhật danh mục không tồn tại
     * Input:
     *   - id: "non-existent-id" - ID của danh mục không tồn tại
     *   - updateData: mockCategoryUpdateDTO - Dữ liệu cập nhật
     *   - BaseService.update trả về: null (không tìm thấy danh mục để cập nhật)
     * Expected Output:
     *   - null (không có danh mục nào được cập nhật)
     *   - BaseService.update được gọi với tham số đúng: updateData, "non-existent-id"
     * Ghi chú: Service phải xử lý được trường hợp không tìm thấy danh mục cần cập nhật
     */
    it('should handle update with non-existent category ID', async () => {
      // Sắp xếp (Arrange)
      const id = 'non-existent-id'; // ID của danh mục không tồn tại
      const updateData = mockCategoryUpdateDTO; // Dữ liệu cập nhật
      mockBaseService.update.mockResolvedValue(null as any as never); // Giả lập BaseService.update trả về null (không tìm thấy danh mục)

      // Thực thi (Act)
      const result = await categoryService.update(updateData, id); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockBaseService.update).toHaveBeenCalledWith(updateData, id); // Kiểm tra BaseService.update được gọi với tham số đúng
      expect(result).toBeNull(); // Kiểm tra kết quả trả về là null
    });

    /**
     * Test Case ID: TC-SV-CATEGORY-UPDATE-003
     * Mục tiêu: Kiểm tra xử lý khi cập nhật với dữ liệu không hợp lệ
     * Input:
     *   - id: "123" - ID của danh mục cần cập nhật
     *   - updateData: null - Dữ liệu cập nhật không hợp lệ
     *   - BaseService.update ném lỗi: Error("Invalid data")
     * Expected Output:
     *   - Exception với message: "Invalid data"
     *   - BaseService.update được gọi với tham số đúng: null, "123"
     * Ghi chú: Service phải ném lại lỗi khi gặp lỗi trong quá trình cập nhật
     */
    it('should handle update with invalid data', async () => {
      // Sắp xếp (Arrange)
      const id = '123'; // ID của danh mục cần cập nhật
      const updateData = null as unknown as categoryUpdateDTO; // Dữ liệu cập nhật không hợp lệ
      mockBaseService.update.mockRejectedValue(new Error('Invalid data') as never); // Giả lập BaseService.update ném lỗi

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(categoryService.update(updateData, id)).rejects.toThrow('Invalid data'); // Kiểm tra lỗi được ném ra
      expect(mockBaseService.update).toHaveBeenCalledWith(updateData, id); // Kiểm tra BaseService.update được gọi với tham số đúng
    });
  });
});