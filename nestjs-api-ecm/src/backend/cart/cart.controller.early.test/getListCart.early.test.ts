/**
 * File: getListCart.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getListCart của CartController
 * Module: Cart
 * Chức năng: Kiểm tra chức năng lấy danh sách giỏ hàng theo trang
 * Ngày tạo: 2023
 */

import { responseHandler } from 'src/Until/responseUtil';
import { CartController } from '../cart.controller';

/**
 * Mock Service cho CartService
 * Giả lập các phương thức của service để kiểm soát hành vi trong quá trình test
 */
class MockCartService {
  public getList = jest.fn(); // Phương thức lấy danh sách giỏ hàng theo trang
}

/**
 * Test Suite: CartController.getListCart() getListCart method
 * Mô tả: Kiểm thử chức năng lấy danh sách giỏ hàng theo trang của CartController
 */
describe('CartController.getListCart() getListCart method', () => {
  // Khai báo các biến sử dụng trong test
  let cartController: CartController;     // Controller cần test
  let mockCartService: MockCartService;   // Mock service

  /**
   * Thiết lập môi trường test trước mỗi test case
   * Khởi tạo các mock objects và controller cần test
   */
  beforeEach(() => {
    mockCartService = new MockCartService() as any;
    cartController = new CartController(mockCartService as any);
  });

  /**
   * Test Group: Happy paths
   * Mô tả: Các test case cho trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * Test Case ID: TC-CT-CART-GETLIST-001
     * Mục tiêu: Kiểm tra việc lấy danh sách giỏ hàng thành công
     * Input:
     *   - page: 1 - Số trang cần lấy
     *   - limit: 10 - Số lượng bản ghi trên một trang
     *   - Service trả về: [{ id: 1, name: 'Cart 1' }, { id: 2, name: 'Cart 2' }]
     * Expected Output:
     *   - Object: responseHandler.ok([{ id: 1, name: 'Cart 1' }, { id: 2, name: 'Cart 2' }])
     *   - Service.getList được gọi với tham số đúng: 1, 10
     * Ghi chú: Controller phải gọi service đúng và trả về danh sách giỏ hàng
     */
    it('should return a list of carts successfully', async () => {
      // Sắp xếp (Arrange)
      const mockCarts = [{ id: 1, name: 'Cart 1' }, { id: 2, name: 'Cart 2' }]; // Danh sách giỏ hàng mẫu
      jest.mocked(mockCartService.getList).mockResolvedValue(mockCarts as any as never); // Giả lập service trả về danh sách giỏ hàng

      // Thực thi (Act)
      const result = await cartController.getListCart(1, 10); // Gọi phương thức cần test với trang 1, giới hạn 10

      // Kiểm tra (Assert)
      expect(result).toEqual(responseHandler.ok(mockCarts)); // Kiểm tra kết quả trả về đúng định dạng
      expect(mockCartService.getList).toHaveBeenCalledWith(1, 10); // Kiểm tra service được gọi với tham số đúng
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-CT-CART-GETLIST-002
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi Error
     * Input:
     *   - page: 1 - Số trang cần lấy
     *   - limit: 10 - Số lượng bản ghi trên một trang
     *   - Service ném lỗi: Error("Service error")
     * Expected Output:
     *   - Object: responseHandler.error("Service error")
     *   - Service.getList được gọi với tham số đúng: 1, 10
     * Ghi chú: Controller phải bắt và xử lý lỗi Error đúng cách
     */
    it('should handle service errors gracefully', async () => {
      // Sắp xếp (Arrange)
      const errorMessage = 'Service error'; // Thông báo lỗi
      jest.mocked(mockCartService.getList).mockRejectedValue(new Error(errorMessage) as never); // Giả lập service ném lỗi

      // Thực thi (Act)
      const result = await cartController.getListCart(1, 10); // Gọi phương thức cần test với trang 1, giới hạn 10

      // Kiểm tra (Assert)
      expect(result).toEqual(responseHandler.error(errorMessage)); // Kiểm tra kết quả trả về là thông báo lỗi
      expect(mockCartService.getList).toHaveBeenCalledWith(1, 10); // Kiểm tra service được gọi với tham số đúng
    });

    /**
     * Test Case ID: TC-CT-CART-GETLIST-003
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi không phải Error (object lỗi)
     * Input:
     *   - page: 1 - Số trang cần lấy
     *   - limit: 10 - Số lượng bản ghi trên một trang
     *   - Service ném lỗi: { message: "Unexpected error" }
     * Expected Output:
     *   - Object: responseHandler.error(JSON.stringify({ message: "Unexpected error" }))
     *   - Service.getList được gọi với tham số đúng: 1, 10
     * Ghi chú: Controller phải bắt và xử lý cả các lỗi không phải Error
     */
    it('should handle non-error exceptions gracefully', async () => {
      // Sắp xếp (Arrange)
      const errorObject = { message: 'Unexpected error' }; // Đối tượng lỗi
      jest.mocked(mockCartService.getList).mockRejectedValue(errorObject as never); // Giả lập service ném đối tượng lỗi

      // Thực thi (Act)
      const result = await cartController.getListCart(1, 10); // Gọi phương thức cần test với trang 1, giới hạn 10

      // Kiểm tra (Assert)
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject))); // Kiểm tra kết quả trả về là chuỗi JSON của đối tượng lỗi
      expect(mockCartService.getList).toHaveBeenCalledWith(1, 10); // Kiểm tra service được gọi với tham số đúng
    });
  });
});