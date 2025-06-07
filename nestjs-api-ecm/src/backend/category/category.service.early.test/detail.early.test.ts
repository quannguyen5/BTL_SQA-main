/**
 * File: detail.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức detail của CategoryService
 * Module: Category
 * Chức năng: Kiểm tra chức năng lấy thông tin chi tiết của danh mục
 * Ngày tạo: 2023
 */

import { CategoryRepository } from 'src/repository/CategoryRepository';
import { CategoryEntity } from '../../../entities/category_entity/category.entity';
import { CategoryService } from '../category.service';

/**
 * Test Suite: CategoryService.detail() detail method
 * Mô tả: Kiểm thử chức năng lấy thông tin chi tiết của danh mục của CategoryService
 */
describe('CategoryService.detail() detail method', () => {
  // Khai báo các biến sử dụng trong test
  let categoryService: CategoryService;                   // Service cần test
  let mockCategoryRepository: jest.Mocked<CategoryRepository>; // Mock repository

  /**
   * Thiết lập môi trường test trước mỗi test case
   * Khởi tạo các mock objects và service cần test
   */
  beforeEach(() => {
    // Tạo mock cho CategoryRepository với phương thức findOneBy
    mockCategoryRepository = {
      findOneBy: jest.fn(), // Phương thức tìm kiếm danh mục theo ID
      // Có thể thêm các phương thức khác nếu cần
    } as unknown as jest.Mocked<CategoryRepository>;

    // Khởi tạo service cần test với repository đã mock
    categoryService = new CategoryService(mockCategoryRepository);

    // Reset các mock trước mỗi test
    jest.clearAllMocks();
  });

  /**
   * Test Group: Happy paths
   * Mô tả: Các test case cho trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * Test Case ID: TC-SV-CATEGORY-DETAIL-001
     * Mục tiêu: Kiểm tra việc lấy thông tin chi tiết của danh mục thành công theo ID
     * Input:
     *   - categoryId: "valid-id" - ID của danh mục cần lấy thông tin
     *   - Repository.findOneBy trả về: { id: "valid-id", name: "Electronics" } (thông tin danh mục)
     * Expected Output:
     *   - Object: { id: "valid-id", name: "Electronics" } (thông tin danh mục)
     *   - Repository.findOneBy được gọi với tham số đúng: { id: "valid-id" }
     * Ghi chú: Service phải gọi repository.findOneBy đúng và trả về thông tin danh mục
     */
    it('should return category details for a valid ID', async () => {
      // Sắp xếp (Arrange)
      const categoryId = 'valid-id'; // ID của danh mục cần lấy thông tin
      const expectedCategory = { id: categoryId, name: 'Electronics' } as CategoryEntity; // Thông tin danh mục mong đợi
      mockCategoryRepository.findOneBy.mockResolvedValue(expectedCategory as any as never); // Giả lập repository.findOneBy trả về thông tin danh mục

      // Thực thi (Act)
      const result = await categoryService.detail(categoryId); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(result).toEqual(expectedCategory); // Kiểm tra kết quả trả về đúng với thông tin danh mục mong đợi
      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({ id: categoryId } as any); // Kiểm tra repository.findOneBy được gọi với tham số đúng
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-SV-CATEGORY-DETAIL-002
     * Mục tiêu: Kiểm tra xử lý khi danh mục không tồn tại
     * Input:
     *   - categoryId: "non-existent-id" - ID của danh mục không tồn tại
     *   - Repository.findOneBy trả về: null (không tìm thấy danh mục)
     * Expected Output:
     *   - Exception với message: "RECORD NOT FOUND!"
     *   - Repository.findOneBy được gọi với tham số đúng: { id: "non-existent-id" }
     * Ghi chú: Service sẽ ném lỗi khi không tìm thấy danh mục
     */
    it('should throw RECORD_NOT_FOUND error if category ID does not exist', async () => {
      // Sắp xếp (Arrange)
      const categoryId = 'non-existent-id'; // ID của danh mục không tồn tại
      mockCategoryRepository.findOneBy.mockResolvedValue(null); // Giả lập repository.findOneBy trả về null (không tìm thấy)

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(categoryService.detail(categoryId)).rejects.toThrow('RECORD NOT FOUND!'); // Kiểm tra lỗi được ném ra
      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({ id: categoryId } as any); // Kiểm tra repository.findOneBy được gọi với tham số đúng
    });

    /**
     * Test Case ID: TC-SV-CATEGORY-DETAIL-004
     * Mục tiêu: Kiểm tra xử lý khi danh mục không tồn tại (test case mới)
     * Input:
     *   - categoryId: "missing-id" - ID của danh mục không tồn tại
     *   - Repository.findOneBy trả về: null (không tìm thấy danh mục)
     * Expected Output:
     *   - Exception với message: "RECORD NOT FOUND!"
     * Ghi chú: Test case này được tạo mới để kiểm tra cùng chức năng nhưng với tên khác
     */
    it('new test case - verify error when category not found', async () => {
      // Sắp xếp (Arrange)
      const categoryId = 'missing-id'; // ID của danh mục không tồn tại
      mockCategoryRepository.findOneBy.mockResolvedValue(null); // Giả lập repository.findOneBy trả về null

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(categoryService.detail(categoryId)).rejects.toThrow('RECORD NOT FOUND!'); // Kiểm tra lỗi được ném ra
    });

    /**
     * Test Case ID: TC-SV-CATEGORY-DETAIL-003
     * Mục tiêu: Kiểm tra xử lý khi repository gặp lỗi
     * Input:
     *   - categoryId: "error-id" - ID của danh mục gây lỗi
     *   - Repository.findOneBy ném lỗi: Error("Database error")
     * Expected Output:
     *   - Exception với message: "Database error"
     *   - Repository.findOneBy được gọi với tham số đúng: { id: "error-id" }
     * Ghi chú: Service phải ném lại lỗi khi repository gặp lỗi
     */
    it('should handle errors thrown by the repository', async () => {
      // Sắp xếp (Arrange)
      const categoryId = 'error-id'; // ID của danh mục gây lỗi
      const errorMessage = 'Database error'; // Thông báo lỗi
      mockCategoryRepository.findOneBy.mockRejectedValue(new Error(errorMessage) as never); // Giả lập repository.findOneBy ném lỗi

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(categoryService.detail(categoryId)).rejects.toThrow(errorMessage); // Kiểm tra lỗi được ném ra
      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({ id: categoryId } as any); // Kiểm tra repository.findOneBy được gọi với tham số đúng
    });
  });
});