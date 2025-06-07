// Import các module cần thiết
import { responseHandler } from 'src/Until/responseUtil';
import { UserController } from '../user.controller';

/**
 * Mock Classes
 * Mục đích: Tạo các lớp giả lập để phục vụ việc test
 */

/**
 * MockCreateUserDto
 * Mục đích: Giả lập DTO cho việc tạo user mới
 * Các thuộc tính:
 * - name: tên người dùng
 * - email: địa chỉ email
 * - password: mật khẩu
 */
class MockCreateUserDto {
  public name: string = 'Test User';
  public email: string = 'test@example.com';
  public password: string = 'password123';
}

/**
 * MockUserService
 * Mục đích: Giả lập UserService với phương thức create
 * Phương thức:
 * - create: phương thức jest.fn() để giả lập việc tạo user
 */
class MockUserService {
  create = jest.fn();
}

/**
 * Test Suite: UserController.create()
 * Mục đích: Kiểm thử phương thức create của UserController
 */
describe('UserController.create() create method', () => {
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
   * Test Suite Con: Happy paths
   * Mục đích: Kiểm thử các trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * Test Case TC-UC-CR-001: Tạo user thành công
     * Mục tiêu: Kiểm tra việc tạo user mới thành công
     * Input: MockCreateUserDto với dữ liệu hợp lệ
     * Expected Output: responseHandler.ok với thông tin user đã tạo
     * Ghi chú: Kiểm tra cả việc gọi service và kết quả trả về
     */
    it('should create a user successfully', () => {
      // Arrange: Chuẩn bị dữ liệu test
      const mockCreateUserDto = new MockCreateUserDto() as any;
      const mockUser = { id: 1, ...mockCreateUserDto };
      jest.mocked(mockUserService.create).mockReturnValue(mockUser as any);

      // Act: Thực hiện hành động test
      const result = userController.create(mockCreateUserDto);

      // Assert: Kiểm tra kết quả
      expect(mockUserService.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(result).toEqual(responseHandler.ok(mockUser));
    });
  });

  /**
   * Test Suite Con: Edge cases
   * Mục đích: Kiểm thử các trường hợp ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test Case TC-UC-CR-002: Xử lý lỗi từ service
     * Mục tiêu: Kiểm tra xử lý khi service throw Error
     * Input: MockCreateUserDto và service ném ra lỗi
     * Expected Output: responseHandler.error với message lỗi
     * Ghi chú: Kiểm tra khả năng xử lý lỗi của controller
     */
    it('should handle service errors gracefully', () => {
      // Arrange
      const mockCreateUserDto = new MockCreateUserDto() as any;
      const errorMessage = 'Service error';
      jest.mocked(mockUserService.create).mockImplementation(() => {
        throw new Error(errorMessage);
      });

      // Act
      const result = userController.create(mockCreateUserDto);

      // Assert
      expect(mockUserService.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    /**
     * Test Case TC-UC-CR-003: Xử lý ngoại lệ không phải Error
     * Mục tiêu: Kiểm tra xử lý khi service throw object không phải Error
     * Input: MockCreateUserDto và service ném ra object
     * Expected Output: responseHandler.error với message được stringify
     * Ghi chú: Kiểm tra khả năng xử lý các loại exception khác nhau
     */
    it('should handle non-error exceptions gracefully', () => {
      // Arrange
      const mockCreateUserDto = new MockCreateUserDto() as any;
      const errorObject = { message: 'Unexpected error' };
      jest.mocked(mockUserService.create).mockImplementation(() => {
        throw errorObject;
      });

      // Act
      const result = userController.create(mockCreateUserDto);

      // Assert
      expect(mockUserService.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});