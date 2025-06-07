/**
 * File: getTopProductsByRevenue.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getTopProductsByRevenue của DashboardService
 * Module: Dashboard
 * Chức năng: Kiểm tra chức năng lấy danh sách sản phẩm bán chạy nhất theo doanh thu
 * Ngày tạo: 2023
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../dashboard.service';
import { TimeFilter } from 'src/share/Enum/Enum';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderRepository } from 'src/repository/OrderRepository';
import { OrderProductRepository } from 'src/repository/OrderProductRepository';
import { ImportRepository } from 'src/repository/ImportRepository';
import { ImportProductRepository } from 'src/repository/ImportProductRepository';
import { UserRepository } from 'src/repository/UserRepository';

/**
 * Test Suite: DashboardService - getTopProductsByRevenue
 * Mô tả: Bộ test cho phương thức getTopProductsByRevenue của DashboardService
 */
describe('DashboardService.getTopProductsByRevenue() method', () => {
  let dashboardService: DashboardService;

  /**
   * Mock cho các repository
   * Mô tả: Tạo mock cho các repository được sử dụng trong service
   */
  const mockOrderRepo = {};
  const mockOrderProductRepo = {
    getTopProductsByRevenue: jest.fn(),
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

    // Spy các phương thức helper để kiểm tra chúng được gọi đúng cách
    jest.spyOn(dashboardService, 'timeFilterCreate');
    jest.spyOn(dashboardService, 'lastTimeFilterCreate');
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
     * Test case: TC-SV-DASHBOARD-TOPPRODUCTS-001
     * Mục tiêu: Kiểm tra phương thức getTopProductsByRevenue trả về danh sách sản phẩm bán chạy đúng
     * Input: timeFilter = TimeFilter.Week
     * Expected Output: [{ product_id: 'P001', product_name: 'Sản phẩm 1', total_revenue: 5000000, quantity_sold: 50 }, { product_id: 'P002', product_name: 'Sản phẩm 2', total_revenue: 3000000, quantity_sold: 30 }]
     * Ghi chú: Kiểm tra luồng thành công cơ bản
     */
    it('TC-SV-DASHBOARD-TOPPRODUCTS-001 - Nên trả về danh sách sản phẩm bán chạy đúng', async () => {
      // Sắp xếp (Arrange)
      const timeFilter = TimeFilter.Week;
      const mockStartDate = new Date('2023-04-10');
      const mockEndDate = new Date('2023-04-16');
      const mockLastStartDate = new Date('2023-04-03');
      const mockLastEndDate = new Date('2023-04-09');

      // Mock timeFilterCreate và lastTimeFilterCreate
      dashboardService.timeFilterCreate = jest.fn().mockReturnValue({
        startDate: mockStartDate,
        endDate: mockEndDate
      });

      dashboardService.lastTimeFilterCreate = jest.fn().mockReturnValue({
        lastStartDate: mockLastStartDate,
        lastEndDate: mockLastEndDate
      });

      // Mock getTopProductsByRevenue
      const mockTopProducts = [
        { product_id: 'P001', product_name: 'Sản phẩm 1', total_revenue: 5000000, quantity_sold: 50 },
        { product_id: 'P002', product_name: 'Sản phẩm 2', total_revenue: 3000000, quantity_sold: 30 }
      ];

      mockOrderProductRepo.getTopProductsByRevenue.mockResolvedValue(mockTopProducts);

      // Thực thi (Act)
      const result = await dashboardService.getTopProductsByRevenue(timeFilter);

      // Kiểm tra (Assert)
      expect(dashboardService.timeFilterCreate).toHaveBeenCalledWith(timeFilter);
      expect(dashboardService.lastTimeFilterCreate).toHaveBeenCalledWith(mockStartDate, mockEndDate, timeFilter);
      expect(mockOrderProductRepo.getTopProductsByRevenue).toHaveBeenCalledWith(mockStartDate, mockEndDate);

      // Kiểm tra kết quả
      expect(result).toEqual(mockTopProducts);
    });

    /**
     * Test case: TC-SV-DASHBOARD-TOPPRODUCTS-002
     * Mục tiêu: Kiểm tra phương thức getTopProductsByRevenue hoạt động đúng với các bộ lọc thời gian khác nhau
     * Input: timeFilter = TimeFilter.Month
     * Expected Output: [{ product_id: 'P001', product_name: 'Sản phẩm 1', total_revenue: 15000000, quantity_sold: 150 }, { product_id: 'P003', product_name: 'Sản phẩm 3', total_revenue: 12000000, quantity_sold: 120 }]
     * Ghi chú: Kiểm tra với bộ lọc theo tháng
     */
    it('TC-SV-DASHBOARD-TOPPRODUCTS-002 - Nên hoạt động đúng với bộ lọc "Tháng"', async () => {
      // Sắp xếp (Arrange)
      const timeFilter = TimeFilter.Month;
      const mockStartDate = new Date('2023-04-01');
      const mockEndDate = new Date('2023-04-30');
      const mockLastStartDate = new Date('2023-03-01');
      const mockLastEndDate = new Date('2023-03-31');

      // Mock timeFilterCreate và lastTimeFilterCreate
      dashboardService.timeFilterCreate = jest.fn().mockReturnValue({
        startDate: mockStartDate,
        endDate: mockEndDate
      });

      dashboardService.lastTimeFilterCreate = jest.fn().mockReturnValue({
        lastStartDate: mockLastStartDate,
        lastEndDate: mockLastEndDate
      });

      // Mock getTopProductsByRevenue
      const mockTopProducts = [
        { product_id: 'P001', product_name: 'Sản phẩm 1', total_revenue: 15000000, quantity_sold: 150 },
        { product_id: 'P003', product_name: 'Sản phẩm 3', total_revenue: 12000000, quantity_sold: 120 }
      ];

      mockOrderProductRepo.getTopProductsByRevenue.mockResolvedValue(mockTopProducts);

      // Thực thi (Act)
      const result = await dashboardService.getTopProductsByRevenue(timeFilter);

      // Kiểm tra (Assert)
      expect(dashboardService.timeFilterCreate).toHaveBeenCalledWith(timeFilter);
      expect(dashboardService.lastTimeFilterCreate).toHaveBeenCalledWith(mockStartDate, mockEndDate, timeFilter);
      expect(mockOrderProductRepo.getTopProductsByRevenue).toHaveBeenCalledWith(mockStartDate, mockEndDate);

      // Kiểm tra kết quả
      expect(result).toEqual(mockTopProducts);
    });
  });

  /**
   * Nhóm test case: Các trường hợp ngoại lệ
   * Mô tả: Kiểm tra các trường hợp xử lý lỗi và ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test case: TC-SV-DASHBOARD-TOPPRODUCTS-003
     * Mục tiêu: Kiểm tra phương thức getTopProductsByRevenue xử lý đúng khi repository trả về mảng rỗng
     * Input: timeFilter = TimeFilter.Quarter
     * Expected Output: []
     * Ghi chú: Kiểm tra xử lý mảng rỗng
     */
    it('TC-SV-DASHBOARD-TOPPRODUCTS-003 - Nên trả về mảng rỗng khi repository trả về mảng rỗng', async () => {
      // Sắp xếp (Arrange)
      const timeFilter = TimeFilter.Quarter;
      const mockStartDate = new Date('2023-04-01');
      const mockEndDate = new Date('2023-06-30');
      const mockLastStartDate = new Date('2023-01-01');
      const mockLastEndDate = new Date('2023-03-31');

      // Mock timeFilterCreate và lastTimeFilterCreate
      dashboardService.timeFilterCreate = jest.fn().mockReturnValue({
        startDate: mockStartDate,
        endDate: mockEndDate
      });

      dashboardService.lastTimeFilterCreate = jest.fn().mockReturnValue({
        lastStartDate: mockLastStartDate,
        lastEndDate: mockLastEndDate
      });

      // Mock getTopProductsByRevenue trả về mảng rỗng
      mockOrderProductRepo.getTopProductsByRevenue.mockResolvedValue([]);

      // Thực thi (Act)
      const result = await dashboardService.getTopProductsByRevenue(timeFilter);

      // Kiểm tra (Assert)
      expect(dashboardService.timeFilterCreate).toHaveBeenCalledWith(timeFilter);
      expect(dashboardService.lastTimeFilterCreate).toHaveBeenCalledWith(mockStartDate, mockEndDate, timeFilter);
      expect(mockOrderProductRepo.getTopProductsByRevenue).toHaveBeenCalledWith(mockStartDate, mockEndDate);
      expect(result).toEqual([]);
    });

    /**
     * Test case: TC-SV-DASHBOARD-TOPPRODUCTS-004
     * Mục tiêu: Kiểm tra phương thức getTopProductsByRevenue xử lý lỗi khi repository ném ra lỗi
     * Input: timeFilter = TimeFilter.Year
     * Expected Output: Error('Database query failed')
     * Ghi chú: Kiểm tra xử lý lỗi từ repository
     */
    it('TC-SV-DASHBOARD-TOPPRODUCTS-004 - Nên ném ra lỗi khi repository gặp lỗi', async () => {
      // Sắp xếp (Arrange)
      const timeFilter = TimeFilter.Year;
      const mockStartDate = new Date('2023-01-01');
      const mockEndDate = new Date('2023-12-31');
      const mockLastStartDate = new Date('2022-01-01');
      const mockLastEndDate = new Date('2022-12-31');

      // Mock timeFilterCreate và lastTimeFilterCreate
      dashboardService.timeFilterCreate = jest.fn().mockReturnValue({
        startDate: mockStartDate,
        endDate: mockEndDate
      });

      dashboardService.lastTimeFilterCreate = jest.fn().mockReturnValue({
        lastStartDate: mockLastStartDate,
        lastEndDate: mockLastEndDate
      });

      // Mock getTopProductsByRevenue để ném ra lỗi
      const errorMessage = 'Database query failed';
      mockOrderProductRepo.getTopProductsByRevenue.mockRejectedValue(new Error(errorMessage));

      // Thực thi & Kiểm tra (Act & Assert)
      await expect(dashboardService.getTopProductsByRevenue(timeFilter))
        .rejects.toThrow(errorMessage);

      expect(dashboardService.timeFilterCreate).toHaveBeenCalledWith(timeFilter);
      expect(dashboardService.lastTimeFilterCreate).toHaveBeenCalledWith(mockStartDate, mockEndDate, timeFilter);
      expect(mockOrderProductRepo.getTopProductsByRevenue).toHaveBeenCalledWith(mockStartDate, mockEndDate);
    });
  });
});
