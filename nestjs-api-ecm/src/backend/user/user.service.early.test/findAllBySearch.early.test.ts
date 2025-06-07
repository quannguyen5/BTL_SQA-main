/**
 * Import các module cần thiết
 * Like: Operator của TypeORM để tìm kiếm theo pattern
 * UserService: Service chứa các phương thức xử lý logic cho User
 */
import { Like } from 'typeorm';
import { UserService } from '../user.service';

/**
 * MockUser
 * Mục đích: Tạo đối tượng User mẫu cho việc test
 * Thuộc tính:
 * - id: định danh của user
 * - lastName: họ của user
 * - email: địa chỉ email
 * - phone: số điện thoại
 * - role: vai trò người dùng
 * - isActive: trạng thái hoạt động
 */
class MockUser {
  public id: number = 1;
  public lastName: string = 'Doe';
  public email: string = 'johndoe@example.com';
  public phone: string = '1234567890';
  public role: string = 'user';
  public isActive: boolean = true;
}

/**
 * MockRepository
 * Mục đích: Giả lập Repository để thao tác với database
 * Phương thức:
 * - findAndCount: trả về danh sách user và tổng số lượng
 */
class MockRepository {
  public findAndCount = jest.fn().mockResolvedValue([[new MockUser()], 1] as any);
}

/**
 * Test Suite: UserService.findAllBySearch()
 * Mục đích: Kiểm thử phương thức findAllBySearch của UserService
 * Chức năng: Tìm kiếm và lấy danh sách user theo điều kiện lọc có phân trang
 */
describe('UserService.findAllBySearch() findAllBySearch method', () => {
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
     * Test Case TC-SV-FABS-001: Tìm kiếm user với phân trang thành công
     * Mục tiêu: Kiểm tra việc tìm kiếm và phân trang hoạt động đúng
     * Input: 
     * - page: 1 (trang hiện tại)
     * - limit: 10 (số lượng record mỗi trang)
     * - filters: {} (không có điều kiện lọc)
     * Expected Output:
     * - data: mảng chứa thông tin user
     * - total: tổng số user
     * - page: số trang hiện tại
     * - limit: số lượng record mỗi trang
     * Ghi chú: Kiểm tra cả việc gọi repository và kết quả trả về
     */
    it('should return users with pagination', async () => {
      // Act: Thực hiện hành động test
      const result = await userService.findAllBySearch(1, 10, {});

      // Assert: Kiểm tra kết quả
      expect(result).toEqual({
        data: [new MockUser()],
        total: 1,
        page: 1,
        limit: 10,
      });
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
      });
    });

    /**
     * Test Case TC-SV-FABS-002: Tìm kiếm user với điều kiện lọc
     * Mục tiêu: Kiểm tra việc áp dụng các điều kiện lọc hoạt động đúng
     * Input:
     * - page: 1
     * - limit: 10
     * - filters: {lastName: 'Doe', email: 'johndoe@example.com'}
     * Expected Output: Repository được gọi với điều kiện Like cho các trường lọc
     * Ghi chú: Kiểm tra việc chuyển đổi filter thành điều kiện Like
     */
    it('should apply filters correctly', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const filters = { lastName: 'Doe', email: 'johndoe@example.com' };

      // Act: Thực hiện hành động test
      await userService.findAllBySearch(1, 10, filters);

      // Assert: Kiểm tra kết quả
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          lastName: Like('%Doe%'),
          email: Like('%johndoe@example.com%'),
        },
        skip: 0,
        take: 10,
      });
    });
  });

  /**
   * Test Suite Con: Edge Cases
   * Mục đích: Kiểm thử các trường hợp ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test Case TC-SV-FABS-003: Tìm kiếm thất bại - Page không hợp lệ
     * Mục tiêu: Kiểm tra xử lý khi tham số page < 1
     * Input:
     * - page: 0 (không hợp lệ)
     * - limit: 10
     * - filters: {}
     * Expected Output:
     * - Throw error với message 'Page and limit must be greater than 0.'
     * Ghi chú: Kiểm tra validate tham số page
     */
    it('should throw an error if page is less than 1', async () => {
      await expect(userService.findAllBySearch(0, 10, {}))
        .rejects.toThrow('Page and limit must be greater than 0.');
    });

    /**
     * Test Case TC-SV-FABS-004: Tìm kiếm thất bại - Limit không hợp lệ
     * Mục tiêu: Kiểm tra xử lý khi tham số limit < 1
     * Input:
     * - page: 1
     * - limit: 0 (không hợp lệ)
     * - filters: {}
     * Expected Output:
     * - Throw error với message 'Page and limit must be greater than 0.'
     * Ghi chú: Kiểm tra validate tham số limit
     */
    it('should throw an error if limit is less than 1', async () => {
      await expect(userService.findAllBySearch(1, 0, {}))
        .rejects.toThrow('Page and limit must be greater than 0.');
    });

    /**
     * Test Case TC-SV-FABS-005: Tìm kiếm thất bại - Không tìm thấy user
     * Mục tiêu: Kiểm tra xử lý khi không có user nào thỏa mãn điều kiện
     * Input:
     * - page: 1
     * - limit: 10
     * - filters: {}
     * Expected Output:
     * - Throw error với message 'NO USER!'
     * Ghi chú: Kiểm tra xử lý khi không có dữ liệu phù hợp
     */
    it('should throw an error if no users are found', async () => {
      // Arrange: Mock repository trả về mảng rỗng
      mockRepository.findAndCount.mockResolvedValue([[], 0] as any);

      // Act & Assert: Thực hiện test và kiểm tra kết quả
      await expect(userService.findAllBySearch(1, 10, {}))
        .rejects.toThrow('NO USER!');
    });
  });
});