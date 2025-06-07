/**
 * File: getListProduct.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getListProduct của CartService
 * Module: Cart
 * Chức năng: Kiểm tra chức năng lấy danh sách sản phẩm trong giỏ hàng theo điều kiện
 * Ngày tạo: 2023
 */

import { CartService } from '../cart.service';

/**
 * Mock Repository cho Cart_productEntity
 * Giả lập các phương thức của repository để kiểm soát hành vi trong quá trình test
 */
class MockCartRepository {
  findAndCount = jest.fn(); // Phương thức tìm kiếm và đếm số lượng sản phẩm trong giỏ hàng
}

/**
 * Test Suite: CartService.getListProduct() getListProduct method
 * Mô tả: Kiểm thử chức năng lấy danh sách sản phẩm trong giỏ hàng theo điều kiện của CartService
 */
describe('CartService.getListProduct() getListProduct method', () => {
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
     * Test Case ID: TC-SV-CART-GETLISTPROD-001
     * Mục tiêu: Kiểm tra việc lấy danh sách sản phẩm trong giỏ hàng theo user_id thành công
     * Input:
     *   - filters: { user_id: '123' } - Điều kiện tìm kiếm theo ID người dùng
     *   - Repository.findAndCount trả về: [[{ id: 1, name: 'Product 1' }], 1] (mảng sản phẩm và tổng số)
     * Expected Output:
     *   - Object: { cart: [{ id: 1, name: 'Product 1' }], total: 1 }
     *   - Repository.findAndCount được gọi với tham số đúng: { where: { user_id: '123' }, relations: ['product'] }
     * Ghi chú: Service phải trả về đúng danh sách sản phẩm và tổng số theo điều kiện tìm kiếm
     */
    it('should return a list of products and total count when user_id is provided', async () => {
      // Sắp xếp (Arrange)
      const filters = { user_id: '123' }; // Điều kiện tìm kiếm theo ID người dùng
      const mockProducts = [{ id: 1, name: 'Product 1' }]; // Dữ liệu mẫu: danh sách sản phẩm
      const mockTotal = 1; // Tổng số sản phẩm
      jest.mocked(mockCartRepository.findAndCount).mockResolvedValue([mockProducts, mockTotal] as any as never); // Giả lập repository trả về danh sách sản phẩm

      // Thực thi (Act)
      const result = await cartService.getListProduct(filters); // Gọi phương thức cần test với điều kiện tìm kiếm

      // Kiểm tra (Assert)
      expect(result).toEqual({ cart: mockProducts, total: mockTotal }); // Kiểm tra kết quả trả về đúng định dạng
      expect(mockCartRepository.findAndCount).toHaveBeenCalledWith({ // Kiểm tra repository được gọi với tham số đúng
        where: { user_id: '123' }, // Điều kiện tìm kiếm
        relations: ['product'], // Quan hệ cần lấy theo
      });
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-SV-CART-GETLISTPROD-002
     * Mục tiêu: Kiểm tra xử lý khi không tìm thấy sản phẩm nào trong giỏ hàng
     * Input:
     *   - filters: { user_id: '123' } - Điều kiện tìm kiếm theo ID người dùng
     *   - Repository.findAndCount trả về: [null, 0] (không có sản phẩm nào)
     * Expected Output:
     *   - Exception với message: "No product!"
     * Ghi chú: Service phải kiểm tra kết quả trả về từ repository để đảm bảo có dữ liệu
     */
    it('should throw an error if no products are found', async () => {
      // Sắp xếp (Arrange)
      const filters = { user_id: '123' }; // Điều kiện tìm kiếm theo ID người dùng
      jest.mocked(mockCartRepository.findAndCount).mockResolvedValue([null, 0] as any as never); // Giả lập không tìm thấy sản phẩm

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(cartService.getListProduct(filters)).rejects.toThrow('No product!'); // Kiểm tra lỗi được ném ra
    });

    /**
     * Test Case ID: TC-SV-CART-GETLISTPROD-003
     * Mục tiêu: Kiểm tra xử lý khi không cung cấp điều kiện tìm kiếm
     * Input:
     *   - filters: {} - Điều kiện tìm kiếm rỗng
     *   - Repository.findAndCount trả về: [[{ id: 1, name: 'Product 1' }], 1] (mảng sản phẩm và tổng số)
     * Expected Output:
     *   - Object: { cart: [{ id: 1, name: 'Product 1' }], total: 1 }
     *   - Repository.findAndCount được gọi với tham số đúng: { where: {}, relations: ['product'] }
     * Ghi chú: Service phải xử lý được trường hợp không có điều kiện tìm kiếm
     */
    it('should handle empty filters gracefully', async () => {
      // Sắp xếp (Arrange)
      const filters = {}; // Điều kiện tìm kiếm rỗng
      const mockProducts = [{ id: 1, name: 'Product 1' }]; // Dữ liệu mẫu: danh sách sản phẩm
      const mockTotal = 1; // Tổng số sản phẩm
      jest.mocked(mockCartRepository.findAndCount).mockResolvedValue([mockProducts, mockTotal] as any as never); // Giả lập repository trả về danh sách sản phẩm

      // Thực thi (Act)
      const result = await cartService.getListProduct(filters); // Gọi phương thức cần test với điều kiện rỗng

      // Kiểm tra (Assert)
      expect(result).toEqual({ cart: mockProducts, total: mockTotal }); // Kiểm tra kết quả trả về đúng định dạng
      expect(mockCartRepository.findAndCount).toHaveBeenCalledWith({ // Kiểm tra repository được gọi với tham số đúng
        where: {}, // Điều kiện tìm kiếm rỗng
        relations: ['product'], // Quan hệ cần lấy theo
      });
    });

    /**
     * Test Case ID: TC-SV-CART-GETLISTPROD-004
     * Mục tiêu: Kiểm tra xử lý khi gặp lỗi không mong muốn từ repository
     * Input:
     *   - filters: { user_id: '123' } - Điều kiện tìm kiếm theo ID người dùng
     *   - Repository.findAndCount ném lỗi: Error("Unexpected error")
     * Expected Output:
     *   - Exception với message: "Unexpected error"
     * Ghi chú: Service phải ném lại lỗi khi gặp lỗi không mong muốn từ repository
     */
    it('should handle unexpected errors from the repository', async () => {
      // Sắp xếp (Arrange)
      const filters = { user_id: '123' }; // Điều kiện tìm kiếm theo ID người dùng
      jest.mocked(mockCartRepository.findAndCount).mockRejectedValue(new Error('Unexpected error') as never); // Giả lập repository ném lỗi

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(cartService.getListProduct(filters)).rejects.toThrow('Unexpected error'); // Kiểm tra lỗi được ném ra
    });
  });
});