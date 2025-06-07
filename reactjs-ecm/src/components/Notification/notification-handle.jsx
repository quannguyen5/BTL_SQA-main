
import { useEffect } from 'react';
import { showNotification, notificationTypes } from './NotificationService';  // Đảm bảo bạn đã import đúng showNotification

const NotificationHandler = ({ setNotifications }) => {
  useEffect(() => {
    // Kiểm tra xem có thông báo trong sessionStorage không
    const notification = sessionStorage.getItem('notification');
    if (notification) {
      const { message, type } = JSON.parse(notification);
      showNotification(message, type, setNotifications);

      // Sau khi đã hiển thị, xóa thông báo khỏi sessionStorage
      sessionStorage.removeItem('notification');
    }
  }, [setNotifications]);

  return null;
};

export default NotificationHandler;
