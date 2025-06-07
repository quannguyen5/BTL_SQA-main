/**
 * File: getManageUserDashBoard.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getManageUserDashBoard của DashboardController
 * Module: Dashboard
 * Chức năng: Kiểm tra chức năng lấy thống kê quản lý người dùng cho dashboard
 * Ngày tạo: 2023
 */

import { responseHandler } from "src/Until/responseUtil";
import { DashboardController } from '../dashboard.controller';
import { DashboardService } from '../dashboard.service';

/**
 * Mock cho responseHandler
 * Mô tả: Tạo mock cho responseHandler để kiểm tra các phản hồi từ controller
 */
jest.mock("src/Until/responseUtil");

/**
 * Mock cho DashboardService
 * Mô tả: Tạo mock cho DashboardService để giả lập các phương thức service
 */
const mockDashboardService = {
  getManageUserDashBoard: jest.fn(),
} as unknown as jest.Mocked<DashboardService>;

/**
 * Test Suite: DashboardController - getManageUserDashBoard
 * Mô tả: Bộ test cho phương thức getManageUserDashBoard của DashboardController
 */
describe('DashboardController.getManageUserDashBoard() method', () => {
  let dashboardController: DashboardController;

  /**
   * Thiết lập môi trường test
   * Mô tả: Khởi tạo controller với service đã được mock
   */
  beforeEach(() => {
    dashboardController = new DashboardController(mockDashboardService);
  });

  /**
   * Nhóm test case: Các trường hợp thành công
   * Mô tả: Kiểm tra các trường hợp phương thức hoạt động đúng
   */
  describe('Happy paths', () => {
    /**
     * Test case: TC-CT-DASHBOARD-MANAGEUSER-001
     * Mục tiêu: Kiểm tra phương thức getManageUserDashBoard trả về kết quả thành công
     * Input: Không có tham số đầu vào
     * Expected Output: { status: 200, data: { totalUsers: 100, usersThisWeek: 15, usersLastWeek: 10, usersBoughtThisWeek: 8, usersBoughtLastWeek: 5 } }
     * Ghi chú: Kiểm tra luồng thành công cơ bản
     */
    it('TC-CT-DASHBOARD-MANAGEUSER-001 - Nên trả về thống kê quản lý người dùng', async () => {
      // Sắp xếp (Arrange)
      const mockResult = {
        totalUsers: 100,
        usersThisWeek: 15,
        usersLastWeek: 10,
        usersBoughtThisWeek: 8,
        usersBoughtLastWeek: 5
      };
      mockDashboardService.getManageUserDashBoard.mockResolvedValue(mockResult as any as never);

      // Thực thi (Act)
      const result = await dashboardController.getManageUserDashBoard();

      // Kiểm tra (Assert)
      expect(mockDashboardService.getManageUserDashBoard).toHaveBeenCalled();
      expect(responseHandler.ok).toHaveBeenCalledWith(mockResult);
      expect(result).toEqual(responseHandler.ok(mockResult));
    });

    /**
     * Test case: TC-CT-DASHBOARD-MANAGEUSER-002
     * Mục tiêu: Kiểm tra phương thức getManageUserDashBoard trả về kết quả với số liệu bằng 0
     * Input: Không có tham số đầu vào
     * Expected Output: { status: 200, data: { totalUsers: 50, usersThisWeek: 0, usersLastWeek: 0, usersBoughtThisWeek: 0, usersBoughtLastWeek: 0 } }
     * Ghi chú: Kiểm tra trường hợp không có người dùng mới
     */
    it('TC-CT-DASHBOARD-MANAGEUSER-002 - Nên trả về thống kê quản lý người dùng với số liệu bằng 0', async () => {
      // Sắp xếp (Arrange)
      const mockResult = {
        totalUsers: 50,
        usersThisWeek: 0,
        usersLastWeek: 0,
        usersBoughtThisWeek: 0,
        usersBoughtLastWeek: 0
      };
      mockDashboardService.getManageUserDashBoard.mockResolvedValue(mockResult as any as never);

      // Thực thi (Act)
      const result = await dashboardController.getManageUserDashBoard();

      // Kiểm tra (Assert)
      expect(mockDashboardService.getManageUserDashBoard).toHaveBeenCalled();
      expect(responseHandler.ok).toHaveBeenCalledWith(mockResult);
      expect(result).toEqual(responseHandler.ok(mockResult));
    });
  });

  /**
   * Nhóm test case: Các trường hợp ngoại lệ
   * Mô tả: Kiểm tra các trường hợp xử lý lỗi và ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test case: TC-CT-DASHBOARD-MANAGEUSER-003
     * Mục tiêu: Kiểm tra phương thức getManageUserDashBoard xử lý lỗi khi service gặp lỗi
     * Input: Không có tham số đầu vào
     * Expected Output: { status: 500, message: 'Lỗi khi lấy thống kê quản lý người dùng' }
     * Ghi chú: Kiểm tra xử lý lỗi kiểu Error
     */
    it('TC-CT-DASHBOARD-MANAGEUSER-003 - Nên xử lý lỗi từ service một cách hợp lý', async () => {
      // Sắp xếp (Arrange)
      const errorMessage = 'Lỗi khi lấy thống kê quản lý người dùng';
      mockDashboardService.getManageUserDashBoard.mockRejectedValue(new Error(errorMessage) as never);

      // Thực thi (Act)
      const result = await dashboardController.getManageUserDashBoard();

      // Kiểm tra (Assert)
      expect(mockDashboardService.getManageUserDashBoard).toHaveBeenCalled();
      expect(responseHandler.error).toHaveBeenCalledWith(errorMessage);
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    /**
     * Test case: TC-CT-DASHBOARD-MANAGEUSER-004
     * Mục tiêu: Kiểm tra phương thức getManageUserDashBoard xử lý lỗi không phải Error
     * Input: Không có tham số đầu vào
     * Expected Output: { status: 500, message: '{"code":500,"message":"User repository error"}' }
     * Ghi chú: Kiểm tra xử lý lỗi không phải kiểu Error
     */
    it('TC-CT-DASHBOARD-MANAGEUSER-004 - Nên xử lý ngoại lệ không phải kiểu Error', async () => {
      // Sắp xếp (Arrange)
      const errorObject = { code: 500, message: 'User repository error' };
      mockDashboardService.getManageUserDashBoard.mockRejectedValue(errorObject as never);

      // Thực thi (Act)
      const result = await dashboardController.getManageUserDashBoard();

      // Kiểm tra (Assert)
      expect(mockDashboardService.getManageUserDashBoard).toHaveBeenCalled();
      expect(responseHandler.error).toHaveBeenCalledWith(JSON.stringify(errorObject));
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});
