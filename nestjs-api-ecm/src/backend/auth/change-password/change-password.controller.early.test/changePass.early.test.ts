/**
 * @file changePass.early.test.ts
 * @description File kiểm thử cho controller đổi mật khẩu
 * @module auth/change-password
 */

import { responseHandler } from 'src/Until/responseUtil';
import { ChangePasswordController } from '../change-password.controller';


/**
 * @class MockchangePassDTO
 * @description Lớp giả lập DTO cho chức năng đổi mật khẩu
 * Chứa dữ liệu mẫu cho việc kiểm thử
 */
class MockchangePassDTO {
  public password: string = 'oldPassword123'; // Mật khẩu cũ mẫu
  public newPassword: string = 'newPassword123'; // Mật khẩu mới mẫu
  public newPasswordCf: string = 'newPassword123'; // Xác nhận mật khẩu mới
}

/**
 * @class MockChangePasswordService
 * @description Lớp giả lập service đổi mật khẩu
 * Chứa các hàm giả lập để kiểm thử controller mà không phụ thuộc vào service thật
 */
class MockChangePasswordService {
  changePassword = jest.fn(); // Hàm giả lập cho phương thức đổi mật khẩu
}

/**
 * @description Bộ kiểm thử cho phương thức changePass của ChangePasswordController
 */
describe('ChangePasswordController.changePass() changePass method', () => {
  let controller: ChangePasswordController; // Đối tượng controller cần kiểm thử
  let mockChangePasswordService: MockChangePasswordService; // Service giả lập

  /**
   * @description Thiết lập môi trường kiểm thử trước mỗi test case
   * Khởi tạo service giả và controller với service giả
   */
  beforeEach(() => {
    mockChangePasswordService = new MockChangePasswordService();
    controller = new ChangePasswordController(mockChangePasswordService as any);
  });

  /**
   * @description Nhóm các test case cho trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * @testcase TC-CT-AUTH-CP-001
     * @description Kiểm tra đổi mật khẩu thành công
     * @input userId='user123', mockDTO với password='oldPassword123', newPassword='newPassword123'
     * @expected Service được gọi với đúng tham số và trả về kết quả thành công (true)
     * @note Đây là trường hợp lý tưởng khi người dùng cung cấp đúng thông tin và quá trình đổi mật khẩu diễn ra suôn sẻ
     */
    it('should successfully change the password', async () => {
      // Arrange - Chuẩn bị dữ liệu đầu vào
      const userId = 'user123'; // ID người dùng hợp lệ
      const mockDTO = new MockchangePassDTO(); // DTO hợp lệ
      jest.mocked(mockChangePasswordService.changePassword).mockResolvedValue(true as any as never); // Giả lập service trả về true

      // Act - Thực hiện hành động cần kiểm thử
      const result = await controller.changePass(userId, mockDTO as any);

      // Assert - Kiểm tra kết quả
      expect(mockChangePasswordService.changePassword).toHaveBeenCalledWith(userId, mockDTO); // Kiểm tra service được gọi với đúng tham số
      expect(result).toEqual(responseHandler.ok(true)); // Kiểm tra kết quả trả về là thành công
    });
  });

  /**
   * @description Nhóm các test case cho trường hợp ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * @testcase TC-CT-AUTH-CP-002
     * @description Kiểm tra xử lý khi service gặp lỗi
     * @input userId='user123', mockDTO hợp lệ
     * @expected Trả về thông báo lỗi từ service
     * @note Test case này kiểm tra khả năng xử lý lỗi của controller khi service bên dưới gặp vấn đề. Đảm bảo rằng controller có thể bắt và xử lý lỗi một cách phù hợp
     */
    it('should handle service throwing an error', async () => {
      // Arrange - Chuẩn bị dữ liệu đầu vào
      const userId = 'user123'; // ID người dùng hợp lệ
      const mockDTO = new MockchangePassDTO(); // DTO hợp lệ
      const errorMessage = 'Service error'; // Thông báo lỗi mẫu
      jest.mocked(mockChangePasswordService.changePassword).mockRejectedValue(new Error(errorMessage) as never); // Giả lập service ném lỗi

      // Act - Thực hiện hành động cần kiểm thử
      const result = await controller.changePass(userId, mockDTO as any);

      // Assert - Kiểm tra kết quả
      expect(mockChangePasswordService.changePassword).toHaveBeenCalledWith(userId, mockDTO); // Kiểm tra service được gọi với đúng tham số
      expect(result).toEqual(responseHandler.error(errorMessage)); // Kiểm tra kết quả trả về là lỗi với đúng thông báo
    });

    /**
     * @testcase TC-CT-AUTH-CP-003
     * @description Kiểm tra xử lý khi ID người dùng không hợp lệ
     * @input userId='', mockDTO hợp lệ
     * @expected Trả về kết quả thất bại (false)
     * @note Test case này kiểm tra việc xử lý khi người dùng gửi yêu cầu với ID rỗng. Đây là trường hợp đầu vào không hợp lệ và hệ thống cần trả về thất bại thay vì gặp lỗi
     */
    it('should handle invalid user_id', async () => {
      // Arrange - Chuẩn bị dữ liệu đầu vào
      const userId = ''; // ID người dùng rỗng (không hợp lệ)
      const mockDTO = new MockchangePassDTO(); // DTO hợp lệ
      jest.mocked(mockChangePasswordService.changePassword).mockResolvedValue(false as any as never); // Giả lập service trả về false

      // Act - Thực hiện hành động cần kiểm thử
      const result = await controller.changePass(userId, mockDTO as any);

      // Assert - Kiểm tra kết quả
      expect(mockChangePasswordService.changePassword).toHaveBeenCalledWith(userId, mockDTO); // Kiểm tra service được gọi với đúng tham số
      expect(result).toEqual(responseHandler.ok(false)); // Kiểm tra kết quả trả về là thất bại
    });

    /**
     * @testcase TC-CT-AUTH-CP-004
     * @description Kiểm tra xử lý khi DTO không hợp lệ
     * @input userId='user123', mockDTO rỗng
     * @expected Trả về kết quả thất bại (false)
     * @note Test case này kiểm tra việc xử lý khi dữ liệu đầu vào (DTO) không hợp lệ hoặc thiếu thông tin. Đảm bảo rằng controller có thể xử lý được các trường hợp dữ liệu không đầy đủ mà không gây ra lỗi hệ thống
     */
    it('should handle invalid DTO', async () => {
      // Arrange - Chuẩn bị dữ liệu đầu vào
      const userId = 'user123'; // ID người dùng hợp lệ
      const mockDTO = {} as MockchangePassDTO; // DTO không hợp lệ (rỗng)
      jest.mocked(mockChangePasswordService.changePassword).mockResolvedValue(false as any as never); // Giả lập service trả về false

      // Act - Thực hiện hành động cần kiểm thử
      const result = await controller.changePass(userId, mockDTO as any);

      // Assert - Kiểm tra kết quả
      expect(mockChangePasswordService.changePassword).toHaveBeenCalledWith(userId, mockDTO); // Kiểm tra service được gọi với đúng tham số
      expect(result).toEqual(responseHandler.ok(false)); // Kiểm tra kết quả trả về là thất bại
    });

    /**
     * @testcase TC-CT-AUTH-CP-005
     * @description Kiểm tra xử lý khi service trả về null
     * @input userId='user123', mockDTO hợp lệ
     * @expected Trả về kết quả thành công với giá trị null
     * @note Test case này kiểm tra việc xử lý khi service trả về null, đảm bảo controller xử lý đúng các giá trị không phải boolean
     */
    it('should handle service returning null', async () => {
      // Arrange - Chuẩn bị dữ liệu đầu vào
      const userId = 'user123'; // ID người dùng hợp lệ
      const mockDTO = new MockchangePassDTO(); // DTO hợp lệ
      jest.mocked(mockChangePasswordService.changePassword).mockResolvedValue(null as any as never); // Giả lập service trả về null

      // Act - Thực hiện hành động cần kiểm thử
      const result = await controller.changePass(userId, mockDTO as any);

      // Assert - Kiểm tra kết quả
      expect(mockChangePasswordService.changePassword).toHaveBeenCalledWith(userId, mockDTO); // Kiểm tra service được gọi với đúng tham số
      expect(result).toEqual(responseHandler.ok(null)); // Kiểm tra kết quả trả về là thành công với giá trị null
    });

    /**
     * @testcase TC-CT-AUTH-CP-006
     * @description Kiểm tra xử lý khi service trả về đối tượng phức tạp
     * @input userId='user123', mockDTO hợp lệ
     * @expected Trả về kết quả thành công với đối tượng phức tạp
     * @note Test case này kiểm tra việc xử lý khi service trả về đối tượng phức tạp, đảm bảo controller xử lý đúng các kiểu dữ liệu khác nhau
     */
    it('should handle service returning complex object', async () => {
      // Arrange - Chuẩn bị dữ liệu đầu vào
      const userId = 'user123'; // ID người dùng hợp lệ
      const mockDTO = new MockchangePassDTO(); // DTO hợp lệ
      const complexObject = { success: true, message: 'Password changed', timestamp: new Date() };
      jest.mocked(mockChangePasswordService.changePassword).mockResolvedValue(complexObject as any as never); // Giả lập service trả về đối tượng phức tạp

      // Act - Thực hiện hành động cần kiểm thử
      const result = await controller.changePass(userId, mockDTO as any);

      // Assert - Kiểm tra kết quả
      expect(mockChangePasswordService.changePassword).toHaveBeenCalledWith(userId, mockDTO); // Kiểm tra service được gọi với đúng tham số
      expect(result).toEqual(responseHandler.ok(complexObject)); // Kiểm tra kết quả trả về là thành công với đối tượng phức tạp
    });

    /**
     * @testcase TC-CT-AUTH-CP-007
     * @description Kiểm tra xử lý khi service ném ra lỗi không phải Error
     * @input userId='user123', mockDTO hợp lệ
     * @expected Trả về thông báo lỗi được chuyển đổi thành chuỗi
     * @note Test case này kiểm tra việc xử lý khi service ném ra lỗi không phải là đối tượng Error
     */
    it('should handle service throwing non-Error object', async () => {
      // Arrange - Chuẩn bị dữ liệu đầu vào
      const userId = 'user123'; // ID người dùng hợp lệ
      const mockDTO = new MockchangePassDTO(); // DTO hợp lệ
      const nonErrorObject = { code: 500, message: 'Internal error' };
      jest.mocked(mockChangePasswordService.changePassword).mockRejectedValue(nonErrorObject as never); // Giả lập service ném ra đối tượng không phải Error

      // Act - Thực hiện hành động cần kiểm thử
      const result = await controller.changePass(userId, mockDTO as any);

      // Assert - Kiểm tra kết quả
      expect(mockChangePasswordService.changePassword).toHaveBeenCalledWith(userId, mockDTO); // Kiểm tra service được gọi với đúng tham số
      expect(result).toEqual(responseHandler.error(JSON.stringify(nonErrorObject))); // Kiểm tra kết quả trả về là lỗi với thông báo được chuyển đổi thành chuỗi
    });
  });
});
