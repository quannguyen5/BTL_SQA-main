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
 */
class MockRepository {
  findOneBy = jest.fn();
}

/**
 * Test Suite: BaseService.findOne()
 * Mục đích: Kiểm thử phương thức findOne của BaseService
 */
describe('BaseService.findOne() findOne method', () => {
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
   * Test Case TC-BS-FO-001: Tìm bản ghi tồn tại
   * Mục tiêu: Kiểm tra tìm kiếm bản ghi khi bản ghi tồn tại trong DB
   * Input: id = '123'
   * Expected Output: 
   * - Trả về bản ghi với id='123' và name='Test Record'
   * - Repository.findOneBy được gọi với tham số {id: '123'}
   * Ghi chú: Kiểm tra trường hợp happy path
   */
  it('should return the existing record when found', async () => {
    // Arrange: Chuẩn bị dữ liệu và mock
    const mockRecord = { id: '123', name: 'Test Record' };
    jest.mocked(mockRepository.findOneBy).mockResolvedValue(mockRecord as any as never);

    // Act: Thực thi phương thức findOne
    const result = await baseService.findOne('123');

    // Assert: Kiểm tra kết quả
    expect(result).toEqual(mockRecord);
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '123' } as any);
  });

  /**
   * Test Case TC-BS-FO-002: Tìm bản ghi không tồn tại
   * Mục tiêu: Kiểm tra xử lý khi bản ghi không tồn tại trong DB
   * Input: id = '123'
   * Expected Output: 
   * - Throw error với message 'RECORD NOT FOUND!'
   * - Repository.findOneBy được gọi với tham số {id: '123'}
   * Ghi chú: Kiểm tra xử lý lỗi khi không tìm thấy bản ghi
   */
  it('should throw an error when the record is not found', async () => {
    // Arrange: Chuẩn bị dữ liệu và mock
    jest.mocked(mockRepository.findOneBy).mockResolvedValue(undefined as any as never);

    // Act & Assert: Thực thi và kiểm tra kết quả
    await expect(baseService.findOne('123')).rejects.toThrow('RECORD NOT FOUND!');
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '123' } as any);
  });

  /**
   * Test Case TC-BS-FO-003: Tìm bản ghi với ID không hợp lệ
   * Mục tiêu: Kiểm tra xử lý khi ID truyền vào là chuỗi rỗng
   * Input: id = ''
   * Expected Output: 
   * - Throw error với message 'RECORD NOT FOUND!'
   * - Repository.findOneBy được gọi với tham số {id: ''}
   * Ghi chú: Kiểm tra xử lý với input không hợp lệ
   */
  it('should handle invalid ID format gracefully', async () => {
    // Arrange: Chuẩn bị dữ liệu và mock
    jest.mocked(mockRepository.findOneBy).mockResolvedValue(undefined as any as never);

    // Act & Assert: Thực thi và kiểm tra kết quả
    await expect(baseService.findOne('')).rejects.toThrow('RECORD NOT FOUND!');
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '' } as any);
  });
});