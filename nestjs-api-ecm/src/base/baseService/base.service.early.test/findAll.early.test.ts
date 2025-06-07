/**
 * Import các module cần thiết
 * BaseService: Service cơ sở cung cấp các phương thức CRUD
 */
import { BaseService } from '../base.service';

/**
 * MockRepository: Class giả lập Repository
 * Mục đích: Tạo một repository mẫu để test BaseService
 * Các phương thức mock:
 * - findAndCount: tìm kiếm và đếm số lượng bản ghi
 */
class MockRepository {
  public findAndCount = jest.fn();
}

/**
 * MockDeepPartial: Type hỗ trợ tạo object partial đệ quy
 * Mục đích: Cho phép tạo object không cần đầy đủ các thuộc tính
 */
type MockDeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? MockDeepPartial<T[P]> : T[P];
};

/**
 * Test Suite: BaseService.findAll()
 * Mục đích: Kiểm thử phương thức findAll của BaseService
 */
describe('BaseService.findAll() findAll method', () => {
  // Khai báo biến sử dụng trong test
  let mockRepository: MockRepository;
  let service: BaseService<any>;

  /**
   * Hook beforeEach
   * Mục đích: Khởi tạo repository và service mới trước mỗi test case
   */
  beforeEach(() => {
    mockRepository = new MockRepository() as any;
    service = new BaseService(mockRepository as any);
  });

  /**
   * Nhóm test case: Happy paths
   * Mục đích: Kiểm tra các trường hợp thành công
   */
  describe('Happy paths', () => {
    /**
     * Test Case TC-BS-FA-001: Lấy danh sách với limit và page mặc định
     * Mục tiêu: Kiểm tra lấy danh sách khi không chỉ định limit và page
     * Input: Không có tham số đầu vào
     * Expected Output: 
     * - data: Mảng 2 phần tử
     * - total: 2
     * - Gọi findAndCount với take=10, skip=0
     * Ghi chú: Kiểm tra giá trị mặc định
     */
    it('should return data and total count with default limit and page', async () => {
      // Arrange: Chuẩn bị dữ liệu và mock
      const mockData = [{ id: 1 }, { id: 2 }];
      const mockTotal = 2;
      jest.mocked(mockRepository.findAndCount).mockResolvedValue([mockData, mockTotal] as any as never);

      // Act: Thực thi phương thức findAll
      const result = await service.findAll();

      // Assert: Kiểm tra kết quả
      expect(result).toEqual({ data: mockData, total: mockTotal });
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({ take: 10, skip: 0 });
    });

    /**
     * Test Case TC-BS-FA-002: Lấy danh sách với limit và page được chỉ định
     * Mục tiêu: Kiểm tra lấy danh sách với tham số limit và page cụ thể
     * Input: limit = 2, page = 2
     * Expected Output: 
     * - data: Mảng 2 phần tử
     * - total: 4
     * - Gọi findAndCount với take=2, skip=2
     * Ghi chú: Kiểm tra phân trang
     */
    it('should return data and total count with specified limit and page', async () => {
      // Arrange: Chuẩn bị dữ liệu và mock
      const mockData = [{ id: 3 }, { id: 4 }];
      const mockTotal = 4;
      jest.mocked(mockRepository.findAndCount).mockResolvedValue([mockData, mockTotal] as any as never);

      // Act: Thực thi phương thức findAll
      const result = await service.findAll(2, 2);

      // Assert: Kiểm tra kết quả
      expect(result).toEqual({ data: mockData, total: mockTotal });
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({ take: 2, skip: 2 });
    });
  });

  /**
   * Nhóm test case: Edge cases
   * Mục đích: Kiểm tra các trường hợp đặc biệt và biên
   */
  describe('Edge cases', () => {
    /**
     * Test Case TC-BS-FA-003: Xử lý kết quả rỗng
     * Mục tiêu: Kiểm tra xử lý khi không có dữ liệu
     * Input: Không có tham số đầu vào
     * Expected Output: 
     * - data: Mảng rỗng
     * - total: 0
     * Ghi chú: Kiểm tra trường hợp không có dữ liệu
     */
    it('should handle empty result set', async () => {
      // Arrange: Chuẩn bị dữ liệu và mock
      const mockData: any[] = [];
      const mockTotal = 0;
      jest.mocked(mockRepository.findAndCount).mockResolvedValue([mockData, mockTotal] as any as never);

      // Act: Thực thi phương thức findAll
      const result = await service.findAll();

      // Assert: Kiểm tra kết quả
      expect(result).toEqual({ data: mockData, total: mockTotal });
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({ take: 10, skip: 0 });
    });

    /**
     * Test Case TC-BS-FA-004: Xử lý limit và page âm
     * Mục tiêu: Kiểm tra xử lý khi limit và page là số âm
     * Input: limit = -1, page = -1
     * Expected Output: Sử dụng giá trị mặc định (take=10, skip=0)
     * Ghi chú: Kiểm tra xử lý giá trị không hợp lệ
     */
    it('should handle negative limit and page gracefully', async () => {
      // Arrange: Chuẩn bị dữ liệu và mock
      const mockData = [{ id: 5 }];
      const mockTotal = 1;
      jest.mocked(mockRepository.findAndCount).mockResolvedValue([mockData, mockTotal] as any as never);

      // Act: Thực thi phương thức findAll
      const result = await service.findAll(-1, -1);

      // Assert: Kiểm tra kết quả
      expect(result).toEqual({ data: mockData, total: mockTotal });
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({ take: 10, skip: 0 });
    });

    /**
     * Test Case TC-BS-FA-005: Xử lý page lớn
     * Mục tiêu: Kiểm tra xử lý khi page có giá trị lớn
     * Input: limit = 10, page = 1000
     * Expected Output: Tính toán skip chính xác (skip = 9990)
     * Ghi chú: Kiểm tra xử lý phân trang với số trang lớn
     */
    it('should handle large page number gracefully', async () => {
      // Arrange: Chuẩn bị dữ liệu và mock
      const mockData: any[] = [];
      const mockTotal = 0;
      jest.mocked(mockRepository.findAndCount).mockResolvedValue([mockData, mockTotal] as any as never);

      // Act: Thực thi phương thức findAll
      const result = await service.findAll(10, 1000);

      // Assert: Kiểm tra kết quả
      expect(result).toEqual({ data: mockData, total: mockTotal });
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({ take: 10, skip: 9990 });
    });
  });
});