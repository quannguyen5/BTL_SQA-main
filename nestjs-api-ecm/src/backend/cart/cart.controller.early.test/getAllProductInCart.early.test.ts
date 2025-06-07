/**
 * File: getAllProductInCart.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getAllProductInCart của CartController
 * Module: Cart
 * Chức năng: Kiểm tra chức năng lấy tất cả sản phẩm trong giỏ hàng của người dùng
 * Ngày tạo: 2023
 */

import { responseHandler } from 'src/Until/responseUtil';
import { CartController } from '../cart.controller';

/**
 * Mock Service cho CartService
 * Giả lập các phương thức của service để kiểm soát hành vi trong quá trình test
 */
class MockCartService {
  public getListProduct = jest.fn(); // Phương thức lấy danh sách sản phẩm trong giỏ hàng
}

/**
 * Test Suite: CartController.getAllProductInCart() getAllProductInCart method
 * Mô tả: Kiểm thử chức năng lấy tất cả sản phẩm trong giỏ hàng của CartController
 */
describe('CartController.getAllProductInCart() getAllProductInCart method', () => {
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
     * Test Case ID: TC-CT-CART-GETALL-001
     * Mục tiêu: Kiểm tra việc lấy tất cả sản phẩm trong giỏ hàng của người dùng hợp lệ
     * Input:
     *   - userId: "123" - ID của người dùng
     *   - Service trả về: [{ id: '1', name: 'Product 1' }, { id: '2', name: 'Product 2' }]
     * Expected Output:
     *   - Object: responseHandler.ok([{ id: '1', name: 'Product 1' }, { id: '2', name: 'Product 2' }])
     *   - Service.getListProduct được gọi với tham số đúng: { user_id: "123" }
     * Ghi chú: Controller phải gọi service đúng và trả về danh sách sản phẩm trong giỏ hàng
     */
    it('should return all products in the cart for a valid user', async () => {
      // Sắp xếp (Arrange)
      const userId = '123'; // ID của người dùng
      const mockProducts = [{ id: '1', name: 'Product 1' }, { id: '2', name: 'Product 2' }]; // Danh sách sản phẩm mẫu
      jest.mocked(mockCartService.getListProduct).mockResolvedValue(mockProducts as any as never); // Giả lập service trả về danh sách sản phẩm

      // Thực thi (Act)
      const result = await cartController.getAllProductInCart(userId); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCartService.getListProduct).toHaveBeenCalledWith({ user_id: userId }); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.ok(mockProducts)); // Kiểm tra kết quả trả về đúng định dạng
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-CT-CART-GETALL-002
     * Mục tiêu: Kiểm tra xử lý khi không tìm thấy sản phẩm nào trong giỏ hàng của người dùng
     * Input:
     *   - userId: "123" - ID của người dùng
     *   - Service trả về: [] (mảng rỗng)
     * Expected Output:
     *   - Object: responseHandler.ok([])
     *   - Service.getListProduct được gọi với tham số đúng: { user_id: "123" }
     * Ghi chú: Controller phải xử lý được trường hợp giỏ hàng rỗng
     */
    it('should handle the case where no products are found for the user', async () => {
      // Sắp xếp (Arrange)
      const userId = '123'; // ID của người dùng
      jest.mocked(mockCartService.getListProduct).mockResolvedValue([] as any as never); // Giả lập service trả về mảng rỗng

      // Thực thi (Act)
      const result = await cartController.getAllProductInCart(userId); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCartService.getListProduct).toHaveBeenCalledWith({ user_id: userId }); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.ok([])); // Kiểm tra kết quả trả về là mảng rỗng
    });

    /**
     * Test Case ID: TC-CT-CART-GETALL-003
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi Error
     * Input:
     *   - userId: "123" - ID của người dùng
     *   - Service ném lỗi: Error("Service error")
     * Expected Output:
     *   - Object: responseHandler.error("Service error")
     *   - Service.getListProduct được gọi với tham số đúng: { user_id: "123" }
     * Ghi chú: Controller phải bắt và xử lý lỗi Error đúng cách
     */
    it('should handle errors thrown by the cart service', async () => {
      // Sắp xếp (Arrange)
      const userId = '123'; // ID của người dùng
      const errorMessage = 'Service error'; // Thông báo lỗi
      jest.mocked(mockCartService.getListProduct).mockRejectedValue(new Error(errorMessage) as never); // Giả lập service ném lỗi

      // Thực thi (Act)
      const result = await cartController.getAllProductInCart(userId); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCartService.getListProduct).toHaveBeenCalledWith({ user_id: userId }); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.error(errorMessage)); // Kiểm tra kết quả trả về là thông báo lỗi
    });

    /**
     * Test Case ID: TC-CT-CART-GETALL-004
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi không phải Error (object lỗi)
     * Input:
     *   - userId: "123" - ID của người dùng
     *   - Service ném lỗi: { message: "Non-error object" }
     * Expected Output:
     *   - Object: responseHandler.error(JSON.stringify({ message: "Non-error object" }))
     *   - Service.getListProduct được gọi với tham số đúng: { user_id: "123" }
     * Ghi chú: Controller phải bắt và xử lý cả các lỗi không phải Error
     */
    it('should handle non-error objects thrown by the cart service', async () => {
      // Sắp xếp (Arrange)
      const userId = '123'; // ID của người dùng
      const errorObject = { message: 'Non-error object' }; // Đối tượng lỗi
      jest.mocked(mockCartService.getListProduct).mockRejectedValue(errorObject as never); // Giả lập service ném đối tượng lỗi

      // Thực thi (Act)
      const result = await cartController.getAllProductInCart(userId); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCartService.getListProduct).toHaveBeenCalledWith({ user_id: userId }); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject))); // Kiểm tra kết quả trả về là chuỗi JSON của đối tượng lỗi
    });
  });
});