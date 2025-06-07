/**
 * Import các module cần thiết
 * BaseService: Service cơ sở cung cấp các phương thức CRUD
 */
import { BaseService } from '../base.service';

/**
 * MockRepository: Class giả lập Repository
 * Mục đích: Tạo một repository mẫu để test BaseService
 * Các phương thức mock:
 * - findOneBy: tìm kiếm một bản ghi theo điều kiện
 * - save: lưu bản ghi vào database
 */
class MockRepository {
  public findOneBy = jest.fn();
  public save = jest.fn();
}

/**
 * MockDeepPartial: Type hỗ trợ tạo object partial đệ quy
 * Mục đích: Cho phép tạo object cập nhật một phần các thuộc tính
 */
type MockDeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? MockDeepPartial<T[P]> : T[P];
};

/**
 * Test Suite: BaseService.update()
 * Mục đích: Kiểm thử phương thức update của BaseService
 */
describe('BaseService.update() update method', () => {
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
   * Test Case TC-BS-UD-001: Cập nhật bản ghi thành công
   * Mục tiêu: Kiểm tra cập nhật bản ghi khi bản ghi tồn tại trong DB
   * Input: 
   * - id: '1'
   * - updateData: { name: 'New Name' }
   * Expected Output:
   * - Trả về bản ghi đã được cập nhật: { id: '1', name: 'New Name' }
   * - Repository.findOneBy được gọi với {id: '1'}
   * - Repository.save được gọi với dữ liệu cập nhật
   * Ghi chú: Kiểm tra trường hợp happy path
   */
  it('should update an existing record successfully', async () => {
    // Arrange: Chuẩn bị dữ liệu và mock
    const existingRecord = { id: '1', name: 'Old Name' };
    const updateData = { name: 'New Name' };
    mockRepository.findOneBy.mockResolvedValue(existingRecord as any as never);
    mockRepository.save.mockResolvedValue({ ...existingRecord, ...updateData } as any as never);

    // Act: Thực thi phương thức update
    const result = await baseService.update(updateData, '1');

    // Assert: Kiểm tra kết quả
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '1' } as any);
    expect(mockRepository.save).toHaveBeenCalledWith({ id: '1', name: 'New Name' } as any);
    expect(result).toEqual({ id: '1', name: 'New Name' });
  });

  /**
   * Test Case TC-BS-UD-002: Cập nhật bản ghi không tồn tại
   * Mục tiêu: Kiểm tra xử lý khi bản ghi cần cập nhật không tồn tại
   * Input:
   * - id: '1'
   * - updateData: { name: 'New Name' }
   * Expected Output:
   * - Throw error với message 'RECORD NOT FOUND!'
   * - Repository.findOneBy được gọi với {id: '1'}
   * - Repository.save không được gọi
   * Ghi chú: Kiểm tra xử lý lỗi khi không tìm thấy bản ghi
   */
  it('should throw an error if the record does not exist', async () => {
    // Arrange: Chuẩn bị dữ liệu và mock
    mockRepository.findOneBy.mockResolvedValue(null as any as never);

    // Act & Assert: Thực thi và kiểm tra kết quả
    await expect(baseService.update({ name: 'New Name' }, '1')).rejects.toThrow('RECORD NOT FOUND!');
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '1' } as any);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  /**
   * Test Case TC-BS-UD-003: Cập nhật một phần bản ghi
   * Mục tiêu: Kiểm tra cập nhật một phần thuộc tính của bản ghi
   * Input:
   * - id: '1'
   * - updateData: { age: 31 }
   * Expected Output:
   * - Trả về bản ghi với thuộc tính đã cập nhật, giữ nguyên các thuộc tính khác
   * - Repository.findOneBy được gọi với {id: '1'}
   * - Repository.save được gọi với dữ liệu cập nhật một phần
   * Ghi chú: Kiểm tra cập nhật từng phần (partial update)
   */
  it('should handle partial updates correctly', async () => {
    // Arrange: Chuẩn bị dữ liệu và mock
    const existingRecord = { id: '1', name: 'Old Name', age: 30 };
    const updateData = { age: 31 };
    mockRepository.findOneBy.mockResolvedValue(existingRecord as any as never);
    mockRepository.save.mockResolvedValue({ ...existingRecord, ...updateData } as any as never);

    // Act: Thực thi phương thức update
    const result = await baseService.update(updateData, '1');

    // Assert: Kiểm tra kết quả
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '1' } as any);
    expect(mockRepository.save).toHaveBeenCalledWith({ id: '1', name: 'Old Name', age: 31 } as any);
    expect(result).toEqual({ id: '1', name: 'Old Name', age: 31 });
  });
});