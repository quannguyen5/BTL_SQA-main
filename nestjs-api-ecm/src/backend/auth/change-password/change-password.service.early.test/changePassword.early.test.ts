/**
 * File: changePassword.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho service đổi mật khẩu
 * Mục đích: Kiểm tra các chức năng của ChangePasswordService
 */

import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ChangePasswordService } from '../change-password.service';

/**
 * Mock module bcrypt để giả lập các hàm compare và hash
 * - compare: Dùng để so sánh mật khẩu cũ với mật khẩu đã mã hóa
 * - hash: Dùng để mã hóa mật khẩu mới
 */
jest.mock('bcrypt', () => ({
  compare: jest.fn(), // Giả lập hàm compare
  hash: jest.fn(),    // Giả lập hàm hash
}));

/**
 * Các lớp mock để phục vụ kiểm thử
 */

/**
 * MockchangePassDTO: Đối tượng giả lập dữ liệu đầu vào cho chức năng đổi mật khẩu
 * - password: Mật khẩu hiện tại của người dùng
 * - newPassword: Mật khẩu mới mà người dùng muốn đổi
 */
class MockchangePassDTO {
  public password: string = 'oldPassword'; // Mật khẩu cũ
  public newPassword: string = 'newPassword'; // Mật khẩu mới
}

/**
 * MockUser: Đối tượng giả lập người dùng trong hệ thống
 * - id: Định danh duy nhất của người dùng
 * - password: Mật khẩu đã được mã hóa của người dùng
 */
class MockUser {
  public id: string = 'user-id'; // ID người dùng
  public password: string = 'hashedOldPassword'; // Mật khẩu đã mã hóa
}

/**
 * MockRepository: Đối tượng giả lập repository để thao tác với cơ sở dữ liệu
 * - findOneBy: Phương thức tìm kiếm người dùng theo điều kiện
 * - save: Phương thức lưu thông tin người dùng sau khi cập nhật
 */
class MockRepository {
  public findOneBy = jest.fn(); // Giả lập hàm tìm kiếm người dùng
  public save = jest.fn(); // Giả lập hàm lưu người dùng
}

/**
 * Test suite: Kiểm thử phương thức changePassword của ChangePasswordService
 * Mục tiêu: Đảm bảo chức năng đổi mật khẩu hoạt động chính xác trong các tình huống khác nhau
 */
describe('ChangePasswordService.changePassword() changePassword method', () => {
  // Khai báo các biến sử dụng trong các test case
  let service: ChangePasswordService; // Service cần kiểm thử
  let mockUserRepo: MockRepository; // Repository giả lập
  let mockUser: MockUser; // Đối tượng người dùng giả lập
  let mockChangePassDTO: MockchangePassDTO; // DTO giả lập

  /**
   * Thiết lập trước mỗi test case
   * - Khởi tạo các đối tượng mock mới
   * - Khởi tạo service với repository giả lập
   * - Xóa lịch sử gọi hàm mock để đảm bảo mỗi test case độc lập
   */
  beforeEach(() => {
    mockUserRepo = new MockRepository() as any;
    service = new ChangePasswordService(mockUserRepo as any);
    mockUser = new MockUser() as any;
    mockChangePassDTO = new MockchangePassDTO() as any;

    // Xóa các giá trị mock trước đó để đảm bảo mỗi kiểm thử độc lập
    jest.clearAllMocks();
  });

  /**
   * Test case 1: Đổi mật khẩu thành công
   * Mã test case: TC-SV-AUTH-CP-001
   * Mục tiêu: Kiểm tra quá trình đổi mật khẩu diễn ra đúng khi tất cả điều kiện hợp lệ
   * Input:
   *   - userId: 'user-id'
   *   - DTO: { password: 'oldPassword', newPassword: 'newPassword' }
   * Expected output: Đối tượng người dùng đã được cập nhật
   * Ghi chú: Kiểm tra đầy đủ các bước trong quy trình đổi mật khẩu
   */
  it('should change the password successfully', async () => {
    // Sắp xếp (Arrange)
    jest.mocked(mockUserRepo.findOneBy).mockResolvedValue(mockUser); // Tìm thấy người dùng
    jest.mocked(bcrypt.compare).mockResolvedValue(true); // Mật khẩu cũ khớp
    jest.mocked(bcrypt.hash).mockResolvedValue('hashedNewPassword'); // Mã hóa mật khẩu mới
    jest.mocked(mockUserRepo.save).mockResolvedValue(mockUser); // Lưu thành công

    // Thực thi (Act)
    const result = await service.changePassword('user-id', mockChangePassDTO as any);

    // Kiểm tra (Assert)
    expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({ id: 'user-id' }); // Đã gọi tìm kiếm người dùng
    expect(bcrypt.compare).toHaveBeenCalledWith('oldPassword', 'hashedOldPassword'); // Đã so sánh mật khẩu
    expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10); // Đã mã hóa mật khẩu mới
    expect(mockUserRepo.save).toHaveBeenCalledWith(mockUser); // Đã lưu người dùng
    expect(result).toEqual(mockUser); // Kết quả trả về đúng
  });

  /**
   * Test case 2: Không tìm thấy người dùng
   * Mã test case: TC-SV-AUTH-CP-002
   * Mục tiêu: Kiểm tra xử lý lỗi khi không tìm thấy người dùng với ID đã cho
   * Input:
   *   - userId: 'invalid-user-id'
   *   - DTO: { password: 'oldPassword', newPassword: 'newPassword' }
   * Expected output: NotFoundException được ném ra
   * Ghi chú: Đảm bảo hệ thống xử lý đúng khi người dùng không tồn tại
   */
  it('should throw NotFoundException if user is not found', async () => {
    // Sắp xếp (Arrange)
    jest.mocked(mockUserRepo.findOneBy).mockResolvedValue(null); // Không tìm thấy người dùng

    // Thực thi & Kiểm tra (Act & Assert)
    await expect(service.changePassword('invalid-user-id', mockChangePassDTO as any))
      .rejects
      .toThrow(NotFoundException); // Phải ném lỗi NotFoundException
  });

  /**
   * Test case 3: Mật khẩu hiện tại không đúng
   * Mã test case: TC-SV-AUTH-CP-003
   * Mục tiêu: Kiểm tra xử lý lỗi khi người dùng nhập sai mật khẩu hiện tại
   * Input:
   *   - userId: 'user-id'
   *   - DTO: { password: 'oldPassword' (sai), newPassword: 'newPassword' }
   * Expected output: Lỗi với thông báo 'CHANGE-PASS.USER NOT EXIST!'
   * Ghi chú: Đảm bảo hệ thống xác thực mật khẩu hiện tại trước khi cho phép đổi
   */
  it('should throw an error if the current password is incorrect', async () => {
    // Sắp xếp (Arrange)
    jest.mocked(mockUserRepo.findOneBy).mockResolvedValue(mockUser); // Tìm thấy người dùng
    jest.mocked(bcrypt.compare).mockResolvedValue(false); // Mật khẩu cũ không khớp

    // Thực thi & Kiểm tra (Act & Assert)
    await expect(service.changePassword('user-id', mockChangePassDTO as any))
      .rejects
      .toThrow('CHANGE-PASS.USER NOT EXIST!'); // Phải ném lỗi
  });

  /**
   * Test case 4: Lưu mật khẩu mới thất bại
   * Mã test case: TC-SV-AUTH-CP-004
   * Mục tiêu: Kiểm tra xử lý lỗi khi không thể lưu mật khẩu mới vào cơ sở dữ liệu
   * Input:
   *   - userId: 'user-id'
   *   - DTO: { password: 'oldPassword', newPassword: 'newPassword' }
   * Expected output: Lỗi với thông báo 'CHANGE-PASS.CHANGE-PASS ERROR!'
   * Ghi chú: Đảm bảo hệ thống xử lý đúng khi có lỗi trong quá trình lưu dữ liệu
   */
  it('should throw an error if saving the new password fails', async () => {
    // Sắp xếp (Arrange)
    jest.mocked(mockUserRepo.findOneBy).mockResolvedValue(mockUser); // Tìm thấy người dùng
    jest.mocked(bcrypt.compare).mockResolvedValue(true); // Mật khẩu cũ khớp
    jest.mocked(bcrypt.hash).mockResolvedValue('hashedNewPassword'); // Mã hóa mật khẩu mới
    jest.mocked(mockUserRepo.save).mockResolvedValue(null); // Lưu thất bại

    // Thực thi & Kiểm tra (Act & Assert)
    await expect(service.changePassword('user-id', mockChangePassDTO as any))
      .rejects
      .toThrow('CHANGE-PASS.CHANGE-PASS ERROR!'); // Phải ném lỗi
  });

  /**
   * Test case 5: Mật khẩu mới giống mật khẩu cũ
   * Mã test case: TC-SV-AUTH-CP-005
   * Mục tiêu: Kiểm tra xử lý khi người dùng nhập mật khẩu mới giống với mật khẩu cũ
   * Input:
   *   - userId: 'user-id'
   *   - DTO: { password: 'samePassword', newPassword: 'samePassword' }
   * Expected output: Lỗi với thông báo 'CHANGE-PASS.NEW-PASS SAME OLD-PASS!'
   * Ghi chú: Đảm bảo hệ thống kiểm tra mật khẩu mới khác với mật khẩu cũ
   */
  it('should throw an error if new password is the same as old password', async () => {
    // Sắp xếp (Arrange)
    const samePasswordDTO = {
      password: 'samePassword',
      newPassword: 'samePassword'
    };
    jest.mocked(mockUserRepo.findOneBy).mockResolvedValue(mockUser); // Tìm thấy người dùng
    jest.mocked(bcrypt.compare).mockResolvedValue(true); // Mật khẩu cũ khớp

    // Thực thi & Kiểm tra (Act & Assert)
    await expect(service.changePassword('user-id', samePasswordDTO as any))
      .rejects
      .toThrow('CHANGE-PASS.NEW-PASS SAME OLD-PASS!'); // Phải ném lỗi khi mật khẩu mới giống mật khẩu cũ
  });

  /**
   * Test case 6: Mật khẩu mới không đủ độ phức tạp
   * Mã test case: TC-SV-AUTH-CP-006
   * Mục tiêu: Kiểm tra xử lý khi mật khẩu mới không đáp ứng yêu cầu về độ phức tạp
   * Input:
   *   - userId: 'user-id'
   *   - DTO: { password: 'oldPassword', newPassword: 'weak' }
   * Expected output: Lỗi với thông báo 'CHANGE-PASS.NEW-PASS NOT STRONG ENOUGH!'
   * Ghi chú: Đảm bảo hệ thống kiểm tra độ phức tạp của mật khẩu mới
   */
  it('should throw an error if new password is not complex enough', async () => {
    // Sắp xếp (Arrange)
    const weakPasswordDTO = {
      password: 'oldPassword',
      newPassword: 'weak'
    };
    jest.mocked(mockUserRepo.findOneBy).mockResolvedValue(mockUser); // Tìm thấy người dùng
    jest.mocked(bcrypt.compare).mockResolvedValue(true); // Mật khẩu cũ khớp

    // Thực thi & Kiểm tra (Act & Assert)
    await expect(service.changePassword('user-id', weakPasswordDTO as any))
      .rejects
      .toThrow('CHANGE-PASS.NEW-PASS NOT STRONG ENOUGH!'); // Phải ném lỗi khi mật khẩu mới không đủ mạnh
  });

  /**
   * Test case 7: Xử lý lỗi từ bcrypt khi mã hóa mật khẩu
   * Mã test case: TC-SV-AUTH-CP-007
   * Mục tiêu: Kiểm tra xử lý khi có lỗi xảy ra trong quá trình mã hóa mật khẩu mới
   * Input:
   *   - userId: 'user-id'
   *   - DTO: { password: 'oldPassword', newPassword: 'newPassword' }
   * Expected output: Lỗi với thông báo 'CHANGE-PASS.HASH ERROR!'
   * Ghi chú: Đảm bảo hệ thống xử lý đúng khi có lỗi từ thư viện mã hóa
   */
  it('should handle bcrypt hash errors', async () => {
    // Sắp xếp (Arrange)
    jest.mocked(mockUserRepo.findOneBy).mockResolvedValue(mockUser); // Tìm thấy người dùng
    jest.mocked(bcrypt.compare).mockResolvedValue(true); // Mật khẩu cũ khớp
    jest.mocked(bcrypt.hash).mockRejectedValue(new Error('Hash error')); // Lỗi khi mã hóa

    // Thực thi & Kiểm tra (Act & Assert)
    await expect(service.changePassword('user-id', mockChangePassDTO as any))
      .rejects
      .toThrow('CHANGE-PASS.HASH ERROR!'); // Phải ném lỗi khi có vấn đề với mã hóa
  });

  /**
   * Test case 8: Xử lý lỗi từ bcrypt khi so sánh mật khẩu
   * Mã test case: TC-SV-AUTH-CP-008
   * Mục tiêu: Kiểm tra xử lý khi có lỗi xảy ra trong quá trình so sánh mật khẩu
   * Input:
   *   - userId: 'user-id'
   *   - DTO: { password: 'oldPassword', newPassword: 'newPassword' }
   * Expected output: Lỗi với thông báo 'CHANGE-PASS.COMPARE ERROR!'
   * Ghi chú: Đảm bảo hệ thống xử lý đúng khi có lỗi từ thư viện so sánh mật khẩu
   */
  it('should handle bcrypt compare errors', async () => {
    // Sắp xếp (Arrange)
    jest.mocked(mockUserRepo.findOneBy).mockResolvedValue(mockUser); // Tìm thấy người dùng
    jest.mocked(bcrypt.compare).mockRejectedValue(new Error('Compare error')); // Lỗi khi so sánh

    // Thực thi & Kiểm tra (Act & Assert)
    await expect(service.changePassword('user-id', mockChangePassDTO as any))
      .rejects
      .toThrow('CHANGE-PASS.COMPARE ERROR!'); // Phải ném lỗi khi có vấn đề với so sánh mật khẩu
  });
});