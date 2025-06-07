/**
 * File: update.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho controller xác thực đăng ký
 * Mục đích: Kiểm tra các chức năng cập nhật (xác thực) của RegisterModuleController
 */

import { responseHandler } from 'src/Until/responseUtil';
import { RegisterModuleController } from '../register-module.controller';

/**
 * Các lớp mock để phục vụ kiểm thử
 */

/**
 * MockRegisterModuleService: Đối tượng giả lập service đăng ký
 * - update: Phương thức giả lập chức năng cập nhật (xác thực) người dùng
 */
class MockRegisterModuleService {
  update = jest.fn(); // Hàm giả lập cập nhật (xác thực) người dùng
}

/**
 * MockVerifyDto: Đối tượng giả lập dữ liệu đầu vào cho chức năng xác thực đăng ký
 * - email: Địa chỉ email của người dùng cần xác thực
 * - otp: Mã OTP dùng để xác thực
 */
class MockVerifyDto {
  public email: string = 'test@example.com'; // Email mẫu
  public otp: string = '123456'; // Mã OTP mẫu
}

/**
 * Test suite: Kiểm thử phương thức update của RegisterModuleController
 * Mục tiêu: Đảm bảo chức năng xác thực đăng ký hoạt động chính xác trong các tình huống khác nhau
 */
describe('RegisterModuleController.update() update method', () => {
  // Khai báo các biến sử dụng trong các test case
  let controller: RegisterModuleController; // Controller cần kiểm thử
  let mockRegisterModuleService: MockRegisterModuleService; // Service giả lập

  /**
   * Thiết lập trước mỗi test case
   * - Khởi tạo service giả lập mới
   * - Khởi tạo controller với service giả lập
   */
  beforeEach(() => {
    mockRegisterModuleService = new MockRegisterModuleService();
    controller = new RegisterModuleController(mockRegisterModuleService as any);
  });

  /**
   * Nhóm các test case cho trường hợp thành công
   * Mục đích: Kiểm tra hành vi của controller khi các tình huống xác thực thành công
   */
  describe('Happy paths', () => {
    /**
     * Test case 1: Xác thực đăng ký thành công
     * Mã test case: TC-CT-AUTH-UD-001
     * Mục tiêu: Kiểm tra controller trả về kết quả thành công khi service xác thực thành công
     * Input:
     *   - DTO:
     *     + email: 'test@example.com' - Địa chỉ email cần xác thực
     *     + otp: '123456' - Mã OTP hợp lệ đã được gửi đến email
     *   - Service trả về: { success: true }
     * Expected output:
     *   - Object: { success: true }
     *   - Service.update được gọi với tham số đúng là mockVerifyDto
     * Ghi chú: Đảm bảo controller gọi service đúng và trả về kết quả đúng định dạng
     */
    it('should successfully update with valid data', async () => {
      // Sắp xếp (Arrange)
      const mockVerifyDto = new MockVerifyDto(); // DTO xác thực hợp lệ
      const expectedResponse = { success: true }; // Kết quả mong đợi
      mockRegisterModuleService.update.mockResolvedValue(expectedResponse); // Giả lập service trả về thành công

      // Thực thi (Act)
      const result = await controller.update(mockVerifyDto); // Gọi phương thức cần kiểm thử

      // Kiểm tra (Assert)
      expect(mockRegisterModuleService.update).toHaveBeenCalledWith(mockVerifyDto); // Kiểm tra service được gọi với đúng tham số
      expect(result).toEqual(expectedResponse); // Kết quả phải đúng với định dạng thành công
    });
  });

  /**
   * Nhóm các test case cho trường hợp ngoại lệ
   * Mục đích: Kiểm tra hành vi của controller khi xảy ra các tình huống lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test case 2: Xử lý lỗi từ service xác thực
     * Mã test case: TC-CT-AUTH-UD-002
     * Mục tiêu: Kiểm tra controller xử lý đúng khi service xác thực ném lỗi
     * Input:
     *   - DTO:
     *     + email: 'test@example.com' - Địa chỉ email cần xác thực
     *     + otp: '123456' - Mã OTP đã nhập
     *   - Service.update ném lỗi: Error('Service error')
     * Expected output:
     *   - Object: responseHandler.error('Service error')
     *   - Kết quả trả về có cấu trúc phù hợp với định dạng lỗi
     *   - Service.update được gọi với tham số đúng là mockVerifyDto
     * Ghi chú: Đảm bảo controller bắt và xử lý lỗi đúng cách
     */
    it('should handle service throwing an error gracefully', async () => {
      // Sắp xếp (Arrange)
      const mockVerifyDto = new MockVerifyDto(); // DTO xác thực
      const errorMessage = 'Service error'; // Thông báo lỗi
      mockRegisterModuleService.update.mockRejectedValue(new Error(errorMessage)); // Giả lập service ném lỗi

      // Thực thi (Act)
      const result = await controller.update(mockVerifyDto); // Gọi phương thức cần kiểm thử

      // Kiểm tra (Assert)
      expect(mockRegisterModuleService.update).toHaveBeenCalledWith(mockVerifyDto); // Kiểm tra service được gọi với đúng tham số
      expect(result).toEqual(responseHandler.error(errorMessage)); // Kết quả phải là thông báo lỗi
    });

    /**
     * Test case 3: Xử lý khi dữ liệu đầu vào rỗng
     * Mã test case: TC-CT-AUTH-UD-003
     * Mục tiêu: Kiểm tra controller xử lý đúng khi dữ liệu đầu vào rỗng
     * Input:
     *   - DTO: {} (object rỗng không có thuộc tính email và otp)
     *   - Service.update trả về: { success: false, message: 'Invalid input' }
     * Expected output:
     *   - Object: { success: false, message: 'Invalid input' }
     *   - Service.update được gọi với tham số là object rỗng
     * Ghi chú: Đảm bảo controller xử lý được cả trường hợp dữ liệu đầu vào không hợp lệ
     */
    it('should handle empty input gracefully', async () => {
      // Sắp xếp (Arrange)
      const mockVerifyDto = {} as any; // DTO rỗng
      const expectedResponse = { success: false, message: 'Invalid input' }; // Kết quả mong đợi
      mockRegisterModuleService.update.mockResolvedValue(expectedResponse); // Giả lập service trả về lỗi

      // Thực thi (Act)
      const result = await controller.update(mockVerifyDto); // Gọi phương thức cần kiểm thử

      // Kiểm tra (Assert)
      expect(mockRegisterModuleService.update).toHaveBeenCalledWith(mockVerifyDto); // Kiểm tra service được gọi với đúng tham số
      expect(result).toEqual(expectedResponse); // Kết quả phải đúng với định dạng lỗi
    });

    /**
     * Test case 4: Xử lý khi mã OTP không hợp lệ
     * Mã test case: TC-CT-AUTH-UD-004
     * Mục tiêu: Kiểm tra controller xử lý đúng khi mã OTP không hợp lệ
     * Input:
     *   - DTO:
     *     + email: 'test@example.com' - Địa chỉ email hợp lệ
     *     + otp: 'invalid' - Mã OTP không đúng định dạng (không phải 6 chữ số)
     *   - Service.update trả về: { success: false, message: 'Invalid OTP' }
     * Expected output:
     *   - Object: { success: false, message: 'Invalid OTP' }
     *   - Service.update được gọi với tham số chứa OTP không hợp lệ
     * Ghi chú: Đảm bảo controller xử lý được trường hợp mã OTP không đúng định dạng
     */
    it('should handle invalid OTP format', async () => {
      // Sắp xếp (Arrange)
      const mockVerifyDto = { email: 'test@example.com', otp: 'invalid' }; // DTO với OTP không hợp lệ
      const expectedResponse = { success: false, message: 'Invalid OTP' }; // Kết quả mong đợi
      mockRegisterModuleService.update.mockResolvedValue(expectedResponse); // Giả lập service trả về lỗi

      // Thực thi (Act)
      const result = await controller.update(mockVerifyDto as any); // Gọi phương thức cần kiểm thử

      // Kiểm tra (Assert)
      expect(mockRegisterModuleService.update).toHaveBeenCalledWith(mockVerifyDto); // Kiểm tra service được gọi với đúng tham số
      expect(result).toEqual(expectedResponse); // Kết quả phải đúng với định dạng lỗi
    });
  });
});
