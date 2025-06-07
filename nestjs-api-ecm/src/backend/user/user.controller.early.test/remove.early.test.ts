// Import các module cần thiết
import { responseHandler } from 'src/Until/responseUtil';
import { UserController } from '../user.controller';

/**
 * Mock Classes
 * Mục đích: Tạo các lớp giả lập để phục vụ việc test
 */

/**
 * MockUserService
 * Mục đích: Giả lập UserService với phương thức remove
 * Phương thức:
 * - remove: phương thức jest.fn() để giả lập việc xóa user
 */
class MockUserService {
  public remove = jest.fn();
}

/**
 * Test Suite: UserController.remove()
 * Mục đích: Kiểm thử phương thức remove của UserController
 * Chức năng: API xóa user theo ID
 */
describe('UserController.remove() remove method', () => {
  // Khai báo biến để sử dụng trong các test case
  let userController: UserController; // Controller cần test
  let mockUserService: MockUserService; // Service giả lập

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
  describe('Happy paths', () => {
    /**
     * Test Case TC-UC-RM-001: Xóa user thành công
     * Mục tiêu: Kiểm tra việc xóa user thành công và trả về response phù hợp
     * Input: 
     * - user_id_user: '123'
     * Expected Output: 
     * - responseHandler.ok với { success: true }
     * Ghi chú: Kiểm tra cả việc gọi service và kết quả trả về
     */
    it('should successfully remove a user and return a success response', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const user_id_user = '123';
      const expectedResponse = { success: true };
      jest.mocked(mockUserService.remove).mockResolvedValue(expectedResponse as any as never);

      // Act: Thực hiện hành động test
      const result = await userController.remove(user_id_user);

      // Assert: Kiểm tra kết quả
      expect(mockUserService.remove).toHaveBeenCalledWith(user_id_user);
      expect(result).toEqual(responseHandler.ok(expectedResponse));
    });
  });

  /**
   * Test Suite Con: Edge Cases
   * Mục đích: Kiểm thử các trường hợp ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test Case TC-UC-RM-002: Xóa user không tồn tại
     * Mục tiêu: Kiểm tra xử lý khi không tìm thấy user cần xóa
     * Input:
     * - user_id_user: '123'
     * - error: Error('User not found')
     * Expected Output:
     * - responseHandler.error với message 'User not found'
     * Ghi chú: Kiểm tra khả năng xử lý lỗi khi user không tồn tại
     */
    it('should handle errors thrown by the UserService and return an error response', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const user_id_user = '123';
      const errorMessage = 'User not found';
      jest.mocked(mockUserService.remove).mockRejectedValue(new Error(errorMessage) as never);

      // Act: Thực hiện hành động test
      const result = await userController.remove(user_id_user);

      // Assert: Kiểm tra kết quả
      expect(mockUserService.remove).toHaveBeenCalledWith(user_id_user);
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    /**
     * Test Case TC-UC-RM-003: Xử lý lỗi không phải Error object
     * Mục tiêu: Kiểm tra xử lý khi service trả về lỗi không phải Error object
     * Input:
     * - user_id_user: '123'
     * - errorObject: { message: 'Unexpected error' }
     * Expected Output:
     * - responseHandler.error với message là chuỗi JSON của errorObject
     * Ghi chú: Kiểm tra khả năng xử lý các loại lỗi khác nhau
     */
    it('should handle non-error objects thrown by the UserService and return an error response', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const user_id_user = '123';
      const errorObject = { message: 'Unexpected error' };
      jest.mocked(mockUserService.remove).mockRejectedValue(errorObject as never);

      // Act: Thực hiện hành động test
      const result = await userController.remove(user_id_user);

      // Assert: Kiểm tra kết quả
      expect(mockUserService.remove).toHaveBeenCalledWith(user_id_user);
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});