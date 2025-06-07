/**
 * File: update.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức update của CartController
 * Module: Cart
 * Chức năng: Kiểm tra chức năng cập nhật thông tin giỏ hàng
 * Ngày tạo: 2023
 */

import { responseHandler } from 'src/Until/responseUtil';
import { CartController } from '../cart.controller';

/**
 * Mock DTO cho việc cập nhật giỏ hàng
 * Chứa các thông tin cần thiết để cập nhật giỏ hàng
 */
class MockUpdateCartDto {
  public id: string = 'mock-id'; // ID của giỏ hàng cần cập nhật
  // Có thể thêm các thuộc tính khác nếu cần
}

/**
 * Mock Service cho CartService
 * Giả lập các phương thức của service để kiểm soát hành vi trong quá trình test
 */
class MockCartService {
  update = jest.fn(); // Phương thức cập nhật thông tin giỏ hàng
}

/**
 * Test Suite: CartController.update() update method
 * Mô tả: Kiểm thử chức năng cập nhật thông tin giỏ hàng của CartController
 */
describe('CartController.update() update method', () => {
  // Khai báo các biến sử dụng trong test
  let cartController: CartController;         // Controller cần test
  let mockCartService: MockCartService;       // Mock service
  let mockUpdateCartDto: MockUpdateCartDto;   // Mock DTO đầu vào

  /**
   * Thiết lập môi trường test trước mỗi test case
   * Khởi tạo các mock objects và controller cần test
   */
  beforeEach(() => {
    mockCartService = new MockCartService() as any;
    cartController = new CartController(mockCartService as any);
    mockUpdateCartDto = new MockUpdateCartDto() as any;
  });

  /**
   * Test Group: Happy paths
   * Mô tả: Các test case cho trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * Test Case ID: TC-CT-CART-UPDATE-001
     * Mục tiêu: Kiểm tra việc cập nhật giỏ hàng thành công
     * Input:
     *   - updateCartDto:
     *     + id: "mock-id" - ID của giỏ hàng cần cập nhật
     *   - Service trả về: { success: true }
     * Expected Output:
     *   - Object: responseHandler.ok({ success: true })
     *   - Service.update được gọi với tham số đúng: mockUpdateCartDto, "mock-id"
     * Ghi chú: Controller phải gọi service đúng và trả về kết quả thành công
     */
    it('should update the cart successfully', async () => {
      // Sắp xếp (Arrange)
      const expectedResponse = { success: true }; // Kết quả mong đợi từ service
      jest.mocked(mockCartService.update).mockResolvedValue(expectedResponse as any as never); // Giả lập service trả về thành công

      // Thực thi (Act)
      const result = await cartController.update(mockUpdateCartDto as any); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCartService.update).toHaveBeenCalledWith(mockUpdateCartDto as any, mockUpdateCartDto.id); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.ok(expectedResponse)); // Kiểm tra kết quả trả về đúng định dạng
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-CT-CART-UPDATE-002
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi Error khi cập nhật
     * Input:
     *   - updateCartDto:
     *     + id: "mock-id" - ID của giỏ hàng cần cập nhật
     *   - Service ném lỗi: Error("Update failed")
     * Expected Output:
     *   - Object: responseHandler.error("Update failed")
     *   - Service.update được gọi với tham số đúng: mockUpdateCartDto, "mock-id"
     * Ghi chú: Controller phải bắt và xử lý lỗi Error đúng cách
     */
    it('should handle service update failure gracefully', async () => {
      // Sắp xếp (Arrange)
      const errorMessage = 'Update failed'; // Thông báo lỗi
      jest.mocked(mockCartService.update).mockRejectedValue(new Error(errorMessage) as never); // Giả lập service ném lỗi

      // Thực thi (Act)
      const result = await cartController.update(mockUpdateCartDto as any); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCartService.update).toHaveBeenCalledWith(mockUpdateCartDto as any, mockUpdateCartDto.id); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.error(errorMessage)); // Kiểm tra kết quả trả về là thông báo lỗi
    });

    /**
     * Test Case ID: TC-CT-CART-UPDATE-003
     * Mục tiêu: Kiểm tra xử lý khi service gặp lỗi không phải Error (object lỗi)
     * Input:
     *   - updateCartDto:
     *     + id: "mock-id" - ID của giỏ hàng cần cập nhật
     *   - Service ném lỗi: { message: "Unexpected error" }
     * Expected Output:
     *   - Object: responseHandler.error(JSON.stringify({ message: "Unexpected error" }))
     *   - Service.update được gọi với tham số đúng: mockUpdateCartDto, "mock-id"
     * Ghi chú: Controller phải bắt và xử lý cả các lỗi không phải Error
     */
    it('should handle non-error exceptions gracefully', async () => {
      // Sắp xếp (Arrange)
      const errorObject = { message: 'Unexpected error' }; // Đối tượng lỗi
      jest.mocked(mockCartService.update).mockRejectedValue(errorObject as never); // Giả lập service ném đối tượng lỗi

      // Thực thi (Act)
      const result = await cartController.update(mockUpdateCartDto as any); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCartService.update).toHaveBeenCalledWith(mockUpdateCartDto as any, mockUpdateCartDto.id); // Kiểm tra service được gọi với tham số đúng
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject))); // Kiểm tra kết quả trả về là chuỗi JSON của đối tượng lỗi
    });
  });
});