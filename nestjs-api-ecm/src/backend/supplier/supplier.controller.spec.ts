import { Test, TestingModule } from '@nestjs/testing';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';
import { responseHandler } from 'src/Until/responseUtil';
import { CreateSupplierDto } from 'src/dto/supplierDTO/create-supplier.dto';
import { UpdateSupplierDto } from 'src/dto/supplierDTO/update-supplier.dto';
import { SearchSupplierDto } from 'src/dto/supplierDTO/search-supplier.dto';

describe('SupplierController', () => {
  let controller: SupplierController;
  let service: SupplierService;

  const mockSupplierService = {
    getList: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierController],
      providers: [
        {
          provide: SupplierService,
          useValue: mockSupplierService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<SupplierController>(SupplierController);
    service = module.get<SupplierService>(SupplierService);

    jest.clearAllMocks();
  });

  // Mã: TC-SC-001
  // Test case: Kiểm tra service được định nghĩa
  // Mục tiêu: Đảm bảo rằng SupplierService được inject và định nghĩa trong controller
  // Input: Không có
  // Output mong đợi: service phải được định nghĩa (không undefined)
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Kiểm tra các chức năng liên quan đến lấy danh sách nhà cung cấp
  describe('getList', () => {
    // Mã: TC-SC-002
    // Test case: Lấy danh sách nhà cung cấp
    // Mục tiêu: Kiểm tra controller trả về danh sách nhà cung cấp từ service
    // Input: page = 1, limit = 10
    // Output mong đợi: Response với danh sách nhà cung cấp (có thể rỗng) được bọc trong responseHandler.ok
    it('should return a list of suppliers', async () => {
      const result = { data: [], total: 0, page: 1, limit: 10 };
      mockSupplierService.getList.mockResolvedValue(result);

      const response = await controller.getList(1, 10);
      expect(service.getList).toHaveBeenCalledWith(1, 10, {});
      expect(response).toEqual(responseHandler.ok(result));
    });

    // Mã: TC-SC-003
    // Test case: Xử lý lỗi khi lấy danh sách nhà cung cấp
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw Error
    // Input: page = 1, limit = 10, service throw Error('fail')
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message 'fail'
    it('should handle errors', async () => {
      mockSupplierService.getList.mockRejectedValue(new Error('fail'));
      const response = await controller.getList(1, 10);
      expect(response).toEqual(responseHandler.error('fail'));
    });

    // Mã: TC-SC-004
    // Test case: Xử lý giá trị không phải Error khi lấy danh sách
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw một object không phải Error
    // Input: page = 1, limit = 10, service throw { msg: 'fail' }
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message là JSON string của object
    it('should handle non-Error thrown values', async () => {
      mockSupplierService.getList.mockRejectedValue({ msg: 'fail' });
      const response = await controller.getList(1, 10);
      expect(response).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
    });
  });

  // Kiểm tra các chức năng liên quan đến tìm kiếm nhà cung cấp theo bộ lọc
  describe('getAllBySearch', () => {
    // Mã: TC-SC-005
    // Test case: Lấy danh sách nhà cung cấp theo bộ lọc
    // Mục tiêu: Kiểm tra controller trả về danh sách nhà cung cấp được lọc theo tiêu chí tìm kiếm
    // Input: page = 1, limit = 10, searchDto = { name: 'test', phone: '0123456789' }
    // Output mong đợi: Response với danh sách nhà cung cấp được bọc trong responseHandler.ok
    it('should return filtered suppliers', async () => {
      const result = { data: [], total: 0, page: 1, limit: 10 };
      mockSupplierService.getList.mockResolvedValue(result);

      const searchDto: SearchSupplierDto = { name: 'test', phone: '0123456789' };
      const response = await controller.getAllBySearch(1, 10, searchDto);
      expect(service.getList).toHaveBeenCalledWith(1, 10, { name: 'test', phone: '0123456789' });
      expect(response).toEqual(responseHandler.ok(result));
    });

    // Mã: TC-SC-006
    // Test case: Xử lý lỗi khi tìm kiếm nhà cung cấp
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw Error trong quá trình tìm kiếm
    // Input: page = 1, limit = 10, searchDto = { name: 'test' }, service throw Error('fail')
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message 'fail'
    it('should handle errors', async () => {
      mockSupplierService.getList.mockRejectedValue(new Error('fail'));
      const response = await controller.getAllBySearch(1, 10, { name: 'test' });
      expect(response).toEqual(responseHandler.error('fail'));
    });

    // Mã: TC-SC-007
    // Test case: Xử lý giá trị không phải Error khi tìm kiếm
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw một object không phải Error
    // Input: page = 1, limit = 10, searchDto = { name: 'test' }, service throw { msg: 'fail' }
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message là JSON string của object
    it('should handle non-Error thrown values', async () => {
      mockSupplierService.getList.mockRejectedValue({ msg: 'fail' });
      const response = await controller.getAllBySearch(1, 10, { name: 'test' });
      expect(response).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
    });
  });

  // Kiểm tra các chức năng liên quan đến tạo mới nhà cung cấp
  describe('create', () => {
    // Mã: TC-SC-008
    // Test case: Tạo mới nhà cung cấp
    // Mục tiêu: Kiểm tra controller tạo mới nhà cung cấp thành công thông qua service
    // Input: CreateSupplierDto với name, url_image, phone, address
    // Output mong đợi: Response với thông tin nhà cung cấp được tạo, bọc trong responseHandler.ok
    it('should create a supplier', async () => {
      const dto: CreateSupplierDto = {
        name: 'test',
        url_image: 'test@example.com',
        phone: '0123456789',
        address: 'address',
      };
      const result = { id: '1', ...dto };
      mockSupplierService.create.mockResolvedValue(result);

      const response = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(response).toEqual(responseHandler.ok(result));
    });

    // Mã: TC-SC-009
    // Test case: Xử lý lỗi khi tạo nhà cung cấp
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw Error trong quá trình tạo
    // Input: CreateSupplierDto, service throw Error('fail')
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message 'fail'
    it('should handle errors', async () => {
      mockSupplierService.create.mockRejectedValue(new Error('fail'));
      const response = await controller.create({
        name: 'test',
        url_image: 'test@example.com',
        phone: '0123456789',
        address: 'address',
      });
      expect(response).toEqual(responseHandler.error('fail'));
    });

    // Mã: TC-SC-010
    // Test case: Xử lý giá trị không phải Error khi tạo nhà cung cấp
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw một object không phải Error
    // Input: CreateSupplierDto, service throw { msg: 'fail' }
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message là JSON string của object
    it('should handle non-Error thrown values', async () => {
      mockSupplierService.create.mockRejectedValue({ msg: 'fail' });
      const response = await controller.create({
        name: 'test',
        url_image: 'test@example.com',
        phone: '0123456789',
        address: 'address',
      });
      expect(response).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
    });
  });

  // Kiểm tra các chức năng liên quan đến lấy thông tin chi tiết nhà cung cấp
  describe('findOne', () => {
    // Mã: TC-SC-011
    // Test case: Lấy thông tin nhà cung cấp theo ID
    // Mục tiêu: Kiểm tra controller trả về thông tin nhà cung cấp dựa trên ID
    // Input: id = '1'
    // Output mong đợi: Response với thông tin nhà cung cấp được bọc trong responseHandler.ok
    it('should return a supplier by id', async () => {
      const result = { id: '1', name: 'test' };
      mockSupplierService.findOne.mockResolvedValue(result);

      const response = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(response).toEqual(responseHandler.ok(result));
    });

    // Mã: TC-SC-012
    // Test case: Xử lý lỗi khi lấy chi tiết nhà cung cấp
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw Error
    // Input: id = '1', service throw Error('fail')
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message 'fail'
    it('should handle errors', async () => {
      mockSupplierService.findOne.mockRejectedValue(new Error('fail'));
      const response = await controller.findOne('1');
      expect(response).toEqual(responseHandler.error('fail'));
    });

    // Mã: TC-SC-013
    // Test case: Xử lý giá trị không phải Error khi lấy chi tiết
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw một object không phải Error
    // Input: id = '1', service throw { msg: 'fail' }
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message là JSON string của object
    it('should handle non-Error thrown values', async () => {
      mockSupplierService.findOne.mockRejectedValue({ msg: 'fail' });
      const response = await controller.findOne('1');
      expect(response).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
    });
  });

  // Kiểm tra các chức năng liên quan đến cập nhật nhà cung cấp
  describe('update', () => {
    // Mã: TC-SC-014
    // Test case: Cập nhật thông tin nhà cung cấp
    // Mục tiêu: Kiểm tra controller cập nhật nhà cung cấp thành công thông qua service
    // Input: id = '1', UpdateSupplierDto với id, name, url_image, phone, address
    // Output mong đợi: Response với thông tin nhà cung cấp đã cập nhật, bọc trong responseHandler.ok
    it('should update a supplier', async () => {
      const dto: UpdateSupplierDto = {
        id: '1',
        name: 'test',
        url_image: 'test@example.com',
        phone: '0123456789',
        address: 'address',
      };
      const result = { ...dto };
      mockSupplierService.update.mockResolvedValue(result);

      const response = await controller.update('1', dto);
      expect(service.update).toHaveBeenCalledWith(dto, '1');
      expect(response).toEqual(responseHandler.ok(result));
    });

    // Mã: TC-SC-015
    // Test case: Xử lý lỗi khi cập nhật nhà cung cấp
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw Error trong quá trình cập nhật
    // Input: id = '1', UpdateSupplierDto, service throw Error('fail')
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message 'fail'
    it('should handle errors', async () => {
      mockSupplierService.update.mockRejectedValue(new Error('fail'));
      const response = await controller.update('1', {
        id: '1',
        name: 'test',
        url_image: 'test@example.com',
        phone: '0123456789',
        address: 'address',
      });
      expect(response).toEqual(responseHandler.error('fail'));
    });

    // Mã: TC-SC-016
    // Test case: Xử lý giá trị không phải Error khi cập nhật
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw một object không phải Error
    // Input: id = '1', UpdateSupplierDto, service throw { msg: 'fail' }
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message là JSON string của object
    it('should handle non-Error thrown values', async () => {
      mockSupplierService.update.mockRejectedValue({ msg: 'fail' });
      const response = await controller.update('1', {
        id: '1',
        name: 'test',
        url_image: 'test@example.com',
        phone: '0123456789',
        address: 'address',
      });
      expect(response).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
    });
  });

  // Kiểm tra các chức năng liên quan đến xóa nhà cung cấp
  describe('remove', () => {
    // Mã: TC-SC-017
    // Test case: Xóa nhà cung cấp
    // Mục tiêu: Kiểm tra controller xóa nhà cung cấp thành công thông qua service
    // Input: id = '1'
    // Output mong đợi: Response với thông tin nhà cung cấp đã xóa, bọc trong responseHandler.ok
    it('should delete a supplier', async () => {
      const result = { id: '1' };
      mockSupplierService.delete.mockResolvedValue(result);

      const response = await controller.remove('1');
      expect(service.delete).toHaveBeenCalledWith('1');
      expect(response).toEqual(responseHandler.ok(result));
    });

    // Mã: TC-SC-018
    // Test case: Xử lý lỗi khi xóa nhà cung cấp
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw Error trong quá trình xóa
    // Input: id = '1', service throw Error('fail')
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message 'fail'
    it('should handle errors', async () => {
      mockSupplierService.delete.mockRejectedValue(new Error('fail'));
      const response = await controller.remove('1');
      expect(response).toEqual(responseHandler.error('fail'));
    });

    // Mã: TC-SC-019
    // Test case: Xử lý giá trị không phải Error khi xóa
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw một object không phải Error
    // Input: id = '1', service throw { msg: 'fail' }
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message là JSON string của object
    it('should handle non-Error thrown values', async () => {
      mockSupplierService.delete.mockRejectedValue({ msg: 'fail' });
      const response = await controller.remove('1');
      expect(response).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
    });
  });
});