/**
 * File: detail.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức detail của CartService
 * Module: Cart
 * Chức năng: Kiểm tra chức năng lấy thông tin chi tiết của sản phẩm trong giỏ hàng
 * Ngày tạo: 2023
 */

import { Cart_productEntity } from 'src/entities/cartproduct_entity/cart_product.entity';
import { CartService } from '../cart.service';

/**
 * Mock Repository cho Cart_productEntity
 * Giả lập các phương thức của repository để kiểm soát hành vi trong quá trình test
 */
class MockCartRepository {
  public findOneBy = jest.fn(); // Phương thức tìm kiếm sản phẩm trong giỏ hàng theo điều kiện
}

/**
 * Test Suite: CartService.detail() detail method
 * Mô tả: Kiểm thử chức năng lấy thông tin chi tiết của sản phẩm trong giỏ hàng của CartService
 */
describe('CartService.detail() detail method', () => {
  // Khai báo các biến sử dụng trong test
  let service: CartService;               // Service cần test
  let mockCartRepo: MockCartRepository;   // Mock repository

  /**
   * Thiết lập môi trường test trước mỗi test case
   * Khởi tạo các mock objects và service cần test
   */
  beforeEach(() => {
    mockCartRepo = new MockCartRepository();
    service = new CartService(mockCartRepo as any);
  });

  /**
   * Test Group: Happy paths
   * Mô tả: Các test case cho trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * Test Case ID: TC-SV-CART-DETAIL-001
     * Mục tiêu: Kiểm tra việc lấy thông tin chi tiết của sản phẩm trong giỏ hàng thành công
     * Input:
     *   - filter: { id: 1 } - Điều kiện tìm kiếm theo ID
     *   - Repository.findOneBy trả về: { id: 1, product_id: 'product-1', user_id: 'user-1', quantity: 2 }
     * Expected Output:
     *   - Object: { id: 1, product_id: 'product-1', user_id: 'user-1', quantity: 2 }
     *   - Repository.findOneBy được gọi với tham số đúng: { id: 1 }
     * Ghi chú: Service phải trả về đúng sản phẩm trong giỏ hàng theo điều kiện tìm kiếm
     */
    it('should return cart product details when found', async () => {
      // Sắp xếp (Arrange)
      const mockCartProduct = { id: 1, product_id: 'product-1', user_id: 'user-1', quantity: 2 } as unknown as Cart_productEntity; // Sản phẩm trong giỏ hàng mẫu
      jest.mocked(mockCartRepo.findOneBy).mockResolvedValue(mockCartProduct as any as never); // Giả lập tìm thấy sản phẩm

      // Thực thi (Act)
      const result = await service.detail({ id: 1 }); // Gọi phương thức cần test với điều kiện tìm kiếm

      // Kiểm tra (Assert)
      expect(mockCartRepo.findOneBy).toHaveBeenCalledWith({ id: 1 }); // Kiểm tra repository được gọi với tham số đúng
      expect(result).toEqual(mockCartProduct); // Kiểm tra kết quả trả về đúng với sản phẩm tìm thấy
    });

    /**
     * Test Case ID: TC-SV-CART-DETAIL-005
     * Mục tiêu: Kiểm tra việc lấy thông tin chi tiết của sản phẩm trong giỏ hàng với điều kiện product_id
     * Input:
     *   - filter: { product_id: 'product-1' } - Điều kiện tìm kiếm theo product_id
     *   - Repository.findOneBy trả về: { id: 1, product_id: 'product-1', user_id: 'user-1', quantity: 2 }
     * Expected Output:
     *   - Object: { id: 1, product_id: 'product-1', user_id: 'user-1', quantity: 2 }
     *   - Repository.findOneBy được gọi với tham số đúng: { product_id: 'product-1' }
     * Ghi chú: Service phải xử lý được trường hợp tìm kiếm theo product_id
     */
    it('should filter by product_id when provided', async () => {
      // Sắp xếp (Arrange)
      const mockCartProduct = { id: 1, product_id: 'product-1', user_id: 'user-1', quantity: 2 } as unknown as Cart_productEntity; // Sản phẩm trong giỏ hàng mẫu
      jest.mocked(mockCartRepo.findOneBy).mockResolvedValue(mockCartProduct as any as never); // Giả lập tìm thấy sản phẩm

      // Thực thi (Act)
      const result = await service.detail({ product_id: 'product-1' }); // Gọi phương thức cần test với điều kiện tìm kiếm theo product_id

      // Kiểm tra (Assert)
      expect(mockCartRepo.findOneBy).toHaveBeenCalledWith({ product_id: 'product-1' }); // Kiểm tra repository được gọi với tham số đúng
      expect(result).toEqual(mockCartProduct); // Kiểm tra kết quả trả về đúng với sản phẩm tìm thấy
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-SV-CART-DETAIL-002
     * Mục tiêu: Kiểm tra xử lý khi không cung cấp điều kiện tìm kiếm
     * Input:
     *   - filter: {} - Điều kiện tìm kiếm rỗng
     *   - Repository.findOneBy trả về: null (không tìm thấy sản phẩm)
     * Expected Output:
     *   - null
     *   - Repository.findOneBy được gọi với tham số đúng: {}
     * Ghi chú: Service phải xử lý được trường hợp không có điều kiện tìm kiếm
     */
    it('should return null when no filters are provided', async () => {
      // Sắp xếp (Arrange)
      jest.mocked(mockCartRepo.findOneBy).mockResolvedValue(null as any as never); // Giả lập không tìm thấy sản phẩm

      // Thực thi (Act)
      const result = await service.detail({}); // Gọi phương thức cần test với điều kiện rỗng

      // Kiểm tra (Assert)
      expect(mockCartRepo.findOneBy).toHaveBeenCalledWith({}); // Kiểm tra repository được gọi với tham số đúng
      expect(result).toBeNull(); // Kiểm tra kết quả trả về là null
    });

    /**
     * Test Case ID: TC-SV-CART-DETAIL-003
     * Mục tiêu: Kiểm tra xử lý khi không tìm thấy sản phẩm trong giỏ hàng
     * Input:
     *   - filter: { user_id: 999 } - Điều kiện tìm kiếm theo user_id không tồn tại
     *   - Repository.findOneBy trả về: null (không tìm thấy sản phẩm)
     * Expected Output:
     *   - null
     *   - Repository.findOneBy được gọi với tham số đúng: { user_id: 999 }
     * Ghi chú: Service phải xử lý được trường hợp không tìm thấy sản phẩm
     */
    it('should return null when no matching cart product is found', async () => {
      // Sắp xếp (Arrange)
      jest.mocked(mockCartRepo.findOneBy).mockResolvedValue(null as any as never); // Giả lập không tìm thấy sản phẩm

      // Thực thi (Act)
      const result = await service.detail({ user_id: 999 }); // Gọi phương thức cần test với điều kiện tìm kiếm

      // Kiểm tra (Assert)
      expect(mockCartRepo.findOneBy).toHaveBeenCalledWith({ user_id: 999 }); // Kiểm tra repository được gọi với tham số đúng
      expect(result).toBeNull(); // Kiểm tra kết quả trả về là null
    });

    /**
     * Test Case ID: TC-SV-CART-DETAIL-004
     * Mục tiêu: Kiểm tra xử lý khi gặp lỗi không mong muốn
     * Input:
     *   - filter: { user_id: 1 } - Điều kiện tìm kiếm hợp lệ
     *   - Repository.findOneBy ném lỗi: Error("Unexpected error")
     * Expected Output:
     *   - Exception với message: "Unexpected error"
     * Ghi chú: Service phải ném lại lỗi khi gặp lỗi không mong muốn
     */
    it('should handle unexpected errors gracefully', async () => {
      // Sắp xếp (Arrange)
      jest.mocked(mockCartRepo.findOneBy).mockRejectedValue(new Error('Unexpected error') as never); // Giả lập repository ném lỗi

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(service.detail({ user_id: 1 })).rejects.toThrow('Unexpected error'); // Kiểm tra lỗi được ném ra
    });

    /**
     * Test Case ID: TC-SV-CART-DETAIL-006
     * Mục tiêu: Kiểm tra việc lấy thông tin chi tiết với cả user_id và product_id
     * Input:
     *   - filter: { user_id: 'user-1', product_id: 'product-1' } - Điều kiện tìm kiếm kết hợp
     *   - Repository.findOneBy trả về: { id: 1, product_id: 'product-1', user_id: 'user-1', quantity: 2 }
     * Expected Output:
     *   - Object: { id: 1, product_id: 'product-1', user_id: 'user-1', quantity: 2 }
     *   - Repository.findOneBy được gọi với tham số đúng: { user_id: 'user-1', product_id: 'product-1' }
     * Ghi chú: Service phải xử lý được trường hợp tìm kiếm kết hợp nhiều điều kiện
     */
    it('should filter by both user_id and product_id when both are provided', async () => {
      // Sắp xếp (Arrange)
      const mockCartProduct = { id: 1, product_id: 'product-1', user_id: 'user-1', quantity: 2 } as unknown as Cart_productEntity; // Sản phẩm trong giỏ hàng mẫu
      jest.mocked(mockCartRepo.findOneBy).mockResolvedValue(mockCartProduct as any as never); // Giả lập tìm thấy sản phẩm

      // Thực thi (Act)
      const result = await service.detail({ user_id: 'user-1', product_id: 'product-1' }); // Gọi phương thức cần test với điều kiện tìm kiếm kết hợp

      // Kiểm tra (Assert)
      expect(mockCartRepo.findOneBy).toHaveBeenCalledWith({ user_id: 'user-1', product_id: 'product-1' }); // Kiểm tra repository được gọi với tham số đúng
      expect(result).toEqual(mockCartProduct); // Kiểm tra kết quả trả về đúng với sản phẩm tìm thấy
    });
  });
});
