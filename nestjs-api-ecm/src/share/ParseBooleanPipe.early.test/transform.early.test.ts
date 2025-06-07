
import { BadRequestException } from '@nestjs/common';
import { ParseBooleanPipe } from '../ParseBooleanPipe';

describe('ParseBooleanPipe.transform() transform method', () => {
  let pipe: ParseBooleanPipe;

  beforeEach(() => {
    pipe = new ParseBooleanPipe();
  });

  describe('transform', () => {
    // Test các trường hợp thành công
    /**
     * Test Case ID: TC-TRANSFORM-001
     * Mục tiêu: Kiểm tra chuyển đổi chuỗi "true" thành boolean true
     * Input: value = "true"
     * Expected Output: true
     * Ghi chú: Happy path - Trường hợp cơ bản với giá trị "true"
     */
    it('should return true when the input is the string "true"', () => {
      // Act: Thực hiện chuyển đổi
      const result = pipe.transform('true');
      // Assert: Kiểm tra kết quả
      expect(result).toBe(true);
    });

    /**
     * Test Case ID: TC-TRANSFORM-002
     * Mục tiêu: Kiểm tra chuyển đổi chuỗi "false" thành boolean false
     * Input: value = "false"
     * Expected Output: false
     * Ghi chú: Happy path - Trường hợp cơ bản với giá trị "false"
     */
    it('should return false when the input is the string "false"', () => {
      const result = pipe.transform('false');
      expect(result).toBe(false);
    });

    /**
     * Test Case ID: TC-TRANSFORM-003
     * Mục tiêu: Kiểm tra xử lý giá trị undefined
     * Input: value = undefined
     * Expected Output: undefined
     * Ghi chú: Edge case - Xử lý giá trị undefined
     */
    it('should return undefined when the input is undefined', () => {
      const result = pipe.transform(undefined);
      expect(result).toBeUndefined();
    });

    // Test các trường hợp lỗi
    /**
     * Test Case ID: TC-TRANSFORM-004
     * Mục tiêu: Kiểm tra xử lý chuỗi không phải boolean
     * Input: value = "notABoolean"
     * Expected Output: Ném ra BadRequestException
     * Ghi chú: Error case - Xử lý input không hợp lệ
     */
    it('should throw a BadRequestException when the input is a non-boolean string', () => {
      expect(() => pipe.transform('notABoolean')).toThrow(BadRequestException);
    });


    /**
     * Test Case ID: TC-TRANSFORM-005
     * Mục tiêu: Kiểm tra xử lý chuỗi rỗng
     * Input: value = ""
     * Expected Output: Ném ra BadRequestException
     * Ghi chú: Error case - Xử lý chuỗi rỗng
     */
    it('should throw a BadRequestException when the input is an empty string', () => {
      expect(() => pipe.transform('')).toThrow(BadRequestException);
    });

    

    /**
     * Test Case ID: TC-TRANSFORM-006
     * Mục tiêu: Kiểm tra xử lý chuỗi số
     * Input: value = "123"
     * Expected Output: Ném ra BadRequestException
     * Ghi chú: Error case - Xử lý input là chuỗi số
     */
    it('should throw a BadRequestException when the input is a numeric string', () => {
      expect(() => pipe.transform('123')).toThrow(BadRequestException);
    });

    /**
     * Test Case ID: TC-TRANSFORM-007
     * Mục tiêu: Kiểm tra xử lý khi input là boolean true
     * Input: value = true
     * Expected Output: Ném ra BadRequestException
     * Ghi chú: Error case - Xử lý input là boolean thay vì string
     */
    it('should throw a BadRequestException when the input is a boolean true', () => {
      expect(() => pipe.transform(true as any)).toThrow(BadRequestException);
    });

    /**
     * Test Case ID: TC-TRANSFORM-008
     * Mục tiêu: Kiểm tra xử lý khi input là boolean false
     * Input: value = false
     * Expected Output: Ném ra BadRequestException
     * Ghi chú: Error case - Xử lý input là boolean thay vì string
     */
    it('should throw a BadRequestException when the input is a boolean false', () => {
      expect(() => pipe.transform(false as any)).toThrow(BadRequestException);
    });
  });
});
