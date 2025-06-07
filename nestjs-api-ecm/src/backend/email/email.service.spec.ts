/**
 * @file email.service.spec.ts
 * @description File kiểm thử đơn vị cho dịch vụ gửi email
 */

import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { Email_entity } from 'src/entities/helper/email_entity';
import * as nodemailer from 'nodemailer';

/**
 * Mock thư viện nodemailer
 * - Tạo một đối tượng giả lập cho nodemailer.createTransport
 * - Đối tượng này trả về một transporter có phương thức sendMail được mock
 */
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
  }),
}));

/**
 * Test suite cho EmailService
 * - Kiểm tra các chức năng của dịch vụ gửi email
 */
describe('EmailService', () => {
  let service: EmailService; // Biến lưu trữ instance của EmailService
  let mockTransporter: any; // Biến lưu trữ đối tượng transporter giả lập

  /**
   * Thiết lập môi trường test trước mỗi test case
   * - Khởi tạo lại các mock
   * - Thiết lập transporter giả lập
   * - Khởi tạo module test và lấy instance của EmailService
   */
  beforeEach(async () => {
    // Khởi tạo lại các mock trước mỗi test case
    jest.clearAllMocks();

    // Thiết lập transporter giả lập với phương thức sendMail trả về messageId
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    };
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    // Khởi tạo module test với EmailService
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    // Lấy instance của EmailService từ module test
    service = module.get<EmailService>(EmailService);
  });

  /**
   * Test case: TC-SV-EMAIL-001 - Kiểm tra service đã được định nghĩa
   * Mục tiêu: Xác nhận EmailService đã được khởi tạo thành công
   * Input:
   *   - service: Instance của EmailService được tạo từ TestingModule
   * Expected output:
   *   - expect(service).toBeDefined() trả về true
   *   - Không có lỗi nào được ném ra trong quá trình khởi tạo
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * Test suite cho constructor của EmailService
   * - Kiểm tra cấu hình của nodemailer transporter
   */
  describe('constructor', () => {
    /**
     * Test case: TC-SV-EMAIL-002 - Kiểm tra cấu hình của nodemailer transporter
     * Mục tiêu: Xác nhận transporter được tạo với cấu hình SMTP chính xác
     * Input:
     *   - EmailService constructor được gọi tự động trong beforeEach
     *   - nodemailer.createTransport được mock để theo dõi các tham số được truyền vào
     * Expected output:
     *   - nodemailer.createTransport được gọi với các tham số cụ thể:
     *     + host: 'smtp.gmail.com'
     *     + port: 587
     *     + secure: false
     *     + auth: { user: expect.any(String), pass: expect.any(String) }
     * Ghi chú: Kiểm tra kết nối đến máy chủ SMTP của Gmail
     */
    it('should create a nodemailer transporter with correct configuration', () => {
      // Kiểm tra
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: expect.any(String),
          pass: expect.any(String),
        },
      });
    });
  });

  /**
   * Test suite cho phương thức sendNotificationEmail
   * - Kiểm tra các trường hợp gửi email thông báo
   */
  describe('sendNotificationEmail', () => {
    /**
     * Test case: TC-SV-EMAIL-003 - Kiểm tra trường hợp mảng emailEntities rỗng
     * Mục tiêu: Xác nhận hàm kết thúc sớm khi không có email nào để gửi
     * Input:
     *   - emailEntities: [] - Mảng rỗng không có phần tử nào
     *   - consoleSpy: jest.spyOn(console, 'log') - Theo dõi các cuộc gọi console.log
     * Expected output:
     *   - consoleSpy được gọi với thông báo: 'No offline admins to send email notifications.'
     *   - mockTransporter.sendMail không được gọi (expect(mockTransporter.sendMail).not.toHaveBeenCalled())
     *   - Hàm kết thúc mà không ném lỗi
     * Ghi chú: Kiểm tra xử lý trường hợp đặc biệt khi không có dữ liệu
     */
    it('should return early if emailEntities array is empty', async () => {
      // Chuẩn bị dữ liệu
      const emailEntities: Email_entity[] = [];
      const consoleSpy = jest.spyOn(console, 'log');

      // Thực thi
      await service.sendNotificationEmail(emailEntities);

      // Kiểm tra
      expect(consoleSpy).toHaveBeenCalledWith('No offline admins to send email notifications.');
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();
    });

    /**
     * Test case: TC-SV-EMAIL-004 - Kiểm tra gửi email đến tất cả người nhận trong mảng emailEntities
     * Mục tiêu: Xác nhận email được gửi đến tất cả người nhận với nội dung chính xác
     * Input:
     *   - emailEntities: Mảng chứa 2 đối tượng Email_entity:
     *     + Email 1: { emailReceive: 'test1@example.com', header: 'Test Subject 1', content: 'Test Content 1', htmlContent: '<p>Test HTML 1</p>' }
     *     + Email 2: { emailReceive: 'test2@example.com', header: 'Test Subject 2', content: 'Test Content 2', htmlContent: '<p>Test HTML 2</p>' }
     *   - consoleSpy: jest.spyOn(console, 'log') - Theo dõi các cuộc gọi console.log
     *   - mockTransporter.sendMail: Được mock để trả về { messageId: 'test-message-id' }
     * Expected output:
     *   - mockTransporter.sendMail được gọi đúng 2 lần (toHaveBeenCalledTimes(2))
     *   - Lần gọi thứ nhất với tham số chính xác cho email 1:
     *     + from: '"Admin" <vuong2k2002@gmail.com>'
     *     + to: 'test1@example.com'
     *     + subject: 'Test Subject 1'
     *     + text: 'Test Content 1'
     *     + html: '<p>Test HTML 1</p>'
     *   - Lần gọi thứ hai với tham số chính xác cho email 2
     *   - consoleSpy được gọi với 'Email sent to test1@example.com' và 'Email sent to test2@example.com'
     * Ghi chú: Kiểm tra chức năng chính của dịch vụ gửi email
     */
    it('should send emails to all recipients in emailEntities', async () => {
      // Chuẩn bị dữ liệu
      const emailEntities: Email_entity[] = [
        createEmailEntity('test1@example.com', 'Test Subject 1', 'Test Content 1', '<p>Test HTML 1</p>'),
        createEmailEntity('test2@example.com', 'Test Subject 2', 'Test Content 2', '<p>Test HTML 2</p>'),
      ];
      const consoleSpy = jest.spyOn(console, 'log');

      // Thực thi
      await service.sendNotificationEmail(emailEntities);

      // Kiểm tra
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(2);

      // Kiểm tra email đầu tiên
      expect(mockTransporter.sendMail).toHaveBeenNthCalledWith(1, {
        from: '"Admin" <vuong2k2002@gmail.com>',
        to: 'test1@example.com',
        subject: 'Test Subject 1',
        text: 'Test Content 1',
        html: '<p>Test HTML 1</p>',
      });

      // Kiểm tra email thứ hai
      expect(mockTransporter.sendMail).toHaveBeenNthCalledWith(2, {
        from: '"Admin" <vuong2k2002@gmail.com>',
        to: 'test2@example.com',
        subject: 'Test Subject 2',
        text: 'Test Content 2',
        html: '<p>Test HTML 2</p>',
      });

      // Kiểm tra log
      expect(consoleSpy).toHaveBeenCalledWith('Email sent to test1@example.com');
      expect(consoleSpy).toHaveBeenCalledWith('Email sent to test2@example.com');
    });

    /**
     * Test case: TC-SV-EMAIL-005 - Kiểm tra xử lý lỗi khi gửi email thất bại
     * Mục tiêu: Xác nhận hàm ném ra lỗi khi gửi email thất bại
     * Input:
     *   - emailEntities: Mảng chứa 1 đối tượng Email_entity:
     *     + { emailReceive: 'test@example.com', header: 'Test Subject', content: 'Test Content', htmlContent: '<p>Test HTML</p>' }
     *   - errorMessage: 'Failed to send email'
     *   - mockTransporter.sendMail: Được mock để ném lỗi Error(errorMessage)
     *   - consoleErrorSpy: jest.spyOn(console, 'error').mockImplementation() - Theo dõi và giả lập console.error
     * Expected output:
     *   - Hàm service.sendNotificationEmail ném ra lỗi với thông báo 'Email sending failed'
     *   - consoleErrorSpy được gọi với 'Failed to send email:' và đối tượng Error
     *   - Quá trình gửi email bị ngừng lại sau khi gặp lỗi
     * Ghi chú: Kiểm tra xử lý ngoại lệ trong quá trình gửi email
     */
    it('should throw an error if sending email fails', async () => {
      // Chuẩn bị dữ liệu
      const emailEntities: Email_entity[] = [
        createEmailEntity('test@example.com', 'Test Subject', 'Test Content', '<p>Test HTML</p>'),
      ];
      const errorMessage = 'Failed to send email';
      mockTransporter.sendMail.mockRejectedValueOnce(new Error(errorMessage));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Thực thi và kiểm tra
      await expect(service.sendNotificationEmail(emailEntities)).rejects.toThrow('Email sending failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to send email:', expect.any(Error));
    });
  });

  /**
   * Hàm trợ giúp để tạo đối tượng Email_entity
   * @param emailReceive - Địa chỉ email người nhận (ví dụ: 'test@example.com')
   * @param header - Tiêu đề email (ví dụ: 'Test Subject')
   * @param content - Nội dung email dạng text (ví dụ: 'Test Content')
   * @param htmlContent - Nội dung email dạng HTML (ví dụ: '<p>Test HTML</p>')
   * @returns Đối tượng Email_entity đã được cấu hình với các giá trị đầu vào và emailSend='sender@example.com'
   * Ghi chú: Hàm này giúp tạo dữ liệu test một cách nhất quán
   */
  function createEmailEntity(
    emailReceive: string,
    header: string,
    content: string,
    htmlContent: string
  ): Email_entity {
    const email = new Email_entity();
    email.emailSend = 'sender@example.com';
    email.emailReceive = emailReceive;
    email.header = header;
    email.content = content;
    email.htmlContent = htmlContent;
    return email;
  }
});
