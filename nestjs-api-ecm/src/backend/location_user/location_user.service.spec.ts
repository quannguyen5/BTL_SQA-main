// Import các module cần thiết từ NestJS và các file liên quan
import { Test, TestingModule } from '@nestjs/testing';
import { LocationUserService } from './location_user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Location_userEntity } from 'src/entities/user_entity/location_user.entity';
import { CreateLocationUserDto } from 'src/dto/locationUserDTO/create-location_user.dto';
import { UpdateLocationUserDto } from 'src/dto/locationUserDTO/update-location_user.dto';

/**
 * Test Suite cho LocationUserService
 * Mục đích: Kiểm tra các chức năng của service quản lý địa chỉ người dùng
 */
describe('LocationUserService', () => {
  // Khai báo các biến sử dụng trong test
  let service: LocationUserService; // Service cần test
  let mockLocationUserRepository: any; // Repository giả lập

  /**
   * Cấu hình và khởi tạo môi trường test trước mỗi test case
   */
  beforeEach(async () => {
    // Tạo mock repository với các phương thức cần thiết
    mockLocationUserRepository = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Khởi tạo testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationUserService,
        {
          provide: getRepositoryToken(Location_userEntity),
          useValue: mockLocationUserRepository,
        },
      ],
    }).compile();

    service = module.get<LocationUserService>(LocationUserService);
  });

  /**
   * Mã: TC-LUs-001
   * Test case: Kiểm tra khởi tạo service
   * Mục tiêu: Đảm bảo service được khởi tạo thành công
   * Input: Không có
   * Output mong đợi: Service được định nghĩa
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * Nhóm test cho chức năng lấy danh sách địa chỉ
   */
  describe('getList', () => {
    /**
     * Mã: TC-LUs-002
     * Test case: Lấy danh sách địa chỉ theo user_id
     * Mục tiêu: Kiểm tra việc lọc địa chỉ theo ID người dùng
     * Input: user_id = '123'
     * Output mong đợi: Danh sách địa chỉ và tổng số bản ghi
     */
    it('should return list with user_id filter', async () => {
      const mockLocations = [{ id: '1', name: 'Location 1' }];
      const mockTotal = 1;
      mockLocationUserRepository.findAndCount.mockResolvedValue([
        mockLocations,
        mockTotal,
      ]);

      const result = await service.getList({ user_id: '123' });

      expect(result).toEqual({
        data: mockLocations,
        total: mockTotal,
      });
      expect(mockLocationUserRepository.findAndCount).toHaveBeenCalledWith({
        where: { user_id: '123' },
      });
    });

    /**
     * Mã: TC-LUs-003
     * Test case: Lấy danh sách địa chỉ mặc định
     * Mục tiêu: Kiểm tra việc lọc địa chỉ mặc định
     * Input: default_location = true
     * Output mong đợi: Danh sách địa chỉ mặc định và tổng số bản ghi
     */
    it('should return list with default_location filter', async () => {
      const mockLocations = [{ id: '1', name: 'Location 1' }];
      const mockTotal = 1;
      mockLocationUserRepository.findAndCount.mockResolvedValue([
        mockLocations,
        mockTotal,
      ]);

      const result = await service.getList({ default_location: true });

      expect(result).toEqual({
        data: mockLocations,
        total: mockTotal,
      });
      expect(mockLocationUserRepository.findAndCount).toHaveBeenCalledWith({
        where: { default_location: true },
      });
    });

    /**
     * Mã: TC-LUs-004
     * Test case: Lấy danh sách khi không có địa chỉ nào
     * Mục tiêu: Kiểm tra xử lý lỗi khi không tìm thấy địa chỉ
     * Input: Không có điều kiện lọc
     * Output mong đợi: Ném ra lỗi 'NO LOCATION!'
     */
    it('should throw error when no locations found', async () => {
      mockLocationUserRepository.findAndCount.mockResolvedValue([null, 0]);

      await expect(service.getList({})).rejects.toThrow('NO LOCATION!');
    });
  });

  /**
   * Nhóm test cho chức năng tạo địa chỉ mới
   */
  describe('createLocation', () => {
    /**
     * Mã: TC-LUs-005
     * Test case: Tạo địa chỉ mới không phải địa chỉ mặc định
     * Mục tiêu: Kiểm tra việc tạo địa chỉ thông thường
     * Input: đối tượng CreateLocationUserDto đầy đủ các trường thuộc tính, với default_location = false
     * Output mong đợi: Địa chỉ mới được tạo thành công
     */
    it('should create location without updating default location', async () => {
      const createDto: CreateLocationUserDto = {
        name: 'New Location',
        address: '123 Street',
        phone: '1234567890',
        default_location: false,
        user_id: '123',
      };

      const mockLocation = { ...createDto, id: '1' };
      mockLocationUserRepository.create.mockReturnValue(mockLocation);
      mockLocationUserRepository.save.mockResolvedValue(mockLocation);
      // Mock for checking default location
      mockLocationUserRepository.findOne.mockResolvedValueOnce(null);
      // Mock for checking existing record
      mockLocationUserRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.createLocation(createDto);

      expect(result).toEqual(mockLocation);
    });

    /**
     * Mã: TC-LUs-006
     * Test case: Tạo địa chỉ mặc định mới
     * Mục tiêu: Kiểm tra việc cập nhật địa chỉ mặc định cũ khi tạo địa chỉ mặc định mới
     * Input: đối tượng CreateLocationUserDtođầy đủ các trường thuộc tính, với default_location = true
     * Output mong đợi: Địa chỉ mới được tạo và địa chỉ mặc định cũ được cập nhật
     */
    it('should create location and update existing default location', async () => {
      const createDto: CreateLocationUserDto = {
        name: 'New Location',
        address: '123 Street',
        phone: '1234567890',
        default_location: true,
        user_id: '123',
      };

      const existingLocation = {
        id: '2',
        default_location: true,
        user_id: '123',
      };

      const mockLocation = { ...createDto, id: '1' };
      mockLocationUserRepository.create.mockReturnValue(mockLocation);
      mockLocationUserRepository.save.mockResolvedValue(mockLocation);

      // Mock for checking default location
      mockLocationUserRepository.findOne
        .mockResolvedValueOnce(existingLocation) // For updateDefaultMethod
        .mockResolvedValueOnce(null); // For create method's existence check

      mockLocationUserRepository.findOneBy.mockResolvedValue(existingLocation);

      const result = await service.createLocation(createDto);

      expect(result).toEqual(mockLocation);
      expect(mockLocationUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          default_location: true,
          user_id: '123',
        },
      });
    });
  });

  /**
   * Nhóm test cho chức năng xem chi tiết địa chỉ
   */
  describe('detail', () => {
    /**
     * Mã: TC-LUs-007
     * Test case: Lấy thông tin chi tiết địa chỉ
     * Mục tiêu: Kiểm tra việc lấy thông tin một địa chỉ cụ thể
     * Input: ID của địa chỉ
     * Output mong đợi: Thông tin chi tiết của địa chỉ
     */
    it('should return location details', async () => {
      const mockLocation = { id: '1', name: 'Test Location' };
      mockLocationUserRepository.findOneBy.mockResolvedValue(mockLocation);

      const result = await service.detail('1');
      expect(result).toEqual(mockLocation);
    });

    /**
     * Mã: TC-LUs-008
     * Test case: Lấy thông tin địa chỉ không tồn tại
     * Mục tiêu: Kiểm tra xử lý lỗi khi không tìm thấy địa chỉ
     * Input: ID không tồn tại
     * Output mong đợi: Ném ra lỗi 'RECORD NOT FOUND!'
     */
    it('should throw error when location not found', async () => {
      mockLocationUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.detail('1')).rejects.toThrow('RECORD NOT FOUND!');
    });
  });

  /**
   * Nhóm test cho chức năng cập nhật địa chỉ
   */
  describe('update', () => {
    /**
     * Mã: TC-LUs-009
     * Test case: Cập nhật địa chỉ không thay đổi trạng thái mặc định
     * Mục tiêu: Kiểm tra việc cập nhật thông tin địa chỉ bình thường
     * Input: đối tượng UpdateLocationUserDto đầy đủ các trường thuộc tính, với default_location = false
     * Output mong đợi: Thông tin địa chỉ được cập nhật
     */
    it('should update location without changing default status', async () => {
      const updateDto: UpdateLocationUserDto = {
        id: '1',
        name: 'Updated Location',
        default_location: false,
        user_id: '123',
      };

      const mockLocation = { ...updateDto };
      mockLocationUserRepository.findOneBy.mockResolvedValue(mockLocation);
      mockLocationUserRepository.save.mockResolvedValue(mockLocation);

      const result = await service.update(updateDto);
      expect(result).toEqual(mockLocation);
    });

    /**
     * Mã: TC-LUs-010
     * Test case: Cập nhật địa chỉ thành địa chỉ mặc định
     * Mục tiêu: Kiểm tra việc xử lý khi thay đổi địa chỉ mặc định
     * Input: đối tượng UpdateLocationUserDto đầy đủ các trường thuộc tính, với default_location = true
     * Output mong đợi: Địa chỉ được cập nhật và địa chỉ mặc định cũ được cập nhật
     */
    it('should update location and handle default location changes', async () => {
      const updateDto: UpdateLocationUserDto = {
        id: '1',
        name: 'Updated Location',
        default_location: true,
        user_id: '123',
      };

      const existingLocation = {
        id: '2',
        default_location: true,
        user_id: '123',
      };

      const mockLocation = { ...updateDto };
      mockLocationUserRepository.findOneBy.mockResolvedValue(mockLocation);
      mockLocationUserRepository.findOne.mockResolvedValue(existingLocation);
      mockLocationUserRepository.save.mockResolvedValue(mockLocation);

      const result = await service.update(updateDto);
      expect(result).toEqual(mockLocation);
    });
  });

  /**
   * Nhóm test cho chức năng xóa địa chỉ
   */
  describe('delete', () => {
    /**
     * Mã: TC-LUs-011
     * Test case: Xóa địa chỉ
     * Mục tiêu: Kiểm tra chức năng xóa địa chỉ
     * Input: ID của địa chỉ cần xóa
     * Output mong đợi: Địa chỉ được xóa thành công
     */
    it('should delete location', async () => {
      const mockLocation = { id: '1', name: 'Test Location' };
      mockLocationUserRepository.findOneBy.mockResolvedValue(mockLocation);
      mockLocationUserRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete('1');

      expect(mockLocationUserRepository.findOneBy).toHaveBeenCalledWith({
        id: '1',
      });
      expect(mockLocationUserRepository.delete).toHaveBeenCalledWith('1');
    });

    /**
     * Mã: TC-LUs-012
     * Test case: Xóa địa chỉ không tồn tại
     * Mục tiêu: Kiểm tra xử lý lỗi khi xóa địa chỉ không tồn tại trong hệ thống
     * Input: 
     * - ID địa chỉ không tồn tại ('1')
     * - Mock findOneBy trả về null (giả lập không tìm thấy địa chỉ)
     * Output mong đợi: Ném ra lỗi với message 'RECORD NOT FOUND!'
     */
    it('should throw error when location not found', async () => {
      // Giả lập trường hợp không tìm thấy địa chỉ trong database
      mockLocationUserRepository.findOneBy.mockResolvedValue(null);

      // Kiểm tra việc service ném ra lỗi khi xóa địa chỉ không tồn tại
      await expect(service.delete('1')).rejects.toThrow('RECORD NOT FOUND!');
    });
  });
});
