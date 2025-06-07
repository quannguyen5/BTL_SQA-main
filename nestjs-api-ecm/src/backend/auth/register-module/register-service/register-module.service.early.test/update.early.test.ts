/**
 * File: update.early.test.ts
 * Mô tả: File kiểm thử cho phương thức update() của RegisterModuleService
 * Module: Auth/Register
 * Chức năng: Kiểm tra việc xác thực và kích hoạt tài khoản người dùng bằng mã OTP
 * Ngày tạo: 2023
 */

import { authenticator } from 'otplib';
import { Location_userEntity } from 'src/entities/user_entity/location_user.entity';
import { User } from 'src/entities/user_entity/user.entity';
import { RegisterModuleService } from '../register-module.service';
import { InternalServerErrorException } from '@nestjs/common';

/**
 * Mock các thư viện bên ngoài để kiểm soát hành vi của chúng trong quá trình test
 */
jest.mock('nodemailer'); // Mock thư viện gửi email
jest.mock('otplib');     // Mock thư viện tạo và xác thực OTP

/**
 * Mock DTO cho việc xác thực OTP
 * Chứa các thông tin cần thiết để xác thực tài khoản
 */
class MockVerifyDto {
  otp: string = '123456';       // Mã OTP được gửi đến email người dùng
  email: string = 'test@example.com'; // Địa chỉ email cần xác thực
}

/**
 * Mock Repository
 * Giả lập các phương thức của repository để kiểm soát hành vi trong quá trình test
 */
class MockRepository<T = any> {
  update = jest.fn(); // Phương thức cập nhật dữ liệu trong database
}

/**
 * Mock DataSource
 * Giả lập DataSource để sử dụng trong service
 */
class MockDataSource {}

/**
 * Test Suite: RegisterModuleService.update() update method
 * Mô tả: Kiểm thử chức năng xác thực và kích hoạt tài khoản của RegisterModuleService
 */
describe('RegisterModuleService.update() update method', () => {
  // Khai báo các biến sử dụng trong test
  let service: RegisterModuleService;           // Service cần test
  let mockUserRepository: MockRepository<User>; // Mock repository cho User
  let mockLocationRepository: MockRepository<Location_userEntity>; // Mock repository cho Location_user
  let mockDataSource: MockDataSource;           // Mock DataSource

  /**
   * Thiết lập môi trường test trước mỗi test case
   * Khởi tạo các mock objects và service cần test
   */
  beforeEach(() => {
    // Khởi tạo các mock repositories
    mockUserRepository = new MockRepository<User>();
    mockLocationRepository = new MockRepository<Location_userEntity>();
    mockDataSource = new MockDataSource();

    // Khởi tạo service cần test với các dependencies đã mock
    service = new RegisterModuleService(
      mockUserRepository as any,
      mockLocationRepository as any,
      mockDataSource as any,
    );
  });

  /**
   * Test Group: Happy paths
   * Mô tả: Các test case cho trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * Test Case ID: TC-SV-AUTH-UD-001
     * Mục tiêu: Kiểm tra việc cập nhật trạng thái kích hoạt của người dùng khi OTP được xác thực thành công
     * Input:
     *   - email: "test@example.com" - Địa chỉ email cần xác thực
     *   - otp: "123456" - Mã OTP hợp lệ
     *   - authenticator.check trả về true (OTP hợp lệ)
     *   - mockUserRepository.update trả về { affected: 1 } (cập nhật thành công 1 bản ghi)
     * Expected Output:
     *   - Kết quả trả về: true
     *   - mockUserRepository.update được gọi với tham số đúng:
     *     + Điều kiện: { email: "test@example.com" }
     *     + Giá trị cập nhật: { isActive: true }
     * Ghi chú: Khi OTP hợp lệ, tài khoản người dùng sẽ được kích hoạt (isActive = true)
     */
    it('should update user as active when OTP is verified', async () => {
      // Sắp xếp (Arrange)
      const mockVerifyDto = new MockVerifyDto();

      // Giả lập xác thực OTP thành công
      (authenticator.check as jest.Mock).mockReturnValue(true);
      // Giả lập cập nhật database thành công (1 bản ghi bị ảnh hưởng)
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      // Thực thi (Act)
      const result = await service.update(mockVerifyDto);

      // Kiểm tra (Assert)
      expect(result).toBe(true); // Kết quả phải là true
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { email: mockVerifyDto.email }, // Điều kiện cập nhật
        { isActive: true },             // Giá trị cập nhật
      );
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp đặc biệt và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-SV-AUTH-UD-002
     * Mục tiêu: Kiểm tra xử lý khi mã OTP không hợp lệ hoặc đã hết hạn
     * Input:
     *   - email: "test@example.com" - Địa chỉ email cần xác thực
     *   - otp: "123456" - Mã OTP đã nhập
     *   - authenticator.check trả về false (OTP không hợp lệ hoặc đã hết hạn)
     * Expected Output:
     *   - Exception với message chính xác: 'REGISTER.OTP EXPIRED!'
     *   - Không có thay đổi nào trong database
     * Ghi chú: Khi OTP không hợp lệ, hệ thống sẽ thông báo lỗi và không kích hoạt tài khoản
     */
    it('should throw an error if OTP is not verified', async () => {
      // Sắp xếp (Arrange)
      const mockVerifyDto = new MockVerifyDto();

      // Giả lập xác thực OTP thất bại
      (authenticator.check as jest.Mock).mockReturnValue(false);

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(service.update(mockVerifyDto)).rejects.toThrow(
        'REGISTER.OTP EXPIRED!', // Kiểm tra thông báo lỗi chính xác
      );
    });

    /**
     * Test Case ID: TC-SV-AUTH-UD-003
     * Mục tiêu: Kiểm tra xử lý khi cập nhật trạng thái người dùng thất bại
     * Input:
     *   - email: "test@example.com" - Địa chỉ email cần xác thực
     *   - otp: "123456" - Mã OTP hợp lệ
     *   - authenticator.check trả về true (OTP hợp lệ)
     *   - mockUserRepository.update trả về { affected: 0 } (không có bản ghi nào được cập nhật)
     * Expected Output:
     *   - Exception với message chính xác: 'REGISTER.UPDATE ACTIVE FAILED!'
     *   - Không có tài khoản nào được kích hoạt
     * Ghi chú: Khi không tìm thấy tài khoản hoặc cập nhật thất bại, hệ thống sẽ thông báo lỗi
     */
    it('should throw an error if update fails', async () => {
      // Sắp xếp (Arrange)
      const mockVerifyDto = new MockVerifyDto();

      // Giả lập xác thực OTP thành công
      (authenticator.check as jest.Mock).mockReturnValue(true);
      // Giả lập cập nhật database thất bại (không có bản ghi nào bị ảnh hưởng)
      mockUserRepository.update.mockResolvedValue({ affected: 0 });

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(service.update(mockVerifyDto)).rejects.toThrow(
        'REGISTER.UPDATE ACTIVE FAILED!', // Kiểm tra thông báo lỗi chính xác
      );
    });
  });
});
