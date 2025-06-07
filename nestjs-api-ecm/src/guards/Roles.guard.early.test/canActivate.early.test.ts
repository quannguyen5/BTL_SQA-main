
/**
 * File: nestjs-api-ecm\src\guards\Roles.guard.early.test\canActivate.early.test.ts
 * Class: RolesGuard
 * Method: canActivate
 * 
 * Mô tả: Test suite cho phương thức canActivate của RolesGuard
 * Chức năng: Kiểm tra quyền truy cập của người dùng dựa trên role
 * 
 * Bộ test case:
 * TC-ROLE-GUARD-001: Kiểm tra quyền truy cập khi user có role phù hợp
 * TC-ROLE-GUARD-002: Kiểm tra quyền truy cập khi không yêu cầu role
 * TC-ROLE-GUARD-003: Kiểm tra quyền truy cập khi user không có role yêu cầu
 * TC-ROLE-GUARD-004: Kiểm tra quyền truy cập khi không có thông tin user
 * TC-ROLE-GUARD-005: Kiểm tra quyền truy cập khi role user không nằm trong danh sách role được phép
 */

import {
    UnauthorizedException
} from '@nestjs/common';
import { RolesGuard } from '../Roles.guard';

/**
 * Mock class Reflector
 * Mục đích: Giả lập service Reflector để lấy metadata từ decorator
 * Cung cấp method get() để mock việc lấy roles
 */
class MockReflector {
  get = jest.fn();
}

/**
 * Mock class ExecutionContext
 * Mục đích: Giả lập context của request
 * Cung cấp các method để truy cập thông tin request
 */
class MockExecutionContext {
  switchToHttp = jest.fn().mockReturnThis();
  getRequest = jest.fn();
  getHandler = jest.fn();
}

/**
 * Mock class Request
 * Mục đích: Giả lập đối tượng request
 * Chứa thông tin user, headers và params
 */
class MockRequest {
  user: any;
  headers: any;
  params: any;
}

describe('RolesGuard.canActivate() canActivate method', () => {
  let rolesGuard: RolesGuard;
  let mockReflector: MockReflector;
  let mockExecutionContext: MockExecutionContext;
  let mockRequest: MockRequest;

  /**
   * Setup trước mỗi test case
   * Khởi tạo các mock object mới để đảm bảo tính độc lập giữa các test
   */
  beforeEach(() => {
    mockReflector = new MockReflector();
    mockExecutionContext = new MockExecutionContext();
    mockRequest = new MockRequest();
    rolesGuard = new RolesGuard(mockReflector as any);
    mockExecutionContext.getHandler.mockReturnValue(() => {});
  });

  /**
   * Test Case ID: TC-ROLE-GUARD-001
   * Mục tiêu: Kiểm tra xử lý khi user có role phù hợp với yêu cầu
   * Input: 
   * - User role: 'admin'
   * - Required roles: ['admin']
   * Expected Output: true (cho phép truy cập)
   * Ghi chú: Happy path - trường hợp thành công cơ bản
   */
  it('should return true if user has the required role', () => {
    // Arrange: Cấu hình mock data với role phù hợp
    mockReflector.get.mockReturnValue(['admin']);
    mockRequest.user = { role: 'admin' };
    mockExecutionContext.getRequest.mockReturnValue(mockRequest);

    // Act: Thực thi phương thức cần test
    const result = rolesGuard.canActivate(mockExecutionContext as any);

    // Assert: Kiểm tra kết quả
    expect(result).toBe(true);
  });

  /**
   * Test Case ID: TC-ROLE-GUARD-002
   * Mục tiêu: Kiểm tra xử lý khi không có role nào được yêu cầu
   * Input: Required roles: undefined
   * Expected Output: true (cho phép truy cập)
   * Ghi chú: Happy path - trường hợp không yêu cầu role
   */
  it('should return true if no roles are required', () => {
    // Arrange: Cấu hình mock data không có role yêu cầu
    mockReflector.get.mockReturnValue(undefined);

    // Act: Thực thi phương thức cần test
    const result = rolesGuard.canActivate(mockExecutionContext as any);

    // Assert: Kiểm tra kết quả
    expect(result).toBe(true);
  });

  /**
   * Test Case ID: TC-ROLE-GUARD-003
   * Mục tiêu: Kiểm tra xử lý khi user không có role yêu cầu
   * Input:
   * - User role: 'user'
   * - Required roles: ['admin']
   * Expected Output: UnauthorizedException
   * Ghi chú: Edge case - xử lý trường hợp không đủ quyền
   */
  it('should throw UnauthorizedException if user does not have the required role', () => {
    // Arrange: Cấu hình mock data với role không phù hợp
    mockReflector.get.mockReturnValue(['admin']);
    mockRequest.user = { role: 'user' };
    mockExecutionContext.getRequest.mockReturnValue(mockRequest);

    // Act & Assert: Kiểm tra việc throw exception
    expect(() => rolesGuard.canActivate(mockExecutionContext as any))
      .toThrow(UnauthorizedException);
  });

  /**
   * Test Case ID: TC-ROLE-GUARD-004
   * Mục tiêu: Kiểm tra xử lý khi không có thông tin user trong request
   * Input:
   * - User: undefined
   * - Required roles: ['admin']
   * Expected Output: UnauthorizedException
   * Ghi chú: Edge case - thiếu thông tin user
   */
  it('should throw UnauthorizedException if no user is present in the request', () => {
    // Arrange: Cấu hình mock data không có thông tin user
    mockReflector.get.mockReturnValue(['admin']);
    mockRequest.user = undefined;
    mockExecutionContext.getRequest.mockReturnValue(mockRequest);

    // Act & Assert: Kiểm tra việc throw exception
    expect(() => rolesGuard.canActivate(mockExecutionContext as any))
      .toThrow(UnauthorizedException);
  });

  /**
   * Test Case ID: TC-ROLE-GUARD-005
   * Mục tiêu: Kiểm tra xử lý khi role của user không nằm trong danh sách được phép
   * Input:
   * - User role: 'guest'
   * - Required roles: ['admin', 'manager']
   * Expected Output: UnauthorizedException
   * Ghi chú: Edge case - role không nằm trong danh sách cho phép
   */
  it('should throw UnauthorizedException if user role is not included in the required roles', () => {
    // Arrange: Cấu hình mock data với role không nằm trong danh sách
    mockReflector.get.mockReturnValue(['admin', 'manager']);
    mockRequest.user = { role: 'guest' };
    mockExecutionContext.getRequest.mockReturnValue(mockRequest);

    // Act & Assert: Kiểm tra việc throw exception
    expect(() => rolesGuard.canActivate(mockExecutionContext as any))
      .toThrow(UnauthorizedException);
  });
});
