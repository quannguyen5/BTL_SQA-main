/**
 * File: getList.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getList của CartService
 * Module: Cart
 * Chức năng: Kiểm tra chức năng lấy danh sách sản phẩm trong giỏ hàng có phân trang
 * Ngày tạo: 2023
 */

import { CartService } from '../cart.service';

/**
 * Mock Repository cho Cart_productEntity
 * Giả lập các phương thức của repository để kiểm soát hành vi trong quá trình test
 */
class MockCartRepository {
  // Phương thức tìm kiếm và đếm số lượng sản phẩm trong giỏ hàng, trả về mảng sản phẩm và tổng số
  public findAndCount = jest.fn().mockResolvedValue([[], 0] as any as never);
}

/**
 * Test Suite: CartService.getList() getList method
 * Mô tả: Kiểm thử chức năng lấy danh sách sản phẩm trong giỏ hàng có phân trang của CartService
 */
describe('CartService.getList() getList method', () => {
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
   * Test Group: Happy Paths
   * Mô tả: Các test case cho trường hợp thành công
   */
  describe('Happy Paths', () => {
    /**
     * Test Case ID: TC-SV-CART-GETLIST-001
     * Mục tiêu: Kiểm tra việc lấy danh sách sản phẩm trong giỏ hàng có phân trang thành công
     * Input:
     *   - page: 1 - Số trang cần lấy
     *   - limit: 2 - Số lượng bản ghi trên một trang
     *   - Repository.findAndCount trả về: [[{ id: 1 }, { id: 2 }], 2] (mảng sản phẩm và tổng số)
     * Expected Output:
     *   - Object: { data: [{ id: 1 }, { id: 2 }], total: 2, page: 1, limit: 2 }
     *   - Repository.findAndCount được gọi với tham số đúng: { skip: 0, take: 2 }
     * Ghi chú: Service phải trả về đúng danh sách sản phẩm và thông tin phân trang
     */
    it('should return a list of cart products with pagination', async () => {
      // Sắp xếp (Arrange)
      const mockData = [{ id: 1 }, { id: 2 }]; // Dữ liệu mẫu: danh sách sản phẩm
      const total = 2; // Tổng số sản phẩm
      jest.mocked(mockCartRepository.findAndCount).mockResolvedValue([mockData, total] as any as never); // Giả lập repository trả về danh sách sản phẩm

      // Thực thi (Act)
      const result = await cartService.getList(1, 2); // Gọi phương thức cần test với trang 1, giới hạn 2

      // Kiểm tra (Assert)
      expect(result).toEqual({ // Kiểm tra kết quả trả về đúng định dạng
        data: mockData, // Danh sách sản phẩm
        total,          // Tổng số sản phẩm
        page: 1,        // Số trang hiện tại
        limit: 2,       // Số lượng bản ghi trên một trang
      });
      expect(mockCartRepository.findAndCount).toHaveBeenCalledWith({ // Kiểm tra repository được gọi với tham số đúng
        skip: 0, // Bỏ qua 0 bản ghi (trang 1)
        take: 2, // Lấy 2 bản ghi
      });
    });
  });

  /**
   * Test Group: Edge Cases
   * Mô tả: Các test case cho trường hợp ngoại lệ và xử lý lỗi
   */
  describe('Edge Cases', () => {
    /**
     * Test Case ID: TC-SV-CART-GETLIST-002
     * Mục tiêu: Kiểm tra xử lý khi số trang nhỏ hơn 1
     * Input:
     *   - page: 0 - Số trang không hợp lệ (nhỏ hơn 1)
     *   - limit: 10 - Số lượng bản ghi trên một trang
     * Expected Output:
     *   - Exception với message: "PAGE NUMBER MUST BE GREATER THAN 0!"
     * Ghi chú: Service phải kiểm tra tính hợp lệ của số trang trước khi thực hiện truy vấn
     */
    it('should throw an error if page number is less than 1', async () => {
      // Sắp xếp (Arrange)
      const invalidPage = 0; // Số trang không hợp lệ

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(cartService.getList(invalidPage, 10)).rejects.toThrow('PAGE NUMBER MUST BE GREATER THAN 0!'); // Kiểm tra lỗi được ném ra
    });

    /**
     * Test Case ID: TC-SV-CART-GETLIST-003
     * Mục tiêu: Kiểm tra xử lý khi giới hạn bản ghi nhỏ hơn 1
     * Input:
     *   - page: 1 - Số trang hợp lệ
     *   - limit: 0 - Giới hạn bản ghi không hợp lệ (nhỏ hơn 1)
     * Expected Output:
     *   - Exception với message: "LIMIT MUST BE GREATER THAN 0!"
     * Ghi chú: Service phải kiểm tra tính hợp lệ của giới hạn bản ghi trước khi thực hiện truy vấn
     */
    it('should throw an error if limit is less than 1', async () => {
      // Sắp xếp (Arrange)
      const invalidLimit = 0; // Giới hạn bản ghi không hợp lệ

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(cartService.getList(1, invalidLimit)).rejects.toThrow('LIMIT MUST BE GREATER THAN 0!'); // Kiểm tra lỗi được ném ra
    });

    /**
     * Test Case ID: TC-SV-CART-GETLIST-004
     * Mục tiêu: Kiểm tra xử lý khi không tìm thấy sản phẩm nào trong giỏ hàng
     * Input:
     *   - page: 1 - Số trang hợp lệ
     *   - limit: 10 - Giới hạn bản ghi hợp lệ
     *   - Repository.findAndCount trả về: [null, 0] (không có sản phẩm nào)
     * Expected Output:
     *   - Exception với message: "NO cart!"
     * Ghi chú: Service phải kiểm tra kết quả trả về từ repository để đảm bảo có dữ liệu
     */
    it('should throw an error if no cart products are found', async () => {
      // Sắp xếp (Arrange)
      jest.mocked(mockCartRepository.findAndCount).mockResolvedValue([null, 0] as any as never); // Giả lập không tìm thấy sản phẩm

      // Thực thi và Kiểm tra (Act & Assert)
      await expect(cartService.getList(1, 10)).rejects.toThrow('NO cart!'); // Kiểm tra lỗi được ném ra
    });
  });
});