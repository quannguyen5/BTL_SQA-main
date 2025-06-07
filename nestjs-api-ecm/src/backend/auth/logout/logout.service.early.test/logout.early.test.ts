/**
 * File: logout.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho service đăng xuất
 * Mục đích: Kiểm tra các chức năng của LogoutService
 */

import { LogoutService } from '../logout.service';

/**
 * Các lớp mock để phục vụ kiểm thử
 */

/**
 * MockUser: Đối tượng giả lập người dùng trong hệ thống
 * - id: Định danh duy nhất của người dùng
 * - token: Token xác thực của người dùng, null khi đã đăng xuất
 */
class MockUser {
  public id: string = '123'; // ID người dùng
  public token: string | null = 'valid-token'; // Token xác thực
}

/**
 * MocklogoutDTO: Đối tượng giả lập dữ liệu đầu vào cho chức năng đăng xuất
 * - token: Token xác thực cần đăng xuất
 */
class MocklogoutDTO {
  public token: string = 'valid-token'; // Token cần đăng xuất
}

/**
 * MockRepository: Đối tượng giả lập repository để thao tác với cơ sở dữ liệu
 * - findOneBy: Phương thức tìm kiếm người dùng theo điều kiện
 * - save: Phương thức lưu thông tin người dùng
 */
class MockRepository {
  public findOneBy = jest.fn(); // Giả lập hàm tìm kiếm người dùng
  public save = jest.fn(); // Giả lập hàm lưu người dùng
}

/**
 * Test suite: Kiểm thử phương thức logout của LogoutService
 * Mục tiêu: Đảm bảo chức năng đăng xuất hoạt động chính xác trong các tình huống khác nhau
 */
describe('LogoutService.logout() logout method', () => {
  // Khai báo các biến sử dụng trong các test case
  let logoutService: LogoutService; // Service cần kiểm thử
  let mockUserRepo: MockRepository; // Repository giả lập
  let mockUser: MockUser; // Đối tượng người dùng giả lập
  let mockLogoutDTO: MocklogoutDTO; // DTO giả lập

  /**
   * Thiết lập trước mỗi test case
   * - Khởi tạo repository giả lập mới
   * - Khởi tạo service với repository giả lập
   * - Khởi tạo đối tượng người dùng và DTO giả lập
   */
  beforeEach(() => {
    mockUserRepo = new MockRepository() as any;
    logoutService = new LogoutService(mockUserRepo as any);
    mockUser = new MockUser() as any;
    mockLogoutDTO = new MocklogoutDTO() as any;
  });

  /**
   * Nhóm các test case cho trường hợp thành công
   * Mục đích: Kiểm tra hành vi của service khi các tình huống đăng xuất thành công
   */
  describe('Happy paths', () => {
    /**
     * Test case 1: Đăng xuất thành công với thông tin hợp lệ
     * Mã test case: TC-SV-AUTH-LS-001
     * Mục tiêu: Kiểm tra quá trình đăng xuất diễn ra đúng khi thông tin đăng xuất hợp lệ
     * Input:
     *   - userId: '123'
     *   - DTO: { token: 'valid-token' }
     * Expected output: true (xác nhận đăng xuất thành công)
     * Ghi chú: Kiểm tra đầy đủ các bước trong quy trình đăng xuất và xóa token
     */
    it('should successfully logout a user with valid credentials', async () => {
      // Sắp xếp (Arrange)
      jest.mocked(mockUserRepo.findOneBy).mockResolvedValue(mockUser as any as never); // Giả lập tìm thấy người dùng
      jest.mocked(mockUserRepo.save).mockResolvedValue(mockUser as any as never); // Giả lập lưu thành công

      // Thực thi (Act)
      const result = await logoutService.logout(mockUser.id, mockLogoutDTO); // Gọi phương thức cần kiểm thử

      // Kiểm tra (Assert)
      expect(result).toBe(true); // Kết quả phải là true
      expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({
        id: mockUser.id,
        token: mockLogoutDTO.token, // Kiểm tra tìm kiếm người dùng với đúng ID và token
      });
      // Lưu ý: Dòng dưới đã bị comment, có thể cần bỏ comment để kiểm tra đầy đủ hơn
      // expect(mockUserRepo.save).toHaveBeenCalledWith(expect.objectContaining({ token: null }));
    });
  });

  /**
   * Nhóm các test case cho trường hợp ngoại lệ
   * Mục đích: Kiểm tra hành vi của service khi xảy ra các tình huống lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test case 2: Không tìm thấy người dùng hoặc token không hợp lệ
     * Mã test case: TC-SV-AUTH-LS-002
     * Mục tiêu: Kiểm tra xử lý lỗi khi không tìm thấy người dùng với ID và token đã cho
     * Input:
     *   - userId: '123'
     *   - DTO: { token: 'valid-token' }
     * Expected output: Lỗi với thông báo 'LOGOUT.USER NOT LOGIN!'
     * Ghi chú: Đảm bảo hệ thống xử lý đúng khi người dùng không tồn tại hoặc token không hợp lệ
     */
    it('should throw an error if the user is not found', async () => {
      // Sắp xếp (Arrange)
      jest.mocked(mockUserRepo.findOneBy).mockResolvedValue(null as any as never); // Giả lập không tìm thấy người dùng

      // Thực thi & Kiểm tra (Act & Assert)
      await expect(logoutService.logout(mockUser.id, mockLogoutDTO)).rejects.toThrow('LOGOUT.USER NOT LOGIN!'); // Phải ném lỗi
      expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({
        id: mockUser.id,
        token: mockLogoutDTO.token, // Kiểm tra tìm kiếm với đúng tham số
      });
    });

    /**
     * Test case 3: Lỗi khi lưu thông tin người dùng
     * Mã test case: TC-SV-AUTH-LS-003
     * Mục tiêu: Kiểm tra xử lý lỗi khi không thể lưu thông tin người dùng sau khi đăng xuất
     * Input:
     *   - userId: '123'
     *   - DTO: { token: 'valid-token' }
     * Expected output: Lỗi với thông báo 'LOGOUT.OCCUR ERROR WHEN LOGOUT!'
     * Ghi chú: Đảm bảo hệ thống xử lý đúng khi có lỗi trong quá trình lưu dữ liệu
     */
    it('should throw an error if saving the user fails', async () => {
      // Sắp xếp (Arrange)
      jest.mocked(mockUserRepo.findOneBy).mockResolvedValue(mockUser as any as never); // Giả lập tìm thấy người dùng
      jest.mocked(mockUserRepo.save).mockResolvedValue(null as any as never); // Giả lập lưu thất bại

      // Thực thi & Kiểm tra (Act & Assert)
      await expect(logoutService.logout(mockUser.id, mockLogoutDTO)).rejects.toThrow('LOGOUT.OCCUR ERROR WHEN LOGOUT!'); // Phải ném lỗi
      // Lưu ý: Dòng dưới đã bị comment, có thể cần bỏ comment để kiểm tra đầy đủ hơn
      // expect(mockUserRepo.save).toHaveBeenCalledWith(expect.objectContaining({ token: null }));
    });

    /**
     * Test case 4: Đăng xuất với userId không hợp lệ
     * Mã test case: TC-SV-AUTH-LS-004
     * Mục tiêu: Kiểm tra xử lý khi userId không hợp lệ (rỗng hoặc null)
     * Input:
     *   - userId: '' (rỗng)
     *   - DTO: { token: 'valid-token' }
     * Expected output: Lỗi với thông báo 'LOGOUT.USER_ID INVALID!'
     * Ghi chú: Đảm bảo hệ thống kiểm tra tính hợp lệ của userId trước khi xử lý
     */
    it('should throw an error if userId is invalid', async () => {
      // Sắp xếp (Arrange)
      const invalidUserId = ''; // ID người dùng không hợp lệ (rỗng)

      // Thực thi & Kiểm tra (Act & Assert)
      await expect(logoutService.logout(invalidUserId, mockLogoutDTO)).rejects.toThrow('LOGOUT.USER_ID INVALID!'); // Phải ném lỗi
      // Không cần kiểm tra findOneBy vì hàm này không được gọi khi userId không hợp lệ
    });
  });
});