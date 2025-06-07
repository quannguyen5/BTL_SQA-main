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
 * - delete: xóa một bản ghi
 */
class MockRepository {
  public findOneBy = jest.fn();
  public delete = jest.fn();
}

/**
 * Test Suite: BaseService.delete()
 * Mục đích: Kiểm thử phương thức delete của BaseService
 */
describe('BaseService.delete() delete method', () => {
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
   * Test Case TC-BS-DL-001: Xóa bản ghi thành công
   * Mục tiêu: Kiểm tra xóa bản ghi khi bản ghi tồn tại
   * Input: id = '123'
   * Expected Output: Bản ghi được xóa thành công
   * Ghi chú: Happy path - trường hợp lý tưởng
   */
  it('should delete a record when it exists', async () => {
    // Arrange: Chuẩn bị dữ liệu và mock
    const id = '123';
    const mockRecord = { id: '123', name: 'Test Record' };
    jest.mocked(mockRepository.findOneBy).mockResolvedValue(mockRecord as any);
    jest.mocked(mockRepository.delete).mockResolvedValue(undefined as any);

    // Act: Thực thi phương thức delete
    await baseService.delete(id);

    // Assert: Kiểm tra kết quả
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id } as any);
    expect(mockRepository.delete).toHaveBeenCalledWith(id);
  });

  /**
   * Test Case TC-BS-DL-002: Xóa bản ghi không tồn tại
   * Mục tiêu: Kiểm tra xử lý khi xóa bản ghi không tồn tại
   * Input: id = '123'
   * Expected Output: Throw error với message 'RECORD NOT FOUND!'
   * Ghi chú: Edge case - kiểm tra xử lý lỗi khi bản ghi không tồn tại
   */
  it('should throw an error when the record does not exist', async () => {
    // Arrange: Chuẩn bị dữ liệu và mock
    const id = '123';
    jest.mocked(mockRepository.findOneBy).mockResolvedValue(null as any);

    // Act & Assert: Thực thi và kiểm tra lỗi
    await expect(baseService.delete(id)).rejects.toThrow('RECORD NOT FOUND!');
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id } as any);
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  /**
   * Test Case TC-BS-DL-003: Xử lý lỗi khi xóa bản ghi
   * Mục tiêu: Kiểm tra xử lý khi repository.delete gặp lỗi
   * Input: id = '123'
   * Expected Output: Throw error với message 'Delete failed'
   * Ghi chú: Edge case - kiểm tra xử lý lỗi từ repository
   */
  it('should propagate an error if the repository delete method fails', async () => {
    // Arrange: Chuẩn bị dữ liệu và mock
    const id = '123';
    const mockRecord = { id: '123', name: 'Test Record' };
    jest.mocked(mockRepository.findOneBy).mockResolvedValue(mockRecord as any);
    jest.mocked(mockRepository.delete).mockRejectedValue(new Error('Delete failed') as never);

    // Act & Assert: Thực thi và kiểm tra lỗi
    await expect(baseService.delete(id)).rejects.toThrow('Delete failed');
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id } as any);
    expect(mockRepository.delete).toHaveBeenCalledWith(id);
  });
});