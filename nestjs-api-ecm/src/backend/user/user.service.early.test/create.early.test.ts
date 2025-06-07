/**
 * Mock module bcrypt
 * Mục đích: Giả lập module bcrypt để không thực sự mã hóa password trong quá trình test
 * Output: Trả về password đã hash cố định là 'hashedPassword'
 */
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword')
}));

// Import các module cần thiết
import * as bcrypt from 'bcrypt';
import { UserService } from '../user.service';

/**
 * MockCreateUserDto
 * Mục đích: Giả lập DTO cho việc tạo user mới
 * Thuộc tính:
 * - email: email mặc định của user test
 * - password: mật khẩu mặc định của user test
 */
class MockCreateUserDto {
  public email: string = 'test@example.com';
  public password: string = 'password123';
}

/**
 * MockUser
 * Mục đích: Giả lập đối tượng User được trả về từ database
 * Thuộc tính:
 * - email: email của user
 * - password: password đã được hash
 * - isActive: trạng thái kích hoạt của user
 */
class MockUser {
  public email: string = 'test@example.com';
  public password: string = 'hashedPassword';
  public isActive: boolean = false;
}

/**
 * MockRepository
 * Mục đích: Giả lập Repository để thao tác với database
 * Phương thức:
 * - findOneBy: tìm kiếm user theo điều kiện
 * - save: lưu user vào database
 */
class MockRepository {
  public findOneBy = jest.fn();
  public save = jest.fn();
}

/**
 * Test Suite: UserService.create()
 * Mục đích: Kiểm thử phương thức create của UserService
 * Chức năng: Tạo tài khoản user mới
 */
describe('UserService.create() create method', () => {
  // Khai báo các biến sử dụng trong test
  let userService: UserService;         // Service cần test
  let mockRepository: MockRepository;   // Repository giả lập
  let mockCreateUserDto: MockCreateUserDto; // DTO giả lập

  /**
   * Hook beforeEach
   * Mục đích: Khởi tạo các đối tượng mới trước mỗi test case
   * Output: Instance mới của UserService, MockRepository và MockCreateUserDto
   */
  beforeEach(() => {
    mockRepository = new MockRepository() as any;
    userService = new UserService(mockRepository as any);
    mockCreateUserDto = new MockCreateUserDto() as any;
  });

  /**
   * Test Suite Con: Happy Paths
   * Mục đích: Kiểm thử các trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * Test Case TC-SV-CR-001: Tạo user mới thành công
     * Mục tiêu: Kiểm tra việc tạo user mới khi chưa tồn tại trong hệ thống
     * Input: 
     * - mockCreateUserDto: { email: 'test@example.com', password: 'password123' }
     * Expected Output:
     * - Trả về object chứa email của user đã tạo
     * Ghi chú: Kiểm tra cả việc gọi repository và kết quả trả về
     */
    it('should create a user successfully when user does not exist', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      jest.mocked(mockRepository.findOneBy).mockResolvedValue(null as any);
      jest.mocked(mockRepository.save).mockResolvedValue(new MockUser() as any);

      // Act: Thực hiện hành động test
      const result = await userService.create(mockCreateUserDto as any);

      // Assert: Kiểm tra kết quả
      expect(result).toEqual({ email: 'test@example.com' });
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  /**
   * Test Suite Con: Edge Cases
   * Mục đích: Kiểm thử các trường hợp ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test Case TC-SV-CR-002: Tạo user thất bại - User đã tồn tại và đang active
     * Mục tiêu: Kiểm tra xử lý khi tạo user đã tồn tại và đang active
     * Input:
     * - mockCreateUserDto: { email: 'test@example.com', password: 'password123' }
     * - existingUser: { email: 'test@example.com', isActive: true }
     * Expected Output:
     * - Throw error với message 'ACCOUNT EXSIST!'
     * Ghi chú: Kiểm tra việc xử lý trùng lặp tài khoản
     */
    it('should throw an error if the user already exists and is active', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const existingUser = new MockUser();
      existingUser.isActive = true;
      jest.mocked(mockRepository.findOneBy).mockResolvedValue(existingUser as any);

      // Act & Assert: Thực hiện test và kiểm tra kết quả
      await expect(userService.create(mockCreateUserDto as any))
        .rejects.toThrow('ACCOUNT EXSIST!');
    });

    /**
     * Test Case TC-SV-CR-003: Tạo user thất bại - Lỗi lưu database
     * Mục tiêu: Kiểm tra xử lý khi không thể lưu user vào database
     * Input:
     * - mockCreateUserDto: { email: 'test@example.com', password: 'password123' }
     * Expected Output:
     * - Throw error với message 'OCCUR ERROR WHEN SAVE USER TO DB!'
     * Ghi chú: Kiểm tra việc xử lý lỗi từ database
     */
    it('should throw an error if saving the user fails', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      jest.mocked(mockRepository.findOneBy).mockResolvedValue(null as any);
      jest.mocked(mockRepository.save).mockResolvedValue(null as any);

      // Act & Assert: Thực hiện test và kiểm tra kết quả
      await expect(userService.create(mockCreateUserDto as any))
        .rejects.toThrow('OCCUR ERROR WHEN SAVE USER TO DB!');
    });
  });
});