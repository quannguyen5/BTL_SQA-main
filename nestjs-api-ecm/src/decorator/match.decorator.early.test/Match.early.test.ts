/**
 * File: Match.early.test.ts
 * Mục đích: Kiểm thử unit test cho decorator Match
 * Decorator Match được sử dụng để kiểm tra sự trùng khớp giữa hai trường trong một đối tượng
 * (Thường dùng để validate password và confirmPassword)
 */

/**
 * Import các dependencies cần thiết:
 * - Match: Custom decorator cần test
 * - ValidationArguments, ValidationOptions: Các interface từ class-validator
 * - getMetadataStorage: Function để truy cập metadata storage
 */
import { Match } from '../match.decorator';
import {
  ValidationArguments,
  ValidationOptions,
  getMetadataStorage,
} from 'class-validator';

/**
 * Class mẫu để test decorator
 * Chứa hai trường cần so sánh: password và confirmPassword
 */
class DummyClass {
  password: string;
  confirmPassword: string;
}

/**
 * Test Suite chính cho Match Decorator
 */
describe('Match() Match method', () => {
  let validator: any;

  /**
   * Thiết lập trước mỗi test case
   * Khởi tạo decorator và áp dụng vào DummyClass
   */
  beforeEach(() => {
    // Tạo decorator với message tùy chỉnh
    const decorator = Match('password', {
      message: 'Values do not match',
    });

    // Áp dụng decorator vào trường confirmPassword của DummyClass
    decorator(DummyClass.prototype, 'confirmPassword');

    // Lấy metadata và khởi tạo validator
    const metadata = getMetadataStorage().getTargetValidationMetadatas(
      DummyClass,
      '',
      false, false
    );

    const matchMetadata = metadata.find(
      (meta) => meta.propertyName === 'confirmPassword'
    );

    validator = matchMetadata?.constraintCls && new (matchMetadata.constraintCls as new () => any)();
  });

  /**
   * Test Case TC-DC-M-001: Kiểm tra validation khi hai trường giá trị trùng khớp
   * Mục tiêu: Verify decorator xác thực đúng khi giá trị trùng khớp
   * Input: 
   * - password: '123456'
   * - confirmPassword: '123456'
   * Expected Output: 
   * - Kết quả validation là true
   * Ghi chú: Trường hợp lý tưởng khi hai trường khớp nhau
   */
  it('should validate successfully when properties match', () => {
    const obj = {
      password: '123456',
      confirmPassword: '123456',
    };

    const args: ValidationArguments = {
      value: obj.confirmPassword,
      constraints: ['password'],
      object: obj,
      targetName: 'DummyClass',
      property: 'confirmPassword',
    };

    const result = validator.validate(obj.confirmPassword, args);
    expect(result).toBe(true);
  });

  /**
   * Test Case TC-DC-M-002: Kiểm tra thông báo lỗi tùy chỉnh
   * Mục tiêu: Verify thông báo lỗi khi hai trường không khớp
   * Input:
   * - password: 'abc123'
   * - confirmPassword: 'xyz789'
   * Expected Output:
   * - Thông báo: 'Values do not match'
   * Ghi chú: Kiểm tra message tùy chỉnh khi validation thất bại
   */
  it('should return a custom message when properties do not match', () => {
    const obj = {
      password: 'abc123',
      confirmPassword: 'xyz789',
    };

    const args: ValidationArguments = {
      value: obj.confirmPassword,
      constraints: ['password'],
      object: obj,
      targetName: 'DummyClass',
      property: 'confirmPassword',
    };

    const result = validator.validate(obj.confirmPassword, args);
    const message = validator.defaultMessage(args);

    expect(result).toBe(false);
    expect(message).toBe('Values do not match');
  });

  /**
   * Test Case TC-DC-M-003: Kiểm tra khi trường được so sánh là undefined
   * Mục tiêu: Verify xử lý khi trường password là undefined
   * Input:
   * - password: undefined
   * - confirmPassword: 'something'
   * Expected Output:
   * - Kết quả validation là false
   * Ghi chú: Kiểm tra edge case với giá trị undefined
   */
  it('should return false when related property is undefined', () => {
    const obj = {
      password: undefined,
      confirmPassword: 'something',
    };

    const args: ValidationArguments = {
      value: obj.confirmPassword,
      constraints: ['password'],
      object: obj,
      targetName: 'DummyClass',
      property: 'confirmPassword',
    };

    const result = validator.validate(obj.confirmPassword, args);
    expect(result).toBe(false);
  });

  /**
   * Test Case TC-DC-M-004: Kiểm tra khi giá trị cần validate là undefined
   * Mục tiêu: Verify xử lý khi trường confirmPassword là undefined
   * Input:
   * - password: 'something'
   * - confirmPassword: undefined
   * Expected Output:
   * - Kết quả validation là false
   * Ghi chú: Kiểm tra edge case với giá trị undefined
   */
  it('should return false when value is undefined', () => {
    const obj = {
      password: 'something',
      confirmPassword: undefined,
    };

    const args: ValidationArguments = {
      value: obj.confirmPassword,
      constraints: ['password'],
      object: obj,
      targetName: 'DummyClass',
      property: 'confirmPassword',
    };

    const result = validator.validate(obj.confirmPassword, args);
    expect(result).toBe(false);
  });

  /**
   * Test Case TC-DC-M-005: Kiểm tra thông báo mặc định
   * Mục tiêu: Verify thông báo mặc định khi không cung cấp message tùy chỉnh
   * Input:
   * - Decorator không có message tùy chỉnh
   * - password: 'abc'
   * - confirmPassword: 'def'
   * Expected Output:
   * - Thông báo: 'confirmPassword must match password'
   * Ghi chú: Kiểm tra message mặc định của decorator
   */
  it('should return default message when properties do not match and no custom message is provided', () => {
    const decorator = Match('password'); // không có message tùy chỉnh

    class SimpleClass {
      password: string;
      confirmPassword: string;
    }

    decorator(SimpleClass.prototype, 'confirmPassword');

    const metadata = getMetadataStorage().getTargetValidationMetadatas(
      SimpleClass,
      '',
      false, false
    );

    const matchMetadata = metadata.find(
      (meta) => meta.propertyName === 'confirmPassword'
    );

    const validatorNoCustom = matchMetadata?.constraintCls && new (matchMetadata.constraintCls as new () => any)();

    const obj = {
      password: 'abc',
      confirmPassword: 'def',
    };

    const args: ValidationArguments = {
      value: obj.confirmPassword,
      constraints: ['password'],
      object: obj,
      targetName: 'SimpleClass',
      property: 'confirmPassword',
    };

    const result = validatorNoCustom.validate(obj.confirmPassword, args);
    const message = validatorNoCustom.defaultMessage(args);

    expect(result).toBe(false);
    expect(message).toBe('confirmPassword must match password');
  });
});