// Import các module cần thiết
import { responseHandler } from 'src/Until/responseUtil';
import { UserController } from '../user.controller';

/**
 * Mock Classes
 * Mục đích: Tạo các lớp giả lập để phục vụ việc test
 */

/**
 * MockUserService
 * Mục đích: Giả lập UserService với phương thức findAll
 * Phương thức:
 * - findAll: phương thức jest.fn() để giả lập việc lấy danh sách user
 */
class MockUserService {
  public findAll = jest.fn();
}

/**
 * Test Suite: UserController.findAll()
 * Mục đích: Kiểm thử phương thức findAll của UserController
 */
describe('UserController.findAll() findAll method', () => {
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
     * Test Case TC-UC-FA-001: Lấy danh sách users thành công
     * Mục tiêu: Kiểm tra việc lấy danh sách users thành công
     * Input: 
     * - page: 1
     * - limit: 10
     * Expected Output: responseHandler.ok với mảng users
     * Ghi chú: Kiểm tra cả việc gọi service và kết quả trả về
     */
    it('should return a list of users when findAll is successful', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const mockUsers = [
        { id: 1, name: 'John Doe' }, 
        { id: 2, name: 'Jane Doe' }
      ];
      jest.mocked(mockUserService.findAll).mockResolvedValue(mockUsers as any as never);

      // Act: Thực hiện hành động test
      const result = await userController.findAll(1, 10);

      // Assert: Kiểm tra kết quả
      expect(result).toEqual(responseHandler.ok(mockUsers));
      expect(mockUserService.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  /**
   * Test Suite Con: Edge Cases
   * Mục đích: Kiểm thử các trường hợp ngoại lệ
   */
  describe('Edge Cases', () => {
    /**
     * Test Case TC-UC-FA-002: Xử lý lỗi từ service
     * Mục tiêu: Kiểm tra xử lý khi service throw Error
     * Input:
     * - page: 1
     * - limit: 10
     * Expected Output: responseHandler.error với message lỗi
     * Ghi chú: Kiểm tra khả năng xử lý lỗi của controller
     */
    it('should handle errors thrown by the UserService', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const errorMessage = 'Database connection error';
      jest.mocked(mockUserService.findAll).mockRejectedValue(new Error(errorMessage) as never);

      // Act: Thực hiện hành động test
      const result = await userController.findAll(1, 10);

      // Assert: Kiểm tra kết quả
      expect(result).toEqual(responseHandler.error(errorMessage));
      expect(mockUserService.findAll).toHaveBeenCalledWith(1, 10);
    });

    /**
     * Test Case TC-UC-FA-003: Xử lý ngoại lệ không phải Error
     * Mục tiêu: Kiểm tra xử lý khi service throw object không phải Error
     * Input:
     * - page: 1
     * - limit: 10
     * Expected Output: responseHandler.error với message được stringify
     * Ghi chú: Kiểm tra khả năng xử lý các loại exception khác nhau
     */
    it('should handle non-error objects thrown by the UserService', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const errorObject = { message: 'Unexpected error' };
      jest.mocked(mockUserService.findAll).mockRejectedValue(errorObject as never);

      // Act: Thực hiện hành động test
      const result = await userController.findAll(1, 10);

      // Assert: Kiểm tra kết quả
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
      expect(mockUserService.findAll).toHaveBeenCalledWith(1, 10);
    });
  });
});