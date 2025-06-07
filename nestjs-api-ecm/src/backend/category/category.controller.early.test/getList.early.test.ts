/**
 * File: getList.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getList của CategoryController
 * Module: Category
 * Chức năng: Kiểm tra chức năng lấy danh sách danh mục có phân trang và lọc
 * Ngày tạo: 2023
 */

import { ApplyStatus } from 'src/share/Enum/Enum';
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
 * Mock Service cho CategoryService
 * Giả lập các phương thức của service để kiểm soát hành vi trong quá trình test
 */
class MockCategoryService {
  public getList = jest.fn(); // Phương thức lấy danh sách danh mục
}

/**
 * Test Suite: CategoryController.getList() getList method
 * Mô tả: Kiểm thử chức năng lấy danh sách danh mục của CategoryController
 */
describe('CategoryController.getList() getList method', () => {
  // Khai báo các biến sử dụng trong test
  let categoryController: CategoryController;     // Controller cần test
  let mockCategoryService: MockCategoryService;   // Mock service

  /**
   * Thiết lập môi trường test trước mỗi test case
   * Khởi tạo các mock objects và controller cần test
   */
  beforeEach(() => {
    mockCategoryService = new MockCategoryService();
    categoryController = new CategoryController(mockCategoryService as any);

    // Reset các mock trước mỗi test
    jest.clearAllMocks();
  });

  /**
   * Test Group: Happy paths
   * Mô tả: Các test case cho trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * Test Case ID: TC-CT-CATEGORY-GETLIST-001
     * Mục tiêu: Kiểm tra việc lấy danh sách danh mục với các tham số hợp lệ
     * Input:
     *   - page: 1 - Số trang cần lấy
     *   - limit: 10 - Số lượng bản ghi trên một trang
     *   - name: "Category" - Tên danh mục cần lọc
     *   - status: ApplyStatus.All - Trạng thái cần lọc
     *   - Service.getList trả về: [{ id: 1, name: 'Category 1' }] (danh sách danh mục)
     * Expected Output:
     *   - Object: responseHandler.ok([{ id: 1, name: 'Category 1' }])
     *   - Service.getList được gọi với tham số đúng: 1, 10, { name: 'Category', status: ApplyStatus.All }
     * Ghi chú: Controller phải gọi service đúng và trả về kết quả thành công
     */
    it('should return a list of categories when called with valid parameters', async () => {
      // Sắp xếp (Arrange)
      const mockCategories = [{ id: 1, name: 'Category 1' }]; // Danh sách danh mục mẫu
      jest.mocked(mockCategoryService.getList).mockResolvedValue(mockCategories as any as never); // Giả lập service trả về danh sách danh mục

      // Thực thi (Act)
      const result = await categoryController.getList(1, 10, 'Category', ApplyStatus.All); // Gọi phương thức cần test với các tham số

      // Kiểm tra (Assert)
      expect(mockCategoryService.getList).toHaveBeenCalledWith(1, 10, { name: 'Category', status: ApplyStatus.All }); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.ok(mockCategories)); // Kiểm tra kết quả trả về đúng định dạng
    });

    /**
     * Test Case ID: TC-CT-CATEGORY-GETLIST-002
     * Mục tiêu: Kiểm tra việc lấy danh sách danh mục với các tham số mặc định
     * Input:
     *   - page: 1 - Số trang cần lấy
     *   - limit: 10 - Số lượng bản ghi trên một trang
     *   - name: undefined - Không có tên danh mục cần lọc
     *   - status: undefined - Không có trạng thái cần lọc
     *   - Service.getList trả về: [{ id: 1, name: 'Category 1' }] (danh sách danh mục)
     * Expected Output:
     *   - Object: responseHandler.ok([{ id: 1, name: 'Category 1' }])
     *   - Service.getList được gọi với tham số đúng: 1, 10, { name: '', status: '' }
     * Ghi chú: Controller phải xử lý được trường hợp không có tham số lọc
     */
    it('should return a list of categories with default filters when no query parameters are provided', async () => {
      // Sắp xếp (Arrange)
      const mockCategories = [{ id: 1, name: 'Category 1' }]; // Danh sách danh mục mẫu
      jest.mocked(mockCategoryService.getList).mockResolvedValue(mockCategories as any as never); // Giả lập service trả về danh sách danh mục

      // Thực thi (Act)
      const result = await categoryController.getList(1, 10); // Gọi phương thức cần test chỉ với page và limit

      // Kiểm tra (Assert)
      expect(mockCategoryService.getList).toHaveBeenCalledWith(1, 10, { name: '', status: '' }); // Kiểm tra service được gọi với tham số mặc định
      expect(result).toEqual(responseHandler.ok(mockCategories)); // Kiểm tra kết quả trả về đúng định dạng
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-CT-CATEGORY-GETLIST-003
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi Error
     * Input:
     *   - page: 1 - Số trang cần lấy
     *   - limit: 10 - Số lượng bản ghi trên một trang
     *   - Service.getList ném lỗi: Error("Service error")
     * Expected Output:
     *   - Object: responseHandler.error("Service error")
     *   - Service.getList được gọi với tham số đúng: 1, 10, { name: '', status: '' }
     * Ghi chú: Controller phải bắt và xử lý lỗi Error đúng cách
     */
    it('should handle an error thrown by the service gracefully', async () => {
      // Sắp xếp (Arrange)
      const errorMessage = 'Service error'; // Thông báo lỗi
      jest.mocked(mockCategoryService.getList).mockRejectedValue(new Error(errorMessage) as never); // Giả lập service ném lỗi

      // Thực thi (Act)
      const result = await categoryController.getList(1, 10); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCategoryService.getList).toHaveBeenCalledWith(1, 10, { name: '', status: '' }); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.error(errorMessage)); // Kiểm tra kết quả trả về là thông báo lỗi
    });

    /**
     * Test Case ID: TC-CT-CATEGORY-GETLIST-004
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi không phải Error (object lỗi)
     * Input:
     *   - page: 1 - Số trang cần lấy
     *   - limit: 10 - Số lượng bản ghi trên một trang
     *   - Service.getList ném lỗi: { message: "Non-error object" }
     * Expected Output:
     *   - Object: responseHandler.error(JSON.stringify({ message: "Non-error object" }))
     *   - Service.getList được gọi với tham số đúng: 1, 10, { name: '', status: '' }
     * Ghi chú: Controller phải bắt và xử lý cả các lỗi không phải Error
     */
    it('should handle non-error objects thrown by the service gracefully', async () => {
      // Sắp xếp (Arrange)
      const errorObject = { message: 'Non-error object' }; // Đối tượng lỗi
      jest.mocked(mockCategoryService.getList).mockRejectedValue(errorObject as never); // Giả lập service ném đối tượng lỗi

      // Thực thi (Act)
      const result = await categoryController.getList(1, 10); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCategoryService.getList).toHaveBeenCalledWith(1, 10, { name: '', status: '' }); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject))); // Kiểm tra kết quả trả về là chuỗi JSON của đối tượng lỗi
    });
  });
});