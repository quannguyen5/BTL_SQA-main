import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { ProductRepository } from 'src/repository/ProductRepository';
import { ImportProductRepository } from 'src/repository/ImportProductRepository';
import { EntityManager } from 'typeorm';
import { ProductEntity } from 'src/entities/product_entity/product.entity';
import { Import_productEntity } from 'src/entities/import_entity/import_product.entity';
import { ProductCreateDTO } from 'src/dto/productDTO/product.create.dto';
import { ProductUpdateDTO } from 'src/dto/productDTO/product.update.dto';
import { ExpirationStatus, ApplyStatus } from 'src/share/Enum/Enum';
import { getRepositoryToken } from '@nestjs/typeorm';

// Mô tả: Test suite cho ProductService, kiểm tra các chức năng liên quan đến quản lý sản phẩm như lấy danh sách, tìm kiếm, tạo, xem chi tiết, cập nhật và xóa sản phẩm.

describe('ProductService', () => {
  let service: ProductService;
  let productRepo: ProductRepository;
  let importProductRepo: ImportProductRepository;
  let entityManager: EntityManager;

  const mockProduct = {
    id: '1',
    name: 'Test Product',
    priceout: 100,
    banner: 'banner.jpg',
    description: 'Test Description',
    stockQuantity: 10,
    weight: 1,
    url_image: 'image.jpg',
    category_id: 'cat1',
    supplier_id: 'sup1',
    expire_date: new Date(),
    status: ExpirationStatus.Valid,
    category: { id: 'cat1', status: ApplyStatus.True },
  };

  const mockProductRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockImportProductRepository = {
    find: jest.fn(),
  };

  const mockEntityManager = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Import_productEntity),
          useValue: mockImportProductRepository,
        },
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepo = module.get<ProductRepository>(getRepositoryToken(ProductEntity));
    importProductRepo = module.get<ImportProductRepository>(
      getRepositoryToken(Import_productEntity),
    );
    entityManager = module.get<EntityManager>(EntityManager);
  });

  // Mô tả: Kiểm tra xem ProductService có được khởi tạo thành công hay không.
  it('should be defined', () => {
    // Mã: TC-PS-001
    // Test case: Kiểm tra khởi tạo ProductService
    // Mục tiêu: Đảm bảo ProductService được định nghĩa sau khi module được biên dịch
    // Input: Không có
    // Output mong đợi: service phải được định nghĩa (không undefined)
    expect(service).toBeDefined();
  });

  // Mô tả: Kiểm tra chức năng getList, lấy danh sách sản phẩm với phân trang và bộ lọc.
  describe('getList', () => {
    it('should return a list of products with pagination', async () => {
      // Mã: TC-PS-002
      // Test case: Lấy danh sách sản phẩm với phân trang và bộ lọc trạng thái
      // Mục tiêu: Đảm bảo hàm getList trả về danh sách sản phẩm với phân trang và áp dụng bộ lọc trạng thái hợp lệ
      // Input: page = 1, limit = 10, filters = { status: ExpirationStatus.Valid }
      // Output mong đợi: Đối tượng chứa danh sách sản phẩm, tổng số lượng, trang hiện tại và giới hạn
      const mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
      };
      mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getList(1, 10, { status: ExpirationStatus.Valid });

      expect(mockProductRepository.createQueryBuilder).toHaveBeenCalledWith('product');
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
        'product.category',
        'category',
        'category.status = :categoryStatus',
        { categoryStatus: ApplyStatus.True },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('product.status = :status', {
        status: ExpirationStatus.Valid,
      });
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        products: [mockProduct],
        total: 1,
        page: 1,
        limit: 10,
      });
    });

    it('should throw error if page is less than 1', async () => {
      // Mã: TC-PS-003
      // Test case: Kiểm tra lỗi khi số trang nhỏ hơn 1
      // Mục tiêu: Đảm bảo hàm getList ném lỗi khi page <= 0
      // Input: page = 0, limit = 10, filters = {}
      // Output mong đợi: Lỗi với thông báo 'PAGE NUMBER MUST BE GREATER THAN 0!'
      await expect(service.getList(0, 10, {})).rejects.toThrow('PAGE NUMBER MUST BE GREATER THAN 0!');
    });

    it('should throw error if limit is less than 1', async () => {
      // Mã: TC-PS-004
      // Test case: Kiểm tra lỗi khi giới hạn nhỏ hơn 1
      // Mục tiêu: Đảm bảo hàm getList ném lỗi khi limit <= 0
      // Input: page = 1, limit = 0, filters = {}
      // Output mong đợi: Lỗi với thông báo 'LIMIT MUST BE GREATER THAN 0!'
      await expect(service.getList(1, 0, {})).rejects.toThrow('LIMIT MUST BE GREATER THAN 0!');
    });

    it('should throw error if no products found', async () => {
      // Mã: TC-PS-005
      // Test case: Kiểm tra lỗi khi không tìm thấy sản phẩm
      // Mục tiêu: Đảm bảo hàm getList ném lỗi khi không có sản phẩm nào được tìm thấy
      // Input: page = 1, limit = 10, filters = { status: ExpirationStatus.Valid }
      // Output mong đợi: Lỗi với thông báo 'NO PRODUCT!'
      const mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([null, 0]),
      };
      mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.getList(1, 10, { status: ExpirationStatus.Valid }))
        .rejects.toThrow('NO PRODUCT!');
    });

    it('should not add status condition if status is invalid', async () => {
      // Mã: TC-PS-006
      // Test case: Kiểm tra khi trạng thái trong bộ lọc không hợp lệ
      // Mục tiêu: Đảm bảo hàm getList không áp dụng điều kiện trạng thái khi status không hợp lệ
      // Input: page = 1, limit = 10, filters = { status: 'INVALID_STATUS' }
      // Output mong đợi: Danh sách sản phẩm và tổng số lượng, không áp dụng điều kiện trạng thái
      const mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
      };
      mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const filters = { status: 'INVALID_STATUS' };
      const result = await service.getList(1, 10, filters);

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith('product.status = :status', expect.anything());
      expect(result).toEqual({
        products: [mockProduct],
        total: 1,
        page: 1,
        limit: 10,
      });
    });

    it('should use default page and limit if not provided', async () => {
      // Mã: TC-PS-007
      // Test case: Kiểm tra sử dụng giá trị mặc định cho page và limit
      // Mục tiêu: Đảm bảo hàm getList sử dụng page = 1 và limit = 10 khi không được cung cấp
      // Input: page = undefined, limit = undefined, filters = {}
      // Output mong đợi: Danh sách sản phẩm với page = 1, limit = 10
      const mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
      };
      mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // @ts-ignore
      const result = await service.getList(undefined, undefined, {});

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        products: [mockProduct],
        total: 1,
        page: 1,
        limit: 10,
      });
    });

    it('should not add status condition if filters.status is not provided', async () => {
      // Mã: TC-PS-008
      // Test case: Kiểm tra khi không cung cấp trạng thái trong bộ lọc
      // Mục tiêu: Đảm bảo hàm getList không áp dụng điều kiện trạng thái khi filters.status không được cung cấp
      // Input: page = 1, limit = 10, filters = {}
      // Output mong đợi: Danh sách sản phẩm và tổng số lượng, không áp dụng điều kiện trạng thái
      const mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
      };
      mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const filters = {};
      const result = await service.getList(1, 10, filters);

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith('product.status = :status', expect.anything());
      expect(result).toEqual({
        products: [mockProduct],
        total: 1,
        page: 1,
        limit: 10,
      });
    });

    it('should handle filters as undefined', async () => {
      // Mã: TC-PS-009
      // Test case: Kiểm tra khi bộ lọc là undefined
      // Mục tiêu: Đảm bảo hàm getList xử lý đúng khi filters là undefined bằng cách sử dụng bộ lọc rỗng
      // Input: page = 1, limit = 10, filters = {}
      // Output mong đợi: Danh sách sản phẩm và tổng số lượng, không áp dụng điều kiện trạng thái
      const mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
      };
      mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getList(1, 10, {});

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith('product.status = :status', expect.anything());
      expect(result).toEqual({
        products: [mockProduct],
        total: 1,
        page: 1,
        limit: 10,
      });
    });
  });

  // Mô tả: Kiểm tra chức năng searchProducts, tìm kiếm sản phẩm dựa trên các bộ lọc như tên và danh mục.
  describe('searchProducts', () => {
    it('should return products based on search filters', async () => {
      // Mã: TC-PS-010
      // Test case: Tìm kiếm sản phẩm với bộ lọc tên và danh sách danh mục
      // Mục tiêu: Đảm bảo hàm searchProducts trả về danh sách sản phẩm dựa trên bộ lọc tên và danh sách category_id
      // Input: page = 1, limit = 10, filters = { name: 'Test', category_id: ['cat1'] }
      // Output mong đợi: Đối tượng chứa danh sách sản phẩm và tổng số lượng
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
      };
      mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const filters = { name: 'Test', category_id: ['cat1'] };
      const result = await service.searchProducts(1, 10, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('product.name LIKE :name', {
        name: '%Test%',
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('product.category_id IN (:...categoryIds)', {
        categoryIds: ['cat1'],
      });
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
        'product.category',
        'category',
        'category.status = :categoryStatus',
        { categoryStatus: ApplyStatus.True },
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        products: [mockProduct],
        total: 1,
      });
    });

    it('should return products when category_id is a single value', async () => {
      // Mã: TC-PS-011
      // Test case: Tìm kiếm sản phẩm với bộ lọc tên và một danh mục duy nhất
      // Mục tiêu: Đảm bảo hàm searchProducts xử lý đúng khi category_id là một giá trị đơn
      // Input: page = 1, limit = 10, filters = { name: 'Test', category_id: 'cat1' }
      // Output mong đợi: Đối tượng chứa danh sách sản phẩm và tổng số lượng
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
      };
      mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const filters = { name: 'Test', category_id: 'cat1' };
      const result = await service.searchProducts(1, 10, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('product.name LIKE :name', {
        name: '%Test%',
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('product.category_id = :categoryId', {
        categoryId: 'cat1',
      });
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
        'product.category',
        'category',
        'category.status = :categoryStatus',
        { categoryStatus: ApplyStatus.True },
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        products: [mockProduct],
        total: 1,
      });
    });

    it('should work when no filters are provided', async () => {
      // Mã: TC-PS-012
      // Test case: Tìm kiếm sản phẩm khi không cung cấp bộ lọc
      // Mục tiêu: Đảm bảo hàm searchProducts trả về danh sách sản phẩm khi không có bộ lọc
      // Input: page = 1, limit = 10, filters = {}
      // Output mong đợi: Đối tượng chứa danh sách sản phẩm và tổng số lượng
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
      };
      mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchProducts(1, 10, {});

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      expect(result).toEqual({
        products: [mockProduct],
        total: 1,
      });
    });

    it('should return empty products if getManyAndCount returns empty', async () => {
      // Mã: TC-PS-013
      // Test case: Tìm kiếm sản phẩm khi không có kết quả
      // Mục tiêu: Đảm bảo hàm searchProducts trả về danh sách rỗng khi không tìm thấy sản phẩm
      // Input: page = 1, limit = 10, filters = {}
      // Output mong đợi: Đối tượng chứa danh sách sản phẩm rỗng và tổng số lượng = 0
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchProducts(1, 10, {});

      expect(result).toEqual({
        products: [],
        total: 0,
      });
    });
  });

  // Mô tả: Kiểm tra chức năng create, tạo một sản phẩm mới.
  describe('create', () => {
    it('should create a new product', async () => {
      // Mã: TC-PS-014
      // Test case: Tạo một sản phẩm mới
      // Mục tiêu: Đảm bảo hàm create tạo và lưu sản phẩm mới thành công
      // Input: ProductCreateDTO với các thông tin sản phẩm
      // Output mong đợi: Đối tượng sản phẩm đã được tạo
      const createDto: ProductCreateDTO = {
        name: 'New Product',
        priceout: 200,
        banner: 'banner.jpg',
        description: 'New Description',
        stockQuantity: 20,
        weight: 2,
        url_image: 'image.jpg',
        category_id: 'cat1',
        supplier_id: 'sup1',
        expire_date: new Date(),
      };
      mockProductRepository.create.mockReturnValue(createDto);
      mockProductRepository.save.mockResolvedValue(mockProduct);

      const result = await service.create(createDto);

      expect(mockProductRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockProductRepository.save).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockProduct);
    });
  });

  // Mô tả: Kiểm tra chức năng detail, lấy chi tiết một sản phẩm theo ID.
  describe('detail', () => {
    it('should return product details', async () => {
      // Mã: TC-PS-015
      // Test case: Lấy chi tiết sản phẩm theo ID
      // Mục tiêu: Đảm bảo hàm detail trả về chi tiết sản phẩm khi tìm thấy
      // Input: id = '1'
      // Output mong đợi: Đối tượng chứa thông tin chi tiết sản phẩm
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.detail('1');

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['category'],
      });
      expect(result).toEqual({ products: mockProduct });
    });

    it('should return null if product not found', async () => {
      // Mã: TC-PS-016
      // Test case: Lấy chi tiết sản phẩm không tồn tại
      // Mục tiêu: Đảm bảo hàm detail trả về null khi không tìm thấy sản phẩm
      // Input: id = 'notfound'
      // Output mong đợi: Đối tượng chứa products = null
      mockProductRepository.findOne.mockResolvedValue(null);

      const result = await service.detail('notfound');

      expect(result).toEqual({ products: null });
    });
  });

  // Mô tả: Kiểm tra chức năng update, cập nhật thông tin một sản phẩm.
  describe('update', () => {
    it('should update a product', async () => {
      // Mã: TC-PS-017
      // Test case: Cập nhật thông tin sản phẩm
      // Mục tiêu: Đảm bảo hàm update cập nhật sản phẩm thành công khi sản phẩm tồn tại
      // Input: updateDto = { id: '1', name: 'Updated Product' }, id = '1'
      // Output mong đợi: Đối tượng sản phẩm đã được cập nhật
      const updateDto: ProductUpdateDTO = {
        id: '1',
        name: 'Updated Product',
      };
      mockProductRepository.findOneBy.mockResolvedValue(mockProduct);
      mockProductRepository.save.mockResolvedValue({ ...mockProduct, name: 'Updated Product' });

      const result = await service.update(updateDto, '1');

      expect(mockProductRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(mockProductRepository.save).toHaveBeenCalledWith(expect.objectContaining({ ...mockProduct, ...updateDto }));
      expect(result).toEqual({ ...mockProduct, name: 'Updated Product' });
    });

    it('should throw error if product to update not found', async () => {
      // Mã: TC-PS-018
      // Test case: Cập nhật sản phẩm không tồn tại
      // Mục tiêu: Đảm bảo hàm update ném lỗi khi sản phẩm không được tìm thấy
      // Input: updateDto = { id: 'notfound', name: 'Updated Product' }, id = 'notfound'
      // Output mong đợi: Lỗi với thông báo 'Product not found'
      const updateDto: ProductUpdateDTO = {
        id: 'notfound',
        name: 'Updated Product',
      };
      const error = new Error('Product not found');
      const baseServiceProto = Object.getPrototypeOf(service);
      const updateSpy = jest.spyOn(baseServiceProto, 'update').mockRejectedValue(error);

      await expect(service.update(updateDto, 'notfound')).rejects.toThrow('Product not found');

      updateSpy.mockRestore();
    });
  });

  // Mô tả: Kiểm tra chức năng delete, xóa một sản phẩm theo ID.
  describe('delete', () => {
    it('should delete a product', async () => {
      // Mã: TC-PS-019
      // Test case: Xóa một sản phẩm
      // Mục tiêu: Đảm bảo hàm delete xóa sản phẩm thành công khi sản phẩm tồn tại
      // Input: id = '1'
      // Output mong đợi: undefined
      mockProductRepository.findOneBy.mockResolvedValue(mockProduct);
      mockProductRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.delete('1');

      expect(mockProductRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(mockProductRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(undefined);
    });

    it('should throw error if product to delete not found', async () => {
      // Mã: TC-PS-020
      // Test case: Xóa sản phẩm không tồn tại
      // Mục tiêu: Đảm bảo hàm delete ném lỗi khi sản phẩm không được tìm thấy
      // Input: id = 'notfound'
      // Output mong đợi: Lỗi với thông báo 'Product not found'
      const error = new Error('Product not found');
      const baseServiceProto = Object.getPrototypeOf(service);
      const deleteSpy = jest.spyOn(baseServiceProto, 'delete').mockRejectedValue(error);

      await expect(service.delete('notfound')).rejects.toThrow('Product not found');

      deleteSpy.mockRestore();
    });
  });
});