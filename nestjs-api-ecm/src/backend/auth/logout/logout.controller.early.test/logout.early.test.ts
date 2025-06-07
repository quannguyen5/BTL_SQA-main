/**
 * File: logout.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho controller đăng xuất
 * Mục đích: Kiểm tra các chức năng của LogoutController
 */

import { responseHandler } from 'src/Until/responseUtil';
import { LogoutController } from '../logout.controller';

/**
 * Các lớp mock để phục vụ kiểm thử
 */

/**
 * MockLogoutService: Đối tượng giả lập service đăng xuất
 * - logout: Phương thức giả lập chức năng đăng xuất
 */
class MockLogoutService {
  public logout = jest.fn(); // Hàm giả lập đăng xuất
}

/**
 * MocklogoutDTO: Đối tượng giả lập dữ liệu đầu vào cho chức năng đăng xuất
 * - someProperty: Thuộc tính mẫu cho DTO
 */
class MocklogoutDTO {
  public someProperty: string = 'someValue'; // Thuộc tính mẫu
}

/**
 * Test suite: Kiểm thử phương thức logout của LogoutController
 * Mục tiêu: Đảm bảo chức năng đăng xuất hoạt động chính xác trong các tình huống khác nhau
 */
describe('LogoutController.logout() logout method', () => {
  // Khai báo các biến sử dụng trong các test case
  let logoutController: LogoutController; // Controller cần kiểm thử
  let mockLogoutService: MockLogoutService; // Service giả lập
  let mockLogoutDTO: MocklogoutDTO; // DTO giả lập

  /**
   * Thiết lập trước mỗi test case
   * - Khởi tạo service giả lập mới
   * - Khởi tạo DTO giả lập
   * - Khởi tạo controller với service giả lập
   */
  beforeEach(() => {
    mockLogoutService = new MockLogoutService() as any;
    mockLogoutDTO = new MocklogoutDTO() as any;
    logoutController = new LogoutController(mockLogoutService as any);
  });

  /**
   * Nhóm các test case cho trường hợp thành công
   * Mục đích: Kiểm tra hành vi của controller khi các tình huống đăng xuất thành công
   */
  describe('Happy paths', () => {
    /**
     * Test case 1: Đăng xuất thành công
     * Mã test case: TC-CT-AUTH-LO-001
     * Mục tiêu: Kiểm tra controller trả về kết quả thành công khi service đăng xuất thành công
     * Input:
     *   - userId: '123'
     *   - DTO: { someProperty: 'someValue' }
     * Expected output: responseHandler.ok(true)
     * Ghi chú: Đảm bảo controller gọi service đúng và trả về kết quả đúng định dạng
     */
    it('should successfully logout a user', async () => {
      // Sắp xếp (Arrange)
      const userId = '123'; // ID người dùng hợp lệ
      jest.mocked(mockLogoutService.logout).mockResolvedValue(true as any as never); // Giả lập service trả về thành công

      // Thực thi (Act)
      const result = await logoutController.logout(userId, mockLogoutDTO as any); // Gọi phương thức cần kiểm thử

      // Kiểm tra (Assert)
      expect(mockLogoutService.logout).toHaveBeenCalledWith(userId, mockLogoutDTO); // Kiểm tra service được gọi với đúng tham số
      expect(result).toEqual(responseHandler.ok(true)); // Kết quả phải đúng với định dạng thành công
    });
  });

  /**
   * Nhóm các test case cho trường hợp ngoại lệ
   * Mục đích: Kiểm tra hành vi của controller khi xảy ra các tình huống lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test case 2: Xử lý lỗi từ service đăng xuất
     * Mã test case: TC-CT-AUTH-LO-002
     * Mục tiêu: Kiểm tra controller xử lý đúng khi service đăng xuất ném lỗi
     * Input:
     *   - userId: '123'
     *   - DTO: { someProperty: 'someValue' }
     *   - Lỗi: Error('Service error')
     * Expected output: responseHandler.error('Service error')
     * Ghi chú: Đảm bảo controller bắt và xử lý lỗi đúng cách
     */
    it('should handle service throwing an error', async () => {
      // Sắp xếp (Arrange)
      const userId = '123'; // ID người dùng
      const errorMessage = 'Service error'; // Thông báo lỗi
      jest.mocked(mockLogoutService.logout).mockRejectedValue(new Error(errorMessage) as never); // Giả lập service ném lỗi

      // Thực thi (Act)
      const result = await logoutController.logout(userId, mockLogoutDTO as any); // Gọi phương thức cần kiểm thử

      // Kiểm tra (Assert)
      expect(mockLogoutService.logout).toHaveBeenCalledWith(userId, mockLogoutDTO); // Kiểm tra service được gọi với đúng tham số
      expect(result).toEqual(responseHandler.error(errorMessage)); // Kết quả phải là thông báo lỗi
    });

    /**
     * Test case 3: Xử lý lỗi không phải Error object
     * Mã test case: TC-CT-AUTH-LO-003
     * Mục tiêu: Kiểm tra controller xử lý đúng khi service đăng xuất ném lỗi không phải Error object
     * Input:
     *   - userId: '123'
     *   - DTO: { someProperty: 'someValue' }
     *   - Lỗi: { message: 'Non-error object' }
     * Expected output: responseHandler.error(JSON.stringify({ message: 'Non-error object' }))
     * Ghi chú: Đảm bảo controller xử lý được cả các lỗi không phải Error object
     */
    it('should handle non-error object thrown by service', async () => {
      // Sắp xếp (Arrange)
      const userId = '123'; // ID người dùng
      const errorObject = { message: 'Non-error object' }; // Đối tượng lỗi không phải Error
      jest.mocked(mockLogoutService.logout).mockRejectedValue(errorObject as never); // Giả lập service ném lỗi

      // Thực thi (Act)
      const result = await logoutController.logout(userId, mockLogoutDTO as any); // Gọi phương thức cần kiểm thử

      // Kiểm tra (Assert)
      expect(mockLogoutService.logout).toHaveBeenCalledWith(userId, mockLogoutDTO); // Kiểm tra service được gọi với đúng tham số
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject))); // Kết quả phải là chuỗi JSON của lỗi
    });

    /**
     * Test case 4: Xử lý khi userId không hợp lệ
     * Mã test case: TC-CT-AUTH-LO-004
     * Mục tiêu: Kiểm tra controller xử lý đúng khi userId không hợp lệ
     * Input:
     *   - userId: '' (rỗng)
     *   - DTO: { someProperty: 'someValue' }
     * Expected output: responseHandler.error('USER_ID_INVALID')
     * Ghi chú: Đảm bảo controller kiểm tra tính hợp lệ của userId trước khi gọi service
     */
    it('should handle invalid userId', async () => {
      // Sắp xếp (Arrange)
      const userId = ''; // ID người dùng không hợp lệ (rỗng)
      const errorMessage = 'USER_ID_INVALID'; // Thông báo lỗi
      jest.mocked(mockLogoutService.logout).mockRejectedValue(new Error(errorMessage) as never); // Giả lập service ném lỗi

      // Thực thi (Act)
      const result = await logoutController.logout(userId, mockLogoutDTO as any); // Gọi phương thức cần kiểm thử

      // Kiểm tra (Assert)
      expect(mockLogoutService.logout).toHaveBeenCalledWith(userId, mockLogoutDTO); // Kiểm tra service được gọi với đúng tham số
      expect(result).toEqual(responseHandler.error(errorMessage)); // Kết quả phải là thông báo lỗi
    });
  });
});