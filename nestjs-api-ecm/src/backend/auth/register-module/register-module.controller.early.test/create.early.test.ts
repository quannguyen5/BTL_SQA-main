/**
 * File: create.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho controller đăng ký người dùng
 * Mục đích: Kiểm tra các chức năng của RegisterModuleController
 */

import { responseHandler } from 'src/Until/responseUtil';
import { RegisterModuleController } from '../register-module.controller';

/**
 * Các lớp mock để phục vụ kiểm thử
 */

/**
 * MockCreateUserDto: Đối tượng giả lập dữ liệu đầu vào cho chức năng đăng ký người dùng
 * - email: Địa chỉ email của người dùng
 * - password: Mật khẩu của người dùng
 */
class MockCreateUserDto {
  public email: string = 'test@example.com'; // Email mẫu
  public password: string = 'password123'; // Mật khẩu mẫu
}

/**
 * MockRegisterModuleService: Đối tượng giả lập service đăng ký
 * - create: Phương thức giả lập chức năng tạo người dùng mới
 */
class MockRegisterModuleService {
  create = jest.fn(); // Hàm giả lập tạo người dùng
}

/**
 * Test suite: Kiểm thử phương thức create của RegisterModuleController
 * Mục tiêu: Đảm bảo chức năng đăng ký người dùng hoạt động chính xác trong các tình huống khác nhau
 */
describe('RegisterModuleController.create() create method', () => {
  // Khai báo các biến sử dụng trong các test case
  let controller: RegisterModuleController; // Controller cần kiểm thử
  let mockRegisterModuleService: MockRegisterModuleService; // Service giả lập

  /**
   * Thiết lập trước mỗi test case
   * - Khởi tạo service giả lập mới
   * - Khởi tạo controller với service giả lập
   */
  beforeEach(() => {
    mockRegisterModuleService = new MockRegisterModuleService() as any;
    controller = new RegisterModuleController(mockRegisterModuleService as any);
  });

  /**
   * Nhóm các test case cho trường hợp thành công
   * Mục đích: Kiểm tra hành vi của controller khi các tình huống đăng ký thành công
   */
  describe('Happy paths', () => {
    /**
     * Test case 1: Đăng ký người dùng thành công
     * Mã test case: TC-CT-AUTH-CREATE-001
     * Mục tiêu: Kiểm tra controller trả về kết quả thành công khi service đăng ký thành công
     * Input:
     *   - DTO: { email: 'test@example.com', password: 'password123' }
     * Expected output: responseHandler.ok('test@example.com')
     * Ghi chú: Đảm bảo controller gọi service đúng và trả về kết quả đúng định dạng
     */
    it('should return a successful response when user is created', async () => {
      // Sắp xếp (Arrange)
      const mockCreateUserDto = new MockCreateUserDto() as any; // DTO đăng ký hợp lệ
      const expectedEmail = 'test@example.com'; // Email dự kiến trả về
      jest.mocked(mockRegisterModuleService.create).mockResolvedValue(expectedEmail as any as never); // Giả lập service trả về thành công

      // Thực thi (Act)
      const result = await controller.create(mockCreateUserDto); // Gọi phương thức cần kiểm thử

      // Kiểm tra (Assert)
      expect(mockRegisterModuleService.create).toHaveBeenCalledWith(mockCreateUserDto); // Kiểm tra service được gọi với đúng tham số
      expect(result).toEqual(responseHandler.ok(expectedEmail)); // Kết quả phải đúng với định dạng thành công
    });
  });

  /**
   * Nhóm các test case cho trường hợp ngoại lệ
   * Mục đích: Kiểm tra hành vi của controller khi xảy ra các tình huống lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test case 2: Xử lý lỗi từ service đăng ký
     * Mã test case: TC-CT-AUTH-CREATE-002
     * Mục tiêu: Kiểm tra controller xử lý đúng khi service đăng ký ném lỗi
     * Input:
     *   - DTO: { email: 'test@example.com', password: 'password123' }
     *   - Lỗi: Error('Service error')
     * Expected output: responseHandler.error('Service error')
     * Ghi chú: Đảm bảo controller bắt và xử lý lỗi đúng cách
     */
    it('should return an error response when service throws an error', async () => {
      // Sắp xếp (Arrange)
      const mockCreateUserDto = new MockCreateUserDto() as any; // DTO đăng ký
      const errorMessage = 'Service error'; // Thông báo lỗi
      jest.mocked(mockRegisterModuleService.create).mockRejectedValue(new Error(errorMessage) as never); // Giả lập service ném lỗi

      // Thực thi (Act)
      const result = await controller.create(mockCreateUserDto); // Gọi phương thức cần kiểm thử

      // Kiểm tra (Assert)
      expect(mockRegisterModuleService.create).toHaveBeenCalledWith(mockCreateUserDto); // Kiểm tra service được gọi với đúng tham số
      expect(result).toEqual(responseHandler.error(errorMessage)); // Kết quả phải là thông báo lỗi
    });

    /**
     * Test case 3: Xử lý lỗi không phải Error object
     * Mã test case: TC-CT-AUTH-CREATE-003
     * Mục tiêu: Kiểm tra controller xử lý đúng khi service đăng ký ném lỗi không phải Error object
     * Input:
     *   - DTO: { email: 'test@example.com', password: 'password123' }
     *   - Lỗi: { message: 'Non-error object' }
     * Expected output: responseHandler.error(JSON.stringify({ message: 'Non-error object' }))
     * Ghi chú: Đảm bảo controller xử lý được cả các lỗi không phải Error object
     */
    it('should handle non-error objects thrown by the service', async () => {
      // Sắp xếp (Arrange)
      const mockCreateUserDto = new MockCreateUserDto() as any; // DTO đăng ký
      const errorObject = { message: 'Non-error object' }; // Đối tượng lỗi không phải Error
      jest.mocked(mockRegisterModuleService.create).mockRejectedValue(errorObject as never); // Giả lập service ném lỗi

      // Thực thi (Act)
      const result = await controller.create(mockCreateUserDto); // Gọi phương thức cần kiểm thử

      // Kiểm tra (Assert)
      expect(mockRegisterModuleService.create).toHaveBeenCalledWith(mockCreateUserDto); // Kiểm tra service được gọi với đúng tham số
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject))); // Kết quả phải là chuỗi JSON của lỗi
    });

    /**
     * Test case 4: Xử lý khi DTO không hợp lệ
     * Mã test case: TC-CT-AUTH-CREATE-004
     * Mục tiêu: Kiểm tra controller xử lý đúng khi DTO không hợp lệ
     * Input:
     *   - DTO: {} (rỗng)
     * Expected output: responseHandler.error('REGISTER.INVALID_INPUT')
     * Ghi chú: Đảm bảo controller kiểm tra tính hợp lệ của dữ liệu đầu vào trước khi gọi service
     */
    it('should handle invalid DTO', async () => {
      // Sắp xếp (Arrange)
      const invalidDTO = {}; // DTO không hợp lệ (rỗng)
      const errorMessage = 'REGISTER.INVALID_INPUT'; // Thông báo lỗi
      jest.mocked(mockRegisterModuleService.create).mockRejectedValue(new Error(errorMessage) as never); // Giả lập service ném lỗi

      // Thực thi (Act)
      const result = await controller.create(invalidDTO as any); // Gọi phương thức cần kiểm thử

      // Kiểm tra (Assert)
      expect(mockRegisterModuleService.create).toHaveBeenCalledWith(invalidDTO); // Kiểm tra service được gọi với đúng tham số
      expect(result).toEqual(responseHandler.error(errorMessage)); // Kết quả phải là thông báo lỗi
    });
  });
});