import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../AdminHeader/admin-header.jsx";
import {
  FaSave,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaSort,
  FaEdit,
} from "react-icons/fa";
import { MdOutlineInbox, MdOutlineCancel } from "react-icons/md";
import {
  getOrdersAdmin,
  updateOrderAdmin,
} from "../../../services/order-service.js";
import {
  showNotification,
  notificationTypes,
  NotificationList,
} from "../../Notification/NotificationService.jsx";
import NotificationHandler from "../../Notification/notification-handle.jsx";

const ManageOrderComplete = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [orders, setOrders] = useState([]);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const { currentPage: paramCurrentPage, ordersPerPage: paramOrdersPerPage } =
    useParams();
  const [notifications, setNotifications] = useState([]);
  const [filterOrderStatus, setFilterOrderStatus] = useState(
    queryParams.get("orderStatus") || "",
  );
  const [filterPaymentStatus, setFilterPaymentStatus] = useState(
    queryParams.get("paymentStatus") || "",
  );
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showConfirmPopupMulti, setShowConfirmPopupMulti] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const ordersPerPage = parseInt(paramOrdersPerPage) || 8; // Số lượng người dùng trên mỗi trang
  const currentPage = parseInt(paramCurrentPage) || 1;
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [productInStock, setProductInStock] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const sortedOrders = React.useMemo(() => {
    let sortableOrders = [...orders];
    if (sortConfig !== null) {
      sortableOrders.sort((a, b) => {
        const orderA = a.order[sortConfig.key];
        const orderB = b.order[sortConfig.key];

        if (orderA < orderB) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (orderA > orderB) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableOrders;
  }, [orders, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (filterOrderStatus) queryParams.set("orderStatus", filterOrderStatus);
    if (filterPaymentStatus)
      queryParams.set("paymentStatus", filterPaymentStatus);
    window.history.replaceState(
      null,
      "",
      `/admin/manage-order-complete/${currentPage}/${ordersPerPage}?${queryParams.toString()}`,
    );
  }, [filterOrderStatus, filterPaymentStatus, currentPage, ordersPerPage]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result2 = await getOrdersAdmin(
          1,
          ordersPerPage * totalPages,
          filterOrderStatus,
          filterPaymentStatus,
          true,
        );
        if (result2.success) {
          const filteredOrders = result2.data.orders;

          setTotalPages(Math.ceil(result2.data.total / ordersPerPage));

          // Áp dụng phân trang và cập nhật `setOrders`
          const pagedOrders = filteredOrders.slice(
            (currentPage - 1) * ordersPerPage,
            currentPage * ordersPerPage,
          );
          setOrders(pagedOrders);
        } else {
          console.error("Failed to fetch filtered orders:", result2.message);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [
    filterPaymentStatus,
    filterOrderStatus,
    ordersPerPage,
    totalPages,
    currentPage,
  ]);

  useEffect(() => {
    setOrders(
      allOrders.slice(
        (currentPage - 1) * ordersPerPage,
        currentPage * ordersPerPage,
      ),
    );
  }, [currentPage, allOrders, ordersPerPage]);

  const handlePageChange = (page) => {
    const queryParams = new URLSearchParams();
    if (filterOrderStatus) queryParams.set("orderStatus", filterOrderStatus);
    if (filterPaymentStatus)
      queryParams.set("paymentStatus", filterPaymentStatus);

    navigate(
      `/admin/manage-order-complete/${page}/${ordersPerPage}?${queryParams.toString()}`,
    );
  };

  const handleOrderStatusChange = (event) => {
    setFilterOrderStatus(event.target.value.trim());
    navigate(
      `/admin/manage-order-complete/1/${ordersPerPage}?${queryParams.toString()}`,
    );
  };

  const handlePaymentStatusChange = (event) => {
    const newPaymentStatus = event.target.value.trim();
    setFilterPaymentStatus(newPaymentStatus);
    navigate(
      `/admin/manage-order-complete/1/${ordersPerPage}?${queryParams.toString()}`,
    );
  };

  const handleViewOrder = (order) => {
    setCurrentOrder({
      ...order,
    });
    setShowViewPopup(true);
  };

  const handleSelectOrder = (id) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter((orderId) => orderId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const time = date.toLocaleTimeString("vi-VN", { hour12: false });
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    return `${formattedDate} ${time}`;
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
            className={`page px-3 ${
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
      <AdminHeader />
      <div className="w-5/6 p-4 ml-[260px]">
        <h1 className="text-4xl font-bold mb-8 mt-4 text-[#222222] text-start">Đơn hàng đã hoàn thành</h1>
    
        {/* Tìm kiếm và lọc */}
        <div className="mb-3 mt-4 flex flex-col items-center rounded-lg bg-white px-6 py-3 md:flex-row tablet:h-28">
          <div className="flex w-4/5 items-center space-x-2">
            <div className="mt-1 pr-4 tablet:absolute tablet:left-10 tablet:mt-[148px]">
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedOrders(sortedOrders.map((order) => order.id));
                  } else {
                    setSelectedOrders([]);
                  }
                }}
              />
            </div>
            <div className="tablet:absolute tablet:left-16 tablet:mt-36">
              {selectedOrders.length > 0 && (
                <FaTrash
                  // onClick={handleDeleteSelectedOrders}
                  className="text-gray-400 hover:text-red-500"
                />
              )}
            </div>
          </div>

          <div className="flex w-2/5 items-center justify-end space-x-2 tablet:w-full">
            <div className="relative w-1/2">
              <select
                value={filterOrderStatus}
                onChange={handleOrderStatusChange}
                className="w-full appearance-none rounded-lg border px-3 py-2 pr-8"
              >
                <option value="">Tất cả</option>
                <option value="Đã giao hàng">Đã giao hàng</option>
                <option value="Hủy đơn hàng">Hủy đơn hàng</option>
              </select>
              <FaFilter className="absolute right-2 top-3 text-gray-400" />
            </div>

            <div className="relative w-1/2">
              <select
                value={filterPaymentStatus}
                onChange={handlePaymentStatusChange}
                className="w-full appearance-none rounded-lg border px-3 py-2 pr-8"
              >
                <option value="">Tất cả</option>
                <option value="Đã thanh toán">Đã thanh toán</option>
                <option value="Chưa thanh toán">Chưa thanh toán</option>
                <option value="Nợ">Nợ</option>
              </select>
              <FaFilter className="absolute right-2 top-3 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="shadow-lg min-w-full overflow-hidden rounded-lg bg-white">
            <thead className="bg-[#006532] text-white">
              <tr>
                <th className="px-6 py-3 text-left">
                  {/*  */}
                  <MdOutlineInbox />
                </th>
                <th className="py-3 pr-3 text-left">STT </th>
                <th className="py-3 text-left">
                  Thời gian đặt hàng{" "}
                  <FaSort onClick={() => requestSort("createdAt")} />{" "}
                </th>
                <th className="py-3 pr-3 text-left">
                  Khách hàng{" "}
                  <FaSort
                    className="ml-1 inline cursor-pointer"
                    onClick={() => requestSort("lastName")}
                  />
                </th>
                <th className="hidden py-3 pr-3 text-left sm:table-cell">
                  Số điện thoại{" "}
                  <FaSort
                    className="ml-1 inline cursor-pointer"
                    onClick={() => requestSort("phone")}
                  />
                </th>
                <th className="hidden py-3 pr-3 text-left sm:table-cell">
                  Tổng tiền{" "}
                  <FaSort
                    className="ml-1 inline cursor-pointer"
                    onClick={() => requestSort("total_price")}
                  />
                </th>
                <th className="hidden py-3 pr-3 text-left md:table-cell">
                  Phương thức thanh toán{" "}
                  <FaSort
                    className="ml-1 inline cursor-pointer"
                    onClick={() => requestSort("payment_method")}
                  />
                </th>
                <th className="hidden py-3 pr-3 text-left lg:table-cell">
                  Tình trạng đơn hàng{" "}
                  <FaSort
                    className="ml-1 inline cursor-pointer"
                    onClick={() => requestSort("orderStatus")}
                  />
                </th>
                <th className="hidden py-3 pr-3 text-left lg:table-cell">
                  Tình trạng thanh toán{" "}
                  <FaSort
                    className="ml-1 inline cursor-pointer"
                    onClick={() => requestSort("paymentStatus")}
                  />
                </th>

                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((or, index) => (
                <tr key={index} className="border-b hover:bg-indigo-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(or.order.id)}
                      onChange={() => handleSelectOrder(or.order.id)}
                    />
                  </td>
                  <td className="py-3 pr-3 text-left">
                    {(currentPage - 1) * ordersPerPage + index + 1}
                  </td>
                  <td className="w-1/6 py-3 text-left">
                    {" "}
                    {formatDateTime(or.order.createdAt)}{" "}
                  </td>
                  <td className="py-3 text-left">
                    {or.order.user.firstName} {or.order.user.lastName}
                  </td>
                  <td className="hidden py-3 text-left sm:table-cell">
                    {or.order.location.phone}
                  </td>
                  <td className="hidden py-3 pr-3 text-left sm:table-cell">
                    {or.order.total_price}
                  </td>
                  <td className="hidden py-3 pr-3 text-left md:table-cell">
                    {or.order.payment_method}
                  </td>
                  <td className="hidden py-3 pr-3 text-left lg:table-cell">
                    <p
                      className={`rounded-md text-center ${
                        or.order.orderStatus == "Đang kiểm hàng"
                          ? "bg-[#F29339] text-white"
                          : or.order.orderStatus == "Chờ giao hàng"
                            ? "bg-[#84b2da] text-white"
                            : or.order.orderStatus == "Đang vận chuyển"
                              ? "bg-[#4175a2] text-white"
                              : or.order.orderStatus == "Hủy đơn hàng"
                                ? "bg-[#ad402a] text-white"
                                : or.order.orderStatus == "Đã giao hàng"
                                  ? "bg-[#006532] text-white"
                                  : "bg-gray-300 text-black"
                      }`}
                    >
                      {or.order.orderStatus}
                    </p>
                  </td>
                  <td className="hidden py-3 pr-3 text-left lg:table-cell">
                    <p
                      className={`rounded-md text-center ${
                        or.order.paymentStatus === "Chưa thanh toán"
                          ? "bg-[#F29339] text-white xl:w-40"
                          : or.order.paymentStatus === "Nợ"
                            ? "bg-[#af342b] text-white xl:w-40"
                            : or.order.paymentStatus === "Đã thanh toán"
                              ? "bg-[#006532] text-white xl:w-40"
                              : "bg-gray-300 text-black"
                      }`}
                    >
                      {or.order.paymentStatus}
                    </p>
                  </td>

                  <td className="py-3 pr-3">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleViewOrder(or)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FaEye size={18} />
                      </button>
                      {/* <button 
                        onClick={() => handleCancelOrder(or.order.orderId)} 
                        className="text-red-600 hover:text-red-700"
                      >
                        <MdOutlineCancel size={18} />
                      </button> */}
                      <button
                        onClick={() => openUpdateModal(or)}
                        className="text-[#006532] hover:text-[#005a2f]"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Popup hiển thị chi tiết đơn hàng */}
        {showViewPopup && currentOrder && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="mt-2 max-h-[80vh] w-1/2 overflow-y-auto rounded-lg bg-white p-8">
              <h2 className="mb-4 text-2xl font-bold">Chi tiết đơn hàng</h2>
              <p className="text-black">
                <strong>Nhân viên:</strong>{" "}
                {currentOrder.order.employee.lastName}
              </p>
              <p className="text-black">
                <strong>Khách hàng:</strong> {currentOrder.order.user.firstName}{" "}
                {currentOrder.order.user.lastName}
              </p>
              <p className="text-black">
                <strong>Địa chỉ:</strong> {currentOrder.order.location.address}
              </p>
              <p className="text-black">
                <strong>Số điện thoại:</strong>{" "}
                {currentOrder.order.location.phone}
              </p>
              <p className="text-black">
                <strong>Tổng tiền:</strong> {currentOrder.order.total_price}
              </p>
              <p className="text-black">
                <strong>Tình trạng đơn hàng:</strong>{" "}
                {currentOrder.order.orderStatus}
              </p>
              <p className="text-black">
                <strong>Phương thức thanh toán:</strong>{" "}
                {currentOrder.order.payment_method}
              </p>
              <p className="text-black">
                <strong>Tình trạng thanh toán:</strong>{" "}
                {currentOrder.order.paymentStatus}
              </p>
              <p className="text-black">
                <strong>Thời gian cập nhật:</strong>{" "}
                {currentOrder.order.updatedAt}
              </p>
              <p className="text-black">
                <strong>Thời gian đặt hàng:</strong>{" "}
                {currentOrder.order.createdAt}
              </p>
              <h3 className="mt-4 text-xl font-bold">Sản phẩm</h3>
              <table className="shadow-lg mt-4 min-w-full overflow-hidden rounded-lg bg-white">
                <thead className="bg-[#006532]">
                  <tr>
                    <th className="px-4 py-2 text-left text-white">
                      Tên sản phẩm
                    </th>
                    <th className="px-4 py-2 text-left text-white">Giá bán</th>
                    <th className="px-4 py-2 text-left text-white">
                      Số lượng khách đặt
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrder.order.products.map((product, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">{product.productName}</td>
                      <td className="px-4 py-2">{product.priceout}</td>
                      <td className="px-4 py-2">{product.quantityBuy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={() => setShowViewPopup(false)}
                className="mt-4 rounded bg-[#006532] px-4 py-2 text-white hover:bg-green-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Popup cập nhật đơn hàng */}
        {showModal && currentOrder && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="mt-2 max-h-[80vh] w-1/2 overflow-y-auto rounded-lg bg-white p-8">
              <h2 className="mb-4 text-2xl font-bold text-[#006532]">
                Cập nhật đơn hàng
              </h2>
              <p className="text-black">
                <strong>Nhân viên:</strong>{" "}
                {currentOrder.order.employee.lastName}
              </p>
              <p className="text-black">
                <strong>Khách hàng:</strong> {currentOrder.order.user.firstName}{" "}
                {currentOrder.order.user.lastName}
              </p>
              <p className="text-black">
                <strong>Địa chỉ:</strong> {currentOrder.order.location.address}
              </p>
              <p className="text-black">
                <strong>Số điện thoại:</strong>{" "}
                {currentOrder.order.location.phone}
              </p>
              <p className="text-black">
                <strong>Tổng tiền:</strong> {currentOrder.order.total_price}
              </p>
              <p className="text-black">
                <strong>Phương thức thanh toán:</strong>{" "}
                {currentOrder.order.payment_method}
              </p>
              <p className="text-black">
                <strong>Thời gian cập nhật:</strong>{" "}
                {formatDateTime(currentOrder.order.createdAt)}
              </p>
              <p className="text-black">
                <strong>Thời gian đặt hàng:</strong>{" "}
                {formatDateTime(currentOrder.order.createdAt)}
              </p>
              <h3 className="mt-4 text-xl font-bold text-[#006532]">
                Sản phẩm
              </h3>
              <table className="shadow-lg mt-4 min-w-full overflow-hidden rounded-lg bg-white">
                <thead className="bg-[#006532]">
                  <tr>
                    <th className="px-4 py-2 text-left text-white">
                      Tên sản phẩm
                    </th>
                    <th className="px-4 py-2 text-left text-white">Giá bán</th>
                    <th className="px-4 py-2 text-left text-white">
                      Số lượng khách đặt
                    </th>
                    <th className="px-4 py-2 text-left text-white">
                      Tình trạng trong kho
                    </th>
                    <th className="px-4 py-2 text-left text-white">
                      Số lượng còn thiếu
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrder.order.products.map((product, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">{product.productName}</td>
                      <td className="px-4 py-2">{product.priceout}</td>
                      <td className="px-4 py-2">{product.quantityBuy}</td>
                      <td className="px-4 py-2">{product.stockStatus}</td>
                      <td className="px-4 py-2">{product.missingQuantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-6 flex space-x-4">
                <select
                  defaultValue={currentOrder.order.orderStatus}
                  onChange={(e) =>
                    setCurrentOrder({ ...currentOrder, status: e.target.value })
                  }
                  className="mb-4 w-full rounded-lg border border-green-500 bg-gray-100 px-4 py-2 hover:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Tất cả</option>
                  <option value="Đang kiểm hàng">Đang kiểm hàng</option>
                  <option value="Chờ giao hàng">Chờ giao hàng</option>
                  <option value="Đang vận chuyển">Đang vận chuyển</option>
                  <option value="Đã giao hàng">Đã giao hàng</option>
                  <option value="Hủy đơn hàng">Hủy đơn hàng</option>
                </select>
                <select
                  defaultValue={currentOrder.order.paymentStatus}
                  onChange={(e) =>
                    setCurrentOrder({ ...currentOrder, status: e.target.value })
                  }
                  className="mb-4 w-full rounded-lg border border-green-500 bg-gray-100 px-4 py-2 hover:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Tất cả</option>
                  <option value="Đã thanh toán">Đã thanh toán</option>
                  <option value="Chưa thanh toán">Chưa thanh toán</option>
                  <option value="Nợ">Nợ</option>
                </select>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  // onClick={() => handleSaveUpdate(currentOrder.status, currentOrder.paymentStatus)}
                  className="rounded bg-[#006532] px-4 py-2 text-white transition-all hover:bg-green-700"
                >
                  Cập nhật
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="ml-2 rounded bg-red-600 px-4 py-2 text-white transition-all hover:bg-red-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* <div className="flex justify-center mt-4"> */}
        {/* Hiển thị các nút phân trang */}
        {/* {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`mx-1 px-3 py-1 rounded ${index + 1 === currentPage ? 'bg-[#006532] text-white' : 'bg-gray-200 text-gray-800 hover:bg-blue-200'}`}
            disabled={index + 1 === currentPage} // Vô hiệu hóa nút hiện tại
          >
            {index + 1}
          </button>
        ))}
      </div> */}
        <section
          id="pagination"
          className="section-p1 flex justify-center space-x-2"
        >
          <div className="mb-4 mt-2 flex justify-center">
            {renderPagination()}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ManageOrderComplete;
