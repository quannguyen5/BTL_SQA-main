// Import các module cần thiết
import { responseHandler } from 'src/Until/responseUtil';
import { UserController } from '../user.controller';

/**
 * Mock Classes
 * Mục đích: Tạo các lớp giả lập để phục vụ việc test
 */

/**
 * MockUserService
 * Mục đích: Giả lập UserService với phương thức findOne
 * Phương thức:
 * - findOne: phương thức jest.fn() để giả lập việc tìm kiếm user theo ID
 */
class MockUserService {
  public findOne = jest.fn();
}

/**
 * Test Suite: UserController.findOneByAdmin()
 * Mục đích: Kiểm thử phương thức findOneByAdmin của UserController
 * Chức năng: API cho phép Admin tìm kiếm thông tin user theo ID
 */
describe('UserController.findOneByAdmin() findOneByAdmin method', () => {
  // Khai báo biến để sử dụng trong các test case
  let userController: UserController; // Controller cần test
  let mockUserService: MockUserService; // Service giả lập

  /**
   * Hook beforeEach
   * Mục đích: Khởi tạo các đối tượng cần thiết trước mỗi test case
   * Output: Instance mới của UserController và MockUserService
   */
  beforeEach(() => {
    mockUserService = new MockUserService();
    userController = new UserController(mockUserService as any);
  });

  /**
   * Test Suite Con: Happy Paths
   * Mục đích: Kiểm thử các trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * Test Case TC-UC-FOBA-001: Admin tìm kiếm user với ID hợp lệ
     * Mục tiêu: Kiểm tra việc admin tìm kiếm user thành công
     * Input: 
     * - userId: '123'
     * Expected Output: 
     * - responseHandler.ok với dữ liệu user { id: '123', name: 'John Doe' }
     * Ghi chú: Kiểm tra cả việc gọi service và kết quả trả về
     */
    it('should return user data when user is found', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const mockUser = { id: '123', name: 'John Doe' };
      jest.mocked(mockUserService.findOne).mockResolvedValue(mockUser as any as never);

      // Act: Thực hiện hành động test
      const result = await userController.findOneByAdmin('123');

      // Assert: Kiểm tra kết quả
      expect(mockUserService.findOne).toHaveBeenCalledWith('123');
      expect(result).toEqual(responseHandler.ok(mockUser));
    });
  });

  /**
   * Test Suite Con: Edge Cases
   * Mục đích: Kiểm thử các trường hợp ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test Case TC-UC-FOBA-002: Admin tìm kiếm user không tồn tại
     * Mục tiêu: Kiểm tra xử lý khi không tìm thấy user
     * Input:
     * - userId: '999' (ID không tồn tại)
     * Expected Output:
     * - responseHandler.error với message 'User not found'
     * Ghi chú: Kiểm tra khả năng xử lý lỗi khi user không tồn tại
     */
    it('should handle error when user is not found', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const errorMessage = 'User not found';
      jest.mocked(mockUserService.findOne).mockRejectedValue(new Error(errorMessage) as never);

      // Act: Thực hiện hành động test
      const result = await userController.findOneByAdmin('999');

      // Assert: Kiểm tra kết quả
      expect(mockUserService.findOne).toHaveBeenCalledWith('999');
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    /**
     * Test Case TC-UC-FOBA-003: Xử lý ngoại lệ không phải Error
     * Mục tiêu: Kiểm tra xử lý khi service trả về exception không phải Error
     * Input:
     * - userId: '999'
     * - errorObject: { message: 'Unexpected error' }
     * Expected Output:
     * - responseHandler.error với message là chuỗi JSON của exception
     * Ghi chú: Kiểm tra khả năng xử lý các loại exception khác nhau
     */
    it('should handle non-error exceptions gracefully', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const errorObject = { message: 'Unexpected error' };
      jest.mocked(mockUserService.findOne).mockRejectedValue(errorObject as never);

      // Act: Thực hiện hành động test
      const result = await userController.findOneByAdmin('999');

      // Assert: Kiểm tra kết quả
      expect(mockUserService.findOne).toHaveBeenCalledWith('999');
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});