import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { responseHandler } from 'src/Until/responseUtil';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';
import { ProductCreateDTO } from 'src/dto/productDTO/product.create.dto';
import { ProductUpdateDTO } from 'src/dto/productDTO/product.update.dto';
import { ExpirationStatus } from 'src/share/Enum/Enum';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const mockProductService = {
    getList: jest.fn(),
    searchProducts: jest.fn(),
    create: jest.fn(),
    detail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: ProductService, useValue: mockProductService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);

    jest.clearAllMocks();
  });

  // Mã: TC-PC-001
  // Test case: Kiểm tra controller được định nghĩa
  // Mục tiêu: Đảm bảo rằng ProductController được khởi tạo và định nghĩa
  // Input: Không có
  // Output mong đợi: controller phải được định nghĩa (không undefined)
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Kiểm tra các chức năng liên quan đến lấy danh sách sản phẩm
  describe('getList', () => {
    // Mã: TC-PC-002
    // Test case: Lấy danh sách sản phẩm
    // Mục tiêu: Kiểm tra controller trả về danh sách sản phẩm từ service
    // Input: page = 1, limit = 10, status = ExpirationStatus.All
    // Output mong đợi: Response với danh sách sản phẩm được bọc trong responseHandler.ok
    it('should return products list', async () => {
      const mockResult = { products: [], total: 0, page: 1, limit: 10 };
      mockProductService.getList.mockResolvedValue(mockResult);

      const result = await controller.getList(1, 10, ExpirationStatus.All);
      expect(result).toEqual(responseHandler.ok(mockResult));
      expect(mockProductService.getList).toHaveBeenCalledWith(1, 10, { status: ExpirationStatus.All });
    });

    // Mã: TC-PC-003
    // Test case: Xử lý lỗi khi lấy danh sách sản phẩm
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw Error
    // Input: page = 1, limit = 10, status = ExpirationStatus.All, service throw Error('fail')
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message 'fail'
    it('should handle errors', async () => {
      mockProductService.getList.mockRejectedValue(new Error('fail'));
      const result = await controller.getList(1, 10, ExpirationStatus.All);
      expect(result).toEqual(responseHandler.error('fail'));
    });

    // Mã: TC-PC-004
    // Test case: Sử dụng status rỗng khi không cung cấp
    // Mục tiêu: Kiểm tra controller gọi service với status rỗng khi không truyền status
    // Input: page = 1, limit = 10, không truyền status
    // Output mong đợi: Response với danh sách sản phẩm được bọc trong responseHandler.ok, service được gọi với status = ''
    it('should use empty status if not provided', async () => {
      const mockResult = { products: [], total: 0, page: 1, limit: 10 };
      mockProductService.getList.mockResolvedValue(mockResult);

      // @ts-ignore
      const result = await controller.getList(1, 10);
      expect(result).toEqual(responseHandler.ok(mockResult));
      expect(mockProductService.getList).toHaveBeenCalledWith(1, 10, { status: '' });
    });

    // Mã: TC-PC-005
    // Test case: Xử lý giá trị không phải Error khi lấy danh sách
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw một object không phải Error
    // Input: page = 1, limit = 10, service throw { msg: 'fail' }
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message là JSON string của object
    it('should handle errors with non-Error object', async () => {
      mockProductService.getList.mockRejectedValue({ msg: 'fail' });
      // @ts-ignore
      const result = await controller.getList(1, 10);
      expect(result).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
    });
  });

  // Kiểm tra các chức năng liên quan đến tìm kiếm sản phẩm
  describe('search', () => {
    // Mã: TC-PC-006
    // Test case: Tìm kiếm sản phẩm
    // Mục tiêu: Kiểm tra controller trả về danh sách sản phẩm theo tiêu chí tìm kiếm
    // Input: page = 1, limit = 10, name = 'abc', category_id = 'cat1'
    // Output mong đợi: Response với danh sách sản phẩm được bọc trong responseHandler.ok
    it('should return search results', async () => {
      const mockResult = { products: [], total: 0 };
      mockProductService.searchProducts.mockResolvedValue(mockResult);

      const result = await controller.search(1, 10, 'abc', 'cat1');
      expect(result).toEqual(responseHandler.ok(mockResult));
      expect(mockProductService.searchProducts).toHaveBeenCalledWith(1, 10, { name: 'abc', category_id: 'cat1' });
    });

    // Mã: TC-PC-007
    // Test case: Xử lý lỗi khi tìm kiếm sản phẩm
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw Error trong quá trình tìm kiếm
    // Input: page = 1, limit = 10, name = 'abc', category_id = 'cat1', service throw Error('fail')
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message 'fail'
    it('should handle errors', async () => {
      mockProductService.searchProducts.mockRejectedValue(new Error('fail'));
      const result = await controller.search(1, 10, 'abc', 'cat1');
      expect(result).toEqual(responseHandler.error('fail'));
    });

    // Mã: TC-PC-008
    // Test case: Xử lý giá trị không phải Error khi tìm kiếm
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw một object không phải Error
    // Input: page = 1, limit = 10, name = 'abc', category_id = 'cat1', service throw { msg: 'fail' }
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message là JSON string của object
    it('should handle errors with non-Error object', async () => {
      mockProductService.searchProducts.mockRejectedValue({ msg: 'fail' });
      // @ts-ignore
      const result = await controller.search(1, 10, 'abc', 'cat1');
      expect(result).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
    });
  });

  // Kiểm tra các chức năng liên quan đến tạo mới sản phẩm
  describe('create', () => {
    // Mã: TC-PC-009
    // Test case: Tạo mới sản phẩm
    // Mục tiêu: Kiểm tra controller tạo mới sản phẩm thành công thông qua service
    // Input: ProductCreateDTO với các thuộc tính sản phẩm
    // Output mong đợi: Response với thông tin sản phẩm được tạo, bọc trong responseHandler.ok
    it('should create a product', async () => {
      const dto: ProductCreateDTO = {
        name: 'test',
        priceout: 100,
        banner: 'banner',
        description: 'desc',
        stockQuantity: 10,
        weight: 1,
        url_image: 'img',
        category_id: 'cat',
        supplier_id: 'sup',
        expire_date: new Date(),
      };
      const mockProduct = { ...dto, id: '1' };
      mockProductService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(dto);
      expect(result).toEqual(responseHandler.ok(mockProduct));
      expect(mockProductService.create).toHaveBeenCalledWith(dto);
    });

    // Mã: TC-PC-010
    // Test case: Xử lý lỗi khi tạo sản phẩm
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw Error trong quá trình tạo
    // Input: ProductCreateDTO, service throw Error('fail')
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message 'fail'
    it('should handle errors', async () => {
      mockProductService.create.mockRejectedValue(new Error('fail'));
      const dto: ProductCreateDTO = {
        name: 'test',
        priceout: 100,
        banner: 'banner',
        description: 'desc',
        stockQuantity: 10,
        weight: 1,
        url_image: 'img',
        category_id: 'cat',
        supplier_id: 'sup',
        expire_date: new Date(),
      };
      const result = await controller.create(dto);
      expect(result).toEqual(responseHandler.error('fail'));
    });

    // Mã: TC-PC-011
    // Test case: Xử lý giá trị không phải Error khi tạo sản phẩm
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw một object không phải Error
    // Input: ProductCreateDTO, service throw { msg: 'fail' }
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message là JSON string của object
    it('should handle errors with non-Error object', async () => {
      mockProductService.create.mockRejectedValue({ msg: 'fail' });
      const dto: ProductCreateDTO = {
        name: 'test',
        priceout: 100,
        banner: 'banner',
        description: 'desc',
        stockQuantity: 10,
        weight: 1,
        url_image: 'img',
        category_id: 'cat',
        supplier_id: 'sup',
        expire_date: new Date(),
      };
      const result = await controller.create(dto);
      expect(result).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
    });
  });

  // Kiểm tra các chức năng liên quan đến lấy thông tin chi tiết sản phẩm
  describe('detail', () => {
    // Mã: TC-PC-012
    // Test case: Lấy thông tin chi tiết sản phẩm
    // Mục tiêu: Kiểm tra controller trả về thông tin chi tiết sản phẩm dựa trên ID
    // Input: id = '1'
    // Output mong đợi: Response với thông tin sản phẩm được bọc trong responseHandler.ok
    it('should return product detail', async () => {
      const mockDetail = { products: { id: '1', name: 'test' } };
      mockProductService.detail.mockResolvedValue(mockDetail);

      const result = await controller.detail('1');
      expect(result).toEqual(responseHandler.ok(mockDetail));
      expect(mockProductService.detail).toHaveBeenCalledWith('1');
    });

    // Mã: TC-PC-013
    // Test case: Xử lý lỗi khi lấy chi tiết sản phẩm
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw Error
    // Input: id = '1', service throw Error('fail')
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message 'fail'
    it('should handle errors', async () => {
      mockProductService.detail.mockRejectedValue(new Error('fail'));
      const result = await controller.detail('1');
      expect(result).toEqual(responseHandler.error('fail'));
    });

    // Mã: TC-PC-014
    // Test case: Xử lý giá trị không phải Error khi lấy chi tiết
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw một object không phải Error
    // Input: id = '1', service throw { msg: 'fail' }
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message là JSON string của object
    it('should handle errors with non-Error object', async () => {
      mockProductService.detail.mockRejectedValue({ msg: 'fail' });
      const result = await controller.detail('1');
      expect(result).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
    });
  });

  // Kiểm tra các chức năng liên quan đến cập nhật sản phẩm
  describe('update', () => {
    // Mã: TC-PC-015
    // Test case: Cập nhật thông tin sản phẩm
    // Mục tiêu: Kiểm tra controller cập nhật sản phẩm thành công thông qua service
    // Input: ProductUpdateDTO với các thuộc tính sản phẩm
    // Output mong đợi: Response với thông tin sản phẩm đã cập nhật, bọc trong responseHandler.ok
    it('should update a product', async () => {
      const dto: ProductUpdateDTO = {
        id: '1',
        name: 'test',
        priceout: 100,
        banner: 'banner',
        description: 'desc',
        stockQuantity: 10,
        weight: 1,
        url_image: 'img',
        category_id: 'cat',
        supplier_id: 'sup',
        expire_date: new Date(),
      };
      const mockUpdate = { ...dto };
      mockProductService.update.mockResolvedValue(mockUpdate);

      const result = await controller.update(dto);
      expect(result).toEqual(responseHandler.ok(mockUpdate));
      expect(mockProductService.update).toHaveBeenCalledWith(dto, dto.id);
    });

    // Mã: TC-PC-016
    // Test case: Xử lý lỗi khi cập nhật sản phẩm
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw Error trong quá trình cập nhật
    // Input: ProductUpdateDTO, service throw Error('fail')
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message 'fail'
    it('should handle errors', async () => {
      mockProductService.update.mockRejectedValue(new Error('fail'));
      const dto: ProductUpdateDTO = {
        id: '1',
        name: 'test',
        priceout: 100,
        banner: 'banner',
        description: 'desc',
        stockQuantity: 10,
        weight: 1,
        url_image: 'img',
        category_id: 'cat',
        supplier_id: 'sup',
        expire_date: new Date(),
      };
      const result = await controller.update(dto);
      expect(result).toEqual(responseHandler.error('fail'));
    });

    // Mã: TC-PC-017
    // Test case: Xử lý giá trị không phải Error khi cập nhật
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw một object không phải Error
    // Input: ProductUpdateDTO, service throw { msg: 'fail' }
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message là JSON string của object
    it('should handle errors with non-Error object', async () => {
      mockProductService.update.mockRejectedValue({ msg: 'fail' });
      const dto: ProductUpdateDTO = {
        id: '1',
        name: 'test',
        priceout: 100,
        banner: 'banner',
        description: 'desc',
        stockQuantity: 10,
        weight: 1,
        url_image: 'img',
        category_id: 'cat',
        supplier_id: 'sup',
        expire_date: new Date(),
      };
      const result = await controller.update(dto);
      expect(result).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
    });
  });

  // Kiểm tra các chức năng liên quan đến xóa sản phẩm
  describe('delete', () => {
    // Mã: TC-PC-018
    // Test case: Xóa sản phẩm
    // Mục tiêu: Kiểm tra controller xóa sản phẩm thành công thông qua service
    // Input: id = '1'
    // Output mong đợi: Response với thông tin xóa (affected: 1), bọc trong responseHandler.ok
    it('should delete a product', async () => {
      mockProductService.delete.mockResolvedValue({ affected: 1 });
      const result = await controller.delete('1');
      expect(result).toEqual(responseHandler.ok({ affected: 1 }));
      expect(mockProductService.delete).toHaveBeenCalledWith('1');
    });

    // Mã: TC-PC-019
    // Test case: Xử lý lỗi khi xóa sản phẩm
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw Error trong quá trình xóa
    // Input: id = '1', service throw Error('fail')
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message 'fail'
    it('should handle errors', async () => {
      mockProductService.delete.mockRejectedValue(new Error('fail'));
      const result = await controller.delete('1');
      expect(result).toEqual(responseHandler.error('fail'));
    });

    // Mã: TC-PC-020
    // Test case: Xử lý giá trị không phải Error khi xóa
    // Mục tiêu: Kiểm tra controller xử lý đúng khi service throw một object không phải Error
    // Input: id = '1', service throw { msg: 'fail' }
    // Output mong đợi: Response lỗi được bọc trong responseHandler.error với message là JSON string của object
    it('should handle errors with non-Error object', async () => {
      mockProductService.delete.mockRejectedValue({ msg: 'fail' });
      const result = await controller.delete('1');
      expect(result).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
    });
  });
});