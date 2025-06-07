/**
 * File: create.early.test.ts
 * Mô tả: File kiểm thử cho phương thức create() của RegisterModuleService
 * Module: Auth/Register
 * Ngày tạo: 2023
 */

import { InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { RegisterModuleService } from '../register-module.service';

// Mock các thư viện bên ngoài để kiểm soát hành vi của chúng trong quá trình test
jest.mock('bcrypt');
jest.mock('nodemailer');
jest.mock('otplib');

/**
 * Mock DTO cho việc tạo người dùng mới
 * Chứa các thông tin cơ bản của người dùng để đăng ký tài khoản
 */
class MockCreateUserDto {
  public firstName = 'John';
  public lastName = 'Doe';
  public email = 'john.doe@example.com';
  public password = 'password123';
  public address = '123 Main St';
  public phone = '1234567890';
}

/**
 * Mock các entities và repository
 */

/**
 * Mock User Entity
 * Đại diện cho thông tin người dùng trong hệ thống
 */
class MockUser {
  public id = 1;
  public email = 'john.doe@example.com';
  public isActive = false; // Trạng thái kích hoạt của tài khoản
}

/**
 * Mock Location_user Entity
 * Đại diện cho thông tin địa chỉ của người dùng
 */
class MockLocation_userEntity {
  public id = 1;
  public name = 'John Doe';
  public address = '123 Main St';
  public phone = '1234567890';
  public default_location = true;
  public user_id = 1; // Liên kết với User
}

/**
 * Mock Repository
 * Giả lập các phương thức của repository để kiểm soát hành vi trong quá trình test
 */
class MockRepository<T = any> {
  findOneBy = jest.fn(); // Tìm kiếm một bản ghi theo điều kiện
  create = jest.fn();    // Tạo một instance mới của entity
  save = jest.fn();      // Lưu entity vào database
}

/**
 * Mock QueryRunner & DataSource
 * Giả lập các phương thức của QueryRunner để kiểm soát transaction trong quá trình test
 */
const createMockQueryRunner = () => ({
  connect: jest.fn(),             // Kết nối đến database
  startTransaction: jest.fn(),    // Bắt đầu transaction
  manager: {
    save: jest.fn(),             // Lưu entity trong transaction
  },
  commitTransaction: jest.fn(),   // Commit transaction
  rollbackTransaction: jest.fn(), // Rollback transaction khi có lỗi
  release: jest.fn(),            // Giải phóng connection
});

/**
 * Test Suite: RegisterModuleService.create() create method
 * Mô tả: Kiểm thử chức năng tạo người dùng mới của RegisterModuleService
 */
describe('RegisterModuleService.create() create method', () => {
  // Khai báo các biến sử dụng trong test
  let service: RegisterModuleService;           // Service cần test
  let mockUserRepository: MockRepository;       // Mock repository cho User
  let mockLocationRepository: MockRepository;   // Mock repository cho Location_user
  let mockDataSource: any;                      // Mock DataSource
  let mockQueryRunner: ReturnType<typeof createMockQueryRunner>; // Mock QueryRunner
  let mockCreateUserDto: MockCreateUserDto;    // Mock DTO đầu vào

  /**
   * Thiết lập môi trường test trước mỗi test case
   * Khởi tạo các mock objects và service cần test
   */
  beforeEach(() => {
    // Khởi tạo các mock repositories
    mockUserRepository = new MockRepository();
    mockLocationRepository = new MockRepository();

    // Khởi tạo mock QueryRunner và DataSource
    mockQueryRunner = createMockQueryRunner();
    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    // Khởi tạo mock DTO
    mockCreateUserDto = new MockCreateUserDto();

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
     * Test Case ID: TC-SV-AUTH-CREATE-001
     * Mục tiêu: Kiểm tra việc tạo người dùng mới và gửi email OTP thành công
     * Input:
     *   - firstName: "John"
     *   - lastName: "Doe"
     *   - email: "john.doe@example.com"
     *   - password: "password123"
     *   - address: "123 Main St"
     *   - phone: "1234567890"
     * Expected Output:
     *   - Object: { email: "john.doe@example.com" }
     *   - Người dùng được lưu vào database
     *   - Email OTP được gửi đến địa chỉ email đã đăng ký
     *   - Transaction được commit
     * Ghi chú: Transaction phải được commit sau khi lưu thành công
     */
    it('should create a new user and send an OTP email', async () => {
      // Giả lập không tìm thấy user (email chưa tồn tại)
      mockUserRepository.findOneBy.mockResolvedValue(null);

      // Giả lập mã hóa mật khẩu thành công
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      // Giả lập tạo đối tượng User và Location_user
      mockUserRepository.create.mockReturnValue(new MockUser());
      mockQueryRunner.manager.save.mockResolvedValue(new MockUser());
      mockLocationRepository.create.mockReturnValue(new MockLocation_userEntity());

      // Giả lập gửi email OTP thành công
      (nodemailer.createTransport as jest.Mock).mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ response: 'Email sent' }),
      });

      // Gọi phương thức cần test
      const result = await service.create(mockCreateUserDto as any);

      // Kiểm tra kết quả
      expect(result).toEqual({ email: 'john.doe@example.com' });
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: 'john.doe@example.com' });
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp đặc biệt và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-SV-AUTH-CREATE-002
     * Mục tiêu: Kiểm tra xử lý khi người dùng đã tồn tại và đã kích hoạt
     * Input:
     *   - firstName: "John"
     *   - lastName: "Doe"
     *   - email: "john.doe@example.com" (email đã tồn tại trong hệ thống)
     *   - password: "password123"
     *   - address: "123 Main St"
     *   - phone: "1234567890"
     *   - Database có user với email="john.doe@example.com" và isActive=true
     * Expected Output:
     *   - Exception với message chính xác: 'REGISTER.ACCOUNT EXISTS!'
     *   - Không có thay đổi nào trong database
     * Ghi chú: Không cho phép đăng ký trùng email đã kích hoạt
     */
    it('should throw an error if the user already exists and is active', async () => {
      // Giả lập tìm thấy user đã kích hoạt
      mockUserRepository.findOneBy.mockResolvedValue({ isActive: true });

      // Kiểm tra lỗi được ném ra
      await expect(service.create(mockCreateUserDto as any)).rejects.toThrow('REGISTER.ACCOUNT EXISTS!');
    });

    /**
     * Test Case ID: TC-SV-AUTH-CREATE-003
     * Mục tiêu: Kiểm tra xử lý khi người dùng đã tồn tại nhưng chưa kích hoạt
     * Input:
     *   - firstName: "John"
     *   - lastName: "Doe"
     *   - email: "john.doe@example.com" (email đã tồn tại trong hệ thống)
     *   - password: "password123"
     *   - address: "123 Main St"
     *   - phone: "1234567890"
     *   - Database có user với email="john.doe@example.com" và isActive=false
     * Expected Output:
     *   - Exception với message chính xác: 'REGISTER.ACCOUNT NOT VERIFY! PLEASE ENTER OTP VERIFY!'
     *   - Email OTP mới được gửi đến địa chỉ email đã đăng ký
     *   - Hàm nodemailer.createTransport được gọi để gửi email
     * Ghi chú: Cho phép gửi lại OTP để người dùng xác thực tài khoản
     */
    it('should send OTP email if user exists but not active', async () => {
      // Giả lập tìm thấy user chưa kích hoạt
      mockUserRepository.findOneBy.mockResolvedValue({ isActive: false, email: 'john.doe@example.com' });

      // Giả lập gửi email OTP
      (nodemailer.createTransport as jest.Mock).mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ response: 'Email sent' }),
      });

      // Kiểm tra lỗi được ném ra
      await expect(service.create(mockCreateUserDto as any)).rejects.toThrow(
        'REGISTER.ACCOUNT NOT VERIFY! PLEASE ENTER OTP VERIFY!',
      );

      // Kiểm tra đã gọi hàm gửi email
      expect(nodemailer.createTransport).toHaveBeenCalled();
    });

    /**
     * Test Case ID: TC-SV-AUTH-CREATE-004
     * Mục tiêu: Kiểm tra xử lý khi lưu thông tin người dùng thất bại
     * Input:
     *   - firstName: "John"
     *   - lastName: "Doe"
     *   - email: "john.doe@example.com"
     *   - password: "password123"
     *   - address: "123 Main St"
     *   - phone: "1234567890"
     *   - mockQueryRunner.manager.save ném lỗi "Database error"
     * Expected Output:
     *   - Exception loại InternalServerErrorException
     *   - Transaction được rollback (mockQueryRunner.rollbackTransaction được gọi)
     *   - Không có dữ liệu nào được lưu vào database
     * Ghi chú: Đảm bảo tính toàn vẹn dữ liệu khi có lỗi xảy ra
     */
    it('should rollback transaction and throw error if saving user fails', async () => {
      // Giả lập không tìm thấy user (email chưa tồn tại)
      mockUserRepository.findOneBy.mockResolvedValue(null);

      // Giả lập mã hóa mật khẩu thành công
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      // Giả lập tạo đối tượng User
      mockUserRepository.create.mockReturnValue(new MockUser());

      // Giả lập lỗi khi lưu vào database
      mockQueryRunner.manager.save.mockRejectedValue(new Error('Database error'));

      // Kiểm tra lỗi được ném ra
      await expect(service.create(mockCreateUserDto as any)).rejects.toThrow(InternalServerErrorException);

      // Kiểm tra transaction đã được rollback
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
