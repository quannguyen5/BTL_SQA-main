import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { PiShoppingCartBold } from "react-icons/pi";
import { FaRegUser } from "react-icons/fa";
import { IoMenu, IoClose } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import img from "../../../public/images/Crops organic farm.png";
import { getUser } from "../../services/user-service";
import { getToken, getUserId } from "../../util/auth-local";
import { logoutUser } from "../../services/auth-api";
import {
  NotificationList,
  notificationTypes,
  showNotification,
} from "../Notification/NotificationService";
import { useCart } from "../../Context/CartContext";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [cartItemsQuantity, setCartItemsQuantity] = useState(0);

  const [notifications, setNotifications] = useState([]);

  const { totalQuantity, isLoading } = useCart();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    console.log("Header component mounted");
    const fetchUser = async () => {
      const token = getToken();
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const response = await getUser();
        setUser(response.data);
        console.log("User data:", response.data);
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    setCartItemsQuantity(totalQuantity);
  }, [totalQuantity]);

  const formattedLastName = user?.lastName
    ? user.lastName.substring(0, 4).toUpperCase()
    : "";

  const handleLogoutUser = async () => {
    try {
      // Gọi hàm logoutUser với userId
      await logoutUser();

      console.log("Logout successful");

      // Xóa token khỏi localStorage và đặt lại state user
      localStorage.clear();
      setUser(null); // Đặt lại user state sau khi đăng xuất
      console.log("User state reset after logout");
      // Hiển thị thông báo đăng xuất thành công
      showNotification(
        "Bạn đã đăng xuất thành công.",
        notificationTypes.INFO,
        setNotifications,
      );
      window.location.href = "/home-page";
    } catch (error) {
      // Xử lý lỗi khi đăng xuất
      console.error("Error logging out:", error);

      // Hiển thị thông báo lỗi
      showNotification(
        "Đăng xuất thất bại. Vui lòng thử lại.",
        notificationTypes.ERROR,
        setNotifications,
      );
    }
  };

  const userId = getUserId();
  return (
    <>
      {/* Hiển thị các thông báo */}
      <NotificationList notifications={notifications} />
      {isLoading ? (
        "Loading..."
      ) : (
        <div className="shadow-lg sticky top-0 z-50 flex flex-col items-end bg-white px-12 py-3 shadow-custom-dark">
          <a href="/home-page" className="absolute left-10 -mt-1 xl:ml-36">
            <img
              src={img}
              className="fadeInUp h-[100px] w-24 rounded-[0_30px_30px_30px] border-2 border-[#006633] bg-white p-1 shadow-custom-dark transition-all duration-500 ease-in-out hover:rounded-[30px_30px_0_30px] md:h-[105px] md:w-[100px] md:border-0"
              alt="Logo"
            />
          </a>
          <div className="flex items-center pb-3 pt-3 xl:mr-28">
            <ul
              id="navbar"
              className={`hidden items-center md:flex ${isMenuOpen ? "block" : "hidden"} md:block`}
            >
              <li className="px-4">
                <NavLink
                  to="/home-page"
                  className={({ isActive }) =>
                    isActive
                      ? "border-b-2 border-b-[#006532] text-[15px] font-bold text-[#006532] transition-colors duration-300 ease-in-out"
                      : "text-[15px] font-bold text-[#006532] transition-colors duration-300 ease-in-out hover:text-[#80c9a4]"
                  }
                >
                  TRANG CHỦ
                </NavLink>
              </li>
              <li className="px-4">
                <NavLink
                  to="/product/search/1/8"
                  className={({ isActive }) =>
                    isActive ||
                      window.location.pathname.includes("/product/search")
                      ? "border-b-2 border-b-[#006532] text-[15px] font-bold text-[#006532] transition-colors duration-300 ease-in-out"
                      : "text-[15px] font-bold text-[#006532] transition-colors duration-300 ease-in-out hover:text-[#80c9a4]"
                  }
                >
                  SẢN PHẨM
                </NavLink>
              </li>

              <li className="px-4">
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    isActive
                      ? "border-b-2 border-b-[#006532] text-[15px] font-bold text-[#006532] transition-colors duration-300 ease-in-out"
                      : "text-[15px] font-bold text-[#006532] transition-colors duration-300 ease-in-out hover:text-[#80c9a4]"
                  }
                >
                  VỀ CHÚNG TÔI
                </NavLink>
              </li>
              <li className="px-4">
                <NavLink
                  // to="/user/${userId}"
                  to={`/user/${userId}`}
                  className={({ isActive }) =>
                    isActive
                      ? "border-b-2 border-b-[#006532] text-[15px] font-bold text-[#006532] transition-colors duration-300 ease-in-out"
                      : "text-[15px] font-bold text-[#006532] transition-colors duration-300 ease-in-out hover:text-[#80c9a4]"
                  }
                >
                  LIÊN HỆ
                </NavLink>
              </li>

              {user && ( // Kiểm tra nếu lastName tồn tại thì hiển thị
                <li className="pl-4">
                  <NavLink
                    to={`/user/${userId}`}
                    className={({ isActive }) =>
                      isActive
                        ? "border-b-2 border-b-[#006532] text-[15px] font-bold text-[#006532] transition-colors duration-300 ease-in-out"
                        : "text-[15px] font-bold text-[#006532] transition-colors duration-300 ease-in-out hover:text-[#80c9a4]"
                    }
                  >
                    {formattedLastName}
                  </NavLink>
                </li>
              )}
              <li id="lg-bag" className="md:mb-3 md:h-5 md:px-4">
                <Link to={user ? "/order-history/${userId}" : "/login"}>
                  <FaRegUser
                    aria-hidden="true"
                    className="h-[23px] w-[23px] text-[#006532] transition duration-300 hover:text-[#80c9a4]"
                  />
                </Link>
              </li>
              <li id="lg-bag" className="relative md:mb-3 md:h-5 md:px-4">
                <Link to="/cart">
                  <PiShoppingCartBold
                    aria-hidden="true"
                    className="h-[23px] w-[23px] text-[#006532] transition duration-300 hover:text-[#80c9a4]"
                  />
                  {user && (
                    <span className="absolute -top-[10px] right-[5px] flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                      {totalQuantity}
                    </span>
                  )}
                </Link>
              </li>
              {user && (
                <li id="lg-bag" className="md:mb-3 md:h-5 md:px-4">
                  <NavLink to="/home-page" onClick={handleLogoutUser}>
                    <FiLogOut
                      aria-hidden="true"
                      className="h-[23px] w-[23px] text-[#006532] transition duration-300 hover:text-[#80c9a4]"
                    />
                  </NavLink>
                </li>
              )}
            </ul>
          </div>

          <div id="mobile" className="-mt-3 flex items-center md:hidden">
            {user && (
              <Link
                to="/user/${userId}"
                className="pl-4 pr-1 pt-3 font-semibold text-[#006532]"
              >
                <div className="h-[25px] w-[25px] transition duration-300 hover:text-[#80c9a4]">
                  {formattedLastName}
                </div>
              </Link>
            )}
            <Link to="/login" className="px-4 text-[#006532]">
              <FaRegUser
                aria-hidden="true"
                className="h-[25px] w-[25px] transition duration-300 hover:text-[#80c9a4]"
              />
            </Link>
            <Link to="/cart" className="px-4 text-[#006532]">
              <PiShoppingCartBold
                aria-hidden="true"
                className="h-[30px] w-[30px] transition duration-300 hover:text-[#80c9a4]"
              />
            </Link>
            <button id="bar" className="px-4" onClick={toggleMenu}>
              {isMenuOpen ? (
                <IoClose
                  className="h-[35px] w-[35px] text-[#006532]"
                  aria-hidden="true"
                />
              ) : (
                <IoMenu
                  className="h-[40px] w-[30px] text-[#006532]"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>

          <div
            className={`md:hidden ${isMenuOpen ? "block" : "hidden"} absolute -right-0 top-[70px] h-[669px] w-[250px] border border-t-2 bg-white`}
          >
            <ul className="flex flex-col items-start pl-9">
              <li className="py-2">
                <NavLink
                  to="/home"
                  className={({ isActive }) =>
                    isActive
                      ? "border-b-2 border-b-[#006532] text-[15px] font-bold text-[#006532] transition-colors duration-300 ease-in-out"
                      : "text-[15px] font-bold text-[#006532] transition-colors duration-300 ease-in-out hover:text-[#80c9a4]"
                  }
                >
                  TRANG CHỦ
                </NavLink>
              </li>
              <li className="py-2">
                <NavLink
                  to="/shop"
                  className={({ isActive }) =>
                    isActive
                      ? "border-b-2 border-b-[#006532] text-[15px] font-bold text-[#006532] transition-colors duration-300 ease-in-out"
                      : "text-[15px] font-bold text-[#006532] transition-colors duration-300 ease-in-out hover:text-[#80c9a4]"
                  }
                >
                  SẢN PHẨM
                </NavLink>
              </li>

              <li className="py-2">
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    isActive
                      ? "border-b-2 border-b-[#006532] text-[15px] font-bold text-[#006532] transition-colors duration-300 ease-in-out"
                      : "text-[15px] font-bold text-[#006532] transition-colors duration-300 ease-in-out hover:text-[#80c9a4]"
                  }
                >
                  LIÊN HỆ
                </NavLink>
              </li>
              {user && (
                <li className="py-2">
                  <NavLink
                    to="/home-page"
                    onClick={handleLogoutUser}
                    className={({ isActive }) =>
                      isActive
                        ? "border-b-2 border-b-[#006532] text-[15px] font-bold text-[#006532] transition-colors duration-300 ease-in-out"
                        : "text-[15px] font-bold text-[#006532] transition-colors duration-300 ease-in-out hover:text-[#80c9a4]"
                    }
                  >
                    ĐĂNG XUẤT
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
