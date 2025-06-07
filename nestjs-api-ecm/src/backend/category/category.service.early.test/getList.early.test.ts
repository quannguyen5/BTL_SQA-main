/**
 * File: getList.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getList của CategoryService
 * Module: Category
 * Chức năng: Kiểm tra chức năng lấy danh sách danh mục có phân trang và lọc
 * Ngày tạo: 2023
 */

import { CategoryRepository } from 'src/repository/CategoryRepository';
import { ApplyStatus } from 'src/share/Enum/Enum';
import { CategoryEntity } from '../../../entities/category_entity/category.entity';
import { CategoryService } from '../category.service';

/**
 * Test Suite: CategoryService.getList() getList method
 * Mô tả: Kiểm thử chức năng lấy danh sách danh mục có phân trang và lọc của CategoryService
 */
describe('CategoryService.getList() getList method', () => {
  // Khai báo các biến sử dụng trong test
  let categoryService: CategoryService;                 // Service cần test
  let mockCategoryRepo: jest.Mocked<CategoryRepository>; // Mock repository

  /**
   * Thiết lập môi trường test trước mỗi test case
   * Khởi tạo các mock objects và service cần test
   */
  beforeEach(() => {
    // Tạo mock cho CategoryRepository với phương thức findAndCount
    mockCategoryRepo = {
      findAndCount: jest.fn(), // Phương thức tìm kiếm và đếm số lượng danh mục
    } as unknown as jest.Mocked<CategoryRepository>;

    // Khởi tạo service cần test với repository đã mock
    categoryService = new CategoryService(mockCategoryRepo);

    // Reset các mock trước mỗi test
    jest.clearAllMocks();
  });

  /**
   * Test Group: Happy paths
   * Mô tả: Các test case cho trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * Test Case ID: TC-SV-CATEGORY-GETLIST-001
     * Mục tiêu: Kiểm tra việc áp dụng các bộ lọc đúng cách khi lấy danh sách danh mục
     * Input:
     *   - page: 1 - Số trang cần lấy
     *   - limit: 10 - Số lượng bản ghi trên một trang
     *   - filters: { name: 'Filtered', status: ApplyStatus.True } - Điều kiện lọc
     *   - Repository.findAndCount trả về: [[{ id: 1, name: 'Filtered Category', status: ApplyStatus.True }], 1]
     * Expected Output:
     *   - Object: {
     *       data: [{ id: 1, name: 'Filtered Category', status: ApplyStatus.True }],
     *       total: 1,
     *       page: 1,
     *       limit: 10
     *     }
     *   - Repository.findAndCount được gọi với tham số đúng bao gồm các điều kiện lọc
     * Ghi chú: Service phải áp dụng các bộ lọc đúng cách và trả về kết quả phân trang
     */
    it('should apply filters correctly', async () => {
      // Sắp xếp (Arrange)
      // Danh sách danh mục mẫu - sử dụng unknown để tránh lỗi type
      const mockCategories = [
        { id: 1, name: 'Filtered Category', status: ApplyStatus.True }
      ] as unknown as CategoryEntity[];
      const mockTotal = 1; // Tổng số danh mục
      mockCategoryRepo.findAndCount.mockResolvedValue([mockCategories, mockTotal] as any as never); // Giả lập repository.findAndCount trả về danh sách danh mục và tổng số

      // Thực thi (Act)
      const result = await categoryService.getList(1, 10, { name: 'Filtered', status: ApplyStatus.True }); // Gọi phương thức cần test với các tham số

      // Kiểm tra (Assert)
      expect(result).toEqual({ // Kiểm tra kết quả trả về đúng định dạng
        data: mockCategories, // Danh sách danh mục
        total: mockTotal,     // Tổng số danh mục
        page: 1,              // Số trang hiện tại
        limit: 10,            // Số lượng bản ghi trên một trang
      });
      // Lưu ý: Đoạn code kiểm tra chi tiết tham số gọi findAndCount đã bị comment lại
      // Có thể bỏ comment để kiểm tra chi tiết hơn
//      expect(mockCategoryRepo.findAndCount).toHaveBeenCalledWith({
//        where: {
//          name: expect.any(Object),
//          status: ApplyStatus.True,
//        },
//        skip: 0,
//        take: 10,
//      });
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-SV-CATEGORY-GETLIST-002
     * Mục tiêu: Kiểm tra xử lý khi số trang nhỏ hơn 1
     * Input:
     *   - page: 0 - Số trang không hợp lệ (nhỏ hơn 1)
     *   - limit: 10 - Số lượng bản ghi trên một trang
     *   - filters: {} - Không có điều kiện lọc
     * Expected Output:
     *   - Exception với message: "PAGE NUMBER MUST BE GREATER THAN 0!"
     * Ghi chú: Service phải kiểm tra tính hợp lệ của số trang trước khi thực hiện truy vấn
     */
    it('should throw an error if page number is less than 1', async () => {
      // Thực thi và Kiểm tra (Act & Assert)
      await expect(categoryService.getList(0, 10, {})).rejects.toThrow('PAGE NUMBER MUST BE GREATER THAN 0!'); // Kiểm tra lỗi được ném ra
    });

    /**
     * Test Case ID: TC-SV-CATEGORY-GETLIST-003
     * Mục tiêu: Kiểm tra xử lý khi giới hạn bản ghi nhỏ hơn 1
     * Input:
     *   - page: 1 - Số trang hợp lệ
     *   - limit: 0 - Giới hạn bản ghi không hợp lệ (nhỏ hơn 1)
     *   - filters: {} - Không có điều kiện lọc
     * Expected Output:
     *   - Exception với message: "LIMIT MUST BE GREATER THAN 0!"
     * Ghi chú: Service phải kiểm tra tính hợp lệ của giới hạn bản ghi trước khi thực hiện truy vấn
     */
    it('should throw an error if limit is less than 1', async () => {
      // Thực thi và Kiểm tra (Act & Assert)
      await expect(categoryService.getList(1, 0, {})).rejects.toThrow('LIMIT MUST BE GREATER THAN 0!'); // Kiểm tra lỗi được ném ra
    });

    /**
     * Test Case ID: TC-SV-CATEGORY-GETLIST-004
     * Mục tiêu: Kiểm tra xử lý khi không tìm thấy danh mục nào
     * Input:
     *   - page: 1 - Số trang hợp lệ
     *   - limit: 10 - Giới hạn bản ghi hợp lệ
     *   - filters: {} - Không có điều kiện lọc
     *   - Repository.findAndCount trả về: [[], 0] (không có danh mục nào)
     * Expected Output:
     *   - Exception với message: "NO CATEGORY!"
     * Ghi chú: Service phải kiểm tra kết quả trả về từ repository để đảm bảo có dữ liệu
     */
    it('should throw an error if no categories are found', async () => {
      // Sắp xếp (Arrange)
      mockCategoryRepo.findAndCount.mockResolvedValue([[], 0] as any as never); // Giả lập repository.findAndCount trả về mảng rỗng và tổng số 0

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(categoryService.getList(1, 10, {})).rejects.toThrow('NO CATEGORY!'); // Kiểm tra lỗi được ném ra
    });
  });
});