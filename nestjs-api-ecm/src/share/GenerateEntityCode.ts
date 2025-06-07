export class GenerateEntityCode {
    public static generateOrderCode(entityCode: string): string {
        const timestamp = Date.now().toString(36); // Tạo timestamp base36
        const randomPart = Math.random().toString(36).substring(2, 12); // Tạo phần ngẫu nhiên với độ dài cố định
        return `${entityCode}-${timestamp}-${randomPart}`;
    }
}
