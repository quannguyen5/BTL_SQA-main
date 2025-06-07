import React, { useEffect, useState } from "react";
import Header from "../Header/header";
import Footer from "../Footer/footer";
import { useCart } from "../../Context/CartContext";
import { useLocation, useNavigate } from "react-router-dom";
import { getOrderDetails } from "../../services/order-service";
import { getUserId } from "../../util/auth-local";

const OrderDetails = () => {
  const location = useLocation();
  const { orderId } = location.state || {};
  console.log("orderId", orderId);

  const [orderDetails, setOrderDetails] = useState([]);

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const userId = getUserId();

  const { selectedCartItems } = useCart();

  console.log("selectedCartItems", selectedCartItems);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await getOrderDetails(orderId);
        console.log("response", response);

        const item = response.data;

        // Lặp qua từng sản phẩm trong orderProducts để xử lý url_images
        item.orderProducts.forEach((product) => {
          let urlImages = {};

          // Kiểm tra nếu url_images có giá trị hợp lệ trong product
          if (product.product.url_images) {
            const cleanedUrlImages = product.product.url_images.replace(
              /\\\"/g,
              '"',
            );
            try {
              urlImages = JSON.parse(cleanedUrlImages);
            } catch (error) {
              console.error("Error parsing url_images:", error);
              urlImages = {};
            }
          }

          // Cập nhật các trường url_image1 và url_image2 cho product.product
          product.product.url_image1 = urlImages.url_images1 || "";
          product.product.url_image2 = urlImages.url_images2 || "";
        });

        console.log("data", item);
        setOrderDetails(item); // Đặt dữ liệu đơn hàng đã được xử lý vào state
      } catch (error) {
        console.error("Failed to fetch order details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const calculateTotal = (products) => {
    if (!products) return 0;
    return products.reduce(
      (total, product) => total + product.priceout * product.quantity,
      0,
    );
  };

  {
    console.log("orderDetails", orderDetails);
  }
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const time = date.toLocaleTimeString("vi-VN", { hour12: false });
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    return `${formattedDate} ${time}`;
  };
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="container mx-auto p-6 md:p-12">
        <div className="shadow-lg rounded-lg border border-gray-200 bg-white p-8 md:p-16">
          <h2 className="mb-6 text-3xl font-bold text-[#006532]">
            Chi tiết đặt hàng
          </h2>

          {/* Thông tin đơn hàng */}
          <div className="mb-8">
            <p className="text-lg text-gray-700">
              Mã đơn hàng:{" "}
              <span className="font-semibold">{orderDetails.order_code}</span>
            </p>
            <p className="text-lg text-gray-700">
              Ngày đặt hàng:{" "}
              <span className="font-semibold">
                {formatDateTime(orderDetails.createdAt)}{" "}
              </span>
            </p>
            <p className="text-lg text-gray-700">
              Họ và tên:{" "}
              <span className="font-semibold">
                {orderDetails.location.name}
              </span>
            </p>
            <p className="text-lg text-gray-700">
              Địa chỉ:{" "}
              <span className="font-semibold">
                {orderDetails.location.address}
              </span>
            </p>
            <p className="text-lg text-gray-700">
              Số điện thoại:{" "}
              <span className="font-semibold">
                {orderDetails.location.phone}
              </span>
            </p>
            <p className="text-lg text-gray-700">
              Phương thức thanh toán:{" "}
              <span className="font-semibold">
                {orderDetails.payment_method}
              </span>
            </p>
            <p className="text-lg text-gray-700">
              Trạng thái giao hàng:{" "}
              <span className="font-semibold">{orderDetails.orderStatus}</span>
            </p>
          </div>

          {/* Danh sách sản phẩm */}
          <h3 className="mb-4 text-2xl font-semibold text-gray-800">
            Sản phẩm
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {orderDetails.orderProducts.map((product) => (
              <div
                key={product.id}
                className="shadow-lg flex items-center space-x-4 rounded-lg border border-gray-200 bg-white p-4"
              >
                <img
                  src={product.product.url_image1}
                  alt={product.product.name}
                  className="h-24 w-24 rounded-lg"
                />
                <div>
                  <h4 className="text-lg font-semibold text-[#006532]">
                    {product.product.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Số lượng: {product.quantity}
                  </p>
                  <p className="text-sm text-gray-500">Bao: 30kg</p>
                  <p className="text-sm font-medium text-gray-700">
                    <div className="flex gap-1">
                      <div>Đơn giá:</div>
                      <h4 className="flex gap-1">
                        <p className="underline">đ</p>
                        {new Intl.NumberFormat("vi-VN").format(
                          product.priceout,
                        )}
                      </h4>
                    </div>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tóm tắt thanh toán */}
          <div className="shadow-lg mt-6 rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between border-b pb-2 text-gray-700">
              <span>Tổng tiền hàng</span>

              <span>
                <span className="underline">đ</span>{" "}
                {new Intl.NumberFormat("vi-VN").format(
                  calculateTotal(orderDetails.orderProducts),
                )}
              </span>
            </div>
            <div className="mb-2 flex items-center justify-between border-b pb-2 text-gray-700">
              <span>Tổng tiền phí vận chuyển</span>
              <span>
                <span className="underline">đ</span> 0
              </span>
            </div>
            <div className="flex items-center justify-between text-lg font-semibold text-[#006532]">
              <span>Tổng thanh toán</span>
              <span>
                <span className="underline">đ</span>{" "}
                {new Intl.NumberFormat("vi-VN").format(
                  calculateTotal(orderDetails.orderProducts),
                )}
              </span>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate(`/order-history/${userId}`)}
              className="w-full rounded-lg bg-[#006532] px-4 py-2 text-center text-white hover:bg-[#004721] md:w-auto"
            >
              Lịch sử đơn hàng
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderDetails;
