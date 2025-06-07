
import { responseHandler } from '../responseUtil';

describe('responseHandler() responseHandler method', () => {
  // Test các trường hợp thành công
  describe('Happy Paths', () => {
    /**
     * Test Case ID: TC-RESUTIL-001
     * Mục tiêu: Kiểm tra phương thức ok() với dữ liệu hợp lệ
     * Input: data = { id: 1, name: 'Test' }
     * Expected Output: Object response với:
     * - success: true
     * - data: { id: 1, name: 'Test' }
     * - status: 200
     * - message: 'SUCCESS!'
     * Ghi chú: Happy path - Trường hợp thành công cơ bản
     */
    it('should return a successful response with data for ok()', () => {
      // Arrange: Chuẩn bị dữ liệu test
      const data = { id: 1, name: 'Test' };
      // Act: Thực thi phương thức cần test
      const result = responseHandler.ok(data);
      // Assert: Kiểm tra kết quả
      expect(result).toEqual({
        success: true,
        data,
        status: 200,
        message: 'SUCCESS!',
      });
    });

    /**
     * Test Case ID: TC-RESUTIL-002
     * Mục tiêu: Kiểm tra phương thức notFound()
     * Input: Không có
     * Expected Output: Object response với:
     * - success: false
     * - status: 404
     * - message: 'CANNOT FIND RESOURCES!'
     * Ghi chú: Happy path - Trường hợp không tìm thấy tài nguyên
     */
    it('should return a not found response for notFound()', () => {
      const result = responseHandler.notFound();
      expect(result).toEqual({
        success: false,
        status: 404,
        message: 'CANNOT FIND RESOURCES!',
      });
    });

    /**
     * Test Case ID: TC-RESUTIL-003
     * Mục tiêu: Kiểm tra phương thức error() với message mặc định
     * Input: Không có
     * Expected Output: Object response với:
     * - success: false
     * - status: 500
     * - message: 'Internal server error'
     * Ghi chú: Happy path - Trường hợp lỗi server mặc định
     */
    it('should return an error response with default message for error()', () => {
      const result = responseHandler.error();
      expect(result).toEqual({
        success: false,
        status: 500,
        message: 'Internal server error',
      });
    });

    /**
     * Test Case ID: TC-RESUTIL-004
     * Mục tiêu: Kiểm tra phương thức unauthorized() với message mặc định
     * Input: Không có
     * Expected Output: Object response với:
     * - success: false
     * - status: 401
     * - message: 'Unauthorized'
     * Ghi chú: Happy path - Trường hợp không có quyền truy cập
     */
    it('should return an unauthorized response with default message for unauthorized()', () => {
      const result = responseHandler.unauthorized();
      expect(result).toEqual({
        success: false,
        status: 401,
        message: 'Unauthorized',
      });
    });

    /**
     * Test Case ID: TC-RESUTIL-005
     * Mục tiêu: Kiểm tra phương thức invalidated() với dữ liệu lỗi
     * Input: errors = { field: 'name', error: 'Required' }
     * Expected Output: Object response với:
     * - success: false
     * - status: 422
     * - data: { field: 'name', error: 'Required' }
     * Ghi chú: Happy path - Trường hợp dữ liệu không hợp lệ
     */
    it('should return an invalidated response with errors for invalidated()', () => {
      const errors = { field: 'name', error: 'Required' };
      const result = responseHandler.invalidated(errors);
      expect(result).toEqual({
        success: false,
        status: 422,
        data: errors,
      });
    });
  });

  // Test các trường hợp đặc biệt
  describe('Edge Cases', () => {
    /**
     * Test Case ID: TC-RESUTIL-006
     * Mục tiêu: Kiểm tra phương thức error() với message tùy chỉnh
     * Input: message = 'Custom error message'
     * Expected Output: Object response với:
     * - success: false
     * - status: 500
     * - message: 'Custom error message'
     * Ghi chú: Edge case - Trường hợp tùy chỉnh thông báo lỗi
     */
    it('should return an error response with a custom message for error()', () => {
      const customMessage = 'Custom error message';
      const result = responseHandler.error(customMessage);
      expect(result).toEqual({
        success: false,
        status: 500,
        message: customMessage,
      });
    });

    /**
     * Test Case ID: TC-RESUTIL-007
     * Mục tiêu: Kiểm tra phương thức unauthorized() với message tùy chỉnh
     * Input: message = 'Custom unauthorized message'
     * Expected Output: Object response với:
     * - success: false
     * - status: 401
     * - message: 'Custom unauthorized message'
     * Ghi chú: Edge case - Trường hợp tùy chỉnh thông báo unauthorized
     */
    it('should return an unauthorized response with a custom message for unauthorized()', () => {
      const customMessage = 'Custom unauthorized message';
      const result = responseHandler.unauthorized(customMessage);
      expect(result).toEqual({
        success: false,
        status: 401,
        message: customMessage,
      });
    });

    /**
     * Test Case ID: TC-RESUTIL-008
     * Mục tiêu: Kiểm tra phương thức invalidated() với object errors rỗng
     * Input: errors = {}
     * Expected Output: Object response với:
     * - success: false
     * - status: 422
     * - data: {}
     * Ghi chú: Edge case - Trường hợp không có chi tiết lỗi
     */
    it('should handle invalidated() with empty errors object', () => {
      const errors = {};
      const result = responseHandler.invalidated(errors);
      expect(result).toEqual({
        success: false,
        status: 422,
        data: errors,
      });
    });

    /**
     * Test Case ID: TC-RESUTIL-009
     * Mục tiêu: Kiểm tra phương thức ok() với dữ liệu null
     * Input: data = null
     * Expected Output: Object response với:
     * - success: true
     * - data: null
     * - status: 200
     * - message: 'SUCCESS!'
     * Ghi chú: Edge case - Trường hợp dữ liệu null
     */
    it('should handle ok() with null data', () => {
      const result = responseHandler.ok(null);
      expect(result).toEqual({
        success: true,
        data: null,
        status: 200,
        message: 'SUCCESS!',
      });
    });

    /**
     * Test Case ID: TC-RESUTIL-010
     * Mục tiêu: Kiểm tra phương thức ok() với dữ liệu undefined
     * Input: data = undefined
     * Expected Output: Object response với:
     * - success: true
     * - data: undefined
     * - status: 200
     * - message: 'SUCCESS!'
     * Ghi chú: Edge case - Trường hợp dữ liệu undefined
     */
    it('should handle ok() with undefined data', () => {
      const result = responseHandler.ok(undefined);
      expect(result).toEqual({
        success: true,
        data: undefined,
        status: 200,
        message: 'SUCCESS!',
      });
    });
  });
});
