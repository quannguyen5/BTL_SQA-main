/**
 * File: delete.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức delete của CartController
 * Module: Cart
 * Chức năng: Kiểm tra chức năng xóa sản phẩm khỏi giỏ hàng
 * Ngày tạo: 2023
 */

import { responseHandler } from 'src/Until/responseUtil';
import { CartController } from '../cart.controller';

/**
 * Mock DTO cho việc xóa sản phẩm khỏi giỏ hàng
 * Chứa các thông tin cần thiết để xóa sản phẩm khỏi giỏ hàng
 */
class MockDeleteCartDto {
  public cart_ids: string[] = []; // Danh sách ID của các sản phẩm cần xóa khỏi giỏ hàng
}

/**
 * Mock Service cho CartService
 * Giả lập các phương thức của service để kiểm soát hành vi trong quá trình test
 */
class MockCartService {
  public deleteProductsInCart = jest.fn(); // Phương thức xóa sản phẩm khỏi giỏ hàng
}

/**
 * Test Suite: CartController.delete() delete method
 * Mô tả: Kiểm thử chức năng xóa sản phẩm khỏi giỏ hàng của CartController
 */
describe('CartController.delete() delete method', () => {
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
     * Test Case ID: TC-CT-CART-DEL-001
     * Mục tiêu: Kiểm tra việc xóa sản phẩm khỏi giỏ hàng thành công
     * Input:
     *   - userId: "123" - ID của người dùng
     *   - deleteCartDto:
     *     + cart_ids: ["1", "2", "3"] - Danh sách ID của các sản phẩm cần xóa
     *   - Service trả về: true (xóa thành công)
     * Expected Output:
     *   - Object: responseHandler.ok(true)
     *   - Service.deleteProductsInCart được gọi với tham số đúng: userId và cart_ids
     * Ghi chú: Controller phải gọi service đúng và trả về kết quả thành công
     */
    it('should successfully delete products from the cart', async () => {
      // Sắp xếp (Arrange)
      const userId = '123'; // ID của người dùng
      const mockDeleteCartDto = new MockDeleteCartDto() as any; // DTO xóa sản phẩm
      mockDeleteCartDto.cart_ids = ['1', '2', '3']; // Thiết lập danh sách ID cần xóa
      jest.mocked(mockCartService.deleteProductsInCart).mockResolvedValue(true as any as never); // Giả lập service trả về thành công

      // Thực thi (Act)
      const result = await cartController.delete(userId, mockDeleteCartDto); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCartService.deleteProductsInCart).toHaveBeenCalledWith(userId, mockDeleteCartDto.cart_ids); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.ok(true)); // Kiểm tra kết quả trả về đúng định dạng
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-CT-CART-DEL-002
     * Mục tiêu: Kiểm tra xử lý khi danh sách cart_ids rỗng
     * Input:
     *   - userId: "123" - ID của người dùng
     *   - deleteCartDto:
     *     + cart_ids: [] - Danh sách rỗng
     *   - Service trả về: false (không có sản phẩm nào được xóa)
     * Expected Output:
     *   - Object: responseHandler.ok(false)
     *   - Service.deleteProductsInCart được gọi với tham số đúng: userId và mảng rỗng
     * Ghi chú: Controller phải xử lý được trường hợp không có sản phẩm nào được chỉ định để xóa
     */
    it('should handle empty cart_ids gracefully', async () => {
      // Sắp xếp (Arrange)
      const userId = '123'; // ID của người dùng
      const mockDeleteCartDto = new MockDeleteCartDto() as any; // DTO xóa sản phẩm
      mockDeleteCartDto.cart_ids = []; // Thiết lập danh sách rỗng
      jest.mocked(mockCartService.deleteProductsInCart).mockResolvedValue(false as any as never); // Giả lập service trả về thất bại

      // Thực thi (Act)
      const result = await cartController.delete(userId, mockDeleteCartDto); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCartService.deleteProductsInCart).toHaveBeenCalledWith(userId, mockDeleteCartDto.cart_ids); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.ok(false)); // Kiểm tra kết quả trả về đúng định dạng
    });

    /**
     * Test Case ID: TC-CT-CART-DEL-003
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi
     * Input:
     *   - userId: "123" - ID của người dùng
     *   - deleteCartDto:
     *     + cart_ids: ["1", "2", "3"] - Danh sách ID của các sản phẩm cần xóa
     *   - Service ném lỗi: Error("Service error")
     * Expected Output:
     *   - Object: responseHandler.error("Service error")
     *   - Service.deleteProductsInCart được gọi với tham số đúng: userId và cart_ids
     * Ghi chú: Controller phải bắt và xử lý lỗi đúng cách
     */
    it('should handle service errors gracefully', async () => {
      // Sắp xếp (Arrange)
      const userId = '123'; // ID của người dùng
      const mockDeleteCartDto = new MockDeleteCartDto() as any; // DTO xóa sản phẩm
      mockDeleteCartDto.cart_ids = ['1', '2', '3']; // Thiết lập danh sách ID cần xóa
      const errorMessage = 'Service error'; // Thông báo lỗi
      jest.mocked(mockCartService.deleteProductsInCart).mockRejectedValue(new Error(errorMessage) as never); // Giả lập service ném lỗi

      // Thực thi (Act)
      const result = await cartController.delete(userId, mockDeleteCartDto); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCartService.deleteProductsInCart).toHaveBeenCalledWith(userId, mockDeleteCartDto.cart_ids); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.error(errorMessage)); // Kiểm tra kết quả trả về là thông báo lỗi
    });

    /**
     * Test Case ID: TC-CT-CART-DEL-004
     * Mục tiêu: Kiểm tra xử lý khi service ném ra lỗi không phải là đối tượng Error
     * Input:
     *   - userId: "123" - ID của người dùng
     *   - deleteCartDto:
     *     + cart_ids: ["1", "2", "3"] - Danh sách ID của các sản phẩm cần xóa
     *   - Service ném lỗi: Đối tượng không phải Error (ví dụ: string, object, v.v.)
     * Expected Output:
     *   - Object: responseHandler.error với thông báo lỗi được chuyển đổi thành chuỗi
     *   - Service.deleteProductsInCart được gọi với tham số đúng: userId và cart_ids
     * Ghi chú: Controller phải xử lý được các loại lỗi khác nhau, không chỉ đối tượng Error
     */
    it('should handle non-Error exceptions from service', async () => {
      // Sắp xếp (Arrange)
      const userId = '123'; // ID của người dùng
      const mockDeleteCartDto = new MockDeleteCartDto() as any; // DTO xóa sản phẩm
      mockDeleteCartDto.cart_ids = ['1', '2', '3']; // Thiết lập danh sách ID cần xóa
      const nonErrorException = { code: 500, message: 'Database connection error' }; // Lỗi không phải Error
      jest.mocked(mockCartService.deleteProductsInCart).mockRejectedValue(nonErrorException as never); // Giả lập service ném lỗi không phải Error

      // Thực thi (Act)
      const result = await cartController.delete(userId, mockDeleteCartDto); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCartService.deleteProductsInCart).toHaveBeenCalledWith(userId, mockDeleteCartDto.cart_ids); // Kiểm tra service được gọi với tham số đúng
      
      // Kiểm tra kết quả trả về là thông báo lỗi được chuyển đổi thành chuỗi
      // Đây là nhánh xử lý ở dòng 98 - khi lỗi không phải là instance của Error
      expect(result).toEqual(responseHandler.error(JSON.stringify(nonErrorException)));
    });
  });
});

