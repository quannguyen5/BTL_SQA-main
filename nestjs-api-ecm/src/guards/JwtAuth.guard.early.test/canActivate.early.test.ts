
import {
    UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/backend/user/user.service';
import { responseHandler } from 'src/Until/responseUtil';
import { AuthGuard } from '../JwtAuth.guard';




// Mocking the UserService
const mockUserService = {
  findOne: jest.fn(),
} as unknown as jest.Mocked<UserService>;

// Mocking the JwtService
const mockJwtService = {
  verifyAsync: jest.fn(),
} as unknown as jest.Mocked<JwtService>;

// Mocking the ConfigService
const mockConfigService = {
  get: jest.fn(),
} as unknown as jest.Mocked<ConfigService>;

// Mocking the ExecutionContext
class MockExecutionContext {
  switchToHttp = jest.fn().mockReturnThis();
  getRequest = jest.fn().mockReturnValue({
    headers: {},
    params: {},
  });
}

describe('AuthGuard.canActivate() canActivate method', () => {
  let authGuard: AuthGuard;
  let mockContext: MockExecutionContext;

  beforeEach(() => {
    authGuard = new AuthGuard(
      mockJwtService as any,
      mockUserService as any,
      mockConfigService as any,
    );
    mockContext = new MockExecutionContext() as any;
  });

  describe('Happy paths', () => {
    /**
     * Test Case ID: TC-JWT-GUARD-001
     * Mục tiêu: Kiểm tra xác thực thành công với token hợp lệ
     * Input: 
     * - Token: 'validToken'
     * - User data: { isActive: true, token: 'validToken', role: 'admin' }
     * Expected Output: true (xác thực thành công)
     * Ghi chú: Happy path - Trường hợp xác thực thành công với đầy đủ thông tin hợp lệ
     */
    it('should return true when authorization header and token are valid', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const mockToken = 'validToken'; // Token mẫu
      const mockPayload = { id: 'userId' }; // Payload của token
      const mockUser = { isActive: true, token: 'validToken', role: 'admin' }; // Thông tin user

      // Mock request với token hợp lệ
      mockContext.getRequest.mockReturnValue({
        headers: { authorization: `Bearer ${mockToken}` },
        params: {},
      });
      // Mock các hàm service
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload as any as never);
      mockUserService.findOne.mockResolvedValue(mockUser as any as never);
      mockConfigService.get.mockReturnValue('secret');

      // Act: Thực thi phương thức cần test
      const result = await authGuard.canActivate(mockContext as any);

      // Assert: Kiểm tra kết quả
      expect(result).toBe(true);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(mockToken, {
        secret: 'secret',
      });
      expect(mockUserService.findOne).toHaveBeenCalledWith(mockPayload.id);
    });
  });

  describe('Edge cases', () => {
    /**
     * Test Case ID: TC-JWT-GUARD-002
     * Mục tiêu: Kiểm tra trường hợp thiếu header authorization
     * Input: Request không có authorization header
     * Expected Output: Response error với message 'GUARD.PLEASE PROVIDE AUTHORIZATIONHEADER!'
     * Ghi chú: Edge case - Kiểm tra xử lý khi thiếu thông tin xác thực
     */
    it('should return error when authorization header is missing', async () => {
      // Arrange: Mock request không có header
      mockContext.getRequest.mockReturnValue({
        headers: {},
        params: {},
      });

      // Act: Thực thi phương thức
      const result = await authGuard.canActivate(mockContext as any);

      // Assert: Kiểm tra kết quả
      expect(result).toEqual(
        responseHandler.error('GUARD.PLEASE PROVIDE AUTHORIZATIONHEADER!'),
      );
    });

    /**
     * Test Case ID: TC-JWT-GUARD-003
     * Mục tiêu: Kiểm tra trường hợp thiếu token
     * Input: Authorization header không có token
     * Expected Output: Response error với message 'GUARD.PLEASE PROVIDE TOKEN!'
     * Ghi chú: Edge case - Kiểm tra xử lý khi header không chứa token
     */
    it('should return error when token is missing', async () => {
      // Arrange: Mock request với header không có token
      mockContext.getRequest.mockReturnValue({
        headers: { authorization: 'Bearer ' },
        params: {},
      });

      // Act: Thực thi phương thức
      const result = await authGuard.canActivate(mockContext as any);

      // Assert: Kiểm tra kết quả
      expect(result).toEqual(
        responseHandler.error('GUARD.PLEASE PROVIDE TOKEN!'),
      );
    });

    /**
     * Test Case ID: TC-JWT-GUARD-004
     * Mục tiêu: Kiểm tra trường hợp token không hợp lệ
     * Input: Token không hợp lệ 'invalidToken'
     * Expected Output: UnauthorizedException
     * Ghi chú: Edge case - Kiểm tra xử lý khi token không thể verify
     */
    it('should throw UnauthorizedException when token verification fails', async () => {
      // Arrange: Mock request với token không hợp lệ
      const mockToken = 'invalidToken';
      mockContext.getRequest.mockReturnValue({
        headers: { authorization: `Bearer ${mockToken}` },
        params: {},
      });
      // Mock verify token thất bại
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      // Act & Assert: Kiểm tra throw exception
      await expect(authGuard.canActivate(mockContext as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    /**
     * Test Case ID: TC-JWT-GUARD-005
     * Mục tiêu: Kiểm tra trường hợp user không active
     * Input: User data với isActive: false
     * Expected Output: false
     * Ghi chú: Edge case - Kiểm tra xử lý khi tài khoản bị vô hiệu hóa
     */
    it('should return error when user is inactive', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const mockToken = 'validToken';
      const mockPayload = { id: 'userId' };
      const mockUser = { isActive: false, token: 'validToken', role: 'admin' };

      // Mock request và các service
      mockContext.getRequest.mockReturnValue({
        headers: { authorization: `Bearer ${mockToken}` },
        params: {},
      });
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload as any as never);
      mockUserService.findOne.mockResolvedValue(mockUser as any as never);

      // Act: Thực thi phương thức
      const result = await authGuard.canActivate(mockContext as any);

      // Assert: Kiểm tra kết quả
      expect(result).toBe(false);
    });

    /**
     * Test Case ID: TC-JWT-GUARD-006
     * Mục tiêu: Kiểm tra trường hợp user không có token
     * Input: User data với token: null
     * Expected Output: false
     * Ghi chú: Edge case - Kiểm tra xử lý khi user chưa được cấp token
     */
    it('should return error when user token is missing', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const mockToken = 'validToken';
      const mockPayload = { id: 'userId' };
      const mockUser = { isActive: true, token: null, role: 'admin' };

      // Mock request và các service
      mockContext.getRequest.mockReturnValue({
        headers: { authorization: `Bearer ${mockToken}` },
        params: {},
      });
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload as any as never);
      mockUserService.findOne.mockResolvedValue(mockUser as any as never);

      // Act: Thực thi phương thức
      const result = await authGuard.canActivate(mockContext as any);

      // Assert: Kiểm tra kết quả
      expect(result).toBe(false);
    });

    /**
     * Test Case ID: TC-JWT-GUARD-007
     * Mục tiêu: Kiểm tra trường hợp user không có quyền admin và user_id không khớp
     * Input: 
     * - User role: 'user'
     * - Request param user_id khác với token
     * Expected Output: Response error với message 'GUARD.USER ID IN PARAM DOES NOT MATCH WITH TOKEN!'
     * Ghi chú: Edge case - Kiểm tra phân quyền truy cập
     */
    it('should return error when user role is not admin and user_id param does not match', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const mockToken = 'validToken';
      const mockPayload = { id: 'userId' };
      const mockUser = { isActive: true, token: 'validToken', role: 'user' };

      // Mock request với user_id không khớp
      mockContext.getRequest.mockReturnValue({
        headers: { authorization: `Bearer ${mockToken}` },
        params: { user_id: 'differentUserId' },
      });
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload as any as never);
      mockUserService.findOne.mockResolvedValue(mockUser as any as never);

      // Act: Thực thi phương thức
      const result = await authGuard.canActivate(mockContext as any);

      // Assert: Kiểm tra kết quả
      expect(result).toEqual(
        responseHandler.error(
          'GUARD.USER ID IN PARAM DOES NOT MATCH WITH TOKEN!',
        ),
      );
    });
  });
});
