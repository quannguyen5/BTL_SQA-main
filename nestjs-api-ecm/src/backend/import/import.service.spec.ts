// Import các module cần thiết để tạo và test service
import { Test, TestingModule } from '@nestjs/testing';
import { ImportService } from './import.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ImportEntity } from 'src/entities/import_entity/import.entity';
import { Import_productEntity } from 'src/entities/import_entity/import_product.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateImportDTO } from 'src/dto/importDTO/import.create.dto';
import { UpdateImpotyDTO } from 'src/dto/importDTO/import.update.dto';
import { InternalServerErrorException } from '@nestjs/common';

describe('ImportService', () => {
  // Khai báo các biến sử dụng trong test
  let service: ImportService; // Service cần test
  let importRepo: Repository<ImportEntity>; // Repository xử lý đơn nhập hàng
  let importProductRepo: Repository<Import_productEntity>; // Repository xử lý chi tiết đơn nhập
  let dataSource: DataSource; // Nguồn dữ liệu

  // Tạo mock object cho queryRunner để giả lập thao tác database
  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
    },
  };
// Mock đối tượng DataSource
  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  /**
   * Chuẩn bị môi trường test trước mỗi test case
   * Khởi tạo các service và repository cần thiết
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportService,
        {
          provide: getRepositoryToken(ImportEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Import_productEntity),
          useClass: Repository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    // Khởi tạo các đối tượng cần test
    service = module.get<ImportService>(ImportService);
    importRepo = module.get<Repository<ImportEntity>>(getRepositoryToken(ImportEntity));
    importProductRepo = module.get<Repository<Import_productEntity>>(getRepositoryToken(Import_productEntity));
    dataSource = module.get<DataSource>(DataSource);

    // Xóa tất cả mock data trước mỗi test
    jest.clearAllMocks();
  });

  /**
   * Mã: TC-IPS-001
   * Test case: Kiểm tra khởi tạo service
   * Mục tiêu: Đảm bảo service được khởi tạo thành công
   * Input: Không có
   * Output mong đợi: Service được định nghĩa
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * Nhóm test cho chức năng tạo đơn nhập hàng
   */
  describe('create', () => {
    // Dữ liệu mẫu cho test
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

    /**
     * Mã: TC-IPS-002
     * Test case: Tạo đơn nhập hàng thành công
     * Mục tiêu: Kiểm tra luồng tạo đơn nhập hàng hoạt động đúng
     * Input: 1 đối tượng CreateImportDTO chứa đầy đủ các trường thuộc tính
     * Output mong đợi: Đơn nhập hàng mới được tạo thành công
     */
    it('should successfully create an import', async () => {
      // Tạo mock data cho test
      const mockImportEntity = {
        id: '1',
        employee_id: createDto.user_id,
        total_amount: createDto.totalAmount,
        import_code: 'IP001',
      };

      const mockImportProduct = {
        id: '1',
        quantity: createDto.products[0].quantity,
        price_in: createDto.products[0].price_in,
        product_id: createDto.products[0].product_id,
        import_id: mockImportEntity.id,
      };

      // Mock các hàm repository
      jest.spyOn(importRepo, 'create').mockReturnValue(mockImportEntity as any);
      jest.spyOn(importProductRepo, 'create').mockReturnValue(mockImportProduct as any);
      jest.spyOn(mockQueryRunner.manager, 'save')
        .mockResolvedValueOnce(mockImportEntity)
        .mockResolvedValueOnce([mockImportProduct]);

      const result = await service.create(createDto);

      // Kiểm tra kết quả
      expect(result).toEqual(mockImportEntity);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });


    /**
     * Mã: TC-IPS-003
     * Test case: Xử lý lỗi khi tạo đơn nhập hàng thất bại
     * Mục tiêu: Kiểm tra xử lý lỗi và rollback transaction
     * Input: một đối tượng CreateImportDTO hợp lệ nhưng có lỗi database
     * Output mong đợi: Throw InternalServerErrorException
     */
    it('should rollback transaction and throw error on failure', async () => {
      jest.spyOn(importRepo, 'create').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.create(createDto)).rejects.toThrow(
        new InternalServerErrorException('ORDER.OCCUR ERROR WHEN SAVE TO DATABASE!')
      );

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });


    /**
     * Mã: TC-IPS-004
     * Test case: Kiểm tra release connection trong finally block
     * Mục tiêu: Đảm bảo connection luôn được release
     * Input: Một đối tượng CreateImportDTO gây lỗi có đầy đủ các trường thuộc tính
     * Output mong đợi: Connection được release
     */
    it('should handle query runner release in finally block', async () => {
      jest.spyOn(importRepo, 'create').mockImplementation(() => {
        throw new Error('Test error');
      });

      try {
        await service.create(createDto);
      } catch (error) {
        // Expected error
      }

      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    /**
     * Mã: TC-IPS-005
     * Test case: Xử lý trường hợp không có sản phẩm
     * Mục tiêu: Kiểm tra validate danh sách sản phẩm rỗng
     * Input: một đối tượng CreateImportDTO không có sản phẩm
     * Output mong đợi: Throw InternalServerErrorException
     */
    it('should handle empty products array', async () => {
      const emptyProductsDto = { ...createDto, products: [] };
      
      await expect(service.create(emptyProductsDto)).rejects.toThrow(
        new InternalServerErrorException('ORDER.OCCUR ERROR WHEN SAVE TO DATABASE!')
      );
    });
  });
/**
   * Nhóm test cho chức năng lấy danh sách đơn nhập hàng
   */
  describe('findAll', () => {
    /**
     * Mã: TC-IPS-006
     * Test case: Lấy danh sách đơn nhập hàng có phân trang
     * Mục tiêu: Kiểm tra chức năng phân trang
     * Input: số trang hiện tại page=1, số lượng bản ghi trên 1 trang limit=10
     * Output mong đợi: Danh sách đơn nhập và tổng số bản ghi
     */
    it('should return paginated imports', async () => {
      const mockImports = [
        { 
          id: '1', 
          import_code: 'IMP001',
          total_amount: 1000,
          employee_id: '1',
          createdAt: new Date(),
          employee: null,
          importProducts: []
        },
        { 
          id: '2', 
          import_code: 'IMP002',
          total_amount: 2000,
          employee_id: '2',
          createdAt: new Date(),
          employee: null,
          importProducts: []
        }
      ];
      const mockTotal = 2;

      jest.spyOn(importRepo, 'findAndCount').mockResolvedValue([mockImports, mockTotal]);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        list: mockImports,
        total: mockTotal,
      });
      expect(importRepo.findAndCount).toHaveBeenCalledWith({
        relations: ['importProducts'],
        skip: 0,
        take: 10,
      });
    });

    /**
     * Mã: TC-IPS-007
     * Test case: Xử lý kết quả rỗng
     * Mục tiêu: Kiểm tra xử lý khi không có dữ liệu
     * Input: số trang hiện tại page=1, số lượng bản ghi trên 1 trang limit=10
     * Output mong đợi: Danh sách rỗng và tổng = 0
     */
    it('should handle empty result', async () => {
      jest.spyOn(importRepo, 'findAndCount').mockResolvedValue([[], 0]);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        list: [],
        total: 0,
      });
    });

    /**
     * Mã: TC-IPS-008
     * Test case: Kiểm tra tính toán phân trang
     * Mục tiêu: Đảm bảo tính toán skip, take chính xác
     * Input: số trang hiện tại page=2, số lượng bản ghi trên 1 trang limit=15
     * Output mong đợi: skip=15, take=15
     */
    it('should handle pagination parameters correctly', async () => {
      jest.spyOn(importRepo, 'findAndCount').mockResolvedValue([[], 0]);

      await service.findAll(2, 15);

      expect(importRepo.findAndCount).toHaveBeenCalledWith({
        relations: ['importProducts'],
        skip: 15,
        take: 15,
      });
    });

    /**
     * Mã: TC-IPS-009
     * Test case: Xử lý lỗi database
     * Mục tiêu: Kiểm tra xử lý khi có lỗi truy vấn
     * Input: số trang hiện tại page=1, số lượng bản ghi trên 1 trang limit=10
     * Output mong đợi: Throw error
     */
    it('should handle findAndCount error', async () => {
      jest.spyOn(importRepo, 'findAndCount').mockRejectedValue(new Error('Database error'));

      await expect(service.findAll(1, 10)).rejects.toThrow();
    });
  });

  /**
   * Nhóm test cho chức năng sinh mã đơn nhập hàng tự động
   */
  describe('getImportCodeMax', () => {
    /**
     * Mã: TC-IPS-010
     * Test case: Sinh mã mới khi chưa có đơn nào
     * Mục tiêu: Kiểm tra sinh mã đầu tiên
     * Input: Không có đơn nhập nào
     * Output mong đợi: Mã IPC00001
     */
    it('should generate new code when no existing codes', async () => {
      jest.spyOn(importRepo, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: null }),
      } as any);

      const result = await service.getImportCodeMax();
      expect(result).toEqual({ import_code: 'IPC00001' });
    });

    /**
     * Mã: TC-IPS-011
     * Test case: Tăng mã tự động
     * Mục tiêu: Kiểm tra tăng mã tự động
     * Input: Mã hiện tại IPC00001
     * Output mong đợi: Mã mới IPC00002
     */
    it('should increment existing max code', async () => {
      jest.spyOn(importRepo, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: 'IPC00001' }),
      } as any);

      const result = await service.getImportCodeMax();
      expect(result).toEqual({ import_code: 'IPC00002' });
    });

    /**
     * Mã: TC-IPS-012
     * Test case: Xử lý lỗi truy vấn
     * Mục tiêu: Kiểm tra xử lý khi có lỗi query
     * Input: Query lỗi
     * Output mong đợi: Throw error
     */
    it('should handle query builder error', async () => {
      jest.spyOn(importRepo, 'createQueryBuilder').mockImplementation(() => {
        throw new Error('Query builder error');
      });

      await expect(service.getImportCodeMax()).rejects.toThrow();
    });
  });

  /**
   * Nhóm test cho chức năng tìm đơn nhập hàng theo ID
   */
  describe('findOne', () => {
    /**
     * Mã: TC-IPS-013
     * Test case: Tìm đơn nhập hàng thành công
     * Mục tiêu: Kiểm tra tìm kiếm đơn theo ID
     * Input: ID hợp lệ
     * Output mong đợi: Thông tin đơn nhập hàng
     */
    it('should return import by id', async () => {
      const mockImport = {
        id: '1',
        import_code: 'IMP001',
        importProducts: [],
      };

      jest.spyOn(importRepo, 'findOne').mockResolvedValue(mockImport as any);

      const result = await service.findOne('1');
      expect(result).toEqual(mockImport);
    });

    /**
     * Mã: TC-IPS-014
     * Test case: Không tìm thấy đơn nhập hàng
     * Mục tiêu: Kiểm tra xử lý khi không tìm thấy đơn
     * Input: ID không tồn tại
     * Output mong đợi: Throw error
     */
    it('should throw error when import not found', async () => {
      jest.spyOn(importRepo, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow('IMPORT.IMPORT DETAIL NOT EXISTS!');
    });

    /**
     * Mã: TC-IPS-015
     * Test case: Xử lý lỗi database
     * Mục tiêu: Kiểm tra xử lý khi có lỗi truy vấn
     * Input: ID hợp lệ nhưng có lỗi database
     * Output mong đợi: Throw error
     */
    it('should handle findOne error', async () => {
      jest.spyOn(importRepo, 'findOne').mockRejectedValue(new Error('Database error'));

      await expect(service.findOne('1')).rejects.toThrow();
    });
  });

  /**
   * Test các chức năng của phương thức cập nhật đơn nhập hàng
   */
  describe('update', () => {
    /**
     * Mã : TC-IPS-016
     * Test case: Cập nhật thông tin khi sản phẩm đã tồn tại
     * Mục đích: Kiểm tra việc cập nhật thông tin sản phẩm đã có
     * Input:
     * - updateDto với sản phẩm đã tồn tại trong importProducts
     * Kết quả mong đợi: Cập nhật thông tin sản phẩm hiện có
     */
    it('should update existing product in import', async () => {
      const existingProduct = {
        product_id: '1',
        quantity: 10,
        price_in: 100
      };
  
      const mockImport = {
        id: '1',
        importProducts: [existingProduct],
        save: jest.fn()
      };
  
      const updateDto = {
        import_id: '1',
        totalAmount: 2000,
        user_id: 'user1',
        import_code: 'IMP001',
        products: [{
          product_id: '1',
          quantity: 20,
          price_in: 150
        }]
      };
  
      jest.spyOn(importRepo, 'findOne').mockResolvedValue(mockImport as any);
      jest.spyOn(importRepo, 'save').mockResolvedValue(mockImport as any);
  
      const result = await service.update(updateDto);
  
      expect(result.importProducts[0].quantity).toBe(20);
      expect(result.importProducts[0].price_in).toBe(150);
    });
  
    /**
     * Mã : TC-IPS-017
     * Test case: Thêm sản phẩm mới vào đơn nhập hàng
     * Mục đích: Kiểm tra việc thêm sản phẩm mới khi cập nhật
     * Input:
     * - updateDto với sản phẩm chưa tồn tại trong importProducts
     * Kết quả mong đợi: Thêm sản phẩm mới vào danh sách
     */
    it('should add new product to import', async () => {
      const mockImport = {
        id: '1',
        importProducts: [],
        save: jest.fn()
      };
  
      const updateDto = {
        import_id: '1',
        totalAmount: 1000,
        user_id: 'user1',
        import_code: 'IMP001',
        products: [{
          product_id: '2',
          quantity: 5,
          price_in: 200
        }]
      };
  
      jest.spyOn(importRepo, 'findOne').mockResolvedValue(mockImport as any);
      jest.spyOn(importRepo, 'save').mockResolvedValue({
        ...mockImport,
        importProducts: [updateDto.products[0]]
      } as any);
  
      const result = await service.update(updateDto);
  
      expect(result.importProducts).toHaveLength(1);
      expect(result.importProducts[0].product_id).toBe('2');
    });
  
    /**
     * Mã : TC-IPS-018
     * Test case: Cập nhật đơn nhập hàng không tồn tại
     * Mục đích: Kiểm tra xử lý lỗi khi đơn hàng không tồn tại
     * Input:
     * - updateDto với import_id không tồn tại
     * Kết quả mong đợi: Throw error với message phù hợp
     */
    it('should throw error when import not found', async () => {
      const updateDto = {
        import_id: 'non-existent',
        totalAmount: 1000,
        user_id: 'user1',
        import_code: 'IMP001',
        products: []
      };
  
      jest.spyOn(importRepo, 'findOne').mockResolvedValue(null);
  
      await expect(service.update(updateDto)).rejects.toThrow('IMPORT.ORDER UPDATE NOT FOUND!');
    });
  });

  /**
   * Nhóm test cho chức năng xóa đơn nhập hàng
   */
  describe('delete', () => {
    /**
     * Mã: TC-IPS-019
     * Test case: Xóa đơn nhập hàng thành công
     * Mục tiêu: Kiểm tra việc xóa đơn nhập hàng
     * Input: ID hợp lệ của đơn nhập hàng ('1')
     * Output mong đợi: Trả về kết quả xóa thành công (affected: 1)
     */
    it('should delete import successfully', async () => {
      const mockDeleteResult = { affected: 1 };
      jest.spyOn(importRepo, 'delete').mockResolvedValue(mockDeleteResult as any);

      const result = await service.delete('1');
      expect(result).toEqual(mockDeleteResult);
    });

    /**
     * Mã: TC-IPS-020
     * Test case: Xóa đơn nhập hàng không tồn tại
     * Mục tiêu: Kiểm tra xử lý khi xóa đơn hàng không tồn tại
     * Input: ID không tồn tại ('999')
     * Output mong đợi: Trả về kết quả không có bản ghi nào bị ảnh hưởng (affected: 0)
     */
    it('should handle non-existent import deletion', async () => {
      const mockDeleteResult = { affected: 0 };
      jest.spyOn(importRepo, 'delete').mockResolvedValue(mockDeleteResult as any);

      const result = await service.delete('999');
      expect(result.affected).toBe(0);
    });

    /**
     * Mã: TC-IPS-021
     * Test case: Xử lý lỗi database khi xóa đơn nhập hàng
     * Mục tiêu: Kiểm tra xử lý khi có lỗi database trong quá trình xóa
     * Input: ID hợp lệ ('1') nhưng có lỗi database
     * Output mong đợi: Throw error từ database
     */
    it('should handle delete error', async () => {
      jest.spyOn(importRepo, 'delete').mockRejectedValue(new Error('Database error'));

      await expect(service.delete('1')).rejects.toThrow();
    });
  });
});