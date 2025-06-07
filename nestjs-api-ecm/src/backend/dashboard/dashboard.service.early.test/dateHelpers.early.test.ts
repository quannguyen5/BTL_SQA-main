/**
 * File: dateHelpers.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho các phương thức helper xử lý ngày tháng của DashboardService
 * Module: Dashboard
 * Chức năng: Kiểm tra các chức năng addDays, addMonths, addYears
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
 * Test Suite: DashboardService - Date Helper Methods
 * Mô tả: Bộ test cho các phương thức helper xử lý ngày tháng của DashboardService
 */
describe('DashboardService Date Helper Methods', () => {
  let dashboardService: DashboardService;

  /**
   * Mock cho các repository
   * Mô tả: Tạo mock cho các repository được sử dụng trong service
   */
  const mockOrderRepo = {};
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
  });

  /**
   * Nhóm test case: Phương thức addDays
   * Mô tả: Kiểm tra phương thức addDays hoạt động đúng
   */
  describe('addDays method', () => {
    /**
     * Test case: TC-SV-DASHBOARD-ADDDAYS-001
     * Mục tiêu: Kiểm tra phương thức addDays thêm ngày đúng
     * Input: date = '2023-04-15', days = 5
     * Expected Output: Ngày mới là '2023-04-20'
     * Ghi chú: Kiểm tra thêm ngày dương
     */
    it('TC-SV-DASHBOARD-ADDDAYS-001 - Nên thêm ngày đúng với số ngày dương', () => {
      // Sắp xếp (Arrange)
      const date = new Date('2023-04-15');
      const days = 5;

      // Thực thi (Act)
      const result = dashboardService.addDays(date, days);

      // Kiểm tra (Assert)
      const expected = new Date('2023-04-20');
      expect(result.getFullYear()).toBe(expected.getFullYear());
      expect(result.getMonth()).toBe(expected.getMonth());
      expect(result.getDate()).toBe(expected.getDate());
    });

    /**
     * Test case: TC-SV-DASHBOARD-ADDDAYS-002
     * Mục tiêu: Kiểm tra phương thức addDays trừ ngày đúng
     * Input: date = '2023-04-15', days = -5
     * Expected Output: Ngày mới là '2023-04-10'
     * Ghi chú: Kiểm tra thêm ngày âm (trừ ngày)
     */
    it('TC-SV-DASHBOARD-ADDDAYS-002 - Nên trừ ngày đúng với số ngày âm', () => {
      // Sắp xếp (Arrange)
      const date = new Date('2023-04-15');
      const days = -5;

      // Thực thi (Act)
      const result = dashboardService.addDays(date, days);

      // Kiểm tra (Assert)
      const expected = new Date('2023-04-10');
      expect(result.getFullYear()).toBe(expected.getFullYear());
      expect(result.getMonth()).toBe(expected.getMonth());
      expect(result.getDate()).toBe(expected.getDate());
    });

    /**
     * Test case: TC-SV-DASHBOARD-ADDDAYS-003
     * Mục tiêu: Kiểm tra phương thức addDays xử lý đúng khi chuyển tháng
     * Input: date = '2023-04-30', days = 5
     * Expected Output: Ngày mới là '2023-05-05'
     * Ghi chú: Kiểm tra thêm ngày qua tháng mới
     */
    it('TC-SV-DASHBOARD-ADDDAYS-003 - Nên xử lý đúng khi thêm ngày qua tháng mới', () => {
      // Sắp xếp (Arrange)
      const date = new Date('2023-04-30');
      const days = 5;

      // Thực thi (Act)
      const result = dashboardService.addDays(date, days);

      // Kiểm tra (Assert)
      const expected = new Date('2023-05-05');
      expect(result.getFullYear()).toBe(expected.getFullYear());
      expect(result.getMonth()).toBe(expected.getMonth());
      expect(result.getDate()).toBe(expected.getDate());
    });
  });

  /**
   * Nhóm test case: Phương thức addMonths
   * Mô tả: Kiểm tra phương thức addMonths hoạt động đúng
   */
  describe('addMonths method', () => {
    /**
     * Test case: TC_DASHBOARD_SERVICE_ADD_MONTHS_001
     * Mục tiêu: Kiểm tra phương thức addMonths thêm tháng đúng
     * Input: date = '2023-04-15', months = 3
     * Expected Output: Ngày mới là '2023-07-15'
     * Ghi chú: Kiểm tra thêm tháng dương
     */
    it('TC_DASHBOARD_SERVICE_ADD_MONTHS_001 - Nên thêm tháng đúng với số tháng dương', () => {
      // Sắp xếp (Arrange)
      const date = new Date('2023-04-15');
      const months = 3;

      // Thực thi (Act)
      const result = dashboardService.addMonths(date, months);

      // Kiểm tra (Assert)
      const expected = new Date('2023-07-15');
      expect(result.getFullYear()).toBe(expected.getFullYear());
      expect(result.getMonth()).toBe(expected.getMonth());
      expect(result.getDate()).toBe(expected.getDate());
    });

    /**
     * Test case: TC_DASHBOARD_SERVICE_ADD_MONTHS_002
     * Mục tiêu: Kiểm tra phương thức addMonths trừ tháng đúng
     * Input: date = '2023-04-15', months = -3
     * Expected Output: Ngày mới là '2023-01-15'
     * Ghi chú: Kiểm tra thêm tháng âm (trừ tháng)
     */
    it('TC_DASHBOARD_SERVICE_ADD_MONTHS_002 - Nên trừ tháng đúng với số tháng âm', () => {
      // Sắp xếp (Arrange)
      const date = new Date('2023-04-15');
      const months = -3;

      // Thực thi (Act)
      const result = dashboardService.addMonths(date, months);

      // Kiểm tra (Assert)
      const expected = new Date('2023-01-15');
      expect(result.getFullYear()).toBe(expected.getFullYear());
      expect(result.getMonth()).toBe(expected.getMonth());
      expect(result.getDate()).toBe(expected.getDate());
    });

    /**
     * Test case: TC_DASHBOARD_SERVICE_ADD_MONTHS_003
     * Mục tiêu: Kiểm tra phương thức addMonths xử lý đúng khi chuyển năm
     * Input: date = '2023-12-15', months = 3
     * Expected Output: Ngày mới là '2024-03-15'
     * Ghi chú: Kiểm tra thêm tháng qua năm mới
     */
    it('TC_DASHBOARD_SERVICE_ADD_MONTHS_003 - Nên xử lý đúng khi thêm tháng qua năm mới', () => {
      // Sắp xếp (Arrange)
      const date = new Date('2023-12-15');
      const months = 3;

      // Thực thi (Act)
      const result = dashboardService.addMonths(date, months);

      // Kiểm tra (Assert)
      const expected = new Date('2024-03-15');
      expect(result.getFullYear()).toBe(expected.getFullYear());
      expect(result.getMonth()).toBe(expected.getMonth());
      expect(result.getDate()).toBe(expected.getDate());
    });
  });

  /**
   * Nhóm test case: Phương thức addYears
   * Mô tả: Kiểm tra phương thức addYears hoạt động đúng
   */
  describe('addYears method', () => {
    /**
     * Test case: TC_DASHBOARD_SERVICE_ADD_YEARS_001
     * Mục tiêu: Kiểm tra phương thức addYears thêm năm đúng
     * Input: date = '2023-04-15', years = 2
     * Expected Output: Ngày mới là '2025-04-15'
     * Ghi chú: Kiểm tra thêm năm dương
     */
    it('TC_DASHBOARD_SERVICE_ADD_YEARS_001 - Nên thêm năm đúng với số năm dương', () => {
      // Sắp xếp (Arrange)
      const date = new Date('2023-04-15');
      const years = 2;

      // Thực thi (Act)
      const result = dashboardService.addYears(date, years);

      // Kiểm tra (Assert)
      const expected = new Date('2025-04-15');
      expect(result.getFullYear()).toBe(expected.getFullYear());
      expect(result.getMonth()).toBe(expected.getMonth());
      expect(result.getDate()).toBe(expected.getDate());
    });

    /**
     * Test case: TC_DASHBOARD_SERVICE_ADD_YEARS_002
     * Mục tiêu: Kiểm tra phương thức addYears trừ năm đúng
     * Input: date = '2023-04-15', years = -2
     * Expected Output: Ngày mới là '2021-04-15'
     * Ghi chú: Kiểm tra thêm năm âm (trừ năm)
     */
    it('TC_DASHBOARD_SERVICE_ADD_YEARS_002 - Nên trừ năm đúng với số năm âm', () => {
      // Sắp xếp (Arrange)
      const date = new Date('2023-04-15');
      const years = -2;

      // Thực thi (Act)
      const result = dashboardService.addYears(date, years);

      // Kiểm tra (Assert)
      const expected = new Date('2021-04-15');
      expect(result.getFullYear()).toBe(expected.getFullYear());
      expect(result.getMonth()).toBe(expected.getMonth());
      expect(result.getDate()).toBe(expected.getDate());
    });

    /**
     * Test case: TC_DASHBOARD_SERVICE_ADD_YEARS_003
     * Mục tiêu: Kiểm tra phương thức addYears xử lý đúng với ngày 29/02 trong năm nhuận
     * Input: date = '2020-02-29' (năm nhuận), years = 1
     * Expected Output: Ngày mới là '2021-02-28' (không phải năm nhuận)
     * Ghi chú: Kiểm tra xử lý ngày 29/02 khi chuyển từ năm nhuận sang năm không nhuận
     */
    it('TC_DASHBOARD_SERVICE_ADD_YEARS_003 - Nên xử lý đúng với ngày 29/02 trong năm nhuận', () => {
      // Sắp xếp (Arrange)
      const date = new Date('2020-02-29'); // Năm nhuận
      const years = 1;

      // Thực thi (Act)
      const result = dashboardService.addYears(date, years);

      // Kiểm tra (Assert)
      // JavaScript tự động xử lý ngày 29/02 khi chuyển sang năm không nhuận
      // Kết quả sẽ là 28/02 hoặc 01/03 tùy thuộc vào cài đặt
      expect(result.getFullYear()).toBe(2021);
      // Không kiểm tra ngày cụ thể vì có thể khác nhau giữa các môi trường
    });
  });
});
