// Import các module cần thiết từ NestJS và các file liên quan
import { Test, TestingModule } from '@nestjs/testing';
import { LocationUserController } from './location_user.controller';
import { LocationUserService } from './location_user.service';
import { CreateLocationUserDto } from 'src/dto/locationUserDTO/create-location_user.dto';
import { UpdateLocationUserDto } from 'src/dto/locationUserDTO/update-location_user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';

/**
 * Mock các Guard xác thực và phân quyền
 * Bỏ qua việc xác thực để tập trung vào test logic
 */
jest.mock('src/guards/JwtAuth.guard', () => ({
  AuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: () => true,
  })),
}));

// Bỏ qua kiểm tra quyền bằng cách mock RolesGuard
jest.mock('src/guards/Roles.guard', () => ({
  RolesGuard: jest.fn().mockImplementation(() => ({
    canActivate: () => true,
  })),
}));

describe('LocationUserController', () => {
  // Khai báo các biến sử dụng trong test
  let controller: LocationUserController;
  let service: LocationUserService;
  let jwtService: JwtService;

  /**
   * Mock các service được sử dụng trong controller
   * Định nghĩa các phương thức giả lập
   */
  const mockLocationUserService = {
    getList: jest.fn(),
    createLocation: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  /**
   * Cấu hình và khởi tạo module test trước mỗi test case
   * Inject các dependency và override các guard
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationUserController],
      providers: [
        { provide: LocationUserService, useValue: mockLocationUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UserService, useValue: mockUserService },
      ],
    })
      .overrideGuard(AuthGuard) // Ghi đè AuthGuard bằng mock
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard) // Ghi đè RolesGuard bằng mock
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LocationUserController>(LocationUserController);
    service = module.get<LocationUserService>(LocationUserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  /**
   * Dọn dẹp mock sau mỗi test case
   * Đảm bảo không có dữ liệu tồn đọng giữa các test
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Mã: TC-LUC-001
  // Test case: Kiểm tra khởi tạo controller
  // Mục tiêu: Đảm bảo controller và các dependency được khởi tạo đúng
  // Input: Không có
  // Output mong đợi: Các instance được định nghĩa
  it('should be defined', () => {
    expect(controller).toBeDefined(); // Đảm bảo controller đã được tạo thành công
    expect(service).toBeDefined(); // Đảm bảo service đã được inject đúng
    expect(jwtService).toBeDefined(); // Đảm bảo jwtService đã được inject đúng
  });

  // Kiểm tra các chức năng liên quan đến lấy danh sách địa chỉ
  describe('getAllLocation', () => {
    // Mã: TC-LUC-002
    // Test case: Lấy danh sách địa chỉ của người dùng thành công
    // Mục tiêu: Kiểm tra việc lấy danh sách địa chỉ theo user_id
    // Input: user_id hợp lệ
    // Output mong đợi: Danh sách địa chỉ và thông tin tổng số bản ghi
    it('should return locations for a user', async () => {
      const user_id = 'test-user-id';
      const mockLocations = [
        { id: '1', name: 'Location 1', user_id },
        { id: '2', name: 'Location 2', user_id },
      ];

      // Giả lập service trả về danh sách location
      mockLocationUserService.getList.mockResolvedValue({
        data: mockLocations,
        total: 2,
      });

      // Gọi controller
      const result = await controller.getAllLocation(user_id);

      // Kiểm tra gọi đúng tham số
      expect(service.getList).toHaveBeenCalledWith({ user_id });

      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: { data: mockLocations, total: 2 },
      });
    });

    // Mã: TC-LUC-003
    // Test case: Xử lý lỗi khi lấy danh sách địa chỉ
    // Mục tiêu: Kiểm tra xử lý lỗi khi có vấn đề với database
    // Input: user_id hợp lệ
    // Output mong đợi: Thông báo lỗi với status 500
    // Ghi chú: Error path - trường hợp thất bại
    it('should handle errors in getAllLocation', async () => {
      const user_id = 'test-user-id';

      mockLocationUserService.getList.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await controller.getAllLocation(user_id);

      expect(result).toEqual({
        status: 500,
        message: 'Database error',
        success: false,
      });
    });

    // Mã: TC-LUC-004
    // Test case: Xử lý giá trị không phải Error khi lấy danh sách địa chỉ
    // Mục tiêu: Kiểm tra xử lý khi service trả về một object không phải Error
    // Input: user_id hợp lệ
    // Output mong đợi: Thông báo lỗi với status 500, message là JSON string của object
    it('should handle non-Error thrown values', async () => {
      const user_id = 'test-user-id';
      // Mock lỗi là object thường
      mockLocationUserService.getList.mockRejectedValue({ error: 'Some error' });
      const result = await controller.getAllLocation(user_id);
      expect(result).toEqual({
        status: 500,
        message: JSON.stringify({ error: 'Some error' }),
        success: false,
      });
    });

    // Mã: TC-LUC-005
    // Test case: Trả về dữ liệu rỗng khi không có địa chỉ
    // Mục tiêu: Kiểm tra xử lý khi không có địa chỉ nào cho user_id
    // Input: user_id hợp lệ
    // Output mong đợi: Response với data rỗng và total = 0
    it('should return empty data if no locations', async () => {
      const user_id = 'test-user-id';
      mockLocationUserService.getList.mockResolvedValue({ data: [], total: 0 });
      const result = await controller.getAllLocation(user_id);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: { data: [], total: 0 },
      });
    });
  });

  // Kiểm tra các chức năng liên quan đến lấy danh sách địa chỉ (Admin view)
  describe('getAllLocationAdmin', () => {
    // Mã: TC-LUC-006
    // Test case: Admin lấy danh sách địa chỉ thành công
    // Mục tiêu: Kiểm tra chức năng xem danh sách địa chỉ dành cho admin
    // Input: user_id của admin
    // Output mong đợi: Danh sách địa chỉ và tổng số bản ghi
    it('should return locations for admin view', async () => {
      // Dữ liệu mẫu cho test
      const user_id = 'admin-user-id';
      const mockLocations = [
        { id: '1', name: 'Location 1', user_id },
        { id: '2', name: 'Location 2', user_id },
      ];

      mockLocationUserService.getList.mockResolvedValue({
        data: mockLocations,
        total: 2,
      });

      const result = await controller.getAllLocationAdmin(user_id);

      expect(service.getList).toHaveBeenCalledWith({ user_id });

      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: { data: mockLocations, total: 2 },
      });
    });

    // Mã: TC-LUC-007
    // Test case: Xử lý lỗi khi admin lấy danh sách
    // Mục tiêu: Kiểm tra xử lý lỗi trong view admin
    // Input: user_id của admin, service throw Error('Admin access error')
    // Output mong đợi: Thông báo lỗi với status 500, message 'Admin access error'
    it('should handle errors in getAllLocationAdmin', async () => {
      // Dữ liệu mẫu cho test
      const user_id = 'admin-user-id';
      mockLocationUserService.getList.mockRejectedValue(
        new Error('Admin access error'),
      );

      const result = await controller.getAllLocationAdmin(user_id);

      expect(result).toEqual({
        status: 500,
        message: 'Admin access error',
        success: false,
      });
    });

    // Mã: TC-LUC-008
    // Test case: Gọi service với user_id_get chính xác
    // Mục tiêu: Kiểm tra service được gọi với user_id_get đúng
    // Input: user_id_get hợp lệ
    // Output mong đợi: Service được gọi với tham số { user_id: user_id_get }
    it('should call service with correct user_id_get', async () => {
      const user_id_get = 'admin-id-2';
      mockLocationUserService.getList.mockResolvedValue({ data: [], total: 0 });
      await controller.getAllLocationAdmin(user_id_get);
      expect(service.getList).toHaveBeenCalledWith({ user_id: user_id_get });
    });

    // Mã: TC-LUC-009
    // Test case: Xử lý giá trị không phải Error khi admin lấy danh sách
    // Mục tiêu: Kiểm tra xử lý khi service trả về một object không phải Error
    // Input: user_id_get hợp lệ
    // Output mong đợi: Thông báo lỗi với status 500, message là JSON string của object
    it('should handle non-Error thrown values', async () => {
      const user_id_get = 'admin-id-2';
      mockLocationUserService.getList.mockRejectedValue({ error: 'Admin error' });
      const result = await controller.getAllLocationAdmin(user_id_get);
      expect(result).toEqual({
        status: 500,
        message: JSON.stringify({ error: 'Admin error' }),
        success: false,
      });
    });

    // Mã: TC-LUC-010
    // Test case: Xử lý khi service trả về null
    // Mục tiêu: Kiểm tra xử lý khi service không tìm thấy dữ liệu
    // Input: user_id_get hợp lệ
    // Output mong đợi: Response với data là null
    it('should handle service returning null', async () => {
      const user_id_get = 'admin-id-2';
      mockLocationUserService.getList.mockResolvedValue(null);
      const result = await controller.getAllLocationAdmin(user_id_get);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: null,
      });
    });
  });

  // Kiểm tra các chức năng liên quan đến tạo mới địa chỉ
  describe('create', () => {
    // Mã: TC-LUC-011
    // Test case: Tạo mới địa chỉ thành công
    // Mục tiêu: Kiểm tra việc tạo mới địa chỉ với dữ liệu hợp lệ
    // Input: Một đối tượng CreateLocationUserDto chứa đầy đủ các trường thuộc tính
    // Output mong đợi: Thông tin địa chỉ mới được tạo
    it('should create a new location', async () => {
      // Dữ liệu mẫu cho test
      const createDto: CreateLocationUserDto = {
        name: 'New Location',
        address: '123 Street',
        phone: '1234567890',
        default_location: true,
        user_id: 'test-user-id',
      };

      const mockCreatedLocation = { id: '1', ...createDto };

      mockLocationUserService.createLocation.mockResolvedValue(
        mockCreatedLocation,
      );

      const result = await controller.create(createDto);

      expect(service.createLocation).toHaveBeenCalledWith(createDto);

      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockCreatedLocation,
      });
    });

    // Mã: TC-LUC-012
    // Test case: Xử lý lỗi khi tạo địa chỉ
    // Mục tiêu: Kiểm tra xử lý lỗi trong quá trình tạo địa chỉ
    // Input: Một đối tượng CreateLocationUserDto chứa đầy đủ các trường thuộc tính
    // Output mong đợi: Thông báo lỗi với status 500, message 'Creation failed'
    it('should handle errors in create', async () => {
      // Dữ liệu mẫu cho test
      const createDto: CreateLocationUserDto = {
        name: 'New Location',
        address: '123 Street',
        phone: '1234567890',
        default_location: true,
        user_id: 'test-user-id',
      };

      mockLocationUserService.createLocation.mockRejectedValue(
        new Error('Creation failed'),
      );

      const result = await controller.create(createDto);

      expect(result).toEqual({
        status: 500,
        message: 'Creation failed',
        success: false,
      });
    });

    // Mã: TC-LUC-013
    // Test case: Xử lý khi DTO thiếu trường bắt buộc
    // Mục tiêu: Kiểm tra xử lý khi DTO thiếu trường name
    // Input: Một đối tượng CreateLocationUserDto thiếu trường name
    // Output mong đợi: Thông báo lỗi với status 500, message 'Validation failed'
    it('should handle missing required fields in DTO', async () => {
      // DTO thiếu trường name
      const createDto: any = {
        address: '123 Street',
        phone: '1234567890',
        default_location: true,
        user_id: 'test-user-id',
      };
      // Service sẽ trả về lỗi
      mockLocationUserService.createLocation.mockRejectedValue(new Error('Validation failed'));
      const result = await controller.create(createDto);
      expect(result).toEqual({
        status: 500,
        message: 'Validation failed',
        success: false,
      });
    });

    // Mã: TC-LUC-014
    // Test case: Xử lý giá trị không phải Error khi tạo địa chỉ
    // Mục tiêu: Kiểm tra xử lý khi service trả về một object không phải Error
    // Input: Một đối tượng CreateLocationUserDto hợp lệ
    // Output mong đợi: Thông báo lỗi với status 500, message là JSON string của object
    it('should handle non-Error thrown values in create', async () => {
      const createDto: CreateLocationUserDto = {
        name: 'New Location',
        address: '123 Street',
        phone: '1234567890',
        default_location: true,
        user_id: 'test-user-id',
      };
      mockLocationUserService.createLocation.mockRejectedValue({ error: 'Some error' });
      const result = await controller.create(createDto);
      expect(result).toEqual({
        status: 500,
        message: JSON.stringify({ error: 'Some error' }),
        success: false,
      });
    });

    // Mã: TC-LUC-015
    // Test case: Xử lý khi service trả về null khi tạo địa chỉ
    // Mục tiêu: Kiểm tra xử lý khi service không trả về dữ liệu
    // Input: Một đối tượng CreateLocationUserDto hợp lệ
    // Output mong đợi: Response với data là null
    it('should handle service returning null', async () => {
      const createDto: CreateLocationUserDto = {
        name: 'New Location',
        address: '123 Street',
        phone: '1234567890',
        default_location: true,
        user_id: 'test-user-id',
      };
      mockLocationUserService.createLocation.mockResolvedValue(null);
      const result = await controller.create(createDto);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: null,
      });
    });
  });

  // Kiểm tra các chức năng liên quan đến cập nhật địa chỉ
  describe('update', () => {
    // Mã: TC-LUC-016
    // Test case: Cập nhật địa chỉ thành công
    // Mục tiêu: Kiểm tra việc cập nhật thông tin địa chỉ
    // Input: Một đối tượng UpdateLocationUserDto chứa đầy đủ các trường thuộc tính
    // Output mong đợi: Thông tin địa chỉ sau khi cập nhật
    it('should update a location', async () => {
      // Dữ liệu mẫu cho test
      const updateDto: UpdateLocationUserDto = {
        id: '1',
        name: 'Updated Location',
        address: '456 Street',
        phone: '0987654321',
        default_location: false,
        user_id: 'test-user-id',
      };

      const mockUpdatedLocation = { ...updateDto };

      mockLocationUserService.update.mockResolvedValue(mockUpdatedLocation);

      const result = await controller.update(updateDto);

      expect(service.update).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockUpdatedLocation,
      });
    });

    // Mã: TC-LUC-017
    // Test case: Xử lý lỗi khi cập nhật địa chỉ
    // Mục tiêu: Kiểm tra xử lý lỗi trong quá trình cập nhật
    // Input: Một đối tượng UpdateLocationUserDto chứa đầy đủ các trường thuộc tính
    // Output mong đợi: Thông báo lỗi với status 500, message 'Update failed'
    it('should handle errors in update', async () => {
      // Dữ liệu mẫu cho test
      const updateDto: UpdateLocationUserDto = {
        id: '1',
        name: 'Updated Location',
        address: '456 Street',
        phone: '0987654321',
        default_location: false,
        user_id: 'test-user-id',
      };

      mockLocationUserService.update.mockRejectedValue(
        new Error('Update failed'),
      );

      const result = await controller.update(updateDto);

      expect(result).toEqual({
        status: 500,
        message: 'Update failed',
        success: false,
      });
    });

    // Mã: TC-LUC-018
    // Test case: Xử lý giá trị không phải Error khi cập nhật địa chỉ
    // Mục tiêu: Kiểm tra xử lý khi service trả về một object không phải Error
    // Input: Một đối tượng UpdateLocationUserDto hợp lệ
    // Output mong đợi: Thông báo lỗi với status 500, message là JSON string của object
    it('should handle non-Error thrown values in update', async () => {
      const updateDto: UpdateLocationUserDto = {
        id: '1',
        name: 'Updated Location',
        address: '456 Street',
        phone: '0987654321',
        default_location: false,
        user_id: 'test-user-id',
      };
      mockLocationUserService.update.mockRejectedValue({ error: 'Update error' });
      const result = await controller.update(updateDto);
      expect(result).toEqual({
        status: 500,
        message: JSON.stringify({ error: 'Update error' }),
        success: false,
      });
    });

    // Mã: TC-LUC-019
    // Test case: Xử lý khi service trả về null khi cập nhật địa chỉ
    // Mục tiêu: Kiểm tra xử lý khi service không trả về dữ liệu
    // Input: Một đối tượng UpdateLocationUserDto hợp lệ
    // Output mong đợi: Response với data là null
    it('should handle service returning null', async () => {
      const updateDto: UpdateLocationUserDto = {
        id: '1',
        name: 'Updated Location',
        address: '456 Street',
        phone: '0987654321',
        default_location: false,
        user_id: 'test-user-id',
      };
      mockLocationUserService.update.mockResolvedValue(null);
      const result = await controller.update(updateDto);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: null,
      });
    });
  });

  // Kiểm tra các chức năng liên quan đến xóa địa chỉ
  describe('remove', () => {
    // Mã: TC-LUC-020
    // Test case: Xóa địa chỉ thành công
    // Mục tiêu: Kiểm tra việc xóa địa chỉ
    // Input: ID địa chỉ cần xóa
    // Output mong đợi: Kết quả xóa thành công
    it('should delete a location', async () => {
      // Dữ liệu mẫu cho test
      const locationId = 'test-location-id';
      const mockDeleteResult = { affected: 1 };

      mockLocationUserService.delete.mockResolvedValue(mockDeleteResult);

      const result = await controller.remove(locationId);

      expect(service.delete).toHaveBeenCalledWith(locationId);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockDeleteResult,
      });
    });

    // Mã: TC-LUC-021
    // Test case: Xử lý lỗi khi xóa địa chỉ
    // Mục tiêu: Kiểm tra xử lý lỗi trong quá trình xóa
    // Input: ID địa chỉ cần xóa, service throw Error('Delete failed')
    // Output mong đợi: Thông báo lỗi với status 500, message 'Delete failed'
    it('should handle errors in delete', async () => {
      // Dữ liệu mẫu cho test
      const locationId = 'test-location-id';
      mockLocationUserService.delete.mockRejectedValue(
        new Error('Delete failed'),
      );

      const result = await controller.remove(locationId);

      expect(result).toEqual({
        status: 500,
        message: 'Delete failed',
        success: false,
      });
    });

    // Mã: TC-LUC-022
    // Test case: Xử lý khi xóa địa chỉ không tồn tại
    // Mục tiêu: Kiểm tra xử lý khi địa chỉ cần xóa không tồn tại
    // Input: ID địa chỉ không tồn tại
    // Output mong đợi: Response với affected = 0
    it('should handle deleting non-existent location', async () => {
      const locationId = 'not-exist-id';
      mockLocationUserService.delete.mockResolvedValue({ affected: 0 });
      const result = await controller.remove(locationId);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: { affected: 0 },
      });
    });

    // Mã: TC-LUC-023
    // Test case: Xử lý giá trị không phải Error khi xóa địa chỉ
    // Mục tiêu: Kiểm tra xử lý khi service trả về một object không phải Error
    // Input: ID địa chỉ cần xóa
    // Output mong đợi: Thông báo lỗi với status 500, message là JSON string của object
    it('should handle non-Error thrown values in remove', async () => {
      const locationId = 'test-location-id';
      mockLocationUserService.delete.mockRejectedValue({ error: 'Remove error' });
      const result = await controller.remove(locationId);
      expect(result).toEqual({
        status: 500,
        message: JSON.stringify({ error: 'Remove error' }),
        success: false,
      });
    });

    // Mã: TC-LUC-024
    // Test case: Xử lý khi service trả về undefined khi xóa địa chỉ
    // Mục tiêu: Kiểm tra xử lý khi service không trả về dữ liệu
    // Input: ID địa chỉ cần xóa
    // Output mong đợi: Response với data là undefined
    it('should handle service returning undefined', async () => {
      const locationId = 'test-location-id';
      mockLocationUserService.delete.mockResolvedValue(undefined);
      const result = await controller.remove(locationId);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: undefined,
      });
    });
  });
});