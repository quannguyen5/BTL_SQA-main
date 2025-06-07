/**
 * File: create.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức create của CartService
 * Module: Cart
 * Chức năng: Kiểm tra chức năng thêm sản phẩm vào giỏ hàng
 * Ngày tạo: 2023
 */

import { BaseService } from 'src/base/baseService/base.service';
import { Cart_productEntity } from 'src/entities/cartproduct_entity/cart_product.entity';
import { CartService } from '../cart.service';

/**
 * Mock DTO cho việc tạo mới sản phẩm trong giỏ hàng
 * Chứa các thông tin cần thiết để thêm sản phẩm vào giỏ hàng
 */
class MockCreateCartDto {
  public product_id: string = 'mock-product-id'; // ID của sản phẩm cần thêm vào giỏ hàng
  public user_id: string = 'mock-user-id';       // ID của người dùng sở hữu giỏ hàng
  public quantity: number = 1;                   // Số lượng sản phẩm cần thêm
}

/**
 * Mock Repository cho Cart_productEntity
 * Giả lập các phương thức của repository để kiểm soát hành vi trong quá trình test
 */
class MockCartRepository {
  public findOneBy = jest.fn(); // Phương thức tìm kiếm sản phẩm trong giỏ hàng
  public save = jest.fn();      // Phương thức lưu sản phẩm vào giỏ hàng
}

/**
 * Test Suite: CartService.create() create method
 * Mô tả: Kiểm thử chức năng thêm sản phẩm vào giỏ hàng của CartService
 */
describe('CartService.create() create method', () => {
  // Khai báo các biến sử dụng trong test
  let cartService: CartService;               // Service cần test
  let mockCartRepo: MockCartRepository;       // Mock repository
  let mockCreateCartDto: MockCreateCartDto;   // Mock DTO đầu vào

  /**
   * Thiết lập môi trường test trước mỗi test case
   * Khởi tạo các mock objects và service cần test
   */
  beforeEach(() => {
    mockCartRepo = new MockCartRepository() as any;
    cartService = new CartService(mockCartRepo as any);
    mockCreateCartDto = new MockCreateCartDto() as any;
  });

  /**
   * Test Group: Happy paths
   * Mô tả: Các test case cho trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * Test Case ID: TC-SV-CART-CREATE-001
     * Mục tiêu: Kiểm tra việc cập nhật số lượng khi sản phẩm đã tồn tại trong giỏ hàng
     * Input:
     *   - createCartDto:
     *     + product_id: "mock-product-id" - ID của sản phẩm
     *     + user_id: "mock-user-id" - ID của người dùng
     *     + quantity: 1 - Số lượng sản phẩm cần thêm
     *   - Repository.findOneBy trả về: { id: "existing-id", quantity: 2 } (sản phẩm đã tồn tại)
     * Expected Output:
     *   - Object: { id: "existing-id", quantity: 2 } (sản phẩm đã được cập nhật)
     *   - BaseService.update được gọi với tham số đúng: existingProduct, existingProduct.id
     * Ghi chú: Khi sản phẩm đã tồn tại trong giỏ hàng, service sẽ cập nhật số lượng thay vì tạo mới
     */
    it('should update the quantity if the product already exists in the cart', async () => {
      // Sắp xếp (Arrange)
      const existingProduct = { id: 'existing-id', quantity: 2 } as Cart_productEntity; // Sản phẩm đã tồn tại trong giỏ hàng
      jest.mocked(mockCartRepo.findOneBy).mockResolvedValue(existingProduct as any as never); // Giả lập tìm thấy sản phẩm
      jest.spyOn(BaseService.prototype, 'update').mockResolvedValue(existingProduct as any as never); // Giả lập cập nhật thành công

      // Thực thi (Act)
      const result = await cartService.create(mockCreateCartDto as any); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCartRepo.findOneBy).toHaveBeenCalledWith({ // Kiểm tra repository được gọi để tìm sản phẩm
        product_id: mockCreateCartDto.product_id,
        user_id: mockCreateCartDto.user_id,
      });
      expect(BaseService.prototype.update).toHaveBeenCalledWith(existingProduct, existingProduct.id); // Kiểm tra BaseService.update được gọi để cập nhật
      expect(result).toEqual(existingProduct); // Kiểm tra kết quả trả về là sản phẩm đã cập nhật
    });

    /**
     * Test Case ID: TC-SV-CART-CREATE-002
     * Mục tiêu: Kiểm tra việc tạo mới sản phẩm trong giỏ hàng khi sản phẩm chưa tồn tại
     * Input:
     *   - createCartDto:
     *     + product_id: "mock-product-id" - ID của sản phẩm
     *     + user_id: "mock-user-id" - ID của người dùng
     *     + quantity: 1 - Số lượng sản phẩm cần thêm
     *   - Repository.findOneBy trả về: null (không tìm thấy sản phẩm)
     * Expected Output:
     *   - Object: { id: "new-id", ...mockCreateCartDto } (sản phẩm mới được tạo)
     *   - BaseService.create được gọi với tham số đúng: mockCreateCartDto, { product_id, user_id }
     * Ghi chú: Khi sản phẩm chưa tồn tại trong giỏ hàng, service sẽ tạo mới sản phẩm trong giỏ hàng
     */
    it('should create a new cart product if it does not exist', async () => {
      // Sắp xếp (Arrange)
      jest.mocked(mockCartRepo.findOneBy).mockResolvedValue(null as any as never); // Giả lập không tìm thấy sản phẩm
      const newCartProduct = { id: 'new-id', ...mockCreateCartDto } as Cart_productEntity; // Sản phẩm mới sẽ được tạo
      jest.spyOn(BaseService.prototype, 'create').mockResolvedValue(newCartProduct as any as never); // Giả lập tạo mới thành công

      // Thực thi (Act)
      const result = await cartService.create(mockCreateCartDto as any); // Gọi phương thức cần test

      // Kiểm tra (Assert)
      expect(mockCartRepo.findOneBy).toHaveBeenCalledWith({ // Kiểm tra repository được gọi để tìm sản phẩm
        product_id: mockCreateCartDto.product_id,
        user_id: mockCreateCartDto.user_id,
      });
      expect(BaseService.prototype.create).toHaveBeenCalledWith(mockCreateCartDto, { // Kiểm tra BaseService.create được gọi để tạo mới
        product_id: mockCreateCartDto.product_id,
        user_id: mockCreateCartDto.user_id,
      });
      expect(result).toEqual(newCartProduct); // Kiểm tra kết quả trả về là sản phẩm mới
    });
  });

  /**
   * Test Group: Edge cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-SV-CART-CREATE-003
     * Mục tiêu: Kiểm tra xử lý khi gặp lỗi trong quá trình cập nhật sản phẩm đã tồn tại
     * Input:
     *   - createCartDto:
     *     + product_id: "mock-product-id" - ID của sản phẩm
     *     + user_id: "mock-user-id" - ID của người dùng
     *     + quantity: 1 - Số lượng sản phẩm cần thêm
     *   - Repository.findOneBy trả về: { id: "existing-id", quantity: 2 } (sản phẩm đã tồn tại)
     *   - BaseService.update ném lỗi: Error("Update failed")
     * Expected Output:
     *   - Exception với message: "Update failed"
     * Ghi chú: Service phải ném lại lỗi khi cập nhật sản phẩm thất bại
     */
    it('should handle errors when updating an existing product', async () => {
      // Sắp xếp (Arrange)
      const existingProduct = { id: 'existing-id', quantity: 2 } as Cart_productEntity; // Sản phẩm đã tồn tại trong giỏ hàng
      jest.mocked(mockCartRepo.findOneBy).mockResolvedValue(existingProduct as any as never); // Giả lập tìm thấy sản phẩm
      jest.spyOn(BaseService.prototype, 'update').mockRejectedValue(new Error('Update failed') as never); // Giả lập cập nhật thất bại

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(cartService.create(mockCreateCartDto as any)).rejects.toThrow('Update failed'); // Kiểm tra lỗi được ném ra
    });

    /**
     * Test Case ID: TC-SV-CART-CREATE-004
     * Mục tiêu: Kiểm tra xử lý khi gặp lỗi trong quá trình tạo mới sản phẩm
     * Input:
     *   - createCartDto:
     *     + product_id: "mock-product-id" - ID của sản phẩm
     *     + user_id: "mock-user-id" - ID của người dùng
     *     + quantity: 1 - Số lượng sản phẩm cần thêm
     *   - Repository.findOneBy trả về: null (không tìm thấy sản phẩm)
     *   - BaseService.create ném lỗi: Error("Create failed")
     * Expected Output:
     *   - Exception với message: "Create failed"
     * Ghi chú: Service phải ném lại lỗi khi tạo mới sản phẩm thất bại
     */
    it('should handle errors when creating a new product', async () => {
      // Sắp xếp (Arrange)
      jest.mocked(mockCartRepo.findOneBy).mockResolvedValue(null as any as never); // Giả lập không tìm thấy sản phẩm
      jest.spyOn(BaseService.prototype, 'create').mockRejectedValue(new Error('Create failed') as never); // Giả lập tạo mới thất bại

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(cartService.create(mockCreateCartDto as any)).rejects.toThrow('Create failed'); // Kiểm tra lỗi được ném ra
    });
  });
});