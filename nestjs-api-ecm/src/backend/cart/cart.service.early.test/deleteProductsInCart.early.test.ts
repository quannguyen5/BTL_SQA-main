/**
 * File: deleteProductsInCart.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức deleteProductsInCart của CartService
 * Module: Cart
 * Chức năng: Kiểm tra chức năng xóa sản phẩm khỏi giỏ hàng
 * Ngày tạo: 2023
 */

import { In } from "typeorm";
import { CartService } from '../cart.service';

/**
 * Mock Repository cho Cart_productEntity
 * Giả lập các phương thức của repository để kiểm soát hành vi trong quá trình test
 */
class MockCartRepository {
  public delete = jest.fn(); // Phương thức xóa sản phẩm khỏi giỏ hàng
}

/**
 * Test Suite: CartService.deleteProductsInCart() deleteProductsInCart method
 * Mô tả: Kiểm thử chức năng xóa sản phẩm khỏi giỏ hàng của CartService
 */
describe('CartService.deleteProductsInCart() deleteProductsInCart method', () => {
  // Khai báo các biến sử dụng trong test
  let cartService: CartService;               // Service cần test
  let mockCartRepository: MockCartRepository; // Mock repository

  /**
   * Thiết lập môi trường test trước mỗi test case
   * Khởi tạo các mock objects và service cần test
   */
  beforeEach(() => {
    mockCartRepository = new MockCartRepository();
    cartService = new CartService(mockCartRepository as any);
  });

  /**
   * Test Group: Happy paths
   * Mô tả: Các test case cho trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * Test Case ID: TC-SV-CART-DEL-001
     * Mục tiêu: Kiểm tra việc xóa sản phẩm khỏi giỏ hàng thành công
     * Input:
     *   - userId: "user123" - ID của người dùng
     *   - cartIds: ["cart1", "cart2"] - Danh sách ID của các sản phẩm cần xóa
     *   - Repository.delete trả về: { affected: 2 } (2 bản ghi bị ảnh hưởng)
     * Expected Output:
     *   - Object: { affected: 2 } (kết quả xóa thành công)
     *   - Repository.delete được gọi với tham số đúng: { id: In(cartIds), user_id: userId }
     * Ghi chú: Service phải xóa đúng các sản phẩm trong giỏ hàng của người dùng
     */
    it('should delete products in cart successfully', async () => {
      // Sắp xếp (Arrange)
      const userId = 'user123'; // ID của người dùng
      const cartIds = ['cart1', 'cart2']; // Danh sách ID của các sản phẩm cần xóa
      const mockDeleteResult = { affected: 2 }; // Kết quả xóa: 2 bản ghi bị ảnh hưởng
      jest.mocked(mockCartRepository.delete).mockResolvedValue(mockDeleteResult as any as never); // Giả lập xóa thành công

      // Thực thi (Act)
      const result = await cartService.deleteProductsInCart(userId, cartIds); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCartRepository.delete).toHaveBeenCalledWith({ // Kiểm tra repository được gọi với tham số đúng
        id: In(cartIds), // Sử dụng In operator để xóa nhiều sản phẩm
        user_id: userId, // Đảm bảo chỉ xóa sản phẩm của người dùng đúng
      });
      expect(result).toEqual(mockDeleteResult); // Kiểm tra kết quả trả về đúng với kết quả xóa
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-SV-CART-DEL-002
     * Mục tiêu: Kiểm tra xử lý khi danh sách cart_ids rỗng
     * Input:
     *   - userId: "user123" - ID của người dùng
     *   - cartIds: [] - Danh sách rỗng
     * Expected Output:
     *   - Exception với message: "cart_ids cannot be empty"
     * Ghi chú: Service phải kiểm tra tính hợp lệ của danh sách cart_ids trước khi thực hiện xóa
     */
    it('should throw an error if cart_ids is empty', async () => {
      // Sắp xếp (Arrange)
      const userId = 'user123'; // ID của người dùng
      const cartIds: string[] = []; // Danh sách rỗng

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(cartService.deleteProductsInCart(userId, cartIds)).rejects.toThrow('cart_ids cannot be empty'); // Kiểm tra lỗi được ném ra
    });

    /**
     * Test Case ID: TC-SV-CART-DEL-003
     * Mục tiêu: Kiểm tra xử lý khi không có bản ghi nào bị xóa
     * Input:
     *   - userId: "user123" - ID của người dùng
     *   - cartIds: ["cart1", "cart2"] - Danh sách ID của các sản phẩm cần xóa
     *   - Repository.delete trả về: { affected: 0 } (không có bản ghi nào bị ảnh hưởng)
     * Expected Output:
     *   - Exception với message: "No records were deleted. Check cart_ids."
     * Ghi chú: Service phải kiểm tra kết quả xóa để đảm bảo có bản ghi bị xóa
     */
    it('should throw an error if no records were deleted', async () => {
      // Sắp xếp (Arrange)
      const userId = 'user123'; // ID của người dùng
      const cartIds = ['cart1', 'cart2']; // Danh sách ID của các sản phẩm cần xóa
      const mockDeleteResult = { affected: 0 }; // Kết quả xóa: không có bản ghi nào bị ảnh hưởng
      jest.mocked(mockCartRepository.delete).mockResolvedValue(mockDeleteResult as any as never); // Giả lập xóa không thành công

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(cartService.deleteProductsInCart(userId, cartIds)).rejects.toThrow('No records were deleted. Check cart_ids.'); // Kiểm tra lỗi được ném ra
    });

    /**
     * Test Case ID: TC-SV-CART-DEL-004
     * Mục tiêu: Kiểm tra xử lý khi thao tác xóa gặp lỗi
     * Input:
     *   - userId: "user123" - ID của người dùng
     *   - cartIds: ["cart1", "cart2"] - Danh sách ID của các sản phẩm cần xóa
     *   - Repository.delete ném lỗi: Error("Database error")
     * Expected Output:
     *   - Exception với message: "Failed to delete products in cart"
     * Ghi chú: Service phải xử lý lỗi từ repository và ném ra lỗi chung
     */
    it('should throw a generic error if delete operation fails', async () => {
      // Sắp xếp (Arrange)
      const userId = 'user123'; // ID của người dùng
      const cartIds = ['cart1', 'cart2']; // Danh sách ID của các sản phẩm cần xóa
      jest.mocked(mockCartRepository.delete).mockRejectedValue(new Error('Database error') as never); // Giả lập repository ném lỗi

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(cartService.deleteProductsInCart(userId, cartIds)).rejects.toThrow('Failed to delete products in cart'); // Kiểm tra lỗi được ném ra
    });
  });
});