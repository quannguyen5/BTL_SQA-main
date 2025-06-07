// Import các module cần thiết
import { responseHandler } from 'src/Until/responseUtil';
import { UserController } from '../user.controller';

/**
 * Mock Classes
 * Mục đích: Tạo các lớp giả lập để phục vụ việc test
 */

/**
 * MockUserSearchDto
 * Mục đích: Giả lập DTO cho việc tìm kiếm user
 * Các thuộc tính:
 * - lastName: họ của user
 * - phone: số điện thoại
 * - email: địa chỉ email
 * - role: vai trò của user
 * - isActive: trạng thái hoạt động
 */
class MockUserSearchDto {
  public lastName: string = 'Doe';
  public phone: string = '1234567890';
  public email: string = 'johndoe@example.com';
  public role: string = 'user';
  public isActive: boolean = true;
}

/**
 * MockUserService
 * Mục đích: Giả lập UserService với phương thức findAllBySearch
 * Phương thức:
 * - findAllBySearch: phương thức jest.fn() để giả lập việc tìm kiếm users
 */
class MockUserService {
  findAllBySearch = jest.fn();
}

/**
 * Test Suite: UserController.findAllBySearch()
 * Mục đích: Kiểm thử phương thức findAllBySearch của UserController
 */
describe('UserController.findAllBySearch() findAllBySearch method', () => {
  // Khai báo biến để sử dụng trong các test case
  let userController: UserController;
  let mockUserService: MockUserService;

  /**
   * Hook beforeEach
   * Mục đích: Khởi tạo các đối tượng cần thiết trước mỗi test case
   * Output: Instance mới của UserController và MockUserService
   */
  beforeEach(() => {
    mockUserService = new MockUserService() as any;
    userController = new UserController(mockUserService as any);
  });

  /**
   * Test Suite Con: Happy Paths
   * Mục đích: Kiểm thử các trường hợp thành công
   */
  describe('Happy Paths', () => {
    /**
     * Test Case TC-UC-FABS-001: Tìm kiếm users với tham số hợp lệ
     * Mục tiêu: Kiểm tra việc tìm kiếm users với các tham số tìm kiếm hợp lệ
     * Input: 
     * - page: 1
     * - limit: 10
     * - searchDto: MockUserSearchDto với đầy đủ thông tin
     * Expected Output: responseHandler.ok với mảng users tìm được
     * Ghi chú: Kiểm tra cả việc gọi service và kết quả trả về
     */
    it('should return users when valid search parameters are provided', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const mockUsers = [{ id: 1, name: 'John Doe' }];
      jest.mocked(mockUserService.findAllBySearch).mockResolvedValue(mockUsers as any as never);

      // Act: Thực hiện hành động test
      const result = await userController.findAllBySearch(1, 10, new MockUserSearchDto() as any);

      // Assert: Kiểm tra kết quả
      expect(result).toEqual(responseHandler.ok(mockUsers));
      expect(mockUserService.findAllBySearch).toHaveBeenCalledWith(1, 10, {
        lastName: 'Doe',
        phone: '1234567890',
        email: 'johndoe@example.com',
        role: 'user',
        isActive: true,
      });
    });
  });

  /**
   * Test Suite Con: Edge Cases
   * Mục đích: Kiểm thử các trường hợp ngoại lệ
   */
  describe('Edge Cases', () => {
    /**
     * Test Case TC-UC-FABS-002: Xử lý tham số tìm kiếm rỗng
     * Mục tiêu: Kiểm tra xử lý khi không có tham số tìm kiếm
     * Input:
     * - page: 1
     * - limit: 10
     * - searchDto: object rỗng
     * Expected Output: responseHandler.ok với mảng users
     * Ghi chú: Kiểm tra khả năng xử lý khi không có điều kiện tìm kiếm
     */
    it('should handle empty search parameters gracefully', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const mockUsers = [{ id: 1, name: 'John Doe' }];
      jest.mocked(mockUserService.findAllBySearch).mockResolvedValue(mockUsers as any as never);

      // Act: Thực hiện hành động test
      const result = await userController.findAllBySearch(1, 10, {} as any);

      // Assert: Kiểm tra kết quả
      expect(result).toEqual(responseHandler.ok(mockUsers));
      expect(mockUserService.findAllBySearch).toHaveBeenCalledWith(1, 10, {});
    });

    /**
     * Test Case TC-UC-FABS-003: Xử lý lỗi từ service
     * Mục tiêu: Kiểm tra xử lý khi service throw Error
     * Input:
     * - page: 1
     * - limit: 10
     * - searchDto: MockUserSearchDto đầy đủ
     * Expected Output: responseHandler.error với message lỗi
     * Ghi chú: Kiểm tra khả năng xử lý lỗi của controller
     */
    it('should handle errors from the service gracefully', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const errorMessage = 'Service error';
      jest.mocked(mockUserService.findAllBySearch).mockRejectedValue(new Error(errorMessage) as never);

      // Act: Thực hiện hành động test
      const result = await userController.findAllBySearch(1, 10, new MockUserSearchDto() as any);

      // Assert: Kiểm tra kết quả
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    /**
     * Test Case TC-UC-FABS-004: Xử lý tham số phân trang không hợp lệ
     * Mục tiêu: Kiểm tra xử lý khi page và limit có giá trị không hợp lệ
     * Input:
     * - page: -1
     * - limit: 0
     * - searchDto: MockUserSearchDto đầy đủ
     * Expected Output: responseHandler.ok với mảng users
     * Ghi chú: Kiểm tra khả năng xử lý tham số phân trang không hợp lệ
     */
    it('should handle invalid page and limit parameters', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const mockUsers = [{ id: 1, name: 'John Doe' }];
      jest.mocked(mockUserService.findAllBySearch).mockResolvedValue(mockUsers as any as never);

      // Act: Thực hiện hành động test
      const result = await userController.findAllBySearch(-1, 0, new MockUserSearchDto() as any);

      // Assert: Kiểm tra kết quả
      expect(result).toEqual(responseHandler.ok(mockUsers));
      expect(mockUserService.findAllBySearch).toHaveBeenCalledWith(-1, 0, {
        lastName: 'Doe',
        phone: '1234567890',
        email: 'johndoe@example.com',
        role: 'user',
        isActive: true,
      });
    });
  });
});