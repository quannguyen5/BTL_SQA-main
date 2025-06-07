/**
 * Import các module cần thiết
 * BaseService: Service cơ sở cung cấp các phương thức CRUD
 */
import { BaseService } from '../base.service';

/**
 * MockRepository: Class giả lập Repository
 * Mục đích: Tạo một repository mẫu để test BaseService
 * Các phương thức mock:
 * - findOne: tìm kiếm một bản ghi
 * - create: tạo đối tượng mới
 * - save: lưu đối tượng vào database
 */
class MockRepository {
  public findOne = jest.fn();
  public create = jest.fn();
  public save = jest.fn();
}

/**
 * MockDeepPartial: Type hỗ trợ tạo object partial đệ quy
 * Mục đích: Cho phép tạo object không cần đầy đủ các thuộc tính
 * Hỗ trợ các kiểu dữ liệu: Array, Map, Set, Object
 */
type MockDeepPartial<T> = T | (T extends Array<infer U> ? MockDeepPartial<U>[] : T extends Map<infer K, infer V> ? Map<MockDeepPartial<K>, MockDeepPartial<V>> : T extends Set<infer M> ? Set<MockDeepPartial<M>> : T extends object ? {
  [K in keyof T]?: MockDeepPartial<T[K]>;
} : T);

/**
 * Test Suite: BaseService.create()
 * Mục đích: Kiểm thử phương thức create của BaseService
 */
describe('BaseService.create() create method', () => {
  // Khai báo biến sử dụng trong test
  let mockRepository: MockRepository;
  let baseService: BaseService<any>;

  /**
   * Hook beforeEach
   * Mục đích: Khởi tạo repository và service mới trước mỗi test case
   */
  beforeEach(() => {
    mockRepository = new MockRepository() as any;
    baseService = new BaseService(mockRepository as any);
  });

  /**
   * Test Case TC-BS-CR-001: Tạo bản ghi mới thành công
   * Mục tiêu: Kiểm tra tạo bản ghi mới khi chưa tồn tại
   * Input: 
   * - data: { name: 'New Record' }
   * - findCondition: { id: 1 }
   * Expected Output: Bản ghi mới được tạo và lưu thành công
   * Ghi chú: Happy path - trường hợp lý tưởng
   */
  describe('Happy paths', () => {
    it('should create and save a new record when no existing record is found', async () => {
      // Arrange: Chuẩn bị dữ liệu và mock
      const data = { name: 'New Record' } as MockDeepPartial<any>;
      const findCondition = { id: 1 };
      mockRepository.findOne.mockResolvedValue(null as any as never);
      mockRepository.create.mockReturnValue(data as any);
      mockRepository.save.mockResolvedValue(data as any as never);

      // Act: Thực thi phương thức create
      const result = await baseService.create(data, findCondition);

      // Assert: Kiểm tra kết quả
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: findCondition });
      expect(mockRepository.create).toHaveBeenCalledWith(data);
      expect(mockRepository.save).toHaveBeenCalledWith(data);
      expect(result).toEqual(data);
    });
  });

  /**
   * Test Case TC-BS-CR-002: Xử lý trường hợp bản ghi đã tồn tại
   * Mục tiêu: Kiểm tra xử lý khi tạo bản ghi đã tồn tại
   * Input:
   * - data: { name: 'Existing Record' }
   * - findCondition: { id: 1 }
   * Expected Output: Throw error với message 'RECORD ALREADY EXISTS!'
   * Ghi chú: Edge case - kiểm tra xử lý lỗi
   */
  describe('Edge cases', () => {
    it('should throw an error if a record already exists', async () => {
      // Arrange: Chuẩn bị dữ liệu và mock
      const data = { name: 'Existing Record' } as MockDeepPartial<any>;
      const findCondition = { id: 1 };
      mockRepository.findOne.mockResolvedValue(data as any as never);

      // Act & Assert: Thực thi và kiểm tra lỗi
      await expect(baseService.create(data, findCondition)).rejects.toThrow('RECORD ALREADY EXISTS!');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: findCondition });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    /**
     * Test Case TC-BS-CR-003: Xử lý dữ liệu rỗng
     * Mục tiêu: Kiểm tra khả năng xử lý khi input là object rỗng
     * Input:
     * - data: {}
     * - findCondition: { id: 1 }
     * Expected Output: Bản ghi rỗng được tạo thành công
     * Ghi chú: Edge case - kiểm tra xử lý dữ liệu đặc biệt
     */
    it('should handle empty data gracefully', async () => {
      // Arrange: Chuẩn bị dữ liệu và mock
      const data = {} as MockDeepPartial<any>;
      const findCondition = { id: 1 };
      mockRepository.findOne.mockResolvedValue(null as any as never);
      mockRepository.create.mockReturnValue(data as any);
      mockRepository.save.mockResolvedValue(data as any as never);

      // Act: Thực thi phương thức create
      const result = await baseService.create(data, findCondition);

      // Assert: Kiểm tra kết quả
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: findCondition });
      expect(mockRepository.create).toHaveBeenCalledWith(data);
      expect(mockRepository.save).toHaveBeenCalledWith(data);
      expect(result).toEqual(data);
    });
  });
});