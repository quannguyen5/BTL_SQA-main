import { z } from "zod";
import { useForm } from "react-hook-form";
import { REGEX } from "../../constants/regex";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../../services/custom-auth-api";
import { paymentMOMO } from '../../services/payment-service'
import React, { useState, useEffect } from "react";
import Header from "../Header/header";
import Footer from "../Footer/footer";
import { PiShoppingCart } from "react-icons/pi";
import { getUserId } from "../../util/auth-local";
import {
  createNewAddress,
  createOrder,
  getAddresses,
} from "../../services/order-service";
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "../../constants/enums";
import {
  NotificationList,
  notificationTypes,
  showNotification,
} from "../Notification/NotificationService";
import { useCart } from "../../Context/CartContext";
import { deleteCartItems, getCarts } from "../../services/cart-service";

const schema = z.object({
  name: z.string().min(2, "Ít nhất 2 ký tự").max(20, "Nhiều nhất 20 ký tự"),
  address: z.string().min(2, "Địa chỉ min = 2").max(50, "Địa chỉ max = 50"),
  phone: z.string().regex(REGEX.phoneNumber, "Số điện thoại không hợp lệ"),
});

const Checkout = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      address: "",
      phone: "",
    },
    mode: "onBlur",
    resolver: zodResolver(schema),
  });

  const { mutate } = useMutation({
    mutationFn: async (data) => {
      // call api thêm địa chỉ mới
      const response = await createNewAddress(data);
      console.log("resAdd", response);
      return response.data;
    },
    onSuccess: (response) => {
      if (response && response.success === true) {
        setShowModal(false);
        alert("Địa chỉ và số điện thoại đã được thêm!");
        window.location.reload();
      }
    },
    onError: (error) => {
      console.error("Error:", error);
    },
  });

  const onSubmit = (data) => {
    mutate(data);
  };

  const navigate = useNavigate();

  const { setCarts, selectedCartItems, setTotalQuantity } = useCart();

  console.log("selectedarrtItem", selectedCartItems);
  // useEffect(() => {
  //   if (selectedCartItems.length === 0) {
  //     navigate("/cart");
  //   }
  // }, [selectedCartItems]);

  const [nameUser, setNameUser] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(
    "Thanh toán khi nhận hàng",
  );
  const [addresses, setAddresses] = useState([]); // Để lưu danh sách địa chỉ
  const [showModal, setShowModal] = useState(false); // Hiển thị popup

  const totalCost = selectedCartItems.reduce(
    (sum, cart) => sum + cart.product.priceout * cart.quantity,
    0,
  );

  const [selectedLocationId, setSelectedLocationId] = useState("");

  const [notifications, setNotifications] = useState([]);

  const handlePaymentChange = (method) => {
    setPaymentMethod(method);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const addressResponse = await getAddresses();
        setAddresses(addressResponse.data.data.data); // Lưu danh sách địa chỉ vào state

        // Lọc tên địa chỉ và số điện thoại của địa chỉ có default_location = true
        const defaultLocation = addressResponse.data.data.data.find(
          (location) => location.default_location === true,
        );
        setNameUser(defaultLocation?.name || "");
        setAddress(defaultLocation?.address || "");
        setPhone(defaultLocation?.phone || "");
        setSelectedLocationId(defaultLocation?.id || "");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Hàm xử lý chọn địa chỉ
  const handleAddressChange = (selectedAddress) => {
    setNameUser(selectedAddress.name);
    setAddress(selectedAddress.address);
    setPhone(selectedAddress.phone);
    setSelectedLocationId(selectedAddress.id); // Cập nhật ID địa chỉ được chọn
    setShowModal(false); // Đóng popup sau khi chọn địa chỉ
  };

  // Hàm xử lý đặt hàng
  // const handleOrder = async () => {
  //   let userId = getUserId();

  //   const orderData = {
  //     totalPrice: totalCost,
  //     paymentMethod:
  //       paymentMethod === PaymentMethod.CashOnDelivery
  //         ? PaymentMethod.CashOnDelivery
  //         : PaymentMethod.BankTransfer,
  //     user_id: userId,
  //     location_id: selectedLocationId,
  //     orderStatus: OrderStatus.Checking,
  //     paymentStatus: PaymentStatus.Unpaid,
  //     products: selectedCartItems.map((cart) => ({
  //       product_id: cart.product.id,
  //       quantity: cart.quantity,
  //       priceout: cart.product.priceout,
  //     })),
  //   };

  //   try {
  //     const response = await createOrder(orderData);

  //     if (response.data.data.total_price > 0) {
  //       // Lấy danh sách cart_ids từ sản phẩm đã chọn
  //       const cartIds = selectedCartItems.map((cart) => cart.id);

  //       // Gọi API để xóa sản phẩm trong giỏ hàng
  //       await deleteCartItems(cartIds);

  //       const res = await getCarts();
  //       const cartData = res.data.data.cart;

  //       setCarts(cartData);
  //       // clearSelectedCartItems();

  //       setTotalQuantity(res.data.data.total);
  //       console.log("response.orderId", response.data.data.id);
  //       navigate("/order-success", {
  //         state: { orderId: response.data.data.id },
  //       });
  //     } else {
  //       showNotification(
  //         "Lỗi thanh toán! Vui lòng thử lại.",
  //         notificationTypes.ERROR,
  //         setNotifications,
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Lỗi khi đặt hàng:", error);
  //   }
  // };

  const handleOrder = async () => {
    if (paymentMethod === "Thanh toán khi nhận hàng") {
      let userId = getUserId();

      const orderData = {
        totalPrice: totalCost,
        paymentMethod:
          paymentMethod === PaymentMethod.CashOnDelivery
            ? PaymentMethod.CashOnDelivery
            : PaymentMethod.BankTransfer,
        user_id: userId,
        location_id: selectedLocationId,
        orderStatus: OrderStatus.Checking,
        paymentStatus: PaymentStatus.Unpaid,
        products: selectedCartItems.map((cart) => ({
          product_id: cart.product.id,
          quantity: cart.quantity,
          priceout: cart.product.priceout,
        })),
      };

      try {
        const res = await createOrder(orderData);
        console.log("res", res);
        if (res.data.data.total_price > 0) {
          // Lấy danh sách cart_ids từ sản phẩm đã chọn
          const cartIds = selectedCartItems.map((cart) => cart.id);

          // Gọi API để xóa sản phẩm trong giỏ hàng
          await deleteCartItems(cartIds);

          const response = await getCarts();
          const cartData = response.data.data.cart;

          setCarts(cartData);
          const quantity = response.data.data.total;
          setTotalQuantity(quantity);
          console.log("response.orderId", res.data.data.id);
          navigate("/order-success", {
            state: { orderId: res.data.data.id },
          });
        } else {
          showNotification(
            "Lỗi thanh toán! Vui lòng thử lại.",
            notificationTypes.ERROR,
            setNotifications,
          );
        }
      } catch (error) {
        console.error("Lỗi khi đặt hàng:", error);
      }
    }
    else if (paymentMethod === "Thanh toán qua MOMO") {
      let userId = getUserId();
      const paymentData = {
        order: {
          totalPrice: totalCost,
          paymentMethod:
            paymentMethod === PaymentMethod.CashOnDelivery
              ? PaymentMethod.CashOnDelivery
              : PaymentMethod.BankTransfer,
          user_id: userId,
          location_id: selectedLocationId,
          orderStatus: OrderStatus.Checking,
          paymentStatus: PaymentStatus.Unpaid,
          products: selectedCartItems.map((cart) => ({
            product_id: cart.product.id,
            quantity: cart.quantity,
            priceout: cart.product.priceout,
          })),
        },
        amount: totalCost,
        redirectUrl: "http://localhost:5173/order-success",
        ipnUrl: "https://6f6e-42-1-70-244.ngrok-free.app/momo/callback-payment"
      }
      const response = await paymentMOMO(paymentData);

      if (response.data.payment.message === 'Thành công.') {

        const cartIds = selectedCartItems.map((cart) => cart.id);
        await deleteCartItems(cartIds);
        const res = await getCarts();
        const cartData = res.data.data.cart;

        setCarts(cartData);
        setTotalQuantity(res.data.data.total);

        localStorage.setItem("orId", response.data.order.id);
        console.log(localStorage.getItem("orId"));
        // navigate("/order-success");
        window.location.href = response.data.payment.shortLink;
      } else {
        console.error('Payment failed:', response.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <NotificationList notifications={notifications} />
      <section
        id="page-header"
        className="h-64"
        style={{
          backgroundImage: `url("images/checkout-banner.jpg")`,
          backgroundPosition: "center 20%",
          backgroundSize: "cover",
        }}
      >
        <div className="flex h-full w-full flex-col items-start justify-end bg-[rgba(8,28,14,0.60)] text-center">
          <div className="mb-10 ml-72 flex flex-col items-start justify-start border-l-[8px] border-[#2c7c54] pl-7">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-[#fff]">
              Đặt hàng
            </h2>
          </div>
        </div>
      </section>

      <div className="container mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Sản phẩm */}
          <div className="order-1">
            <h3 className="mb-6 text-2xl font-semibold text-gray-800">
              Đơn hàng của bạn
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {selectedCartItems.map((cart) => (
                <div
                  key={cart.id}
                  className="shadow-lg flex items-center space-x-4 rounded-lg border border-gray-200 bg-white p-4"
                >
                  <img
                    src={cart.product.url_image1}
                    alt={cart.product.name}
                    className="h-24 w-24 rounded-lg"
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-[#006532]">
                      {cart.product.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Số lượng: {cart.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      Bao: {cart.product.weight}kg
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      <div className="flex gap-1">
                        <div>Đơn giá:</div>
                        <h4 className="flex gap-1">
                          <p className="underline">đ</p>
                          {new Intl.NumberFormat("vi-VN").format(
                            cart.product.priceout,
                          )}
                        </h4>
                      </div>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="shadow-lg mt-6 rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between border-b pb-2 text-gray-700">
                <span>Tổng tiền hàng</span>
                <span>
                  <span className="underline">đ</span>{" "}
                  {new Intl.NumberFormat("vi-VN").format(totalCost)}
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
                  {new Intl.NumberFormat("vi-VN").format(totalCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Địa chỉ giao hàng và phương thức thanh toán */}
          <div className="order-2">
            <h3 className="mb-6 text-2xl font-semibold text-gray-800">
              Địa chỉ giao hàng
            </h3>
            <div className="shadow-lg space-y-4 rounded-lg border border-gray-200 bg-white p-6">
              {nameUser && address && phone ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={nameUser}
                      className="shadow-sm mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-green-600 focus:ring-green-600"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={address}
                      className="shadow-sm mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-green-600 focus:ring-green-600"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      value={phone}
                      className="shadow-sm mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-green-600 focus:ring-green-600"
                      readOnly
                    />
                  </div>
                </>
              ) : (
                <div className="text-gray-500">Chưa có địa chỉ giao hàng</div>
              )}

              {/* Nút thay đổi */}
              <button
                onClick={() => setShowModal(true)}
                className="text-sm text-green-600 hover:text-green-800"
              >
                Thay đổi
              </button>
            </div>
            <div className="mt-8">
              <h3 className="mb-4 text-2xl font-semibold text-gray-800">
                Phương thức thanh toán
              </h3>
              <div className="shadow-lg flex space-x-4 rounded-lg border border-gray-200 bg-white p-6">
                {["Thanh toán khi nhận hàng", "Thanh toán qua MOMO"].map(
                  (method) => (
                    <button
                      key={method}
                      onClick={() => handlePaymentChange(method)}
                      className={`rounded border-2 border-[#006532] px-4 py-2 transition hover:bg-[#006532] hover:text-white ${paymentMethod === method
                          ? "bg-[#006532] text-white"
                          : "bg-white text-gray-700 hover:bg-[#006532ca] hover:text-white"
                        }`}
                    >
                      {method === "Thanh toán khi nhận hàng"
                        ? "Thanh toán khi nhận hàng"
                        : "Thanh toán qua MOMO"}
                    </button>
                  ),
                )}
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleOrder}
                  className="shadow-md w-full rounded-md border-2 border-[#006532] bg-[#006532] px-6 py-2 text-white transition hover:bg-[#006532ca] hover:text-white"
                >
                  Đặt hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup để chọn địa chỉ */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="shadow-lg w-full max-w-lg rounded-lg bg-white p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-xl font-semibold text-gray-800">
              Chọn địa chỉ giao hàng
            </h3>
            {addresses.map((item) => (
              <div
                key={item.id}
                className="mb-2 flex items-center justify-between"
              >
                <div>
                  <p>{item.name}</p>
                  <p>{item.address}</p>
                  <p>{item.phone}</p>
                </div>
                <button
                  onClick={() => handleAddressChange(item)}
                  className="text-sm text-blue-600"
                >
                  Chọn
                </button>
              </div>
            ))}

            {/* Thêm địa chỉ mới với số điện thoại */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Thêm tên mới"
                  {...register("name")}
                  className="w-full rounded-md border border-gray-300 p-2"
                />
                {errors.name && (
                  <span className="text-red-500">{errors.name.message}</span>
                )}
                <input
                  type="text"
                  placeholder="Thêm địa chỉ mới"
                  {...register("address")}
                  className="mt-2 w-full rounded-md border border-gray-300 p-2"
                />
                {errors.address && (
                  <span className="text-red-500">{errors.address.message}</span>
                )}
                <input
                  type="text"
                  placeholder="Thêm số điện thoại"
                  {...register("phone")}
                  className="mt-2 w-full rounded-md border border-gray-300 p-2"
                />
                {errors.phone && (
                  <span className="text-red-500">{errors.phone.message}</span>
                )}
                <input
                  type="submit"
                  value="Thêm địa chỉ"
                  className="mt-2 w-full rounded-md bg-green-600 px-4 py-2 text-white"
                ></input>
              </div>
            </form>

            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md bg-red-600 px-4 py-2 text-white"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Checkout;
