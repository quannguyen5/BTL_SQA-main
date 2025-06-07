/**
 * File: login.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho service đăng nhập
 * Mục đích: Kiểm tra các chức năng của LoginModuleService
 */

import {
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginModuleService } from '../login-module.service';

/**
 * Mock module bcrypt để giả lập hàm compare
 * - compare: Dùng để so sánh mật khẩu người dùng nhập vào với mật khẩu đã mã hóa trong cơ sở dữ liệu
 */
jest.mock('bcrypt', () => ({
  compare: jest.fn(), // Giả lập hàm compare
}));

/**
 * Các lớp mock để phục vụ kiểm thử
 */

/**
 * MockLoginDTO: Đối tượng giả lập dữ liệu đầu vào cho chức năng đăng nhập
 * - email: Địa chỉ email của người dùng
 * - password: Mật khẩu của người dùng
 */
class MockLoginDTO {
  public email: string = 'test@example.com'; // Email mẫu
  public password: string = 'password123'; // Mật khẩu mẫu
}

/**
 * MockUser: Đối tượng giả lập người dùng trong hệ thống
 * - id: Định danh duy nhất của người dùng
 * - email: Địa chỉ email của người dùng
 * - password: Mật khẩu đã được mã hóa của người dùng
 * - role: Vai trò của người dùng trong hệ thống
 * - token: Token xác thực của người dùng
 */
class MockUser {
  public id: number = 1; // ID người dùng
  public email: string = 'test@example.com'; // Email người dùng
  public password: string = 'hashedPassword'; // Mật khẩu đã mã hóa
  public role: string = 'user'; // Vai trò người dùng
  public token: string = ''; // Token xác thực
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
 * Test suite: Kiểm thử phương thức login của LoginModuleService
 * Mục tiêu: Đảm bảo chức năng đăng nhập hoạt động chính xác trong các tình huống khác nhau
 */
describe('LoginModuleService.login() login method', () => {
  // Khai báo các biến sử dụng trong các test case
  let service: LoginModuleService; // Service cần kiểm thử
  let mockRepository: MockRepository; // Repository giả lập
  let mockJwtService: JwtService; // JwtService giả lập
  let mockConfigService: ConfigService; // ConfigService giả lập

  /**
   * Thiết lập trước mỗi test case
   * - Khởi tạo các đối tượng mock mới
   * - Khởi tạo service với các dependency giả lập
   * - Xóa lịch sử gọi hàm mock để đảm bảo mỗi test case độc lập
   */
  beforeEach(() => {
    mockRepository = new MockRepository() as any;
    mockJwtService = {
      signAsync: jest.fn(), // Giả lập hàm tạo JWT token
    } as any;
    mockConfigService = {} as any;

    service = new LoginModuleService(
      mockRepository as any,
      mockJwtService as any,
      mockConfigService as any,
    );

    jest.clearAllMocks(); // Xóa các giá trị mock trước mỗi test
  });

  /**
   * Nhóm các test case cho trường hợp thành công
   * Mục đích: Kiểm tra hành vi của service khi các tình huống đăng nhập thành công
   */
  describe('Happy paths', () => {
    /**
     * Test case 1: Đăng nhập thành công với thông tin hợp lệ
     * Mã test case: TC-SV-AUTH-LS-001
     * Mục tiêu: Kiểm tra quá trình đăng nhập diễn ra đúng khi thông tin đăng nhập hợp lệ
     * Input:
     *   - DTO: { email: 'test@example.com', password: 'password123' }
     * Expected output:
     *   - user: Thông tin người dùng
     *   - accessToken: Token xác thực
     * Ghi chú: Kiểm tra đầy đủ các bước trong quy trình đăng nhập và lưu token
     */
    it('should successfully login a user with valid credentials', async () => {
      // Sắp xếp (Arrange)
      const mockLoginDTO = new MockLoginDTO(); // DTO đăng nhập hợp lệ
      const mockUser = new MockUser(); // Đối tượng người dùng giả lập

      mockRepository.findOneBy.mockResolvedValue(mockUser); // Giả lập tìm thấy người dùng
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Giả lập mật khẩu khớp
      (mockJwtService.signAsync as jest.Mock).mockResolvedValue('accessToken'); // Giả lập tạo token thành công

      // Thực thi (Act)
      const result = await service.login(mockLoginDTO); // Gọi phương thức cần kiểm thử

      // Kiểm tra (Assert)
      expect(result).toEqual({
        user: mockUser, // Kết quả phải chứa thông tin người dùng
        accessToken: 'accessToken', // Kết quả phải chứa token xác thực
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        token: 'accessToken', // Kiểm tra token đã được lưu vào người dùng
      });
    });
  });

  /**
   * Nhóm các test case cho trường hợp ngoại lệ
   * Mục đích: Kiểm tra hành vi của service khi xảy ra các tình huống lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test case 2: Không tìm thấy người dùng
     * Mã test case: TC-SV-AUTH-LS-002
     * Mục tiêu: Kiểm tra xử lý lỗi khi không tìm thấy người dùng với email đã cho
     * Input:
     *   - DTO: { email: 'test@example.com', password: 'password123' }
     * Expected output: NotFoundException với thông báo 'LOGIN.USER.EMAIL IS NOT VALID!'
     * Ghi chú: Đảm bảo hệ thống xử lý đúng khi người dùng không tồn tại
     */
    it('should throw NotFoundException if user is not found', async () => {
      // Sắp xếp (Arrange)
      const mockLoginDTO = new MockLoginDTO(); // DTO đăng nhập

      mockRepository.findOneBy.mockResolvedValue(null); // Giả lập không tìm thấy người dùng

      // Thực thi & Kiểm tra (Act & Assert)
      await expect(service.login(mockLoginDTO)).rejects.toThrow(
        new NotFoundException('LOGIN.USER.EMAIL IS NOT VALID!'), // Phải ném lỗi NotFoundException
      );
    });

    /**
     * Test case 3: Mật khẩu không đúng
     * Mã test case: TC-SV-AUTH-LS-003
     * Mục tiêu: Kiểm tra xử lý lỗi khi người dùng nhập sai mật khẩu
     * Input:
     *   - DTO: { email: 'test@example.com', password: 'password123' (sai) }
     * Expected output: UnauthorizedException với thông báo 'LOGIN.USER.PASSWORD IS NOT VALID!'
     * Ghi chú: Đảm bảo hệ thống xác thực mật khẩu trước khi cho phép đăng nhập
     */
    it('should throw UnauthorizedException if password is incorrect', async () => {
      // Sắp xếp (Arrange)
      const mockLoginDTO = new MockLoginDTO(); // DTO đăng nhập
      const mockUser = new MockUser(); // Đối tượng người dùng giả lập

      mockRepository.findOneBy.mockResolvedValue(mockUser); // Giả lập tìm thấy người dùng
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Giả lập mật khẩu không khớp

      // Thực thi & Kiểm tra (Act & Assert)
      await expect(service.login(mockLoginDTO)).rejects.toThrow(
        new UnauthorizedException('LOGIN.USER.PASSWORD IS NOT VALID!'), // Phải ném lỗi UnauthorizedException
      );
    });

    /**
     * Test case 4: Lỗi khi tạo JWT token
     * Mã test case: TC-SV-AUTH-LS-004
     * Mục tiêu: Kiểm tra xử lý lỗi khi không thể tạo JWT token
     * Input:
     *   - DTO: { email: 'test@example.com', password: 'password123' }
     * Expected output: Lỗi từ JwtService
     * Ghi chú: Đảm bảo hệ thống xử lý đúng khi có lỗi từ JwtService
     */
    it('should throw an error if JWT token creation fails', async () => {
      // Sắp xếp (Arrange)
      const mockLoginDTO = new MockLoginDTO(); // DTO đăng nhập
      const mockUser = new MockUser(); // Đối tượng người dùng giả lập
      const jwtError = new Error('JWT creation failed'); // Lỗi khi tạo JWT

      mockRepository.findOneBy.mockResolvedValue(mockUser); // Giả lập tìm thấy người dùng
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Giả lập mật khẩu khớp
      (mockJwtService.signAsync as jest.Mock).mockRejectedValue(jwtError); // Giả lập lỗi khi tạo token

      // Thực thi & Kiểm tra (Act & Assert)
      await expect(service.login(mockLoginDTO)).rejects.toThrow(jwtError); // Phải ném lỗi từ JwtService
    });
  });
});
