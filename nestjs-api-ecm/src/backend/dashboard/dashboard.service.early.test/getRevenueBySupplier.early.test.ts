/**
 * File: getRevenueBySupplier.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getRevenueBySupplier của DashboardService
 * Module: Dashboard
 * Chức năng: Kiểm tra chức năng lấy doanh thu theo nhà cung cấp
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
 * Test Suite: DashboardService - getRevenueBySupplier
 * Mô tả: Bộ test cho phương thức getRevenueBySupplier của DashboardService
 */
describe('DashboardService.getRevenueBySupplier() method', () => {
  let dashboardService: DashboardService;

  /**
   * Mock cho các repository
   * Mô tả: Tạo mock cho các repository được sử dụng trong service
   */
  const mockOrderRepo = {
    getRevenueBySupplier: jest.fn(),
  };
  const mockOrderProductRepo = {};
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
     * Test case: TC-SV-DASHBOARD-REVENUESUPPLIER-001
     * Mục tiêu: Kiểm tra phương thức getRevenueBySupplier trả về doanh thu theo nhà cung cấp đúng
     * Input: timeFilter = TimeFilter.Week
     * Expected Output: [{ supplier_id: 'S001', supplier_name: 'Nhà cung cấp A', total_revenue: 12000000 }, { supplier_id: 'S002', supplier_name: 'Nhà cung cấp B', total_revenue: 8000000 }]
     * Ghi chú: Kiểm tra luồng thành công cơ bản
     */
    it('TC-SV-DASHBOARD-REVENUESUPPLIER-001 - Nên trả về doanh thu theo nhà cung cấp đúng', async () => {
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

      // Mock getRevenueBySupplier
      const mockRevenueBySupplier = [
        { supplier_id: 'S001', supplier_name: 'Nhà cung cấp A', total_revenue: 12000000 },
        { supplier_id: 'S002', supplier_name: 'Nhà cung cấp B', total_revenue: 8000000 }
      ];

      mockOrderRepo.getRevenueBySupplier.mockResolvedValue(mockRevenueBySupplier);

      // Thực thi (Act)
      const result = await dashboardService.getRevenueBySupplier(timeFilter);

      // Kiểm tra (Assert)
      expect(dashboardService.timeFilterCreate).toHaveBeenCalledWith(timeFilter);
      expect(dashboardService.lastTimeFilterCreate).toHaveBeenCalledWith(mockStartDate, mockEndDate, timeFilter);
      expect(mockOrderRepo.getRevenueBySupplier).toHaveBeenCalledWith(mockStartDate, mockEndDate);

      // Kiểm tra kết quả
      expect(result).toEqual(mockRevenueBySupplier);
    });

    /**
     * Test case: TC-SV-DASHBOARD-REVENUESUPPLIER-002
     * Mục tiêu: Kiểm tra phương thức getRevenueBySupplier hoạt động đúng với các bộ lọc thời gian khác nhau
     * Input: timeFilter = TimeFilter.Month
     * Expected Output: [{ supplier_id: 'S001', supplier_name: 'Nhà cung cấp A', total_revenue: 45000000 }, { supplier_id: 'S003', supplier_name: 'Nhà cung cấp C', total_revenue: 30000000 }]
     * Ghi chú: Kiểm tra với bộ lọc theo tháng
     */
    it('TC-SV-DASHBOARD-REVENUESUPPLIER-002 - Nên hoạt động đúng với bộ lọc "Tháng"', async () => {
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

      // Mock getRevenueBySupplier
      const mockRevenueBySupplier = [
        { supplier_id: 'S001', supplier_name: 'Nhà cung cấp A', total_revenue: 45000000 },
        { supplier_id: 'S003', supplier_name: 'Nhà cung cấp C', total_revenue: 30000000 }
      ];

      mockOrderRepo.getRevenueBySupplier.mockResolvedValue(mockRevenueBySupplier);

      // Thực thi (Act)
      const result = await dashboardService.getRevenueBySupplier(timeFilter);

      // Kiểm tra (Assert)
      expect(dashboardService.timeFilterCreate).toHaveBeenCalledWith(timeFilter);
      expect(dashboardService.lastTimeFilterCreate).toHaveBeenCalledWith(mockStartDate, mockEndDate, timeFilter);
      expect(mockOrderRepo.getRevenueBySupplier).toHaveBeenCalledWith(mockStartDate, mockEndDate);

      // Kiểm tra kết quả
      expect(result).toEqual(mockRevenueBySupplier);
    });
  });

  /**
   * Nhóm test case: Các trường hợp ngoại lệ
   * Mô tả: Kiểm tra các trường hợp xử lý lỗi và ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test case: TC-SV-DASHBOARD-REVENUESUPPLIER-003
     * Mục tiêu: Kiểm tra phương thức getRevenueBySupplier xử lý đúng khi repository trả về mảng rỗng
     * Input: timeFilter = TimeFilter.Quarter
     * Expected Output: []
     * Ghi chú: Kiểm tra xử lý mảng rỗng
     */
    it('TC-SV-DASHBOARD-REVENUESUPPLIER-003 - Nên trả về mảng rỗng khi repository trả về mảng rỗng', async () => {
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

      // Mock getRevenueBySupplier trả về mảng rỗng
      mockOrderRepo.getRevenueBySupplier.mockResolvedValue([]);

      // Thực thi (Act)
      const result = await dashboardService.getRevenueBySupplier(timeFilter);

      // Kiểm tra (Assert)
      expect(dashboardService.timeFilterCreate).toHaveBeenCalledWith(timeFilter);
      expect(dashboardService.lastTimeFilterCreate).toHaveBeenCalledWith(mockStartDate, mockEndDate, timeFilter);
      expect(mockOrderRepo.getRevenueBySupplier).toHaveBeenCalledWith(mockStartDate, mockEndDate);
      expect(result).toEqual([]);
    });

    /**
     * Test case: TC-SV-DASHBOARD-REVENUESUPPLIER-004
     * Mục tiêu: Kiểm tra phương thức getRevenueBySupplier xử lý lỗi khi repository ném ra lỗi
     * Input: timeFilter = TimeFilter.Year
     * Expected Output: Error('Supplier repository error')
     * Ghi chú: Kiểm tra xử lý lỗi từ repository
     */
    it('TC-SV-DASHBOARD-REVENUESUPPLIER-004 - Nên ném ra lỗi khi repository gặp lỗi', async () => {
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

      // Mock getRevenueBySupplier để ném ra lỗi
      const errorMessage = 'Supplier repository error';
      mockOrderRepo.getRevenueBySupplier.mockRejectedValue(new Error(errorMessage));

      // Thực thi & Kiểm tra (Act & Assert)
      await expect(dashboardService.getRevenueBySupplier(timeFilter))
        .rejects.toThrow(errorMessage);

      expect(dashboardService.timeFilterCreate).toHaveBeenCalledWith(timeFilter);
      expect(dashboardService.lastTimeFilterCreate).toHaveBeenCalledWith(mockStartDate, mockEndDate, timeFilter);
      expect(mockOrderRepo.getRevenueBySupplier).toHaveBeenCalledWith(mockStartDate, mockEndDate);
    });
  });
});
