// Import các module cần thiết
import { responseHandler } from 'src/Until/responseUtil';
import { UserController } from '../user.controller';

/**
 * Mock Classes
 * Mục đích: Tạo các lớp giả lập để phục vụ việc test
 */

/**
 * MockUpdateUserDto
 * Mục đích: Giả lập DTO cho việc cập nhật user bởi admin
 * Thuộc tính:
 * - name: tên người dùng mặc định
 * - email: email mặc định
 */
class MockUpdateUserDto {
  public name: string = 'Test User';
  public email: string = 'test@example.com';
}

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
 * Test Suite: UserController.updateByAdmin()
 * Mục đích: Kiểm thử phương thức updateByAdmin của UserController
 * Chức năng: API cập nhật thông tin user bởi admin
 */
describe('UserController.updateByAdmin() updateByAdmin method', () => {
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
     * Test Case TC-UC-UDBA-001: Admin cập nhật thông tin user thành công
     * Mục tiêu: Kiểm tra việc admin cập nhật thông tin user thành công
     * Input: 
     * - mockUserId: '123'
     * - mockUpdateUserDto: { name: 'Test User', email: 'test@example.com' }
     * Expected Output: 
     * - responseHandler.ok với dữ liệu user đã cập nhật
     * Ghi chú: Kiểm tra cả việc gọi service và kết quả trả về
     */
    it('should update user successfully', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const mockUserId = '123';
      const mockUpdateUserDto = new MockUpdateUserDto() as any;
      const mockUpdatedUser = { id: mockUserId, ...mockUpdateUserDto };
      jest.mocked(mockUserService.update).mockResolvedValue(mockUpdatedUser as any as never);

      // Act: Thực hiện hành động test
      const result = await userController.updateByAdmin(mockUserId, mockUpdateUserDto);

      // Assert: Kiểm tra kết quả
      expect(mockUserService.update).toHaveBeenCalledWith(mockUserId, mockUpdateUserDto);
      expect(result).toEqual(responseHandler.ok(mockUpdatedUser));
    });
  });

  /**
   * Test Suite Con: Edge Cases
   * Mục đích: Kiểm thử các trường hợp ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test Case TC-UC-UDBA-002: Xử lý lỗi từ service
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi
     * Input:
     * - mockUserId: '123'
     * - mockUpdateUserDto: { name: 'Test User', email: 'test@example.com' }
     * - mockError: Error('Service error')
     * Expected Output:
     * - responseHandler.error với message 'Service error'
     * Ghi chú: Kiểm tra khả năng xử lý Error object
     */
    it('should handle service error gracefully', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const mockUserId = '123';
      const mockUpdateUserDto = new MockUpdateUserDto() as any;
      const mockError = new Error('Service error');
      jest.mocked(mockUserService.update).mockRejectedValue(mockError as never);

      // Act: Thực hiện hành động test
      const result = await userController.updateByAdmin(mockUserId, mockUpdateUserDto);

      // Assert: Kiểm tra kết quả
      expect(mockUserService.update).toHaveBeenCalledWith(mockUserId, mockUpdateUserDto);
      expect(result).toEqual(responseHandler.error(mockError.message));
    });

    /**
     * Test Case TC-UC-UDBA-003: Xử lý lỗi không phải Error object
     * Mục tiêu: Kiểm tra xử lý khi service trả về lỗi không phải Error object
     * Input:
     * - mockUserId: '123'
     * - mockUpdateUserDto: { name: 'Test User', email: 'test@example.com' }
     * - mockError: { message: 'Non-error object' }
     * Expected Output:
     * - responseHandler.error với message là chuỗi JSON của mockError
     * Ghi chú: Kiểm tra khả năng xử lý các loại lỗi khác nhau
     */
    it('should handle non-error object thrown by service', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const mockUserId = '123';
      const mockUpdateUserDto = new MockUpdateUserDto() as any;
      const mockError = { message: 'Non-error object' };
      jest.mocked(mockUserService.update).mockRejectedValue(mockError as never);

      // Act: Thực hiện hành động test
      const result = await userController.updateByAdmin(mockUserId, mockUpdateUserDto);

      // Assert: Kiểm tra kết quả
      expect(mockUserService.update).toHaveBeenCalledWith(mockUserId, mockUpdateUserDto);
      expect(result).toEqual(responseHandler.error(JSON.stringify(mockError)));
    });
  });
});