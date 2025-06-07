import { FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

export const notificationTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

const renderIcon = (type) => {
  switch (type) {
    case notificationTypes.SUCCESS:
      return <FaCheckCircle className="mr-3 text-3xl text-[#006532]" />;
    case notificationTypes.ERROR:
      return <FaTimesCircle className="mr-3 text-3xl text-[#ab4c39]" />;
    case notificationTypes.WARNING:
      return <FaExclamationCircle className="mr-3 text-3xl text-[#a2622d]" />;
    default:
      return <FaInfoCircle className="mr-3 text-3xl text-[#142c3c]" />;
  }
};

export const showNotification = (message, type, setNotifications) => {
  const newNotification = {
    id: Date.now(),
    message,
    type,
  };

  setNotifications((prevNotifications) => [...prevNotifications, newNotification]);

  // Tự động ẩn thông báo sau 3 giây
  setTimeout(() => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== newNotification.id)
    );
  }, 2000);
};

export const NotificationList = ({ notifications }) => {
  return (
    <div className="fixed top-[90px] -right-[130px] transform -translate-x-1/2 z-50 space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`toast-notification flex items-center px-6 py-2 max-w-xs rounded-lg shadow-xl mb-4 text-white ${
            notification.type === notificationTypes.SUCCESS
              ? 'bg-[#1a844f] opacity-90'
              : notification.type === notificationTypes.ERROR
              ? 'bg-[#ea4c3b] opacity-90'
              : notification.type === notificationTypes.WARNING
              ? 'bg-[#f59242] opacity-90'
              : 'bg-[#3079a7] opacity-90'
          } transition-all duration-500 ease-in-out transform scale-105 hover:scale-110`}
          style={{ animation: 'fade-in-out 3s ease-in-out forwards' }}
        >
          {renderIcon(notification.type)}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      ))}
    </div>
  );
};
