/**
 * File: Role.decorator.spec.ts
 * Mục đích: Kiểm thử unit test cho decorator Roles
 * Decorator Roles được sử dụng để gán vai trò (roles) cho các endpoint trong ứng dụng
 */

/**
 * Import các dependencies cần thiết:
 * - Reflector: Class từ @nestjs/core để truy cập metadata
 * - Roles: Custom decorator cần test
 */
import { Reflector } from '@nestjs/core';
import { Roles } from './Role.decorator';

/**
 * Test Suite chính cho Roles Decorator
 * Mục đích: Kiểm tra việc định nghĩa và truy xuất metadata roles
 */
describe('Roles decorator', () => {

  /**
   * Test Case TC-DC-R-001: Kiểm tra định nghĩa metadata roles trên method
   * Mục tiêu: Verify decorator có thể gán roles metadata cho một method
   * Input: 
   * - Decorator @Roles('admin', 'user') được áp dụng cho method
   * Expected Output: 
   * - Metadata 'roles' chứa mảng ['admin', 'user']
   * Ghi chú: Kiểm tra chức năng cơ bản của decorator
   */
  it('should define roles metadata on a method', () => {
    // Định nghĩa test class với method được trang trí bởi @Roles
    class TestController {
      @Roles('admin', 'user')
      someMethod() {}
    }

    // Khởi tạo Reflector để truy xuất metadata
    const reflector = new Reflector();
    
    // Lấy metadata 'roles' từ method
    const roles = Reflect.getMetadata('roles', TestController.prototype.someMethod);

    // Kiểm tra metadata có đúng giá trị mong đợi
    expect(roles).toEqual(['admin', 'user']);
  });

  /**
   * Test Case TC-DC-R-002: Kiểm tra trường hợp không có roles được định nghĩa
   * Mục tiêu: Verify hành vi khi method không được trang trí bởi @Roles
   * Input: 
   * - Method không có decorator @Roles
   * Expected Output: 
   * - Metadata 'roles' là undefined
   * Ghi chú: Kiểm tra edge case khi không sử dụng decorator
   */
  it('should return undefined if no roles are defined', () => {
    // Định nghĩa test class không có decorator
    class AnotherController {
      someMethod() {}
    }

    // Lấy metadata 'roles' từ method không có decorator
    const roles = Reflect.getMetadata('roles', AnotherController.prototype.someMethod);

    // Kiểm tra metadata là undefined
    expect(roles).toBeUndefined();
  });
});