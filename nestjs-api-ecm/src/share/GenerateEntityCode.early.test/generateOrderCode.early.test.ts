
import { GenerateEntityCode } from '../GenerateEntityCode';

describe('GenerateEntityCode.generateOrderCode() generateOrderCode method', () => {
    // Test các trường hợp thành công
    describe('Happy Path', () => {
        /**
         * Test Case ID: TC-GENORDER-001
         * Mục tiêu: Kiểm tra tạo mã đơn hàng hợp lệ với entity code cho trước
         * Input: entityCode = 'ORD'
         * Expected Output: Chuỗi có định dạng 'ORD-timestamp-randomString' trong đó:
         * - Bắt đầu bằng 'ORD-'
         * - Có 3 phần được phân tách bởi dấu gạch ngang
         * - Phần thứ 2 là timestamp hợp lệ ở dạng base36
         * - Phần thứ 3 là chuỗi ngẫu nhiên độ dài 10 ký tự
         * Ghi chú: Happy path - Trường hợp tạo mã đơn hàng cơ bản
         */
        it('should generate a valid order code with a given entity code', () => {
            // Arrange: Chuẩn bị mã entity
            const entityCode = 'ORD';

            // Act: Gọi phương thức tạo mã
            const orderCode = GenerateEntityCode.generateOrderCode(entityCode);

            // Assert: Kiểm tra kết quả
            // Kiểm tra mã bắt đầu bằng entity code
            expect(orderCode.startsWith(`${entityCode}-`)).toBe(true);

            // Kiểm tra có đủ 3 phần
            const parts = orderCode.split('-');
            expect(parts.length).toBe(3);

            // Kiểm tra phần timestamp hợp lệ
            expect(parseInt(parts[1], 36)).not.toBeNaN();

            // Kiểm tra độ dài chuỗi ngẫu nhiên
            expect(parts[2].length).toBe(10);
        });

        /**
         * Test Case ID: TC-GENORDER-002
         * Mục tiêu: Kiểm tra tính duy nhất của mã được tạo
         * Input: entityCode = 'ORD', gọi hàm 2 lần liên tiếp
         * Expected Output: Hai mã khác nhau
         * Ghi chú: Happy path - Kiểm tra tính duy nhất của mã được tạo
         */
        it('should generate different order codes for consecutive calls', () => {
            // Arrange: Chuẩn bị mã entity
            const entityCode = 'ORD';

            // Act: Tạo 2 mã liên tiếp
            const orderCode1 = GenerateEntityCode.generateOrderCode(entityCode);
            const orderCode2 = GenerateEntityCode.generateOrderCode(entityCode);

            // Assert: Kiểm tra 2 mã khác nhau
            expect(orderCode1).not.toBe(orderCode2);
        });
    });

    // Test các trường hợp đặc biệt
    describe('Edge Cases', () => {
        /**
         * Test Case ID: TC-GENORDER-003
         * Mục tiêu: Kiểm tra xử lý khi entity code rỗng
         * Input: entityCode = ''
         * Expected Output: Chuỗi có định dạng '-timestamp-randomString' trong đó:
         * - Bắt đầu bằng dấu gạch ngang
         * - Có 3 phần được phân tách bởi dấu gạch ngang
         * - Phần thứ 2 là timestamp hợp lệ ở dạng base36
         * - Phần thứ 3 là chuỗi ngẫu nhiên độ dài 10 ký tự
         * Ghi chú: Edge case - Xử lý entity code rỗng
         */
        it('should handle an empty entity code gracefully', () => {
            // Arrange: Chuẩn bị entity code rỗng
            const entityCode = '';

            // Act: Gọi phương thức tạo mã
            const orderCode = GenerateEntityCode.generateOrderCode(entityCode);

            // Assert: Kiểm tra kết quả
            // Kiểm tra bắt đầu bằng dấu gạch ngang
            expect(orderCode.startsWith('-')).toBe(true);

            // Kiểm tra có đủ 3 phần
            const parts = orderCode.split('-');
            expect(parts.length).toBe(3);

            // Kiểm tra phần timestamp hợp lệ
            expect(parseInt(parts[1], 36)).not.toBeNaN();

            // Kiểm tra độ dài chuỗi ngẫu nhiên
            expect(parts[2].length).toBe(10);
        });

        /**
         * Test Case ID: TC-GENORDER-004
         * Mục tiêu: Kiểm tra xử lý khi entity code rất dài
         * Input: entityCode = 'A' lặp lại 100 lần
         * Expected Output: Chuỗi có định dạng '{entityCode}-timestamp-randomString' trong đó:
         * - Bắt đầu bằng chuỗi 'A' dài 100 ký tự
         * - Có 3 phần được phân tách bởi dấu gạch ngang
         * - Phần thứ 2 là timestamp hợp lệ ở dạng base36
         * - Phần thứ 3 là chuỗi ngẫu nhiên độ dài 10 ký tự
         * Ghi chú: Edge case - Xử lý entity code có độ dài lớn
         */
        it('should handle a very long entity code', () => {
            // Arrange: Tạo entity code dài 100 ký tự
            const entityCode = 'A'.repeat(100);

            // Act: Gọi phương thức tạo mã
            const orderCode = GenerateEntityCode.generateOrderCode(entityCode);

            // Assert: Kiểm tra kết quả
            // Kiểm tra bắt đầu bằng entity code dài
            expect(orderCode.startsWith(`${entityCode}-`)).toBe(true);

            // Kiểm tra có đủ 3 phần
            const parts = orderCode.split('-');
            expect(parts.length).toBe(3);

            // Kiểm tra phần timestamp hợp lệ
            expect(parseInt(parts[1], 36)).not.toBeNaN();

            // Kiểm tra độ dài chuỗi ngẫu nhiên
            expect(parts[2].length).toBe(10);
        });
    });
});
