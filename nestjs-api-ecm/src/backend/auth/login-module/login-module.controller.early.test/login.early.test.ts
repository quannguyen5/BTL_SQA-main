/**
 * File: login.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho controller đăng nhập
 * Mục đích: Kiểm tra các chức năng của LoginModuleController
 */

import { responseHandler } from 'src/Until/responseUtil';
import { LoginModuleController } from '../login-module.controller';

/**
 * Test suite: Kiểm thử phương thức login của LoginModuleController
 * Mục tiêu: Đảm bảo chức năng đăng nhập hoạt động chính xác trong các tình huống khác nhau
 */
describe('LoginModuleController.login() login method', () => {
  // Khai báo các biến sử dụng trong các test case
  let controller: LoginModuleController; // Controller cần kiểm thử
  let mockLoginModuleService: MockLoginModuleService; // Service giả lập

  /**
   * Thiết lập trước mỗi test case
   * - Khởi tạo service giả lập mới
   * - Khởi tạo controller với service giả lập
   */
  beforeEach(() => {
    mockLoginModuleService = new MockLoginModuleService() as any;
    controller = new LoginModuleController(mockLoginModuleService as any);
  });

  /**
   * Nhóm các test case cho trường hợp thành công
   * Mục đích: Kiểm tra hành vi của controller khi các tình huống đăng nhập thành công
   */
  describe('Happy paths', () => {
    /**
     * Test case 1: Đăng nhập thành công
     * Mã test case: TC-CT-AUTH-LG-001
     * Mục tiêu: Kiểm tra controller trả về kết quả thành công khi service đăng nhập thành công
     * Input:
     *   - DTO: { username: 'testuser', password: 'testpassword' }
     * Expected output: responseHandler.ok với dữ liệu { token: 'some-token' }
     * Ghi chú: Đảm bảo controller gọi service đúng và trả về kết quả đúng định dạng
     */
    it('should return a successful response when login is successful', async () => {
      // Sắp xếp (Arrange)
      const mockLoginDTO = new MockLoginDTO() as any; // DTO đăng nhập hợp lệ
      const mockResponseData = { token: 'some-token' }; // Dữ liệu trả về giả lập
      jest.mocked(mockLoginModuleService.login).mockResolvedValue(mockResponseData as any); // Giả lập service trả về thành công

      // Thực thi (Act)
      const result = await controller.login(mockLoginDTO); // Gọi phương thức cần kiểm thử

      // Kiểm tra (Assert)
      expect(result).toEqual(responseHandler.ok(mockResponseData)); // Kết quả phải đúng với định dạng thành công
    });
  });

  /**
   * Nhóm các test case cho trường hợp ngoại lệ
   * Mục đích: Kiểm tra hành vi của controller khi xảy ra các tình huống lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test case 2: Xử lý lỗi từ service đăng nhập
     * Mã test case: TC-CT-AUTH-LG-002
     * Mục tiêu: Kiểm tra controller xử lý đúng khi service đăng nhập ném lỗi
     * Input:
     *   - DTO: { username: 'testuser', password: 'testpassword' }
     *   - Lỗi: Error('Login failed')
     * Expected output: responseHandler.error với thông báo 'Login failed'
     * Ghi chú: Đảm bảo controller bắt và xử lý lỗi đúng cách
     */
    it('should return an error response when login service throws an error', async () => {
      // Sắp xếp (Arrange)
      const mockLoginDTO = new MockLoginDTO() as any; // DTO đăng nhập
      const mockError = new Error('Login failed'); // Đối tượng lỗi
      jest.mocked(mockLoginModuleService.login).mockRejectedValue(mockError as never); // Giả lập service ném lỗi

      // Thực thi (Act)
      const result = await controller.login(mockLoginDTO); // Gọi phương thức cần kiểm thử

      // Kiểm tra (Assert)
      expect(result).toEqual(responseHandler.error(mockError.message)); // Kết quả phải là thông báo lỗi
    });

    /**
     * Test case 3: Xử lý lỗi không phải Error object
     * Mã test case: TC-CT-AUTH-LG-003
     * Mục tiêu: Kiểm tra controller xử lý đúng khi service đăng nhập ném lỗi không phải Error object
     * Input:
     *   - DTO: { username: 'testuser', password: 'testpassword' }
     *   - Lỗi: { message: 'Unexpected error' }
     * Expected output: responseHandler.error với thông báo JSON.stringify({ message: 'Unexpected error' })
     * Ghi chú: Đảm bảo controller xử lý được cả các lỗi không phải Error object
     */
    it('should handle non-error objects thrown by the login service', async () => {
      // Sắp xếp (Arrange)
      const mockLoginDTO = new MockLoginDTO() as any; // DTO đăng nhập
      const mockError = { message: 'Unexpected error' }; // Đối tượng lỗi không phải Error
      jest.mocked(mockLoginModuleService.login).mockRejectedValue(mockError as never); // Giả lập service ném lỗi

      // Thực thi (Act)
      const result = await controller.login(mockLoginDTO); // Gọi phương thức cần kiểm thử

      // Kiểm tra (Assert)
      expect(result).toEqual(responseHandler.error(JSON.stringify(mockError))); // Kết quả phải là chuỗi JSON của lỗi
    });
  });
});

/**
 * Các lớp mock để phục vụ kiểm thử
 */

/**
 * MockLoginDTO: Đối tượng giả lập dữ liệu đầu vào cho chức năng đăng nhập
 * - username: Tên đăng nhập của người dùng
 * - password: Mật khẩu của người dùng
 */
class MockLoginDTO {
  public username: string = 'testuser'; // Tên đăng nhập mẫu
  public password: string = 'testpassword'; // Mật khẩu mẫu
}

/**
 * MockLoginModuleService: Đối tượng giả lập service đăng nhập
 * - login: Phương thức giả lập chức năng đăng nhập
 */
class MockLoginModuleService {
  public login = jest.fn(); // Hàm giả lập đăng nhập
}