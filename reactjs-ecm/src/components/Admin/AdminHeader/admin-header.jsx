import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { IoNotificationsOutline } from "react-icons/io5";
import { RiArrowDropUpLine, RiArrowDropDownLine } from "react-icons/ri";
import { LuUsers, LuBox } from "react-icons/lu";
import { PiChartLineBold } from "react-icons/pi";
import { FiLogOut } from "react-icons/fi";
import {
  TbCategory,
  TbInvoice,
  TbBuildingWarehouse,
  TbClipboardList,
} from "react-icons/tb";
import img from "../../../../public/images/user.png";
import { NotificationContext } from "../../Notification/NotificationProvider.jsx";
import { ref, update } from "firebase/database";
import { database } from "../../../services/firebase-config.js";
import {
  NotificationList,
  notificationTypes,
  showNotification,
} from "../../Notification/NotificationService.jsx";
import { logoutUser } from "../../../services/auth-api.js";
import { getUser } from "../../../services/user-service.js";

export const markAllNotificationsAsRead = async (notifications) => {
  const updates = {};
  notifications.forEach(([key, notification]) => {
    if (!notification.isRead) {
      updates[`notificationAdmins/${key}/isRead`] = true;
    }
  });
  try {
    if (Object.keys(updates).length > 0) {
      await update(ref(database), updates);
      console.log("All notifications marked as read.");
    } else {
      console.log("No unread notifications to update.");
    }
  } catch (error) {
    console.error("Error updating notifications:", error);
  }
};

function HeaderAdmin() {
  const { notifications } = useContext(NotificationContext);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [allRead, setAllRead] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null); // Lưu trạng thái active của mục
  const [isHovered, setIsHovered] = useState(false); // Trạng thái để kiểm tra hover
  const [isOrderManagementOpen, setIsOrderManagementOpen] = useState(false);
  const [user, setUser] = useState(null);
  const handleNavLinkClick = (index) => {
    setActiveIndex(index); // Cập nhật trạng thái active khi người dùng click vào item
  };

  const [notification, setNotification] = useState([]);

  const unreadCount = notifications.filter(
    ([key, notification]) => notification.isRead === false,
  ).length;

  const toggleOrderManagement = () => {
    setIsOrderManagementOpen(!isOrderManagementOpen);
  };

  const handleSeeMore = () => {
    setIsExpanded(true);
  };
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead(notifications)
      .then(() => {
        setAllRead(true);
      })
      .catch((error) => {
        console.error("Error updating notifications:", error);
      });
  };

  const checkAllRead = () => {
    return unreadCount === 0;
  };

  const handlePopupMouseEnter = () => {
    setIsHovered(true);
  };

  const handlePopupMouseLeave = () => {
    setIsHovered(false);
    setIsPopupOpen(false);
  };

  useEffect(() => {
    setAllRead(checkAllRead());
  }, [notifications]);

  useEffect(() => {
    if (
      activeIndex === 0 ||
      window.location.pathname.includes("/admin/manage-order")
    ) {
      setIsOrderManagementOpen(true);
    }
  }, [activeIndex]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser();
        console.log("admin", response.data);
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };

    fetchUser();
  }, []);

  const formattedLastName = user?.lastName ? user.firstName.toUpperCase() + " " + user.lastName.toUpperCase() : "Admin";

  const handleLogoutAdmin = async () => {
    try {
      // Gọi hàm logoutUser với userId
      await logoutUser();

      // Xóa token khỏi localStorage
      localStorage.clear();

      // Hiển thị thông báo đăng xuất thành công
      showNotification(
        "Bạn đã đăng xuất thành công.",
        notificationTypes.INFO,
        setNotification,
      );
    } catch (error) {
      // Xử lý lỗi khi đăng xuất
      console.error("Error logging out:", error);

      // Hiển thị thông báo lỗi
      showNotification(
        "Đăng xuất thất bại. Vui lòng thử lại.",
        notificationTypes.ERROR,
        setNotification,
      );
    }
  };

  return (
    <>
      <NotificationList notifications={notification} />

      <div className="shadow-lg sticky top-0 z-50 flex bg-white px-12 py-3 shadow-custom-dark">
        <button
          className="relative ml-auto mt-1 flex items-center"
          onClick={togglePopup}
        >
          <IoNotificationsOutline className="h-[25px] w-[25px] text-[#006532]" />
          {unreadCount > 0 && (
            <span className="absolute bottom-1 left-3.5 right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </button>
        <button id="lg-bag" className="ml-8 mt-1">
          <NavLink to="/login" onClick={handleLogoutAdmin}>
            <FiLogOut
              aria-hidden="true"
              className="h-[23px] w-[23px] text-[#006532] transition duration-300 hover:text-[#80c9a4]"
            />
          </NavLink>
        </button>
        {/* Popup Notification */}
        {isPopupOpen && (
          <div
            className="shadow-lg absolute right-8 top-14 z-50 h-[600px] w-[400px] rounded-md bg-white p-0 pb-3"
            onMouseEnter={handlePopupMouseEnter}
            onMouseLeave={handlePopupMouseLeave}
          >
            <div className="flex items-center justify-between p-4">
              <h3 className="flex-grow text-center text-2xl font-semibold text-[#225a3e]">
                Thông báo
              </h3>
              {unreadCount > 0 && (
                <label className="group relative cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 appearance-none rounded-md border-2 border-[#225a3e] transition-all duration-200 checked:border-[#225a3e] checked:bg-[#225a3e]"
                    checked={allRead}
                    onChange={handleMarkAllAsRead}
                  />
                  <span className="w-400 h-100 absolute left-0 top-0 flex items-center justify-center bg-white text-sm text-black opacity-0 transition-opacity duration-300 group-hover:bg-gray-200 group-hover:opacity-100">
                    Đánh dấu tất cả là đã đọc
                  </span>
                </label>
              )}
            </div>

            {/* Phần thông báo cuộn */}
            <div
              className={`transition-all duration-300 ${
                isExpanded ? "overflow-auto" : "overflow-hidden"
              } h-[calc(100%-100px)]`}
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#d3d3d3 #f1f1f1",
              }}
            >
              {notifications.length > 0 ? (
                notifications
                  .sort(
                    (a, b) =>
                      new Date(b[1].createdAt) - new Date(a[1].createdAt),
                  )
                  .map(([key, notification], index) => (
                    <div
                      key={index}
                      className={`${notification.isRead ? "bg-white" : "bg-[#d3f8e2]"}`}
                    >
                      <div className="border-b border-gray-300 pb-1 pl-3 pr-3 pt-2">
                        <h4 className="pb-1 font-semibold text-[#225a3e]">
                          {notification.notificationType || "Không có tiêu đề"}
                        </h4>
                        <p className="mb-0.5 text-sm text-[#225a3e]">
                          {notification.message || "Không có nội dung"}
                        </p>
                        <p className="text-right text-sm text-gray-400">
                          {notification.createdAt
                            ? new Date(notification.createdAt).toLocaleString(
                                "vi-VN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                },
                              )
                            : "Không có thời gian"}
                        </p>
                      </div>
                      {index !== notifications.length - 1 && <hr />}
                    </div>
                  ))
              ) : (
                <p className="text-center text-gray-500">
                  Không có thông báo nào.
                </p>
              )}
            </div>

            {/* Nút "Xem thêm" */}
            <div className="mb-2 mt-4 flex justify-center">
              {!isExpanded && (
                <button
                  onClick={handleSeeMore}
                  className="font-semibold text-[#225a3e] hover:text-[#006532]"
                >
                  Xem thêm
                </button>
              )}
            </div>
          </div>
        )}

        <div
          className={`shadow-lg border-r-1 fixed left-0 top-0 z-50 h-full w-[250px] transform bg-white px-4 transition-transform duration-300 ease-in-out`}
        >
          <div className="-mx-4 h-[54px] border-[1px]"></div>
          <div className="mt-6 flex flex-col items-center border-b pb-6">
            <img
              src={img}
              className="size-28 rounded-full border-[10px] border-solid border-[#006532]"
            />
            <div className="absolute left-0 right-0 top-[168px] mx-auto flex justify-center">
              <span className="rounded-lg bg-[#24695c] px-[6px] pb-[3px] pt-[4px] text-center text-[12px] font-bold text-white">
                Admin
              </span>
            </div>
            <p className="mt-3 font-semibold text-[#006532]">
              {" "}
              {formattedLastName}
              {/* Trần Bình An */}
            </p>
          </div>

          {/* Navigation Links */}
          <ul className="flex flex-col items-start pt-2 font-semibold text-white">
            <li
              className={`group flex w-full flex-wrap rounded-xl px-6 py-[12px] transition-colors duration-700 hover:border-[#006532] hover:bg-[#006532] ${
                activeIndex === 0 ||
                window.location.pathname.includes("/admin/dashboard")
                  ? "rounded-xl bg-[#006532]"
                  : ""
              }`}
            >
              <PiChartLineBold
                className={`mr-5 h-6 w-6 ${
                  activeIndex === 0 ||
                  window.location.pathname.includes("/admin/dashboard")
                    ? "text-white"
                    : "text-[#222222] group-hover:text-white"
                }`}
              />
              <NavLink
                to="/admin/dashboard"
                onClick={() => setActiveIndex(0)} // Cập nhật trạng thái khi click
                className={({ isActive }) =>
                  isActive ||
                  window.location.pathname.includes("/admin/dashboard")
                    ? "border-l-4 border-[#006532] bg-[#006532] text-white"
                    : "text-[#222222] group-hover:text-white"
                }
              >
                Thống Kê
              </NavLink>
            </li>

            <li
              className={`group flex w-full flex-wrap rounded-xl px-6 py-[12px] transition-colors duration-700 hover:border-[#006532] hover:bg-[#006532] ${
                activeIndex === 0 ||
                window.location.pathname.includes("/admin/manage-user")
                  ? "rounded-xl bg-[#006532]"
                  : ""
              }`}
            >
              <LuUsers
                className={`mr-5 h-6 w-6 ${
                  activeIndex === 0 ||
                  window.location.pathname.includes("/admin/manage-user")
                    ? "text-white"
                    : "text-[#222222] group-hover:text-white"
                }`}
              />
              <NavLink
                to="/admin/manage-user/1/8"
                className={({ isActive }) =>
                  isActive ||
                  window.location.pathname.includes("/admin/manage-user")
                    ? "border-l-4 border-[#006532] bg-[#006532] text-white"
                    : "text-[#222222] group-hover:text-white"
                }
              >
                Người dùng
              </NavLink>
            </li>
            <li
              className={`group flex w-full flex-wrap rounded-xl px-6 py-[12px] transition-colors duration-700 hover:border-[#006532] hover:bg-[#006532] ${
                activeIndex === 0 ||
                window.location.pathname.includes("/admin/manage-category")
                  ? "rounded-xl bg-[#006532]"
                  : ""
              }`}
            >
              <TbCategory
                className={`mr-5 h-6 w-6 ${
                  activeIndex === 0 ||
                  window.location.pathname.includes("/admin/manage-category")
                    ? "text-white"
                    : "text-[#222222] group-hover:text-white"
                }`}
              />
              <NavLink
                to="/admin/manage-category/1/4"
                className={({ isActive }) =>
                  isActive ||
                  window.location.pathname.includes("/admin/manage-category")
                    ? "border-l-4 border-[#006532] bg-[#006532] text-white"
                    : "text-[#222222] group-hover:text-white"
                }
              >
                Danh mục
              </NavLink>
            </li>
            <li
              className={`group flex w-full flex-wrap rounded-xl px-6 py-[12px] transition-colors duration-700 hover:border-[#006532] hover:bg-[#006532] ${
                activeIndex === 0 ||
                window.location.pathname.includes("/admin/manage-product")
                  ? "rounded-xl bg-[#006532]"
                  : ""
              }`}
            >
              <LuBox
                className={`mr-5 h-6 w-6 ${
                  activeIndex === 0 ||
                  window.location.pathname.includes("/admin/manage-product")
                    ? "text-white"
                    : "text-[#222222] group-hover:text-white"
                }`}
              />
              <NavLink
                to="/admin/manage-product/1/10"
                className={({ isActive }) =>
                  isActive ||
                  window.location.pathname.includes("/admin/manage-product")
                    ? "border-l-4 border-[#006532] bg-[#006532] text-white"
                    : "text-[#222222] group-hover:text-white"
                }
              >
                Sản phẩm
              </NavLink>
            </li>
            <li
              className={`group flex w-full flex-wrap rounded-xl px-6 py-[12px] transition-colors duration-700 hover:border-[#006532] hover:bg-[#006532] ${
                activeIndex === 0 ||
                window.location.pathname.includes("/admin/manage-import")
                  ? "rounded-xl bg-[#006532]"
                  : ""
              }`}
            >
              <TbInvoice
                className={`mr-5 h-6 w-6 ${
                  activeIndex === 0 ||
                  window.location.pathname.includes("/admin/manage-import")
                    ? "text-white"
                    : "text-[#222222] group-hover:text-white"
                }`}
              />
              <NavLink
                to="/admin/manage-import/1/4"
                className={({ isActive }) =>
                  isActive ||
                  window.location.pathname.includes("/admin/manage-import")
                    ? "border-l-4 border-[#006532] bg-[#006532] text-white"
                    : "text-[#222222] group-hover:text-white"
                }
              >
                Đơn nhập hàng
              </NavLink>
            </li>
            <li
              className={`group w-full cursor-pointer px-6 py-[12px] transition-colors duration-700 hover:rounded-xl hover:bg-[#006532] ${
                activeIndex === 0 ||
                window.location.pathname.includes("/admin/manage-order")
                  ? "rounded-xl bg-[#006532]"
                  : ""
              }`}
            >
              <div
                onClick={toggleOrderManagement}
                className="flex items-center justify-between"
              >
                <TbClipboardList
                  className={`h-6 w-6 ${
                    activeIndex === 0 ||
                    window.location.pathname.includes("/admin/manage-order")
                      ? "text-white"
                      : "text-[#222222] group-hover:text-white"
                  }`}
                />
                <span
                  className={`${
                    activeIndex === 0 ||
                    window.location.pathname.includes("/admin/manage-order")
                      ? "text-white"
                      : "text-[#222222] group-hover:text-white"
                  }`}
                >
                  Đơn hàng
                </span>
                <span>
                  {isOrderManagementOpen ? (
                    <RiArrowDropDownLine className="text-3xl text-[#222222]" />
                  ) : (
                    <RiArrowDropUpLine className="text-3xl text-[#222222]" />
                  )}
                </span>
              </div>
              {isOrderManagementOpen && (
                <ul className="-mx-6 mt-2 border-t bg-white pl-9">
                  <li className="ml-[30px] w-full py-3 transition-colors duration-700">
                    <NavLink
                      to="/admin/manage-order/1/4?"
                      className={({ isActive }) =>
                        isActive
                          ? "font-semibold text-[#006532]"
                          : "font-medium text-[#222222] hover:text-[#006532]"
                      }
                    >
                      Đơn đặt hàng
                    </NavLink>
                  </li>
                  <li className="-mb-4 ml-[30px] w-full py-3 transition-colors duration-700 hover:text-[#006532]">
                    <NavLink
                      to="/admin/manage-order-complete/1/2"
                      className={({ isActive }) =>
                        isActive
                          ? "font-semibold text-[#006532]"
                          : "font-medium text-[#222222] hover:text-[#006532]"
                      }
                    >
                      Đã hoàn thành
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
            <li
              className={`group flex w-full flex-wrap rounded-xl px-6 py-[12px] transition-colors duration-700 hover:border-[#006532] hover:bg-[#006532] ${
                activeIndex === 0 ||
                window.location.pathname.includes("/admin/manage-supplier")
                  ? "rounded-xl bg-[#006532]"
                  : ""
              }`}
            >
              <TbBuildingWarehouse
                className={`mr-5 h-6 w-6 ${
                  activeIndex === 0 ||
                  window.location.pathname.includes("/admin/manage-supplier")
                    ? "text-white"
                    : "text-[#222222] group-hover:text-white"
                }`}
              />
              <NavLink
                to="/admin/manage-supplier/1/4"
                className={({ isActive }) =>
                  isActive ||
                  window.location.pathname.includes("/admin/manage-supplier")
                    ? "border-l-4 border-[#006532] bg-[#006532] text-white"
                    : "text-[#222222] group-hover:text-white"
                }
              >
                Nhà cung cấp
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default HeaderAdmin;
