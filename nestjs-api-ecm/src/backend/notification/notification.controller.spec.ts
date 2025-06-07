// Import các module cần thiết từ NestJS và các file liên quan
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

// Mock toàn bộ NotificationService
jest.mock('./notification.service');

describe('NotificationController', () => {
  // Khai báo biến để sử dụng trong các test case
  let controller: NotificationController;  // Controller cần test
  let service: NotificationService; // Service đã được mock


  /**
   * Chuẩn bị môi trường test trước mỗi test case
   * - Khởi tạo module testing
   * - Cung cấp các dependency đã được mock
   * - Lấy instance của controller và service
   */
  beforeEach(async () => {
    // Xóa trạng thái của tất cả mock trước mỗi test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: {
            // Mock các phương thức của service với các hàm giả
            sendNotification: jest.fn(),
            getNotifications: jest.fn(),
          }
        }
      ],
    }).compile();

    // Lấy instance của controller và service để sử dụng trong các test
    controller = module.get<NotificationController>(NotificationController);
    service = module.get<NotificationService>(NotificationService);
  });

  /**
   * Mã: TC-NC-001
   * Test case: Kiểm tra khởi tạo controller
   * Mục tiêu: Đảm bảo controller được khởi tạo thành công
   * Input: Không có
   * Output mong đợi: Controller được định nghĩa
   */
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /**
   * Mã: TC-NC-002
   * Test case: Kiểm tra dependency injection
   * Mục tiêu: Đảm bảo NotificationService được inject vào controller
   * Input: Không có
   * Output mong đợi: Service được định nghĩa trong controller
   */
  it('should have NotificationService injected', () => {
    expect(service).toBeDefined();
  });
});