import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../AdminHeader/admin-header.jsx";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaEye,
  FaSort,
} from "react-icons/fa";
import { MdOutlineInbox } from "react-icons/md";
import {
  getUsers,
  deleteUser,
  updateUser,
  createUser,
  getSearchUsers,
} from "../../../services/user-service.js";
import { getLocationUserByAdmin, createLocationUser } from "../../../services/location-user-service.js";
import {
  showNotification,
  notificationTypes,
  NotificationList,
} from "../../Notification/NotificationService.jsx";
import NotificationHandler from "../../Notification/notification-handle.jsx";
import { getUserId } from "../../../util/auth-local.js";
import { getManageUserDashboard } from "../../../services/report-service.js";

const Modal = ({ children, showModal, setShowModal }) =>
  showModal ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="shadow-lg w-1/2 rounded-lg bg-white p-6">
        {children}
        <button
          onClick={() => setShowModal(false)}
          className="ml-3 mt-4 rounded bg-red-600 px-4 py-2 text-white"
        >
          Đóng
        </button>
      </div>
    </div>
  ) : null;

const ManageUser = () => {
  const { currentPage: paramCurrentPage, usersPerPage: paramUsersPerPage } =
    useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const usersPerPage = parseInt(paramUsersPerPage) || 8; // Số lượng người dùng trên mỗi trang
  const currentPage = parseInt(paramCurrentPage) || 1;
  const [totalPages, setTotalPages] = useState(1);
  const [locations, setLocations] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState(queryParams.get("search") || "");
  const [filterStatus, setFilterStatus] = useState(
    queryParams.get("status") || "",
  );
  const [filterRole, setFilterRole] = useState(queryParams.get("role") || "");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showConfirmPopupMulti, setShowConfirmPopupMulti] = useState(false);
  const [timeFilter, setTimeFilter] = useState("Tuần");
  const [dashboardData, setDashboardData] = useState(null);


  // Cập nhật URL khi thay đổi filter
  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.set("search", searchTerm);
    if (filterStatus) queryParams.set("status", filterStatus);
    if (filterRole) queryParams.set("role", filterRole);
    window.history.replaceState(
      null,
      "",
      `/admin/manage-user/${currentPage}/${usersPerPage}?${queryParams.toString()}`,
    );
  }, [searchTerm, filterStatus, filterRole, currentPage, usersPerPage]);

  useEffect(() => {
    const fetchUsers = async () => {
      console.log(filterRole);
      if (searchTerm || filterStatus || filterRole) {
        const searchData = {
          lastName: searchTerm,
          phone: "",
          email: searchTerm,
          isActive: filterStatus === "" ? undefined : filterStatus === "1",
          role: filterRole === "" ? undefined : filterRole,
        };
        console.log(searchData);

        try {
          const result = await getSearchUsers(
            currentPage,
            usersPerPage,
            searchData,
          );

          if (Array.isArray(result.data.data)) {
            setUsers(result.data.data);
            const totalPages = Math.ceil(
              parseInt(result.data.total) / parseInt(result.data.limit),
            );
            setTotalPages(totalPages);
          } else {
            console.error(
              "Data returned from API is not an array:",
              result.data.data,
            );
            sessionStorage.setItem(
              "notification",
              JSON.stringify({
                message: "Lỗi trong quá trình xử lý!",
                type: notificationTypes.SUCCESS,
              }),
            );
          }
        } catch (error) {
          console.error("Error fetching search users:", error);
        }
      } else {
        const fetchedUsers = [];
        let page = 1;
        let totalUsers = 0;
        do {
          const result = await getUsers(page, usersPerPage);
          if (result.success) {
            fetchedUsers.push(...result.data.data);
            totalUsers = result.data.total;
            page++;
          } else {
            console.error("Failed to fetch users:", result.message);
            sessionStorage.setItem(
              "notification",
              JSON.stringify({
                message: "Lỗi trong quá trình xử lý!",
                type: notificationTypes.SUCCESS,
              }),
            );
            break;
          }
        } while (fetchedUsers.length < totalUsers);

        setAllUsers(fetchedUsers);
        setTotalPages(Math.ceil(totalUsers / usersPerPage));
        setUsers(
          fetchedUsers.slice(
            (currentPage - 1) * usersPerPage,
            currentPage * usersPerPage,
          ),
        );
      }
    };

    fetchUsers();
  }, [searchTerm, filterRole, filterStatus, currentPage, usersPerPage]);

  useEffect(() => {
    const fetchLocations = async () => {
      const locationData = {};
      for (const user of allUsers) {
        try {
          const response = await getLocationUserByAdmin(user.id);
          if (
            response.success &&
            response.data &&
            response.data.data &&
            response.data.data.length > 0
          ) {
            locationData[user.id] = response.data.data[0];
          } else {
            locationData[user.id] = {
              name: "",
              phone: "",
              address: "",
              id: "",
              default_location: true,
              user_id: "",
            };
          }
        } catch (error) {
          console.error("Error fetching location data:", error);
          locationData[user.id] = {
            name: "",
            phone: "",
            address: "",
            id: "",
            default_location: true,
            user_id: "",
          };
        }
      }
      setLocations(locationData);
    };

    if (allUsers.length > 0) {
      fetchLocations();
    }
  }, [allUsers]);

  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...users];
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSaveUser = async () => {
    try {
      const locationData = {
        name: currentUser.lastName,
        address: currentUser.address,
        phone: currentUser.phone,
        default_location: currentUser.locationdefault || false,
        user_id: currentUser.id,
        locationId: currentUser.locationId,
      };

      console.log("Location Data:", locationData);

      if (currentUser.id) {
        console.log(" Data:", locations[currentUser.id]?.address);
        const adminID = getUserId();
        const userResponse = await updateUser(
          adminID,
          currentUser.id,
          currentUser,
        );

        console.log("User Updated:", userResponse);
        sessionStorage.setItem(
          "notification",
          JSON.stringify({
            message: "Cập nhật người dùng thành công!",
            type: notificationTypes.SUCCESS,
          }),
        );
        window.location.reload();
      } else {
        const createUserResponse = await createUser(currentUser);
        console.log("User Created:", createUserResponse);

        // Lấy user_id từ phản hồi của createUser
        const newUserId = createUserResponse.data.id;
        console.log("Userid", newUserId);

        // Cập nhật user_id trong locationAddData
        const locationAddData = {
          name: currentUser.lastName,
          address: currentUser.address,
          phone: currentUser.phone,
          default_location: currentUser.locationdefault || false,
          user_id: newUserId, // Sử dụng newUserId từ phản hồi của createUser
        };

        console.log("Location Data:", locationAddData);

        const createLocationResponse =
          await createLocationUser(locationAddData);
        console.log("Location Created:", createLocationResponse);
        sessionStorage.setItem(
          "notification",
          JSON.stringify({
            message: "Thêm người dùng thành công!",
            type: notificationTypes.SUCCESS,
          }),
        );
        window.location.reload();
      }
    } catch (error) {
      console.error("Error in handleSaveUser:", error);
      sessionStorage.setItem(
        "notification",
        JSON.stringify({
          message: "Xảy ra lỗi.",
          type: notificationTypes.ERROR,
        }),
      );
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const adminID = getUserId();
      console.log(adminID);
      await Promise.all([
        deleteUser(adminID, userId),
        // deleteLocationUser(adminID,userId)
      ]);

      sessionStorage.setItem(
        "notification",
        JSON.stringify({
          message: "Xóa người dùng thành công!",
          type: notificationTypes.SUCCESS,
        }),
      );
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete user or user location:", error);

      sessionStorage.setItem(
        "notification",
        JSON.stringify({
          message: "Xóa không thành công.",
          type: notificationTypes.ERROR,
        }),
      );
      window.location.reload();
    }
  };

  const handleDeleteSelectedUsers = async () => {
    try {
      const adminID = getUserId();
      await Promise.all(
        selectedUsers.map((userId) =>
          Promise.all([
            deleteUser(adminID, userId),
            // deleteLocationUser(adminID, userId)
          ]),
        ),
      );

      sessionStorage.setItem(
        "notification",
        JSON.stringify({
          message: "Xóa người dùng thành công!",
          type: notificationTypes.SUCCESS,
        }),
      );
      window.location.reload();
    } catch (error) {
      console.error(
        "Failed to delete selected users or their locations:",
        error,
      );

      sessionStorage.setItem(
        "notification",
        JSON.stringify({
          message: "Xóa không thành công.",
          type: notificationTypes.ERROR,
        }),
      );
      window.location.reload();
    }
  };

  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);
    setShowConfirmPopup(true);
  };

  const confirmDelete = () => {
    handleDeleteUser(userToDelete);
    setShowConfirmPopup(false);
  };

  const cancelDelete = () => {
    setShowConfirmPopup(false);
    setUserToDelete(null);
  };

  const handleMultiDeleteClick = () => {
    setShowConfirmPopupMulti(true);
  };

  const confirmMultiDelete = () => {
    handleDeleteSelectedUsers();
    setShowConfirmPopupMulti(false);
  };

  const cancelMultiDelete = () => {
    setShowConfirmPopupMulti(false);
  };
  const openUpdateModal = (user) => {
    const userLocation = locations[user.id] || {}; // Nếu không có location, sử dụng đối tượng rỗng

    setCurrentUser({
      ...user,
      isActive: user.isActive ? true : false,
      name: userLocation.lastName || "", // Đảm bảo lastName tồn tại
      phone: userLocation.phone || "", // Đảm bảo phone tồn tại
      address: userLocation.address || "", // Đảm bảo address tồn tại
      locationId: userLocation.id || "", // Đảm bảo locationId tồn tại
      locationdefault: userLocation.default_location || false, // Đảm bảo default_location tồn tại
    });

    setShowModal(true);
  };

  const openAddModal = () => {
    setCurrentUser({
      firstname: "",
      lastname: "",
      phone: "",
      address: "",
      email: "",
      locationdefault: true,
      role: "customer",
      isActive: true,
    });
    setShowModal(true);
  };

  const handleSelectUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((userId) => userId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const handleViewUser = (user) => {
    setCurrentUser({
      ...user,
      // name: locations[user.id].lastName || '',
      phone: locations[user.id]?.phone || "",
      address: locations[user.id]?.address || "",
      locationid: locations[user.id]?.id || "",
      locationdefault: locations[user.id]?.default_location || "",
    });
    setShowViewPopup(true);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getManageUserDashboard();
        if (data.success) {
          setDashboardData(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  if (!dashboardData) {
    return <p>Loading...</p>;
  }

  const {
    totalUsers,
    usersThisWeek,
    usersLastWeek,
    usersBoughtThisWeek,
    usersBoughtLastWeek,
  } = dashboardData;

  const handlePageChange = (page) => {
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.set("search", searchTerm);
    if (filterStatus) queryParams.set("status", filterStatus);
    if (filterRole) queryParams.set("role", filterRole);

    navigate(
      `/admin/manage-user/${page}/${usersPerPage}?${queryParams.toString()}`,
    );
  };

  // Khi tìm kiếm hoặc filter thay đổi, cập nhật URL
  const handleSearchChange = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    navigate(`/admin/manage-user/1/${usersPerPage}?${queryParams.toString()}`);
  };

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setFilterStatus(newStatus);
    navigate(`/admin/manage-user/1/${usersPerPage}?${queryParams.toString()}`);
  };

  const handleRoleChange = (event) => {
    const newRole = event.target.value;
    setFilterRole(newRole);
    navigate(`/admin/manage-user/1/${usersPerPage}?${queryParams.toString()}`);
  };

  const renderPagination = () => {
    const visiblePages = 5; // Hiển thị tối đa 5 trang

    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);

    return (
      <div id="pagination" className="section-p1">
        {currentPage > 1 && (
          <button
            className="page mx-1 rounded bg-gray-200 p-2"
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Trước
          </button>
        )}
        {[...Array(endPage - startPage + 1)].map((_, index) => (
          <a
            key={startPage + index}
            data-page={startPage + index}
            className={`page ${
              currentPage === startPage + index
                ? "active bg-[#006532] text-white"
                : "bg-gray-200"
            } mx-1 rounded p-2`}
            onClick={() => handlePageChange(startPage + index)}
          >
            {startPage + index}
          </a>
        ))}
        {currentPage < totalPages && (
          <button
            className="page mx-1 rounded bg-gray-200 p-2"
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Tiếp
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed z-50 space-y-3">
        <NotificationList notifications={notifications} />
      </div>
      <NotificationHandler setNotifications={setNotifications} />
      <AdminHeader />

      <div className="ml-[260px] w-5/6 p-4">
        <h1 className="mb-8 mt-4 text-start text-4xl font-bold text-[#222222]">
          Quản lý người dùng
        </h1>

        <Modal showModal={showModal} setShowModal={setShowModal}>
          <h2 className="mb-4 text-2xl font-semibold text-gray-600">
            {currentUser?.id ? "Sửa người dùng" : "Thêm người dùng"}
          </h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-gray-700">Họ:</label>
              <input
                type="text"
                value={currentUser?.firstName}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, firstName: e.target.value })
                }
                className="w-full rounded border border-[#006532] p-2"
                disabled={!!currentUser?.id}
              />
            </div>
            <div>
              <label className="block text-gray-700">Tên:</label>
              <input
                type="text"
                value={currentUser?.lastName}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, lastName: e.target.value })
                }
                className="w-full rounded border border-[#006532] p-2"
                disabled={!!currentUser?.id}
              />
            </div>
            <div>
              <label className="block text-gray-700">Email:</label>
              <input
                type="email"
                value={currentUser?.email}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, email: e.target.value })
                }
                className="w-full rounded border border-[#006532] p-2"
                disabled={!!currentUser?.id}
              />
            </div>
            <div>
              <label className="block text-gray-700">Địa chỉ mặc định:</label>
              <select
                value={currentUser?.locationdefault ? "1" : "0"}
                onChange={(e) =>
                  setCurrentUser({
                    ...currentUser,
                    locationdefault: e.target.value === "1",
                  })
                }
                className="w-full rounded border border-[#006532] p-2"
                disabled={!!currentUser?.id}
              >
                <option value="1">1</option>
                <option value="0">0</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Số điện thoại:</label>
              <input
                type="text"
                value={currentUser?.phone}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, phone: e.target.value })
                }
                className="w-full rounded border border-[#006532] p-2"
                disabled={!!currentUser?.id}
              />
            </div>
            <div>
              <label className="block text-gray-700">Địa chỉ:</label>
              <input
                type="text"
                value={currentUser?.address}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, address: e.target.value })
                }
                className="w-full rounded border border-[#006532] p-2"
                disabled={!!currentUser?.id}
              />
            </div>
            <div>
              <label className="block text-gray-700">Chức vụ:</label>
              <select
                value={currentUser?.role}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, role: e.target.value })
                }
                className="w-full rounded border border-[#006532] p-2"
              >
                <option value="employee">Nhân viên</option>
                <option value="admin">Quản lý</option>
                <option value="customer">Khách hàng</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Trạng thái:</label>
              <select
                value={currentUser?.isActive ? "1" : "0"}
                onChange={(e) =>
                  setCurrentUser({
                    ...currentUser,
                    isActive: e.target.value === "1",
                  })
                }
                className="w-full rounded border border-[#006532] p-2"
              >
                <option value="1">Hoạt động</option>
                <option value="0">Ngưng hoạt động</option>
              </select>
            </div>

            {!currentUser?.id && (
              <div>
                <label className="block text-gray-700">Mật khẩu:</label>
                <input
                  type="text"
                  value={currentUser?.password || ""}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, password: e.target.value })
                  }
                  className="w-full rounded border border-[#006532] p-2"
                />
              </div>
            )}
          </div>
          <button
            onClick={handleSaveUser}
            className="shadow mt-4 rounded bg-[#006532] px-4 py-2 text-white hover:bg-[#005a2f]"
          >
            {currentUser?.id ? "Lưu thay đổi" : "Thêm người dùng"}
          </button>
        </Modal>

        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="shadow-md rounded-lg border border-t-4 border-[#e0e0e0] border-t-[#F29339] bg-white p-4 transition-shadow duration-300 ease-in-out hover:shadow-custom-dark">
            <h4 className="mb-2 text-center text-xl font-semibold text-[#006532]">
              Tổng số khách hàng
            </h4>
            <p className="text-center text-2xl font-bold text-[#006532]">{totalUsers}</p>
            <p className="text-center text-sm text-gray-500">
              So với tuần trước: {usersThisWeek - usersLastWeek > 0 ? '+' : ''}{usersThisWeek - usersLastWeek}
            </p>
          </div>
          <div className="shadow-md rounded-lg border border-t-4 border-[#e0e0e0] border-t-[#84b2da] bg-white p-4 transition-shadow duration-300 ease-in-out hover:shadow-custom-dark">
            <h4 className="mb-2 text-center text-xl font-semibold text-[#006532]">
              Số khách hàng mới
            </h4>
            <p className="text-center text-2xl font-bold text-[#006532]">{usersThisWeek}</p>
            <p className="text-center text-sm text-gray-500">
              So với tuần trước: {usersThisWeek - usersLastWeek > 0 ? '+' : ''}{usersThisWeek - usersLastWeek}
            </p>
          </div>
          <div className="shadow-md rounded-lg border border-t-4 border-[#e0e0e0] border-t-[#4175a2] bg-white p-4 transition-shadow duration-300 ease-in-out hover:shadow-custom-dark">
            <h4 className="mb-2 text-center text-xl font-semibold text-[#006532]">
              Số khách hàng mua hàng
            </h4>
            <p className="text-center text-2xl font-bold text-[#006532]">{usersBoughtThisWeek.userCount}</p>
            <p className="text-center text-sm text-gray-500">
              So với tuần trước: {usersBoughtThisWeek.userCount - usersBoughtLastWeek.userCount > 0 ? '+' : ''}{usersBoughtThisWeek.userCount - usersBoughtLastWeek.userCount}
            </p>
          </div>
        </div>

        {/* Thanh tìm kiếm và bộ lọc */}
        <div className="mb-3 mt-4 flex flex-col items-center rounded-lg border-2 bg-white px-6 py-3 shadow-custom-slate md:flex-row">
          <div className="flex w-1/5 items-center space-x-2">
            <div className="mt-1 pr-4 tablet:absolute tablet:left-10 tablet:mt-[148px]">
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedUsers(sortedUsers.map((user) => user.id));
                  } else {
                    setSelectedUsers([]);
                  }
                }}
              />
            </div>
            <div className="tablet:absolute tablet:left-16 tablet:mt-36">
              {selectedUsers.length > 0 && (
                <FaTrash
                  onClick={handleMultiDeleteClick}
                  className="text-gray-400 hover:text-red-500"
                />
              )}
            </div>
          </div>
          <div className="mb-2 flex w-full items-center space-x-2 md:mb-0 md:w-2/5">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm kiếm bằng tên"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full rounded border border-[#006532] p-2 pl-3"
              />
              <FaSearch className="absolute right-3 top-3 text-gray-500" />
            </div>
          </div>
          <div className="flex w-2/5 items-center justify-end space-x-2 tablet:w-full">
            <select
              value={filterRole}
              onChange={handleRoleChange}
              className="rounded border border-[#006532] p-2"
            >
              <option value="">Tất cả chức vụ</option>
              <option value="employee">Nhân viên</option>
              <option value="admin">Quản lý</option>
              <option value="customer">Khách hàng</option>
            </select>

            <select
              value={filterStatus}
              onChange={handleStatusChange}
              className="rounded border border-[#006532] p-2"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="1">Hoạt động</option>
              <option value="0">Ngưng hoạt động</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto shadow-custom-slate">
          <table className="shadow-lg min-w-full overflow-hidden rounded-lg bg-white">
            <thead className="bg-[#006532] text-white">
              <tr>
                <th className="py-3 pl-6 pr-3 text-left">
                  {/*  */}
                  <MdOutlineInbox />
                </th>
                <th className="py-3 text-left">STT </th>
                <th className="hidden w-1/6 px-6 py-3 text-left xl:table-cell">
                  Ngày tạo{" "}
                  <FaSort
                    className="ml-1 inline cursor-pointer"
                    onClick={() => requestSort("createdAt")}
                  />
                </th>
                <th className="hidden px-6 py-3 text-left sm:table-cell">
                  Họ Tên
                  <FaSort
                    className="ml-1 inline cursor-pointer"
                    onClick={() => requestSort("firstName")}
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  Điện thoại
                  <FaSort
                    className="ml-1 inline cursor-pointer"
                    onClick={() => requestSort("phone")}
                  />
                </th>
                <th className="hidden px-6 py-3 text-left md:table-cell">
                  Email{" "}
                  <FaSort
                    className="ml-1 inline cursor-pointer"
                    onClick={() => requestSort("email")}
                  />
                </th>
                <th className="hidden px-6 py-3 text-left md:table-cell">
                  Địa chỉ
                  <FaSort
                    className="ml-1 inline cursor-pointer"
                    onClick={() => requestSort("address")}
                  />
                </th>
                <th className="hidden px-6 py-3 text-left sm:table-cell">
                  Chức vụ{" "}
                  <FaSort
                    className="ml-1 inline cursor-pointer"
                    onClick={() => requestSort("role")}
                  />
                </th>
                <th className="hidden px-6 py-3 text-left lg:table-cell">
                  Trạng thái{" "}
                  <FaSort
                    className="ml-1 inline cursor-pointer"
                    onClick={() => requestSort("isActive")}
                  />
                </th>

                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-4 text-center">
                    No users found.
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user, index) => (
                  <tr key={user.id} className="border-b hover:bg-[#e0f7e0]">
                    <td className="py-4 pl-6 pr-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </td>
                    <td className="py-3">
                      {(currentPage - 1) * usersPerPage + index + 1}
                    </td>
                    <td className="hidden w-1/6 px-6 py-3 xl:table-cell">
                      {" "}
                      {(() => {
                        const date = new Date(user.createdAt);
                        const time = date.toLocaleTimeString("vi-VN", {
                          hour12: false,
                        });
                        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                        return `${time} ${formattedDate}`;
                      })()}
                    </td>
                    <td className="hidden px-6 py-3 sm:table-cell">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-3">{locations[user.id]?.phone}</td>
                    <td className="hidden px-6 py-3 md:table-cell">
                      {user.email}
                    </td>
                    <td className="hidden px-6 py-3 md:table-cell">
                      {locations[user.id]?.address}
                    </td>
                    <td className="hidden px-6 py-3 capitalize sm:table-cell">
                      {user.role}
                    </td>
                    <td className="hidden px-6 py-3 lg:table-cell">
                      {user.isActive ? "Active" : "Inactive"}
                    </td>

                    <td className="px-6 py-3">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <FaEye size={18} />
                        </button>
                        <button
                          onClick={() => openUpdateModal(user)}
                          className="text-[#006532] hover:text-[#005a2f]"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {showViewPopup && currentUser && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <div className="shadow-lg w-96 rounded-lg border border-gray-200 bg-white p-6">
              {/* <h2 className="text-2xl font-semibold mb-4 text-[#006532]">User: {currentUser.id}</h2>
              <p className="text-black"><strong className="text-[#006532]">firstname:</strong> {currentUser.firstName}</p>
              <p className="text-black"><strong className="text-[#006532]">lastname:</strong> {currentUser.lastName}</p> */}
              <h2 className="mb-4 text-2xl font-semibold text-[#006532]">
                Họ Tên: {currentUser.firstName} {currentUser.lastName}
              </h2>
              <p className="text-black">
                <strong className="text-[#006532]">Email:</strong>{" "}
                {currentUser.email}
              </p>
              <p className="text-black">
                <strong className="text-[#006532]">Số điện thoại:</strong>{" "}
                {currentUser.phone}
              </p>
              <p className="text-black">
                <strong className="text-[#006532]">Địa chỉ:</strong>{" "}
                {currentUser.address}
              </p>
              <p className="text-black">
                <strong className="text-[#006532]">Chức vụ:</strong>{" "}
                {currentUser.role}
              </p>
              <p className="text-black">
                <strong className="text-[#006532]">Trạng thái:</strong>{" "}
                {currentUser.isActive ? "Active" : "Inactive"}
              </p>
              <p className="text-black">
                <strong className="text-[#006532]">Ngày tạo:</strong>{" "}
                {currentUser.createdAt}
              </p>
              <p className="text-black">
                <strong className="text-[#006532]">Ngày cập nhật:</strong>{" "}
                {currentUser.updatedAt}
              </p>

              <button
                onClick={() => setShowViewPopup(false)}
                className="mt-4 rounded bg-[#006532] px-4 py-2 text-white hover:bg-green-700"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
        {showConfirmPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="shadow-lg rounded bg-white p-6">
              <h2 className="mb-4 text-xl">
                Bạn có chắc chắn muốn xóa người dùng này?
              </h2>
              <div className="flex justify-end">
                <button
                  onClick={cancelDelete}
                  className="mr-2 rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-700"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
        {showConfirmPopupMulti && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="shadow-lg rounded bg-white p-6">
              <h2 className="mb-4 text-xl">
                Bạn có chắc chắn muốn xóa các người dùng này?
              </h2>
              <div className="flex justify-end">
                <button
                  onClick={cancelMultiDelete}
                  className="mr-2 rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmMultiDelete}
                  className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-700"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
        {/* <div className="mt-4 flex justify-center"> */}
        {/* Hiển thị các nút phân trang */}
        {/* {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`mx-1 rounded px-3 py-1 ${index + 1 === currentPage ? "bg-[#006532] text-white" : "bg-gray-200 text-gray-800 hover:bg-blue-200"}`}
              disabled={index + 1 === currentPage} // Vô hiệu hóa nút hiện tại
            >
              {index + 1}
            </button>
          ))} */}
        {/* </div> */}
        <section
          id="pagination"
          className="section-p1 flex justify-center space-x-2"
        >
          <div className="mb-4 mt-2 flex justify-center">
            {renderPagination()}
          </div>
        </section>
        <div className="mt-6 flex justify-end">
          <button
            onClick={openAddModal}
            className="shadow-lg fixed bottom-4 right-4 flex items-center justify-center rounded-full bg-[#006532] p-4 text-white hover:bg-[#005a2f]"
          >
            <FaPlus size={24} /> {/* Icon nút */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageUser;
