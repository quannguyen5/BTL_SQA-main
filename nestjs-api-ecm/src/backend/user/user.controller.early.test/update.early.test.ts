// Import các module cần thiết
import { responseHandler } from 'src/Until/responseUtil';
import { UserController } from '../user.controller';

/**
 * Test Suite: UserController.update()
 * Mục đích: Kiểm thử phương thức update của UserController
 * Chức năng: API cập nhật thông tin user
 */
describe('UserController.update() update method', () => {
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
     * Test Case TC-UC-UD-001: Cập nhật thông tin user thành công
     * Mục tiêu: Kiểm tra việc cập nhật thông tin user thành công
     * Input: 
     * - userId: '123'
     * - mockUpdateUserDto: đối tượng UpdateUserDto
     * Expected Output: 
     * - responseHandler.ok với dữ liệu user đã cập nhật
     * Ghi chú: Kiểm tra cả việc gọi service và kết quả trả về
     */
    it('should update user successfully', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const userId = '123';
      const mockUpdateUserDto = new MockUpdateUserDto() as any;
      const updatedUser = { id: userId, name: 'Updated User' };
      jest.mocked(mockUserService.update).mockResolvedValue(updatedUser as any as never);

      // Act: Thực hiện hành động test
      const result = await userController.update(userId, mockUpdateUserDto);

      // Assert: Kiểm tra kết quả
      expect(mockUserService.update).toHaveBeenCalledWith(userId, mockUpdateUserDto);
      expect(result).toEqual(responseHandler.ok(updatedUser));
    });
  });

  /**
   * Test Suite Con: Edge Cases
   * Mục đích: Kiểm thử các trường hợp ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test Case TC-UC-UD-002: Xử lý lỗi khi service throw Error
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi và throw Error
     * Input:
     * - userId: '123'
     * - mockUpdateUserDto: đối tượng UpdateUserDto
     * - error: Error('User not found')
     * Expected Output:
     * - responseHandler.error với message 'User not found'
     * Ghi chú: Kiểm tra khả năng xử lý Error object
     */
    it('should handle error when user service throws an error', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const userId = '123';
      const mockUpdateUserDto = new MockUpdateUserDto() as any;
      const errorMessage = 'User not found';
      jest.mocked(mockUserService.update).mockRejectedValue(new Error(errorMessage) as never);

      // Act: Thực hiện hành động test
      const result = await userController.update(userId, mockUpdateUserDto);

      // Assert: Kiểm tra kết quả
      expect(mockUserService.update).toHaveBeenCalledWith(userId, mockUpdateUserDto);
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    /**
     * Test Case TC-UC-UD-003: Xử lý lỗi không phải Error object
     * Mục tiêu: Kiểm tra xử lý khi service trả về lỗi không phải Error object
     * Input:
     * - userId: '123'
     * - mockUpdateUserDto: đối tượng UpdateUserDto
     * - errorObject: { message: 'Unexpected error' }
     * Expected Output:
     * - responseHandler.error với message là chuỗi JSON của errorObject
     * Ghi chú: Kiểm tra khả năng xử lý các loại lỗi khác nhau
     */
    it('should handle non-error object thrown by user service', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const userId = '123';
      const mockUpdateUserDto = new MockUpdateUserDto() as any;
      const errorObject = { message: 'Unexpected error' };
      jest.mocked(mockUserService.update).mockRejectedValue(errorObject as never);

      // Act: Thực hiện hành động test
      const result = await userController.update(userId, mockUpdateUserDto);

      // Assert: Kiểm tra kết quả
      expect(mockUserService.update).toHaveBeenCalledWith(userId, mockUpdateUserDto);
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});

/**
 * Mock Classes
 * Mục đích: Tạo các lớp giả lập để phục vụ việc test
 */

/**
 * MockUserService
 * Mục đích: Giả lập UserService với phương thức update
 * Phương thức:
 * - update: phương thức jest.fn() để giả lập việc cập nhật user
 */
class MockUserService {
  update = jest.fn();
}

/**
 * MockUpdateUserDto
 * Mục đích: Giả lập DTO cho việc cập nhật user
 * Thuộc tính: Được định nghĩa theo nhu cầu test
 */
class MockUpdateUserDto {
  // Define properties as needed for testing
}