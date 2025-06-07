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
 * - name: tên của user
 */
class MockUser {
  public id: string = '123';
  public name: string = 'Test User';
}

/**
 * MockRepository
 * Mục đích: Giả lập Repository để thao tác với database
 * Phương thức:
 * - findOneBy: tìm một user theo điều kiện
 */
class MockRepository {
  public findOneBy = jest.fn();
}

/**
 * Test Suite: UserService.findOne()
 * Mục đích: Kiểm thử phương thức findOne của UserService
 * Chức năng: Tìm kiếm một user theo ID
 */
describe('UserService.findOne() findOne method', () => {
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
  describe('Happy Paths', () => {
    /**
     * Test Case TC-SV-FO-001: Tìm user thành công theo ID hợp lệ
     * Mục tiêu: Kiểm tra việc tìm kiếm user theo ID hoạt động đúng
     * Input: 
     * - id: '123' (ID hợp lệ)
     * Expected Output:
     * - Đối tượng MockUser với id và name tương ứng
     * Ghi chú: Kiểm tra cả việc gọi repository và kết quả trả về
     */
    it('should return a user when a valid ID is provided', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const mockUser = new MockUser();
      jest.mocked(mockRepository.findOneBy).mockResolvedValue(mockUser as any as never);

      // Act: Thực hiện hành động test
      const result = await userService.findOne('123');

      // Assert: Kiểm tra kết quả
      expect(result).toEqual(mockUser);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '123' } as any);
    });
  });

  /**
   * Test Suite Con: Edge Cases
   * Mục đích: Kiểm thử các trường hợp ngoại lệ
   */
  describe('Edge Cases', () => {
    /**
     * Test Case TC-SV-FO-002: Tìm user thất bại - Không tìm thấy user
     * Mục tiêu: Kiểm tra xử lý khi không tìm thấy user với ID cung cấp
     * Input:
     * - id: '999' (ID không tồn tại)
     * Expected Output:
     * - Throw error với message 'USER WITH ID ${id} NOT FOUND!'
     * Ghi chú: Kiểm tra xử lý khi không tìm thấy dữ liệu
     */
    it('should throw an error when no user is found', async () => {
      // Arrange: Mock repository trả về null
      jest.mocked(mockRepository.findOneBy).mockResolvedValue(null as any as never);

      // Act & Assert: Thực hiện test và kiểm tra kết quả
      await expect(userService.findOne('999')).rejects.toThrow('USER WITH ID ${id} NOT FOUND!');
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '999' } as any);
    });

    /**
     * Test Case TC-SV-FO-003: Tìm user thất bại - Lỗi không mong muốn
     * Mục tiêu: Kiểm tra xử lý khi có lỗi phát sinh từ repository
     * Input:
     * - id: '123'
     * Expected Output:
     * - Throw error với message 'Unexpected error'
     * Ghi chú: Kiểm tra xử lý lỗi từ tầng repository
     */
    it('should handle unexpected errors gracefully', async () => {
      // Arrange: Mock repository throw error
      jest.mocked(mockRepository.findOneBy).mockRejectedValue(new Error('Unexpected error') as never);

      // Act & Assert: Thực hiện test và kiểm tra kết quả
      await expect(userService.findOne('123')).rejects.toThrow('Unexpected error');
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '123' } as any);
    });
  });
});