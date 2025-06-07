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
 * - isActive: trạng thái hoạt động của user
 */
class MockUser {
  public id: string = '1';
  public isActive: boolean = true;
}

/**
 * MockRepository
 * Mục đích: Giả lập Repository để thao tác với database
 * Phương thức:
 * - findOne: tìm một user theo điều kiện
 * - save: lưu thông tin user
 */
class MockRepository {
  public findOne = jest.fn();
  public save = jest.fn();
}

/**
 * Test Suite: UserService.remove()
 * Mục đích: Kiểm thử phương thức remove của UserService
 * Chức năng: Vô hiệu hóa (deactivate) một user trong hệ thống
 */
describe('UserService.remove() remove method', () => {
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
     * Test Case TC-SV-RM-001: Vô hiệu hóa user thành công
     * Mục tiêu: Kiểm tra việc vô hiệu hóa user hoạt động đúng
     * Input: 
     * - id: '1' (ID hợp lệ của user đang hoạt động)
     * Expected Output:
     * - User object với isActive = false
     * Ghi chú: Kiểm tra cả việc gọi repository và kết quả trả về
     */
    it('should deactivate a user when a valid ID is provided', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const mockUser = new MockUser();
      mockRepository.findOne.mockResolvedValue(mockUser as any as never);
      mockRepository.save.mockResolvedValue(mockUser as any as never);

      // Act: Thực hiện hành động test
      const result = await userService.remove('1');

      // Assert: Kiểm tra kết quả
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockRepository.save).toHaveBeenCalledWith({ ...mockUser, isActive: false });
      expect(result).toEqual(mockUser);
    });
  });

  /**
   * Test Suite Con: Edge Cases
   * Mục đích: Kiểm thử các trường hợp ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test Case TC-SV-RM-002: Vô hiệu hóa user thất bại - User không tồn tại
     * Mục tiêu: Kiểm tra xử lý khi không tìm thấy user với ID cung cấp
     * Input:
     * - id: '2' (ID không tồn tại)
     * Expected Output:
     * - Throw error với message 'USER WITH ID 2 NOT FOUND'
     * Ghi chú: Kiểm tra xử lý khi không tìm thấy dữ liệu
     */
    it('should throw an error if the user is not found', async () => {
      // Arrange: Mock repository trả về null
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert: Thực hiện test và kiểm tra kết quả
      await expect(userService.remove('2')).rejects.toThrow('USER WITH ID 2 NOT FOUND');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '2' } });
    });

    /**
     * Test Case TC-SV-RM-003: Vô hiệu hóa user thất bại - Lỗi khi lưu
     * Mục tiêu: Kiểm tra xử lý khi có lỗi trong quá trình lưu thông tin
     * Input:
     * - id: '1'
     * - save operation fails
     * Expected Output:
     * - Throw error với message 'REMOVE NOT SUCCESS!'
     * Ghi chú: Kiểm tra xử lý lỗi từ tầng repository khi lưu
     */
    it('should throw an error if saving the user fails', async () => {
      // Arrange: Mock repository trả về null khi save
      const mockUser = new MockUser();
      mockRepository.findOne.mockResolvedValue(mockUser as any as never);
      mockRepository.save.mockResolvedValue(null);

      // Act & Assert: Thực hiện test và kiểm tra kết quả
      await expect(userService.remove('1')).rejects.toThrow('REMOVE NOT SUCCESS!');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockRepository.save).toHaveBeenCalledWith({ ...mockUser, isActive: false });
    });
  });
});