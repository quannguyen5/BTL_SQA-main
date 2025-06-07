import { Test, TestingModule } from '@nestjs/testing';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { CreateImportDTO } from 'src/dto/importDTO/import.create.dto';
import { UpdateImpotyDTO } from 'src/dto/importDTO/import.update.dto';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';

/**
 * Mock các Guard xác thực và phân quyền
 */
const mockAuthGuard = { canActivate: jest.fn(() => true) };
const mockRolesGuard = { canActivate: jest.fn(() => true) };

describe('ImportController', () => {
  let controller: ImportController;
  let service: ImportService;

  /**
   * Mock service với các phương thức cần thiết cho testing
   */
  const mockImportService = {
    create: jest.fn(),
    getImportCodeMax: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportController],
      providers: [
        {
          provide: ImportService,
          useValue: mockImportService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<ImportController>(ImportController);
    service = module.get<ImportService>(ImportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Mã: TC-IPC-001
  // Test case: Kiểm tra controller được định nghĩa
  // Mục tiêu: Đảm bảo rằng ImportController được khởi tạo và định nghĩa
  // Input: Không có
  // Output mong đợi: controller phải được định nghĩa (không undefined)
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Kiểm tra các chức năng liên quan đến tạo mới bản ghi nhập hàng
  describe('create', () => {
    // Mã: TC-IPC-002
    // Test case: Tạo mới bản ghi nhập hàng
    // Mục tiêu: Kiểm tra controller tạo mới bản ghi nhập hàng thành công thông qua service
    // Input: CreateImportDTO với totalAmount, import_code, user_id, products
    // Output mong đợi: Response với thông tin bản ghi nhập hàng được tạo, status 200, success true
    it('should create a new import record', async () => {
      const createDto: CreateImportDTO = {
        totalAmount: 1000,
        import_code: 'IMP001',
        user_id: '1',
        products: [
          {
            product_id: '1',
            quantity: 10,
            price_in: 100,
          },
        ],
      };
      const expectedResult = { id: '1', ...createDto };
      mockImportService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: expectedResult,
      });
    });

    // Mã: TC-IPC-003
    // Test case: Xử lý lỗi khi tạo bản ghi nhập hàng thất bại (Error instance)
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw Error trong quá trình tạo
    // Input: CreateImportDTO, service throw Error('Creation failed')
    // Output mong đợi: Response lỗi với status 500, message 'Creation failed', success false
    it('should handle errors when create fails (Error instance)', async () => {
      const createDto: CreateImportDTO = {
        totalAmount: 1000,
        import_code: 'IMP001',
        user_id: '1',
        products: [
          {
            product_id: '1',
            quantity: 10,
            price_in: 100,
          },
        ],
      };
      const error = new Error('Creation failed');
      mockImportService.create.mockRejectedValue(error);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        status: 500,
        message: 'Creation failed',
        success: false,
      });
    });

    // Mã: TC-IPC-004
    // Test case: Xử lý lỗi khi tạo bản ghi nhập hàng thất bại (non-Error object)
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw một object không phải Error
    // Input: CreateImportDTO, service throw { msg: 'Non-error object' }
    // Output mong đợi: Response lỗi với status 500, message là JSON string của object, success false
    it('should handle errors when create fails (non-Error object)', async () => {
      const createDto: CreateImportDTO = {
        totalAmount: 1000,
        import_code: 'IMP001',
        user_id: '1',
        products: [
          {
            product_id: '1',
            quantity: 10,
            price_in: 100,
          },
        ],
      };
      const error = { msg: 'Non-error object' };
      mockImportService.create.mockRejectedValue(error);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        status: 500,
        message: JSON.stringify(error),
        success: false,
      });
    });
  });

  // Kiểm tra các chức năng liên quan đến lấy mã nhập hàng lớn nhất
  describe('getImportCodeMax', () => {
    // Mã: TC-IPC-005
    // Test case: Lấy mã nhập hàng lớn nhất
    // Mục tiêu: Kiểm tra controller trả về mã nhập hàng lớn nhất từ service
    // Input: Không có
    // Output mong đợi: Response với mã nhập hàng lớn nhất, status 200, success true
    it('should return the max import code', async () => {
      const maxCode = 'IMP999';
      mockImportService.getImportCodeMax.mockResolvedValue(maxCode);

      const result = await controller.getImportCodeMax();

      expect(service.getImportCodeMax).toHaveBeenCalled();
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: maxCode,
      });
    });

    // Mã: TC-IPC-006
    // Test case: Xử lý lỗi khi lấy mã nhập hàng lớn nhất thất bại (Error instance)
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw Error
    // Input: Service throw Error('Database error')
    // Output mong đợi: Response lỗi với status 500, message 'Database error', success false
    it('should handle errors when getting max code fails (Error instance)', async () => {
      const error = new Error('Database error');
      mockImportService.getImportCodeMax.mockRejectedValue(error);

      const result = await controller.getImportCodeMax();

      expect(service.getImportCodeMax).toHaveBeenCalled();
      expect(result).toEqual({
        status: 500,
        message: 'Database error',
        success: false,
      });
    });

    // Mã: TC-IPC-007
    // Test case: Xử lý lỗi khi lấy mã nhập hàng lớn nhất thất bại (non-Error object)
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw một object không phải Error
    // Input: Service throw { msg: 'Non-error object' }
    // Output mong đợi: Response lỗi với status 500, message là JSON string của object, success false
    it('should handle errors when getting max code fails (non-Error object)', async () => {
      const error = { msg: 'Non-error object' };
      mockImportService.getImportCodeMax.mockRejectedValue(error);

      const result = await controller.getImportCodeMax();

      expect(service.getImportCodeMax).toHaveBeenCalled();
      expect(result).toEqual({
        status: 500,
        message: JSON.stringify(error),
        success: false,
      });
    });
  });

  // Kiểm tra các chức năng liên quan đến lấy danh sách bản ghi nhập hàng
  describe('findAll', () => {
    // Mã: TC-IPC-008
    // Test case: Lấy danh sách tất cả bản ghi nhập hàng với phân trang
    // Mục tiêu: Kiểm tra controller trả về danh sách bản ghi nhập hàng từ service
    // Input: page = 1, limit = 10
    // Output mong đợi: Response với danh sách bản ghi nhập hàng, status 200, success true
    it('should return all import records with pagination', async () => {
      const page = 1;
      const limit = 10;
      const mockImports = [
        { id: '1', import_code: 'IMP001' },
        { id: '2', import_code: 'IMP002' },
      ];
      mockImportService.findAll.mockResolvedValue(mockImports);

      const result = await controller.findAll(page, limit);

      expect(service.findAll).toHaveBeenCalledWith(page, limit);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockImports,
      });
    });

    // Mã: TC-IPC-009
    // Test case: Xử lý lỗi khi lấy danh sách bản ghi nhập hàng thất bại (Error instance)
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw Error
    // Input: page = 1, limit = 10, service throw Error('Find all failed')
    // Output mong đợi: Response lỗi với status 500, message 'Find all failed', success false
    it('should handle errors when finding all records fails (Error instance)', async () => {
      const page = 1;
      const limit = 10;
      const error = new Error('Find all failed');
      mockImportService.findAll.mockRejectedValue(error);

      const result = await controller.findAll(page, limit);

      expect(service.findAll).toHaveBeenCalledWith(page, limit);
      expect(result).toEqual({
        status: 500,
        message: 'Find all failed',
        success: false,
      });
    });

    // Mã: TC-IPC-010
    // Test case: Xử lý lỗi khi lấy danh sách bản ghi nhập hàng thất bại (non-Error object)
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw một object không phải Error
    // Input: page = 1, limit = 10, service throw { msg: 'Non-error object' }
    // Output mong đợi: Response lỗi với status 500, message là JSON string của object, success false
    it('should handle errors when finding all records fails (non-Error object)', async () => {
      const page = 1;
      const limit = 10;
      const error = { msg: 'Non-error object' };
      mockImportService.findAll.mockRejectedValue(error);

      const result = await controller.findAll(page, limit);

      expect(service.findAll).toHaveBeenCalledWith(page, limit);
      expect(result).toEqual({
        status: 500,
        message: JSON.stringify(error),
        success: false,
      });
    });
  });

  // Kiểm tra các chức năng liên quan đến lấy thông tin chi tiết bản ghi nhập hàng
  describe('findOne', () => {
    // Mã: TC-IPC-011
    // Test case: Lấy thông tin chi tiết một bản ghi nhập hàng theo ID
    // Mục tiêu: Kiểm tra controller trả về thông tin chi tiết bản ghi nhập hàng dựa trên ID
    // Input: importId = '1'
    // Output mong đợi: Response với thông tin bản ghi nhập hàng, status 200, success true
    it('should return one import record by id', async () => {
      const importId = '1';
      const mockImport = { id: importId, import_code: 'IMP001' };
      mockImportService.findOne.mockResolvedValue(mockImport);

      const result = await controller.findOne(importId);

      expect(service.findOne).toHaveBeenCalledWith(importId);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockImport,
      });
    });

    // Mã: TC-IPC-012
    // Test case: Xử lý lỗi khi lấy chi tiết bản ghi nhập hàng thất bại (Error instance)
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw Error
    // Input: importId = '1', service throw Error('Record not found')
    // Output mong đợi: Response lỗi với status 500, message 'Record not found', success false
    it('should handle errors when finding one record fails (Error instance)', async () => {
      const importId = '1';
      const error = new Error('Record not found');
      mockImportService.findOne.mockRejectedValue(error);

      const result = await controller.findOne(importId);

      expect(service.findOne).toHaveBeenCalledWith(importId);
      expect(result).toEqual({
        status: 500,
        message: 'Record not found',
        success: false,
      });
    });

    // Mã: TC-IPC-013
    // Test case: Xử lý lỗi khi lấy chi tiết bản ghi nhập hàng thất bại (non-Error object)
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw một object không phải Error
    // Input: importId = '1', service throw { msg: 'Non-error object' }
    // Output mong đợi: Response lỗi với status 500, message là JSON string của object, success false
    it('should handle errors when finding one record fails (non-Error object)', async () => {
      const importId = '1';
      const error = { msg: 'Non-error object' };
      mockImportService.findOne.mockRejectedValue(error);

      const result = await controller.findOne(importId);

      expect(service.findOne).toHaveBeenCalledWith(importId);
      expect(result).toEqual({
        status: 500,
        message: JSON.stringify(error),
        success: false,
      });
    });
  });

  // Kiểm tra các chức năng liên quan đến cập nhật bản ghi nhập hàng
  describe('update', () => {
    // Mã: TC-IPC-014
    // Test case: Cập nhật bản ghi nhập hàng
    // Mục tiêu: Kiểm tra controller cập nhật bản ghi nhập hàng thành công thông qua service
    // Input: UpdateImpotyDTO với import_id, import_code, user_id, totalAmount, products
    // Output mong đợi: Response với thông tin bản ghi nhập hàng đã cập nhật, status 200, success true
    it('should update an import record', async () => {
      const updateDto: UpdateImpotyDTO = {
        import_id: '1',
        import_code: 'IMP001',
        user_id: '1',
        totalAmount: 1500,
        products: [
          {
            product_id: '1',
            quantity: 15,
            price_in: 100,
          },
        ],
      };
      const updatedImport = {
        id: '1',
        import_code: 'IMP001',
        user_id: '1',
        totalAmount: 1500,
        products: [
          {
            product_id: '1',
            quantity: 15,
            price_in: 100,
          },
        ],
      };
      mockImportService.update.mockResolvedValue(updatedImport);

      const result = await controller.update(updateDto);

      expect(service.update).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: updatedImport,
      });
    });

    // Mã: TC-IPC-015
    // Test case: Xử lý lỗi khi cập nhật bản ghi nhập hàng thất bại (Error instance)
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw Error trong quá trình cập nhật
    // Input: UpdateImpotyDTO, service throw Error('Update failed')
    // Output mong đợi: Response lỗi với status 500, message 'Update failed', success false
    it('should handle errors when update fails (Error instance)', async () => {
      const updateDto: UpdateImpotyDTO = {
        import_id: '1',
        import_code: 'IMP001',
        user_id: '1',
        totalAmount: 1500,
        products: [
          {
            product_id: '1',
            quantity: 15,
            price_in: 100,
          },
        ],
      };
      const error = new Error('Update failed');
      mockImportService.update.mockRejectedValue(error);

      const result = await controller.update(updateDto);

      expect(service.update).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual({
        status: 500,
        message: 'Update failed',
        success: false,
      });
    });

    // Mã: TC-IPC-016
    // Test case: Xử lý lỗi khi cập nhật bản ghi nhập hàng thất bại (non-Error object)
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw một object không phải Error
    // Input: UpdateImpotyDTO, service throw { msg: 'Non-error object' }
    // Output mong đợi: Response lỗi với status 500, message là JSON string của object, success false
    it('should handle errors when update fails (non-Error object)', async () => {
      const updateDto: UpdateImpotyDTO = {
        import_id: '1',
        import_code: 'IMP001',
        user_id: '1',
        totalAmount: 1500,
        products: [
          {
            product_id: '1',
            quantity: 15,
            price_in: 100,
          },
        ],
      };
      const error = { msg: 'Non-error object' };
      mockImportService.update.mockRejectedValue(error);

      const result = await controller.update(updateDto);

      expect(service.update).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual({
        status: 500,
        message: JSON.stringify(error),
        success: false,
      });
    });
  });

  // Kiểm tra các chức năng liên quan đến xóa bản ghi nhập hàng
  describe('delete', () => {
    // Mã: TC-IPC-017
    // Test case: Xóa bản ghi nhập hàng
    // Mục tiêu: Kiểm tra controller xóa bản ghi nhập hàng thành công thông qua service
    // Input: importId = '1'
    // Output mong đợi: Response với thông tin xóa (deleted: true), status 200, success true
    it('should delete an import record', async () => {
      const importId = '1';
      const deleteResult = { deleted: true };
      mockImportService.delete.mockResolvedValue(deleteResult);

      const result = await controller.delete(importId);

      expect(service.delete).toHaveBeenCalledWith(importId);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: deleteResult,
      });
    });

    // Mã: TC-IPC-018
    // Test case: Xử lý lỗi khi xóa bản ghi nhập hàng thất bại (Error instance)
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw Error trong quá trình xóa
    // Input: importId = '1', service throw Error('Delete failed')
    // Output mong đợi: Response lỗi với status 500, message 'Delete failed', success false
    it('should handle errors when delete fails (Error instance)', async () => {
      const importId = '1';
      const error = new Error('Delete failed');
      mockImportService.delete.mockRejectedValue(error);

      const result = await controller.delete(importId);

      expect(service.delete).toHaveBeenCalledWith(importId);
      expect(result).toEqual({
        status: 500,
        message: 'Delete failed',
        success: false,
      });
    });

    // Mã: TC-IPC-019
    // Test case: Xử lý lỗi khi xóa bản ghi nhập hàng thất bại (non-Error object)
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw một object không phải Error
    // Input: importId = '1', service throw { msg: 'Non-error object' }
    // Output mong đợi: Response lỗi với status 500, message là JSON string của object, success false
    it('should handle errors when delete fails (non-Error object)', async () => {
      const importId = '1';
      const error = { msg: 'Non-error object' };
      mockImportService.delete.mockRejectedValue(error);

      const result = await controller.delete(importId);

      expect(service.delete).toHaveBeenCalledWith(importId);
      expect(result).toEqual({
        status: 500,
        message: JSON.stringify(error),
        success: false,
      });
    });
  });
});