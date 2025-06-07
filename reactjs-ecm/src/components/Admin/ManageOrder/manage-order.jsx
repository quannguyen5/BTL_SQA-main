import React, { useEffect, useState, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../AdminHeader/admin-header.jsx";
import {getUserId} from '../../../util/auth-local.js'
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
import {getEmployees} from "../../../services/user-service.js"
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

const ManageOrder = () => {
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
  const ordersPerPage = parseInt(paramOrdersPerPage) || 8; // Số lượng người dùng trên mỗi trang
  const currentPage = parseInt(paramCurrentPage) || 1;
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [productInStock, setProductInStock] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [showConfirmPopupInTransit, setShowConfirmPopupInTransit] =
    useState(false);
  const [showConfirmPopupConfirmed, setShowConfirmPopupConfirmed] =
    useState(false);
  const [showConfirmPopupDelivered, setShowConfirmPopupDelivered] =
    useState(false);
  const [orderStatusSummary, setOrderStatusSummary] = useState({
    "Đang kiểm hàng": 0,
    "Chờ giao hàng": 0,
    "Đang giao hàng": 0,
    "Thiếu hàng": 0,
  });
  const [employees, setEmployees] = useState([]);
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

  const calculateStockStatus = (orders, productInStock) => {
    let stockMap = new Map();
    productInStock.forEach((product) => {
      stockMap.set(product.id, product.stockQuantity);
    });

    orders.forEach((order) => {
      let hasMissingProduct = false;

      order.order.products.forEach((product) => {
        const currentStock = stockMap.get(product.productId) || 0;
        const newStock = currentStock - product.quantityBuy;
        stockMap.set(product.productId, newStock);

        if (newStock >= 0) {
          product.stockStatus = "Đủ hàng";
          product.missingQuantity = 0;
        } else {
          product.stockStatus = "Thiếu hàng";
          product.missingQuantity = Math.abs(newStock);
          hasMissingProduct = true;
        }
      });
      order.order.statusProduct = hasMissingProduct ? "Thiếu hàng" : "Đủ hàng";
    });

    return orders;
  };

  const allOrdersRef = useRef([]);

  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (filterOrderStatus) queryParams.set("orderStatus", filterOrderStatus);

    if (filterPaymentStatus)
      queryParams.set("paymentStatus", filterPaymentStatus);
    window.history.replaceState(
      null,
      "",
      `/admin/manage-order/${currentPage}/${ordersPerPage}?${queryParams.toString()}`,
    );
  }, [filterOrderStatus, filterPaymentStatus, currentPage, ordersPerPage]);

  const fetchOrders = async () => {
    try {
      const result1 = await getOrdersAdmin(
        1,
        ordersPerPage * totalPages,
        "",
        "",
        false,
      );
      if (result1.success) {
        const allFetchedOrders = result1.data.orders;
        setProductInStock(result1.data.productInStock);
        const ordersWithStockStatus = calculateStockStatus(
          allFetchedOrders,
          result1.data.productInStock,
        );
        allOrdersRef.current = ordersWithStockStatus;
        setAllOrders(ordersWithStockStatus);
        setOrderStatusSummary(result1.data.orderStatusSummary);
      }

      const result2 = await getOrdersAdmin(
        1,
        ordersPerPage * totalPages,
        filterOrderStatus,
        filterPaymentStatus,
        false,
      );
      if (result2.success) {
        const filteredOrders = result2.data.orders;
        const filteredOrdersWithStockStatus = filteredOrders.map((order) => {
          const matchedOrder = allOrdersRef.current.find(
            (o) => o.order.id === order.order.id,
          );
          return matchedOrder ? matchedOrder : order;
        });

        setTotalPages(Math.ceil(result2.data.total / ordersPerPage));
        const pagedOrders = filteredOrdersWithStockStatus.slice(
          (currentPage - 1) * ordersPerPage,
          currentPage * ordersPerPage,
        );
        setOrders(pagedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      showNotification(
        "Lỗi trong quá trình xử lý. Vui lòng thử lại",
        notificationTypes.ERROR,
        setNotifications,
      );
    }
  };

  useEffect(() => {
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
      `/admin/manage-order/${page}/${ordersPerPage}?${queryParams.toString()}`,
    );
  };

  const handleOrderStatusChange = (event) => {
    setFilterOrderStatus(event.target.value.trim());
    navigate(
      `/admin/manage-order/1/${ordersPerPage}?${queryParams.toString()}`,
    );
  };

  const handlePaymentStatusChange = (event) => {
    const newPaymentStatus = event.target.value.trim();
    setFilterPaymentStatus(newPaymentStatus);
    navigate(
      `/admin/manage-order/1/${ordersPerPage}?${queryParams.toString()}`,
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

  const openUpdateModal = (or) => {
    setCurrentOrder({
      ...or,
    });
    setShowModal(true);
  };

  const handleSaveUpdate = async () => {
    try {
      const {
        order: { products, ...orderDetails },
      } = currentOrder;
  
      // Kiểm tra nếu không có nhân viên phụ trách
      if (!orderDetails.employee || !orderDetails.employee.id) {
        showNotification(
          "Đơn hàng chưa có nhân viên phụ trách. Vui lòng chọn nhân viên trước khi cập nhật!",
          notificationTypes.INFO,
          setNotifications,
        );
      } else {
        // Cập nhật thông tin order nếu có nhân viên phụ trách
        const updatedData = {
          order_id: orderDetails.id,
          totalPrice: orderDetails.total_price,
          paymentMethod: orderDetails.payment_method,
          orderStatus: orderDetails.orderStatus,
          user_id: orderDetails.user.id,
          employee_id: orderDetails.employee.id,
          location_id: orderDetails.location.id,
          paymentStatus: orderDetails.paymentStatus,
          products: Array.isArray(products)
            ? products.map((product) => ({
                product_id: product.productId,
                quantity: product.quantityBuy,
                priceout: product.priceout,
              }))
            : [],
        };
  
        const result = await updateOrderAdmin(updatedData);
        setShowModal(false);
        sessionStorage.setItem(
          "notification",
          JSON.stringify({
            message: "Cập nhật đơn hàng thành công!",
            type: notificationTypes.SUCCESS,
          })
        );
        window.location.reload();
      }
    } catch (error) {
      sessionStorage.setItem(
        "notification",
        JSON.stringify({
          message: "Cập nhật đơn hàng không thành công. Vui lòng thử lại!",
          type: notificationTypes.ERROR,
        })
      );
      window.location.reload();
      console.error("Failed to update order:", error);
    }
  };
  

  const handleCancelOrder = async (or) => {
    try {
      const {
        order: { products, ...orderDetails },
      } = or;
      let updatedData={};
      // Kiểm tra nếu không có nhân viên phụ trách
      if (!orderDetails.employee || !orderDetails.employee.id) {
       const adminId=getUserId();
     
        // Cập nhật thông tin hủy đơn hàng nếu có nhân viên phụ trách
        updatedData = {
          order_id: orderDetails.id, // Sử dụng orderDetails để lấy các thuộc tính còn lại
          totalPrice: orderDetails.total_price,
          paymentMethod: orderDetails.payment_method,
          orderStatus: "Hủy đơn hàng", // Cập nhật trạng thái đơn hàng thành 'Hủy đơn hàng'
          user_id: orderDetails.user.id,
          employee_id: adminId,
          location_id: orderDetails.location.id,
          paymentStatus: orderDetails.paymentStatus,
          products: Array.isArray(products)
            ? products.map((product) => ({
                product_id: product.productId,
                quantity: product.quantityBuy,
                priceout: product.priceout,
              }))
            : [],
        };
      } else {
        updatedData = {
          order_id: orderDetails.id, // Sử dụng orderDetails để lấy các thuộc tính còn lại
          totalPrice: orderDetails.total_price,
          paymentMethod: orderDetails.payment_method,
          orderStatus: "Hủy đơn hàng", // Cập nhật trạng thái đơn hàng thành 'Hủy đơn hàng'
          user_id: orderDetails.user.id,
          employee_id: orderDetails.employee.id,
          location_id: orderDetails.location.id,
          paymentStatus: orderDetails.paymentStatus,
          products: Array.isArray(products)
            ? products.map((product) => ({
                product_id: product.productId,
                quantity: product.quantityBuy,
                priceout: product.priceout,
              }))
            : [],
        };
      }
      
        const result = await updateOrderAdmin(updatedData); // Cập nhật đơn hàng
        setShowModal(false);
  
        // Hiển thị thông báo thành công và lưu vào sessionStorage
        sessionStorage.setItem(
          "notification",
          JSON.stringify({
            message: "Hủy đơn hàng thành công!",
            type: notificationTypes.SUCCESS,
          })
        );
        window.location.reload();
      
    } catch (error) {
      // Hiển thị thông báo lỗi và lưu vào sessionStorage
      sessionStorage.setItem(
        "notification",
        JSON.stringify({
          message: "Hủy không thành công.",
          type: notificationTypes.ERROR,
        })
      );
      window.location.reload();
      console.error("Failed to update order:", error);
    }
  };
  

  const handleCancelSelectedOrders = async () => {
    try {
      await Promise.all(
        selectedOrders.map(async (orderId) => {
          const or = orders.find((order) => order.order.id === orderId);
          if (or && or.order) {


            const {
              order: { products, ...orderDetails },
            } = or;
            let updatedData={};
            if (!orderDetails.employee || !orderDetails.employee.id) {
             const adminId=getUserId();

              updatedData = {
                order_id: orderDetails.id, // Sử dụng orderDetails để lấy các thuộc tính còn lại
                totalPrice: orderDetails.total_price,
                paymentMethod: orderDetails.payment_method,
                orderStatus: "Hủy đơn hàng", // Cập nhật trạng thái đơn hàng thành 'Hủy đơn hàng'
                user_id: orderDetails.user.id,
                employee_id: adminId,
                location_id: orderDetails.location.id,
                paymentStatus: orderDetails.paymentStatus,
                products: Array.isArray(products)
                  ? products.map((product) => ({
                      product_id: product.productId,
                      quantity: product.quantityBuy,
                      priceout: product.priceout,
                    }))
                  : [],
              };
            } else {
              updatedData = {
                order_id: orderDetails.id, // Sử dụng orderDetails để lấy các thuộc tính còn lại
                totalPrice: orderDetails.total_price,
                paymentMethod: orderDetails.payment_method,
                orderStatus: "Hủy đơn hàng", // Cập nhật trạng thái đơn hàng thành 'Hủy đơn hàng'
                user_id: orderDetails.user.id,
                employee_id: orderDetails.employee.id,
                location_id: orderDetails.location.id,
                paymentStatus: orderDetails.paymentStatus,
                products: Array.isArray(products)
                  ? products.map((product) => ({
                      product_id: product.productId,
                      quantity: product.quantityBuy,
                      priceout: product.priceout,
                    }))
                  : [],
              };
            }

            console.log("update", updatedData);
            const result = await updateOrderAdmin(updatedData);

          } else {
            console.error("Order data is missing:", or);
          }


        }),
      );
      sessionStorage.setItem(
        "notification",
        JSON.stringify({
          message: "Hủy đơn hàng thành công!",
          type: notificationTypes.SUCCESS,
        }),
      );
      window.location.reload();
    } catch (error) {
      console.error(
        "Failed to delete selected orders or their locations:",
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

  const handleMultiCancelClick = () => {
    setShowConfirmPopupMulti(true);
  };

  const cancelMultiCancel = () => {
    setShowConfirmPopupMulti(false);
  };

  const confirmMultiCancel = () => {
    handleCancelSelectedOrders();
    setShowConfirmPopupMulti(false);
  };

  const handleConfirmedSelectedOrders = async () => {
    try {
      let allOrdersConfirmed = true;  // Biến này theo dõi xem tất cả đơn hàng đã được xác nhận chưa
  
      await Promise.all(
        selectedOrders.map(async (orderId) => {
          const or = orders.find((order) => order.order.id === orderId);
          if (or && or.order) {
            const {
              order: { products, ...orderDetails },
            } = or;
  
            if (!orderDetails.employee || !orderDetails.employee.id) {
              allOrdersConfirmed = false;  // Nếu đơn hàng không có nhân viên phụ trách, đánh dấu là chưa xác nhận

            } else {
              const updatedData = {
                order_id: orderDetails.id,
                totalPrice: orderDetails.total_price,
                paymentMethod: orderDetails.payment_method,
                orderStatus: "Chờ giao hàng",
                user_id: orderDetails.user.id,
                employee_id: orderDetails.employee.id,
                location_id: orderDetails.location.id,
                paymentStatus: orderDetails.paymentStatus,
                products: Array.isArray(products)
                  ? products.map((product) => ({
                      product_id: product.productId,
                      quantity: product.quantityBuy,
                      priceout: product.priceout,
                    }))
                  : [],
              };
  
              console.log("update", updatedData);
              await updateOrderAdmin(updatedData); 
            }
          } else {
            console.error("Order data is missing:", or);
          }
        }),
      );
  
      if (allOrdersConfirmed) {
        sessionStorage.setItem(
          "notification",
          JSON.stringify({
            message: "Xác nhận đơn hàng thành công!",
            type: notificationTypes.SUCCESS,
          }),
        );
        window.location.reload();
      }
      else{
        showNotification(
          "Đơn hàng chưa có nhân viên phụ trách. Vui lòng chọn nhân viên trước khi cập nhật!",
          notificationTypes.INFO,
          setNotifications,
        );
      }
    } catch (error) {
      sessionStorage.setItem(
        "notification",
        JSON.stringify({
          message: "Xác nhận không thành công.",
          type: notificationTypes.ERROR,
        }),
      );
      window.location.reload();
      console.error("Failed to update orders:", error);
    }
  };
  

  const handleMultiConfirmedClick = () => {
    setShowConfirmPopupConfirmed(true);
  };

  const cancelMultiConfirmed = () => {
    setShowConfirmPopupConfirmed(false);
  };

  const confirmMultiConfirmed = () => {
    handleConfirmedSelectedOrders();
    setShowConfirmPopupConfirmed(false);
  };

  const handleInTransitSelectedOrders = async () => {
    try {
      let allOrdersConfirmed = true;  // Biến này theo dõi xem tất cả đơn hàng đã được cập nhật chưa
  
      await Promise.all(
        selectedOrders.map(async (orderId) => {
          const or = orders.find((order) => order.order.id === orderId);
          if (or && or.order) {
            const {
              order: { products, ...orderDetails },
            } = or;
  
            // Kiểm tra nếu không có nhân viên phụ trách
            if (!orderDetails.employee || !orderDetails.employee.id) {
              allOrdersConfirmed = false;  // Nếu đơn hàng không có nhân viên phụ trách, đánh dấu là chưa xác nhận
            } else {
              const updatedData = {
                order_id: orderDetails.id,
                totalPrice: orderDetails.total_price,
                paymentMethod: orderDetails.payment_method,
                orderStatus: "Đang vận chuyển",
                user_id: orderDetails.user.id,
                employee_id: orderDetails.employee.id,
                location_id: orderDetails.location.id,
                paymentStatus: orderDetails.paymentStatus,
                products: Array.isArray(products)
                  ? products.map((product) => ({
                      product_id: product.productId,
                      quantity: product.quantityBuy,
                      priceout: product.priceout,
                    }))
                  : [],
              };
  
              console.log("update", updatedData);
              await updateOrderAdmin(updatedData); // Cập nhật đơn hàng
            }
          } else {
            console.error("Order data is missing:", or);
          }
        }),
      );
  
      // Nếu tất cả đơn hàng đã được xác nhận và cập nhật, hiển thị thông báo thành công
      if (allOrdersConfirmed) {
        sessionStorage.setItem(
          "notification",
          JSON.stringify({
            message: "Xác nhận đơn hàng thành công!",
            type: notificationTypes.SUCCESS,
          }),
        );
        window.location.reload();
      } else {
        // Nếu có đơn hàng không có nhân viên phụ trách, hiển thị thông báo lỗi
        showNotification(
          "Đơn hàng chưa có nhân viên phụ trách. Vui lòng chọn nhân viên trước khi cập nhật!",
          notificationTypes.INFO,
          setNotifications,
        );
      }
    } catch (error) {
      console.error("Failed to update selected orders:", error);
      sessionStorage.setItem(
        "notification",
        JSON.stringify({
          message: "Xác nhận không thành công.",
          type: notificationTypes.ERROR,
        }),
      );
      window.location.reload();
    }
  };
  

  const handleMultiInTransitClick = () => {
    setShowConfirmPopupInTransit(true);
  };

  const cancelMultiInTransit = () => {
    setShowConfirmPopupInTransit(false);
  };

  const confirmMultiInTransit = () => {
    handleInTransitSelectedOrders();
    setShowConfirmPopupInTransit(false);
  };

  const handleDeliveredSelectedOrders = async () => {
    try {
      let allOrdersConfirmed = true;  // Biến này theo dõi xem tất cả đơn hàng đã được cập nhật chưa
  
      await Promise.all(
        selectedOrders.map(async (orderId) => {
          const or = orders.find((order) => order.order.id === orderId);
          if (or && or.order) {
            const {
              order: { products, ...orderDetails },
            } = or;
  
            // Kiểm tra nếu không có nhân viên phụ trách
            if (!orderDetails.employee || !orderDetails.employee.id) {
              allOrdersConfirmed = false;  // Nếu đơn hàng không có nhân viên phụ trách, đánh dấu là chưa xác nhận
            } else {
              const updatedData = {
                order_id: orderDetails.id,
                totalPrice: orderDetails.total_price,
                paymentMethod: orderDetails.payment_method,
                orderStatus: "Đã giao hàng",
                user_id: orderDetails.user.id,
                employee_id: orderDetails.employee.id,
                location_id: orderDetails.location.id,
                paymentStatus: orderDetails.paymentStatus,
                products: Array.isArray(products)
                  ? products.map((product) => ({
                      product_id: product.productId,
                      quantity: product.quantityBuy,
                      priceout: product.priceout,
                    }))
                  : [],
              };
  
              console.log("update", updatedData);
              await updateOrderAdmin(updatedData); // Cập nhật đơn hàng
            }
          } else {
            console.error("Order data is missing:", or);
          }
        }),
      );
      if (allOrdersConfirmed) {
        sessionStorage.setItem(
          "notification",
          JSON.stringify({
            message: "Xác nhận đơn hàng thành công!",
            type: notificationTypes.SUCCESS,
          }),
        );
        window.location.reload();
      } else {
        showNotification(
          "Đơn hàng chưa có nhân viên phụ trách. Vui lòng chọn nhân viên trước khi cập nhật!",
          notificationTypes.INFO,
          setNotifications,
        );
      }
    } catch (error) {
      console.error("Failed to update selected orders:", error);
      sessionStorage.setItem(
        "notification",
        JSON.stringify({
          message: "Xác nhận không thành công.",
          type: notificationTypes.ERROR,
        }),
      );
      window.location.reload();
    }
  };
  

  const handleMultiDeliveredClick = () => {
    setShowConfirmPopupDelivered(true);
  };

  const cancelMultiDelivered = () => {
    setShowConfirmPopupDelivered(false);
  };

  const confirmMultiDelivered = () => {
    handleDeliveredSelectedOrders();
    setShowConfirmPopupDelivered(false);
  };

  const formatDateTime = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return "";
    }

    const date = new Date(dateString);
    const time = date.toLocaleTimeString("vi-VN", { hour12: false });
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    return `${formattedDate} ${time}`;
  };

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();  
      setEmployees(data.data.data);  // Lưu danh sách nhân viên vào state
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
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
      <div className="fixed z-50 space-y-3">
        <NotificationList notifications={notifications} />
      </div>
      <NotificationHandler setNotifications={setNotifications} />
      <AdminHeader />
      <div className="ml-[260px] w-5/6 p-4">
        <h1 className="mb-8 mt-4 text-start text-4xl font-bold text-[#222222]">
          Đơn hàng đang xử lý
        </h1>

        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          <div className="shadow-md rounded-lg border border-t-4 border-[#e0e0e0] border-t-[#F29339] bg-white p-2 transition-shadow duration-300 ease-in-out hover:shadow-custom-dark">
            <h3 className="mb-2 text-center text-xl font-semibold text-[#006532]">
              {" "}
              Đang kiểm hàng
            </h3>
            <p className="text-center text-xl">
              {orderStatusSummary["Đang kiểm hàng"] ?? 0}
            </p>
          </div>
          <div className="shadow-md rounded-lg border border-t-4 border-[#e0e0e0] border-t-[#84b2da] bg-white p-2 transition-shadow duration-300 ease-in-out hover:shadow-custom-dark">
            <h3 className="mb-2 text-center text-xl font-semibold text-[#006532]">
              {" "}
              Chờ giao hàng
            </h3>
            <p className="text-center text-xl">
              {orderStatusSummary["Chờ giao hàng"] ?? 0}
            </p>
          </div>
          <div className="shadow-md rounded-lg border border-t-4 border-[#e0e0e0] border-t-[#4175a2] bg-white p-2 transition-shadow duration-300 ease-in-out hover:shadow-custom-dark">
            <h3 className="mb-2 text-center text-xl font-semibold text-[#006532]">
              {" "}
              Đang vận chuyển
            </h3>
            <p className="text-center text-xl">
              {orderStatusSummary["Đang vận chuyển"] ?? 0}
            </p>
          </div>
        </div>

        {/* Tìm kiếm và lọc */}
        <div className="mb-3 mt-4 flex flex-col items-center rounded-lg bg-white px-6 py-3 md:flex-row tablet:h-28">
          <div className="flex w-4/5 items-center space-x-2">
            <div className="mt-1 pr-4 tablet:absolute tablet:left-10 tablet:mt-[148px]">
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedOrders(orders.map((or) => or.order.id));
                  } else {
                    setSelectedOrders([]);
                  }
                }}
              />
            </div>

            <div className="pl-3 tablet:absolute tablet:left-24 tablet:mt-36">
              {selectedOrders.length > 0 && (
                <div className="relative flex w-full space-x-2">
                  <button
                    className="transform rounded-md bg-[#84b2da] px-2 py-1 text-sm text-white shadow-[0_4px_6px_rgba(0,0,0,0.4),0_1px_3px_rgba(0,0,0,0.08)] transition duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#73a0c9]"
                    onClick={handleMultiConfirmedClick}
                  >
                    Xác nhận
                  </button>
                  <button
                    className="transform rounded-md bg-[#4175a2] px-2 py-1 text-sm text-white shadow-[0_4px_6px_rgba(0,0,0,0.4),0_1px_3px_rgba(0,0,0,0.08)] transition duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#35628d]"
                    onClick={handleMultiInTransitClick}
                  >
                    Vận chuyển
                  </button>
                  <button
                    className="transform rounded-md bg-[#ad402a] px-2 py-1 text-sm text-white shadow-[0_4px_6px_rgba(0,0,0,0.4),0_1px_3px_rgba(0,0,0,0.08)] transition duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#973727]"
                    onClick={handleMultiCancelClick}
                  >
                    Hủy đơn hàng
                  </button>
                  <button
                    className="transform rounded-md bg-[#006532] px-2 py-1 text-sm text-white shadow-[0_4px_6px_rgba(0,0,0,0.4),0_1px_3px_rgba(0,0,0,0.08)] transition duration-300 ease-in-out hover:-translate-y-1 hover:bg-[#00572b]"
                    onClick={handleMultiDeliveredClick}
                  >
                    Đã giao hàng
                  </button>
                </div>
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
                <option value="Đang kiểm hàng">Đang kiểm hàng</option>
                <option value="Chờ giao hàng">Chờ giao hàng</option>
                <option value="Đang vận chuyển">Đang vận chuyển</option>
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
                <th className="hidden py-3 pr-3 text-left lg:table-cell">
                  Tình trạng trong kho{" "}
                  <FaSort
                    className="ml-1 inline cursor-pointer"
                    onClick={() => requestSort("statusProduct")}
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

                  <td className="hidden py-3 pr-3 text-left lg:table-cell">
                    <p
                      className={`rounded-md text-center ${
                        or.order.statusProduct === "Thiếu hàng"
                          ? "bg-[#cf4631] text-white xl:w-40"
                          : "bg-[#006532] text-white"
                      }`}
                    >
                      {or.order.statusProduct}
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
                      <button
                        onClick={() => {
                          setOrderToCancel(or);
                          setShowConfirmCancel(true);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <MdOutlineCancel size={18} />
                      </button>
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
                {currentOrder.order.employee?.lastName}
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
                {formatDateTime(currentOrder.order.updatedAt)}{" "}
              </p>
              <p className="text-black">
                <strong>Thời gian đặt hàng:</strong>{" "}
                {formatDateTime(currentOrder.order.createdAt)}{" "}
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
                <strong>Mã đơn hàng:</strong>{" "} {currentOrder.order.order_code}
              </p>
              <p className="text-black">
                <strong>Nhân viên:</strong>{" "}{currentOrder.order.employee?.firstName}{" "}
                {currentOrder.order.employee?.lastName}
              </p>
              <p className="text-black">
                <strong>Khách hàng:</strong> {" "}{currentOrder.order.user.firstName}{" "}
                {currentOrder.order.user.lastName}
              </p>
              <p className="text-black">
                <strong>Địa chỉ:</strong>{" "} {currentOrder.order.location.address}
              </p>
              <p className="text-black">
                <strong>Số điện thoại:</strong>{" "}
                {currentOrder.order.location.phone}
              </p>
              <p className="text-black">
                <strong>Tổng tiền:</strong>{" "} {currentOrder.order.total_price}
              </p>
              <p className="text-black">
                <strong>Phương thức thanh toán:</strong>{" "}
                {currentOrder.order.payment_method}
              </p>
              <p className="text-black">
                <strong>Thời gian cập nhật:</strong>{" "}
                {currentOrder.order.updatedAt
                  ? ` ${formatDateTime(currentOrder.order.updatedAt)} `
                  : ""}
              </p>
              <p className="text-black">
                <strong>Thời gian đặt hàng:</strong>{" "}
                {formatDateTime(currentOrder.order.createdAt)}
              </p>
              <div className="mt-6 flex space-x-4">
                <select
                  value={currentOrder.order.orderStatus}
                  onChange={(e) =>
                    setCurrentOrder({
                      ...currentOrder,
                      order: {
                        ...currentOrder.order,
                        orderStatus: e.target.value,
                      },
                    })
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
                  value={currentOrder.order.paymentStatus}
                  onChange={(e) =>
                    setCurrentOrder({
                      ...currentOrder,
                      order: {
                        ...currentOrder.order,
                        paymentStatus: e.target.value,
                      },
                    })
                  }
                  className="mb-4 w-full rounded-lg border border-green-500 bg-gray-100 px-4 py-2 hover:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Tất cả</option>
                  <option value="Đã thanh toán">Đã thanh toán</option>
                  <option value="Chưa thanh toán">Chưa thanh toán</option>
                  <option value="Nợ">Nợ</option>
                </select>
                <select
                 value={currentOrder.order.employee?.id || ""}
                  onClick={fetchEmployees} 
                  onChange={(e) =>
                    setCurrentOrder({
                      ...currentOrder,
                      order: {
                        ...currentOrder.order,
                        employee: {
                            ...currentOrder.order.employee,
                            id: e.target.value, // Đặt giá trị mới cho `employee.id`
                          },
                      },
                    })
                  }
                  className="mb-4 w-full rounded-lg border border-green-500 bg-gray-100 px-4 py-2 hover:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option>Chọn nhân viên</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </select>
              </div>

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
         
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSaveUpdate}
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
        {showConfirmCancel && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="shadow-lg rounded-lg bg-white p-6">
              <h2 className="mb-4 text-2xl font-semibold text-gray-600">
                Xác nhận hủy
              </h2>
              <p>Bạn có chắc chắn muốn hủy đơn này không?</p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowConfirmCancel(false)}
                  className="mr-2 rounded bg-gray-300 px-4 py-2 font-bold text-gray-800 hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleCancelOrder(orderToCancel)}
                  className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
        {showConfirmPopupMulti && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="shadow-lg rounded bg-white p-6">
              <h2 className="mb-4 text-xl text-[#006532]">
                Bạn có chắc chắn muốn hủy các đơn hàng này?
              </h2>
              <div className="flex justify-end">
                <button
                  onClick={cancelMultiCancel}
                  className="mr-2 rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmMultiCancel}
                  className="rounded bg-[#006532] px-4 py-2 text-white hover:bg-[#246d49]"
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        )}
        {showConfirmPopupConfirmed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="shadow-lg rounded bg-white p-6">
              <h2 className="mb-4 text-xl text-[#006532]">
                Bạn có muốn xác nhận các đơn hàng này?
              </h2>
              <div className="flex justify-end">
                <button
                  onClick={cancelMultiConfirmed}
                  className="mr-2 rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmMultiConfirmed}
                  className="rounded bg-[#006532] px-4 py-2 text-white hover:bg-[#246d49]"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
        {showConfirmPopupInTransit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="shadow-lg rounded bg-white p-6">
              <h2 className="mb-4 text-xl text-[#006532]">
                Bạn có muốn giao các đơn hàng này?
              </h2>
              <div className="flex justify-end">
                <button
                  onClick={cancelMultiInTransit}
                  className="mr-2 rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmMultiInTransit}
                  className="rounded bg-[#006532] px-4 py-2 text-white hover:bg-[#246d49]"
                >
                  Xác nhận giao
                </button>
              </div>
            </div>
          </div>
        )}
        {showConfirmPopupDelivered && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="shadow-lg rounded bg-white p-6">
              <h2 className="mb-4 text-xl text-[#006532]">
                Bạn có muốn xác nhận đã giao các đơn hàng này?
              </h2>
              <div className="flex justify-end">
                <button
                  onClick={cancelMultiDelivered}
                  className="mr-2 rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmMultiDelivered}
                  className="rounded bg-[#006532] px-4 py-2 text-white hover:bg-[#246d49]"
                >
                  Xác nhận đã giao
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-center">
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
        </div>
      </div>
    </div>
  );
};

export default ManageOrder;
