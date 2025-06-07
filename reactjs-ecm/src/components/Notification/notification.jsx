import React, { useState } from 'react';
import { showNotification, notificationTypes, NotificationList } from './NotificationService';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Thông Báo Trên Website E-Commerce</h1>

      <button
        onClick={() => showNotification("Sản phẩm đã được thêm vào giỏ hàng!", notificationTypes.SUCCESS, setNotifications)}
        className="bg-[#006532] text-white px-4 py-2 rounded mb-2"
      >
        Thêm vào giỏ hàng
      </button>
      <button
        onClick={() => showNotification("Giỏ hàng của bạn đã được cập nhật!", notificationTypes.INFO, setNotifications)}
        className="bg-[#3079a7] text-white px-4 py-2 rounded mb-2"
      >
        Cập nhật giỏ hàng
      </button>
      <button
        onClick={() => showNotification("Sản phẩm đã được xóa khỏi giỏ hàng!", notificationTypes.WARNING, setNotifications)}
        className="bg-[#f59242] text-white px-4 py-2 rounded mb-2"
      >
        Xóa khỏi giỏ hàng
      </button>
      <button
        onClick={() => showNotification("Thanh toán thành công! Cảm ơn bạn đã mua sắm.", notificationTypes.SUCCESS, setNotifications)}
        className="bg-[#1a844f] text-white px-4 py-2 rounded mb-2"
      >
        Thanh toán thành công
      </button>
      <button
        onClick={() => showNotification("Lỗi thanh toán! Vui lòng thử lại.", notificationTypes.ERROR, setNotifications)}
        className="bg-[#ea4c3b] text-white px-4 py-2 rounded mb-2"
      >
        Thanh toán thất bại
      </button>
      <button
        onClick={() => showNotification("Đăng nhập thành công! Chào mừng bạn trở lại.", notificationTypes.SUCCESS, setNotifications)}
        className="bg-[#006532] text-white px-4 py-2 rounded mb-2"
      >
        Đăng nhập thành công
      </button>
      <button
        onClick={() => showNotification("Đăng nhập thất bại! Kiểm tra lại thông tin.", notificationTypes.ERROR, setNotifications)}
        className="bg-[#D1495B] text-white px-4 py-2 rounded mb-2"
      >
        Đăng nhập thất bại
      </button>

      {/* Các thông báo khác */}
      <button
        onClick={() => showNotification("Sản phẩm hết hàng!", notificationTypes.WARNING, setNotifications)}
        className="bg-[#e08336] text-white px-4 py-2 rounded mb-2"
      >
        Sản phẩm hết hàng
      </button>
      <button
        onClick={() => showNotification("Bạn đã đăng xuất thành công.", notificationTypes.INFO, setNotifications)}
        className="bg-[#3079a7] text-white px-4 py-2 rounded mb-2"
      >
        Đăng xuất
      </button>
      <button
        onClick={() => showNotification("Mật khẩu của bạn đã được thay đổi.", notificationTypes.SUCCESS, setNotifications)}
        className="bg-[#006532] text-white px-4 py-2 rounded mb-2"
      >
        Thay đổi mật khẩu thành công
      </button>
      <button
        onClick={() => showNotification("Đơn hàng của bạn đã được xác nhận!", notificationTypes.SUCCESS, setNotifications)}
        className="bg-[#006532] text-white px-4 py-2 rounded mb-2"
      >
        Xác nhận đơn hàng
      </button>

      {/* Hiển thị các thông báo */}
      <NotificationList notifications={notifications} />
    </div>
  );
};

export default NotificationsPage;
