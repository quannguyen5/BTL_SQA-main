/**
 * File: create.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức create của CategoryService
 * Module: Category
 * Chức năng: Kiểm tra chức năng tạo danh mục mới
 * Ngày tạo: 2023
 */

import { CategoryRepository } from 'src/repository/CategoryRepository';
import { ApplyStatus } from 'src/share/Enum/Enum';
import { BaseService } from '../../../base/baseService/base.service';
import { CategoryCreateDTO } from '../../../dto/categoryDTO/category.create.dto';
import { CategoryService } from '../category.service';

/**
 * Mock DTO cho việc tạo danh mục mới
 * Chứa các thông tin cần thiết để tạo danh mục
 */
const mockCategoryCreateDTO = {
  status: ApplyStatus.True, // Trạng thái của danh mục (True: hoạt động)
  name: 'Test Category',    // Tên danh mục
} as unknown as jest.Mocked<CategoryCreateDTO>;

/**
 * Mock Repository cho CategoryRepository
 * Giả lập các phương thức của repository để kiểm soát hành vi trong quá trình test
 */
const mockCategoryRepository = {
  create: jest.fn(), // Phương thức tạo danh mục mới
} as unknown as jest.Mocked<CategoryRepository>;

/**
 * Test Suite: CategoryService.create() create method
 * Mô tả: Kiểm thử chức năng tạo danh mục mới của CategoryService
 */
describe('CategoryService.create() create method', () => {
  // Khai báo các biến sử dụng trong test
  let categoryService: CategoryService; // Service cần test

  /**
   * Thiết lập môi trường test trước mỗi test case
   * Khởi tạo các mock objects và service cần test
   */
  beforeEach(() => {
    // Khởi tạo service với repository đã mock
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
     * Test Case ID: TC-SV-CATEGORY-CREATE-001
     * Mục tiêu: Kiểm tra việc tạo danh mục thành công khi trạng thái là ApplyStatus.True
     * Input:
     *   - categoryCreateDTO:
     *     + status: ApplyStatus.True - Trạng thái hoạt động
     *     + name: "Test Category" - Tên danh mục
     *   - BaseService.create trả về: { id: 1, status: ApplyStatus.True, name: "Test Category" }
     * Expected Output:
     *   - Object: { id: 1, status: ApplyStatus.True, name: "Test Category" }
     *   - BaseService.create được gọi với tham số đúng: mockCategoryCreateDTO, { name: "Test Category" }
     * Ghi chú: Service phải gọi BaseService.create đúng và trả về kết quả thành công
     */
    it('should create a category successfully when status is ApplyStatus.True', async () => {
      // Sắp xếp (Arrange)
      mockCategoryCreateDTO.status = ApplyStatus.True; // Đặt trạng thái là True
      const expectedResult = { id: 1, ...mockCategoryCreateDTO }; // Kết quả mong đợi
      jest.spyOn(BaseService.prototype, 'create').mockResolvedValue(expectedResult as any as never); // Giả lập BaseService.create trả về kết quả mong đợi

      // Thực thi (Act)
      const result = await categoryService.create(mockCategoryCreateDTO); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(result).toEqual(expectedResult); // Kiểm tra kết quả trả về đúng với kết quả mong đợi
      expect(BaseService.prototype.create).toHaveBeenCalledWith(mockCategoryCreateDTO, { name: mockCategoryCreateDTO.name }); // Kiểm tra BaseService.create được gọi với tham số đúng
    });

    /**
     * Test Case ID: TC-SV-CATEGORY-CREATE-002
     * Mục tiêu: Kiểm tra việc tạo danh mục thành công khi trạng thái là ApplyStatus.False
     * Input:
     *   - categoryCreateDTO:
     *     + status: ApplyStatus.False - Trạng thái không hoạt động
     *     + name: "Test Category" - Tên danh mục
     *   - BaseService.create trả về: { id: 2, status: ApplyStatus.False, name: "Test Category" }
     * Expected Output:
     *   - Object: { id: 2, status: ApplyStatus.False, name: "Test Category" }
     *   - BaseService.create được gọi với tham số đúng: mockCategoryCreateDTO, { name: "Test Category" }
     * Ghi chú: Service phải gọi BaseService.create đúng và trả về kết quả thành công
     */
    it('should create a category successfully when status is ApplyStatus.False', async () => {
      // Sắp xếp (Arrange)
      mockCategoryCreateDTO.status = ApplyStatus.False; // Đặt trạng thái là False
      const expectedResult = { id: 2, ...mockCategoryCreateDTO }; // Kết quả mong đợi
      jest.spyOn(BaseService.prototype, 'create').mockResolvedValue(expectedResult as any as never); // Giả lập BaseService.create trả về kết quả mong đợi

      // Thực thi (Act)
      const result = await categoryService.create(mockCategoryCreateDTO); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(result).toEqual(expectedResult); // Kiểm tra kết quả trả về đúng với kết quả mong đợi
      expect(BaseService.prototype.create).toHaveBeenCalledWith(mockCategoryCreateDTO, { name: mockCategoryCreateDTO.name }); // Kiểm tra BaseService.create được gọi với tham số đúng
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-SV-CATEGORY-CREATE-003
     * Mục tiêu: Kiểm tra xử lý khi trạng thái không hợp lệ
     * Input:
     *   - categoryCreateDTO:
     *     + status: "InvalidStatus" - Trạng thái không hợp lệ (không phải True hoặc False)
     *     + name: "Test Category" - Tên danh mục
     * Expected Output:
     *   - Exception với message: "Invalid status value"
     * Ghi chú: Service phải kiểm tra tính hợp lệ của trạng thái trước khi tạo danh mục
     */
    it('should throw an error when status is neither ApplyStatus.True nor ApplyStatus.False', async () => {
      // Sắp xếp (Arrange)
      mockCategoryCreateDTO.status = 'InvalidStatus' as ApplyStatus; // Đặt trạng thái không hợp lệ

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(categoryService.create(mockCategoryCreateDTO)).rejects.toThrow('Invalid status value'); // Kiểm tra lỗi được ném ra
    });
  });
});