/**
 * File: getFeatureProduct.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getFeatureProduct của DashboardService
 * Module: Dashboard
 * Chức năng: Kiểm tra chức năng lấy danh sách sản phẩm nổi bật
 * Ngày tạo: 2023
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../dashboard.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderRepository } from 'src/repository/OrderRepository';
import { OrderProductRepository } from 'src/repository/OrderProductRepository';
import { ImportRepository } from 'src/repository/ImportRepository';
import { ImportProductRepository } from 'src/repository/ImportProductRepository';
import { UserRepository } from 'src/repository/UserRepository';

/**
 * Test Suite: DashboardService - getFeatureProduct
 * Mô tả: Bộ test cho phương thức getFeatureProduct của DashboardService
 */
describe('DashboardService.getFeatureProduct() method', () => {
  let dashboardService: DashboardService;

  /**
   * Mock cho các repository
   * Mô tả: Tạo mock cho các repository được sử dụng trong service
   */
  const mockOrderRepo = {};
  const mockOrderProductRepo = {
    getFeatureProductsByRevenue: jest.fn(),
  };
  const mockImportRepo = {};
  const mockImportProRepo = {};
  const mockUserRepo = {};

  /**
   * Thiết lập môi trường test
   * Mô tả: Khởi tạo service với các repository đã được mock
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(OrderRepository), useValue: mockOrderRepo },
        { provide: getRepositoryToken(OrderProductRepository), useValue: mockOrderProductRepo },
        { provide: getRepositoryToken(ImportRepository), useValue: mockImportRepo },
        { provide: getRepositoryToken(ImportProductRepository), useValue: mockImportProRepo },
        { provide: getRepositoryToken(UserRepository), useValue: mockUserRepo },
      ],
    }).compile();

    dashboardService = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Nhóm test case: Các trường hợp thành công
   * Mô tả: Kiểm tra các trường hợp phương thức hoạt động đúng
   */
  describe('Happy paths', () => {
    /**
     * Test case: TC-SV-DASHBOARD-FEATUREPRODUCT-001
     * Mục tiêu: Kiểm tra phương thức getFeatureProduct trả về danh sách sản phẩm nổi bật đúng
     * Input: Không có tham số đầu vào
     * Expected Output: [{ product_id: 'P001', product_name: 'Sản phẩm nổi bật 1', total_sold: 150, rating: 4.8 }, { product_id: 'P002', product_name: 'Sản phẩm nổi bật 2', total_sold: 120, rating: 4.7 }]
     * Ghi chú: Kiểm tra luồng thành công cơ bản
     */
    it('TC-SV-DASHBOARD-FEATUREPRODUCT-001 - Nên trả về danh sách sản phẩm nổi bật đúng', async () => {
      // Sắp xếp (Arrange)
      const mockFeatureProducts = [
        { product_id: 'P001', product_name: 'Sản phẩm nổi bật 1', total_sold: 150, rating: 4.8 },
        { product_id: 'P002', product_name: 'Sản phẩm nổi bật 2', total_sold: 120, rating: 4.7 }
      ];

      mockOrderProductRepo.getFeatureProductsByRevenue.mockResolvedValue(mockFeatureProducts);

      // Thực thi (Act)
      const result = await dashboardService.getFeatureProduct();

      // Kiểm tra (Assert)
      expect(mockOrderProductRepo.getFeatureProductsByRevenue).toHaveBeenCalled();
      expect(result).toEqual(mockFeatureProducts);
    });

    /**
     * Test case: TC-SV-DASHBOARD-FEATUREPRODUCT-002
     * Mục tiêu: Kiểm tra phương thức getFeatureProduct xử lý đúng khi repository trả về mảng rỗng
     * Input: Không có tham số đầu vào
     * Expected Output: []
     * Ghi chú: Kiểm tra xử lý mảng rỗng
     */
    it('TC-SV-DASHBOARD-FEATUREPRODUCT-002 - Nên trả về mảng rỗng khi repository trả về mảng rỗng', async () => {
      // Sắp xếp (Arrange)
      mockOrderProductRepo.getFeatureProductsByRevenue.mockResolvedValue([]);

      // Thực thi (Act)
      const result = await dashboardService.getFeatureProduct();

      // Kiểm tra (Assert)
      expect(mockOrderProductRepo.getFeatureProductsByRevenue).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  /**
   * Nhóm test case: Các trường hợp ngoại lệ
   * Mô tả: Kiểm tra các trường hợp xử lý lỗi và ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test case: TC-SV-DASHBOARD-FEATUREPRODUCT-003
     * Mục tiêu: Kiểm tra phương thức getFeatureProduct xử lý lỗi khi repository ném ra lỗi
     * Input: Không có tham số đầu vào
     * Expected Output: Error('Product repository error')
     * Ghi chú: Kiểm tra xử lý lỗi từ repository
     */
    it('TC-SV-DASHBOARD-FEATUREPRODUCT-003 - Nên ném ra lỗi khi repository gặp lỗi', async () => {
      // Sắp xếp (Arrange)
      const errorMessage = 'Product repository error';
      mockOrderProductRepo.getFeatureProductsByRevenue.mockRejectedValue(new Error(errorMessage));

      // Thực thi & Kiểm tra (Act & Assert)
      await expect(dashboardService.getFeatureProduct())
        .rejects.toThrow(errorMessage);

      expect(mockOrderProductRepo.getFeatureProductsByRevenue).toHaveBeenCalled();
    });

    /**
     * Test case: TC-SV-DASHBOARD-FEATUREPRODUCT-004
     * Mục tiêu: Kiểm tra phương thức getFeatureProduct xử lý đúng khi repository trả về null
     * Input: Không có tham số đầu vào
     * Expected Output: null
     * Ghi chú: Kiểm tra xử lý giá trị null
     */
    it('TC-SV-DASHBOARD-FEATUREPRODUCT-004 - Nên xử lý đúng khi repository trả về null', async () => {
      // Sắp xếp (Arrange)
      mockOrderProductRepo.getFeatureProductsByRevenue.mockResolvedValue(null);

      // Thực thi (Act)
      const result = await dashboardService.getFeatureProduct();

      // Kiểm tra (Assert)
      expect(mockOrderProductRepo.getFeatureProductsByRevenue).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
