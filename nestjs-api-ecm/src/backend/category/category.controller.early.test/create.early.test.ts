/**
 * File: create.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức create của CategoryController
 * Module: Category
 * Chức năng: Kiểm tra chức năng tạo danh mục mới
 * Ngày tạo: 2023
 */

import { CategoryService } from 'src/backend/category/category.service';
import { responseHandler } from 'src/Until/responseUtil';
import { CategoryController } from '../category.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/backend/user/user.service';

/**
 * Mock DTO cho việc tạo danh mục mới
 * Chứa các thông tin cần thiết để tạo danh mục
 */
class MockCategoryCreateDTO {
  public name: string = 'Test Category';       // Tên danh mục
  public description: string = 'Test Description'; // Mô tả danh mục
}

/**
 * Mock Service cho CategoryService
 * Giả lập các phương thức của service để kiểm soát hành vi trong quá trình test
 */
class MockCategoryService {
  create = jest.fn(); // Phương thức tạo danh mục mới
}

/**
 * Mock các guard và service cần thiết cho AuthGuard
 */
class MockJwtService {
  verifyAsync = jest.fn().mockResolvedValue({ id: 'user-id', role: 'admin' });
}

class MockUserService {
  findOne = jest.fn().mockResolvedValue({ isActive: true, token: 'valid-token', role: 'admin' });
}

class MockConfigService {
  get = jest.fn().mockReturnValue('jwt-secret');
}

/**
 * Test Suite: CategoryController.create() create method
 * Mô tả: Kiểm thử chức năng tạo danh mục mới của CategoryController
 */
describe('CategoryController.create() create method', () => {
  // Khai báo các biến sử dụng trong test
  let categoryController: CategoryController;     // Controller cần test
  let mockCategoryService: MockCategoryService;   // Mock service

  /**
   * Thiết lập môi trường test trước mỗi test case
   * Khởi tạo các mock objects và controller cần test sử dụng NestJS Testing Module
   */
  beforeEach(async () => {
    // Tạo testing module với các controller và provider cần thiết
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController], // Đăng ký controller cần test
      providers: [
        {
          provide: CategoryService, // Đăng ký provider cho CategoryService
          useClass: MockCategoryService, // Sử dụng lớp mock thay thế
        },
        {
          provide: JwtService, // Đăng ký provider cho JwtService
          useClass: MockJwtService, // Sử dụng lớp mock thay thế
        },
        {
          provide: UserService, // Đăng ký provider cho UserService
          useClass: MockUserService, // Sử dụng lớp mock thay thế
        },
        {
          provide: ConfigService, // Đăng ký provider cho ConfigService
          useClass: MockConfigService, // Sử dụng lớp mock thay thế
        },
      ],
    })
    .overrideGuard(AuthGuard) // Ghi đè AuthGuard
    .useValue({ canActivate: () => true }) // Cho phép tất cả các request
    .overrideGuard(RolesGuard) // Ghi đè RolesGuard
    .useValue({ canActivate: () => true }) // Cho phép tất cả các role
    .compile(); // Biên dịch module

    // Lấy các instance từ module đã tạo
    categoryController = module.get<CategoryController>(CategoryController);
    mockCategoryService = module.get<CategoryService>(CategoryService) as any;
  });

  /**
   * Test Group: Happy paths
   * Mô tả: Các test case cho trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * Test Case ID: TC-CT-CATEGORY-CREATE-001
     * Mục tiêu: Kiểm tra việc tạo danh mục mới thành công
     * Input:
     *   - categoryCreateDTO:
     *     + name: "Test Category" - Tên danh mục
     *     + description: "Test Description" - Mô tả danh mục
     *   - Service trả về: { id: 1, name: "Test Category", description: "Test Description" }
     * Expected Output:
     *   - Object: responseHandler.ok({ id: 1, name: "Test Category", description: "Test Description" })
     *   - Service.create được gọi với tham số đúng là mockCategoryCreateDTO
     * Ghi chú: Controller phải gọi service đúng và trả về kết quả thành công
     */
    it('should create a category successfully', async () => {
      // Sắp xếp (Arrange)
      const mockCategoryCreateDTO = new MockCategoryCreateDTO() as any; // DTO tạo danh mục
      const mockCategory = { id: 1, ...mockCategoryCreateDTO }; // Danh mục đã tạo với ID
      jest.mocked(mockCategoryService.create).mockResolvedValue(mockCategory as any as never); // Giả lập service trả về danh mục đã tạo

      // Thực thi (Act)
      const result = await categoryController.create(mockCategoryCreateDTO); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCategoryService.create).toHaveBeenCalledWith(mockCategoryCreateDTO); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.ok(mockCategory)); // Kiểm tra kết quả trả về đúng định dạng
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-CT-CATEGORY-CREATE-002
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi Error
     * Input:
     *   - categoryCreateDTO:
     *     + name: "Test Category" - Tên danh mục
     *     + description: "Test Description" - Mô tả danh mục
     *   - Service ném lỗi: Error("Service error")
     * Expected Output:
     *   - Object: responseHandler.error("Service error")
     *   - Service.create được gọi với tham số đúng là mockCategoryCreateDTO
     * Ghi chú: Controller phải bắt và xử lý lỗi Error đúng cách
     */
    it('should handle service errors gracefully', async () => {
      // Sắp xếp (Arrange)
      const mockCategoryCreateDTO = new MockCategoryCreateDTO() as any; // DTO tạo danh mục
      const errorMessage = 'Service error'; // Thông báo lỗi
      jest.mocked(mockCategoryService.create).mockRejectedValue(new Error(errorMessage) as never); // Giả lập service ném lỗi

      // Thực thi (Act)
      const result = await categoryController.create(mockCategoryCreateDTO); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCategoryService.create).toHaveBeenCalledWith(mockCategoryCreateDTO); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.error(errorMessage)); // Kiểm tra kết quả trả về là thông báo lỗi
    });

    /**
     * Test Case ID: TC-CT-CATEGORY-CREATE-003
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi không phải Error (object lỗi)
     * Input:
     *   - categoryCreateDTO:
     *     + name: "Test Category" - Tên danh mục
     *     + description: "Test Description" - Mô tả danh mục
     *   - Service ném lỗi: { message: "Unexpected error" }
     * Expected Output:
     *   - Object: responseHandler.error(JSON.stringify({ message: "Unexpected error" }))
     *   - Service.create được gọi với tham số đúng là mockCategoryCreateDTO
     * Ghi chú: Controller phải bắt và xử lý cả các lỗi không phải Error
     */
    it('should handle non-error exceptions gracefully', async () => {
      // Sắp xếp (Arrange)
      const mockCategoryCreateDTO = new MockCategoryCreateDTO() as any; // DTO tạo danh mục
      const errorObject = { message: 'Unexpected error' }; // Đối tượng lỗi
      jest.mocked(mockCategoryService.create).mockRejectedValue(errorObject as never); // Giả lập service ném đối tượng lỗi

      // Thực thi (Act)
      const result = await categoryController.create(mockCategoryCreateDTO); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCategoryService.create).toHaveBeenCalledWith(mockCategoryCreateDTO); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject))); // Kiểm tra kết quả trả về là chuỗi JSON của đối tượng lỗi
    });
  });
});