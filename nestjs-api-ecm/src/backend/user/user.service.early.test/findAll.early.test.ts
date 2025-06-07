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
  public id: number = 1;
  public name: string = 'Test User';
}

/**
 * MockRepository
 * Mục đích: Giả lập Repository để thao tác với database
 * Phương thức:
 * - findAndCount: trả về danh sách user và tổng số lượng
 */
class MockRepository {
  public findAndCount = jest.fn().mockResolvedValue([[new MockUser() as any], 1]);
}

/**
 * Test Suite: UserService.findAll()
 * Mục đích: Kiểm thử phương thức findAll của UserService
 * Chức năng: Lấy danh sách user có phân trang
 */
describe('UserService.findAll() findAll method', () => {
  // Khai báo các biến sử dụng trong test
  let userService: UserService;         // Service cần test
  let mockRepository: MockRepository;   // Repository giả lập

  /**
   * Hook beforeEach
   * Mục đích: Khởi tạo các đối tượng mới trước mỗi test case
   * Output: Instance mới của UserService và MockRepository
   */
  beforeEach(() => {
    mockRepository = new MockRepository() as any;
    userService = new UserService(mockRepository as any);
  });

  /**
   * Test Suite Con: Happy Paths
   * Mục đích: Kiểm thử các trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * Test Case TC-SV-FA-001: Lấy danh sách user thành công
     * Mục tiêu: Kiểm tra việc lấy danh sách user với tham số phân trang hợp lệ
     * Input: 
     * - page: 1 (trang hiện tại)
     * - limit: 10 (số lượng record mỗi trang)
     * Expected Output:
     * - data: mảng chứa thông tin user
     * - total: tổng số user
     * - page: số trang hiện tại
     * - limit: số lượng record mỗi trang
     * Ghi chú: Kiểm tra cả việc gọi repository và kết quả trả về
     */
    it('should return users and total count when valid page and limit are provided', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const page = 1;
      const limit = 10;

      // Act: Thực hiện hành động test
      const result = await userService.findAll(page, limit);

      // Assert: Kiểm tra kết quả
      expect(result).toEqual({
        data: [new MockUser() as any],
        total: 1,
        page,
        limit,
      });
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: limit,
      });
    });
  });

  /**
   * Test Suite Con: Edge Cases
   * Mục đích: Kiểm thử các trường hợp ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test Case TC-SV-FA-002: Lấy danh sách user thất bại - Page không hợp lệ
     * Mục tiêu: Kiểm tra xử lý khi tham số page < 1
     * Input:
     * - page: 0 (không hợp lệ)
     * - limit: 10
     * Expected Output:
     * - Throw error với message 'Page and limit must be greater than 0.'
     * Ghi chú: Kiểm tra validate tham số page
     */
    it('should throw an error if page is less than 1', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const page = 0;
      const limit = 10;

      // Act & Assert: Thực hiện test và kiểm tra kết quả
      await expect(userService.findAll(page, limit))
        .rejects.toThrow('Page and limit must be greater than 0.');
    });

    /**
     * Test Case TC-SV-FA-003: Lấy danh sách user thất bại - Limit không hợp lệ
     * Mục tiêu: Kiểm tra xử lý khi tham số limit < 1
     * Input:
     * - page: 1
     * - limit: 0 (không hợp lệ)
     * Expected Output:
     * - Throw error với message 'Page and limit must be greater than 0.'
     * Ghi chú: Kiểm tra validate tham số limit
     */
    it('should throw an error if limit is less than 1', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const page = 1;
      const limit = 0;

      // Act & Assert: Thực hiện test và kiểm tra kết quả
      await expect(userService.findAll(page, limit))
        .rejects.toThrow('Page and limit must be greater than 0.');
    });

    /**
     * Test Case TC-SV-FA-004: Lấy danh sách user thất bại - Không tìm thấy user
     * Mục tiêu: Kiểm tra xử lý khi không có user nào trong hệ thống
     * Input:
     * - page: 1
     * - limit: 10
     * Expected Output:
     * - Throw error với message 'NO USER!'
     * Ghi chú: Kiểm tra xử lý khi database không có dữ liệu
     */
    it('should throw an error if no users are found', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      mockRepository.findAndCount = jest.fn().mockResolvedValue([null, 0]);

      // Act & Assert: Thực hiện test và kiểm tra kết quả
      await expect(userService.findAll(1, 10))
        .rejects.toThrow('NO USER!');
    });
  });
});