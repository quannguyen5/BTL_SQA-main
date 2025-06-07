/**
 * Import các module cần thiết
 * UserService: Service chứa các phương thức xử lý logic cho User
 */
import { UserService } from '../user.service';

/**
 * MockUser
 * Mục đích: Tạo đối tượng User mẫu cho việc test
 * Thuộc tính:
 * - id: định danh của user
 * - name: tên người dùng
 * - email: địa chỉ email
 */
class MockUser {
  id: string = '1';
  name: string = 'John Doe';
  email: string = 'john.doe@example.com';
}

/**
 * MockUpdateUserDto
 * Mục đích: Tạo đối tượng DTO mẫu cho việc cập nhật thông tin user
 * Thuộc tính:
 * - name: tên mới của user (tùy chọn)
 * - email: email mới của user (tùy chọn)
 */
class MockUpdateUserDto {
  name?: string = 'Jane Doe';
  email?: string = 'jane.doe@example.com';
}

/**
 * MockRepository
 * Mục đích: Giả lập Repository để thao tác với database
 * Phương thức:
 * - findOne: tìm một user theo điều kiện
 * - save: lưu thông tin user
 */
class MockRepository {
  findOne = jest.fn();
  save = jest.fn();
}

/**
 * Test Suite: UserService.update()
 * Mục đích: Kiểm thử phương thức update của UserService
 * Chức năng: Cập nhật thông tin của một user trong hệ thống
 */
describe('UserService.update() update method', () => {
  // Khai báo các biến sử dụng trong test
  let userService: UserService;         // Service cần test
  let mockRepository: MockRepository;   // Repository giả lập

  /**
   * Hook beforeEach
   * Mục đích: Khởi tạo các đối tượng mới trước mỗi test case
   * Output: Instance mới của UserService và MockRepository
   */
  beforeEach(() => {
    mockRepository = new MockRepository();
    userService = new UserService(mockRepository as any);
  });

  /**
   * Test Suite Con: Happy Paths
   * Mục đích: Kiểm thử các trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * Test Case TC-SV-UD-001: Cập nhật thông tin user thành công
     * Mục tiêu: Kiểm tra việc cập nhật thông tin user hoạt động đúng
     * Input: 
     * - id: '1' (ID hợp lệ)
     * - updateUserDto: {name: 'Jane Doe', email: 'jane.doe@example.com'}
     * Expected Output:
     * - User object với thông tin đã được cập nhật
     * Ghi chú: Kiểm tra cả việc gọi repository và kết quả trả về
     */
    it('should update a user successfully', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const mockUser = new MockUser();
      const mockUpdateUserDto = new MockUpdateUserDto();
      jest.mocked(mockRepository.findOne).mockResolvedValue(mockUser as any);
      jest.mocked(mockRepository.save).mockResolvedValue(mockUser as any);

      // Act: Thực hiện hành động test
      const result = await userService.update(mockUser.id, mockUpdateUserDto as any);

      // Assert: Kiểm tra kết quả
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUser.id } });
      expect(result).toEqual(mockUser);
    });
  });

  /**
   * Test Suite Con: Edge Cases
   * Mục đích: Kiểm thử các trường hợp ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test Case TC-SV-UD-002: Cập nhật thất bại - User không tồn tại
     * Mục tiêu: Kiểm tra xử lý khi không tìm thấy user với ID cung cấp
     * Input:
     * - id: 'non-existent-id' (ID không tồn tại)
     * - updateUserDto: {name: 'Jane Doe', email: 'jane.doe@example.com'}
     * Expected Output:
     * - Throw error với message 'USER WITH ID non-existent-id NOT FOUND!'
     * Ghi chú: Kiểm tra xử lý khi không tìm thấy dữ liệu
     */
    it('should throw an error if user is not found', async () => {
      // Arrange: Mock repository trả về null
      const mockUpdateUserDto = new MockUpdateUserDto();
      jest.mocked(mockRepository.findOne).mockResolvedValue(null);

      // Act & Assert: Thực hiện test và kiểm tra kết quả
      await expect(userService.update('non-existent-id', mockUpdateUserDto as any))
        .rejects
        .toThrow('USER WITH ID non-existent-id NOT FOUND!');
    });

    /**
     * Test Case TC-SV-UD-003: Cập nhật thất bại - Lỗi khi lưu
     * Mục tiêu: Kiểm tra xử lý khi có lỗi trong quá trình lưu thông tin
     * Input:
     * - id: '1'
     * - updateUserDto: {name: 'Jane Doe', email: 'jane.doe@example.com'}
     * Expected Output:
     * - Throw error với message 'UPDATE NOT SUCCESS!'
     * Ghi chú: Kiểm tra xử lý lỗi từ tầng repository khi lưu
     */
    it('should throw an error if update is not successful', async () => {
      // Arrange: Mock repository trả về null khi save
      const mockUser = new MockUser();
      const mockUpdateUserDto = new MockUpdateUserDto();
      jest.mocked(mockRepository.findOne).mockResolvedValue(mockUser as any);
      jest.mocked(mockRepository.save).mockResolvedValue(null);

      // Act & Assert: Thực hiện test và kiểm tra kết quả
      await expect(userService.update(mockUser.id, mockUpdateUserDto as any))
        .rejects
        .toThrow('UPDATE NOT SUCCESS!');
    });
  });
});