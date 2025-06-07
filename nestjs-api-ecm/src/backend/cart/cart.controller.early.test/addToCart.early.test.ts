/**
 * File: addToCart.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức addToCart của CartController
 * Module: Cart
 * Chức năng: Kiểm tra chức năng thêm sản phẩm vào giỏ hàng
 * Ngày tạo: 2023
 */

import { responseHandler } from 'src/Until/responseUtil';
import { CartController } from '../cart.controller';

/**
 * Mock DTO cho việc thêm sản phẩm vào giỏ hàng
 * Chứa các thông tin cần thiết để thêm sản phẩm vào giỏ hàng
 */
class MockCreateCartDto {
  public productId: string = 'product-123'; // ID của sản phẩm cần thêm vào giỏ hàng
  public quantity: number = 1;              // Số lượng sản phẩm cần thêm
}

/**
 * Mock DTO với tham số sai tên
 * Dùng cho test case truyền tham số không đúng
 */
class MockCreateCartDtoWithIncorrectParam {
  public ProductId1: string = 'product-123'; // Tên tham số không đúng (P viết hoa và thêm số 1)
  public quantity: number = 1;
}

/**
 * Mock Service cho CartService
 * Giả lập các phương thức của service để kiểm soát hành vi trong quá trình test
 */
class MockCartService {
  public create = jest.fn(); // Phương thức tạo mới giỏ hàng hoặc thêm sản phẩm vào giỏ hàng
}

/**
 * Test Suite: CartController.addToCart() addToCart method
 * Mô tả: Kiểm thử chức năng thêm sản phẩm vào giỏ hàng của CartController
 */
describe('CartController.addToCart() addToCart method', () => {
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
   * Test Group: Happy Paths
   * Mô tả: Các test case cho trường hợp thành công
   */
  describe('Happy Paths', () => {
    /**
     * Test Case ID: TC-CT-CART-ADD-001
     * Mục tiêu: Kiểm tra việc thêm sản phẩm vào giỏ hàng thành công
     * Input:
     *   - userId: "123" - ID của người dùng
     *   - createCartDto:
     *     + productId: "product-123" - ID của sản phẩm
     *     + quantity: 1 - Số lượng sản phẩm
     *   - Service trả về: { success: true, data: "Item added" }
     * Expected Output:
     *   - Object: responseHandler.ok({ success: true, data: "Item added" })
     *   - Service.create được gọi với tham số đúng là mockCreateCartDto
     * Ghi chú: Controller phải gọi service đúng và trả về kết quả thành công
     */
    it('should successfully add an item to the cart', async () => {
      // Sắp xếp (Arrange)
      const userId = '123'; // ID của người dùng
      const mockCreateCartDto = new MockCreateCartDto() as any; // DTO thêm vào giỏ hàng
      const mockResponse = { success: true, data: 'Item added' }; // Kết quả giả lập từ service
      jest.mocked(mockCartService.create).mockResolvedValue(mockResponse as any); // Giả lập service trả về thành công

      // Thực thi (Act)
      const result = await cartController.addToCart(userId, mockCreateCartDto); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCartService.create).toHaveBeenCalledWith(mockCreateCartDto); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.ok(mockResponse)); // Kiểm tra kết quả trả về đúng định dạng
    });
  });

  /**
   * Test Group: Edge Cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge Cases', () => {
    /**
     * Test Case ID: TC-CT-CART-ADD-002
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi Error
     * Input:
     *   - userId: "123" - ID của người dùng
     *   - createCartDto:
     *     + productId: "product-123" - ID của sản phẩm
     *     + quantity: 1 - Số lượng sản phẩm
     *   - Service ném lỗi: Error("Service error")
     * Expected Output:
     *   - Object: responseHandler.error("Service error")
     *   - Service.create được gọi với tham số đúng là mockCreateCartDto
     * Ghi chú: Controller phải bắt và xử lý lỗi Error đúng cách
     */
    it('should handle service errors gracefully', async () => {
      // Sắp xếp (Arrange)
      const userId = '123'; // ID của người dùng
      const mockCreateCartDto = new MockCreateCartDto() as any; // DTO thêm vào giỏ hàng
      const errorMessage = 'Service error'; // Thông báo lỗi
      jest.mocked(mockCartService.create).mockRejectedValue(new Error(errorMessage) as never); // Giả lập service ném lỗi

      // Thực thi (Act)
      const result = await cartController.addToCart(userId, mockCreateCartDto); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCartService.create).toHaveBeenCalledWith(mockCreateCartDto); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.error(errorMessage)); // Kiểm tra kết quả trả về là thông báo lỗi
    });

    /**
     * Test Case ID: TC-CT-CART-ADD-003
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi không phải Error (object lỗi)
     * Input:
     *   - userId: "123" - ID của người dùng
     *   - createCartDto:
     *     + productId: "product-123" - ID của sản phẩm
     *     + quantity: 1 - Số lượng sản phẩm
     *   - Service ném lỗi: { message: "Unexpected error" }
     * Expected Output:
     *   - Object: responseHandler.error(JSON.stringify({ message: "Unexpected error" }))
     *   - Service.create được gọi với tham số đúng là mockCreateCartDto
     * Ghi chú: Controller phải bắt và xử lý cả các lỗi không phải Error
     */
    it('should handle non-error exceptions gracefully', async () => {
      // Sắp xếp (Arrange)
      const userId = '123'; // ID của người dùng
      const mockCreateCartDto = new MockCreateCartDto() as any; // DTO thêm vào giỏ hàng
      const errorObject = { message: 'Unexpected error' }; // Đối tượng lỗi
      jest.mocked(mockCartService.create).mockRejectedValue(errorObject as never); // Giả lập service ném đối tượng lỗi

      // Thực thi (Act)
      const result = await cartController.addToCart(userId, mockCreateCartDto); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCartService.create).toHaveBeenCalledWith(mockCreateCartDto); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject))); // Kiểm tra kết quả trả về là chuỗi JSON của đối tượng lỗi
    });

    /**
     * Test Case ID: TC-CT-CART-ADD-004
     * Mục tiêu: Kiểm tra xử lý khi tham số không đúng tên (ProductId1 thay vì productId)
     * Input:
     *   - userId: "123" - ID của người dùng
     *   - createCartDto:
     *     + ProductId1: "product-123" - Tên tham số không đúng
     *     + quantity: 1 - Số lượng sản phẩm
     *   - Service ném lỗi: Error("Invalid parameter: productId is required")
     * Expected Output:
     *   - Object: responseHandler.error("Invalid parameter: productId is required")
     *   - Service.create được gọi với tham số có tên không đúng
     * Ghi chú: Controller phải xác nhận tham số đúng và xử lý lỗi phù hợp
     */
    it('should handle incorrect parameter names', async () => {
      // Sắp xếp (Arrange)
      const userId = '123'; // ID của người dùng
      const mockCreateCartDtoWithIncorrectParam = new MockCreateCartDtoWithIncorrectParam() as any; // DTO với tên tham số sai
      const errorMessage = 'Invalid parameter: productId is required'; // Thông báo lỗi khi thiếu productId
      jest.mocked(mockCartService.create).mockRejectedValue(new Error(errorMessage) as never); // Giả lập service ném lỗi khi nhận tham số sai

      // Thực thi (Act)
      const result = await cartController.addToCart(userId, mockCreateCartDtoWithIncorrectParam); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCartService.create).toHaveBeenCalledWith(mockCreateCartDtoWithIncorrectParam); // Kiểm tra service được gọi với tham số sai
      expect(result).toEqual(responseHandler.error(errorMessage)); // Kiểm tra kết quả trả về là thông báo lỗi
    });

    /**
     * Test Case ID: TC-CT-CART-ADD-005
     * Mục tiêu: Kiểm tra xử lý khi productId không tồn tại trong hệ thống
     * Input:
     *   - userId: "123" - ID của người dùng
     *   - createCartDto:
     *     + productId: "non-existent-product" - ID sản phẩm không tồn tại
     *     + quantity: 1 - Số lượng sản phẩm
     *   - Service ném lỗi: Error("Product not found: non-existent-product")
     * Expected Output:
      *   - Object: responseHandler.error("Product not found: non-existent-product")
      *   - Service.create được gọi với tham số có productId không tồn tại
     * Ghi chú: Controller phải xử lý trường hợp sản phẩm không tồn tại
     */
    it('should handle non-existent product IDs', async () => {
      // Sắp xếp (Arrange)
      const userId = '123'; // ID của người dùng
      const nonExistentProductDto = new MockCreateCartDto(); // Tạo DTO
      nonExistentProductDto.productId = 'non-existent-product'; // Gán ID sản phẩm không tồn tại
      const errorMessage = 'Product not found: non-existent-product'; // Thông báo lỗi khi sản phẩm không tồn tại
      jest.mocked(mockCartService.create).mockRejectedValue(new Error(errorMessage) as never); // Giả lập service ném lỗi khi sản phẩm không tồn tại

      // Thực thi (Act)
      const result = await cartController.addToCart(userId, nonExistentProductDto as any); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCartService.create).toHaveBeenCalledWith(nonExistentProductDto); // Kiểm tra service được gọi với productId không tồn tại
      expect(result).toEqual(responseHandler.error(errorMessage)); // Kiểm tra kết quả trả về là thông báo lỗi
    });
  });
});