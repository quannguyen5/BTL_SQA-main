import React, { useState } from "react";
import Header from "../Header/header";
import Footer from "../Footer/footer";
import { PiShoppingCart } from "react-icons/pi";
const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const handlePaymentChange = (method) => {
    setPaymentMethod(method);
  };

  const products = [
    {
      id: 1,
      name: "Orange Printed Tshirt",
      quantity: 2,
      price: 78.0,
      size: "M",
      imgSrc: "./images/product/262.png",
    },
    {
      id: 2,
      name: "Orange Printed Tshirt",
      quantity: 1,
      price: 78.0,
      size: "L",
      imgSrc: "./images/product/264.png",
    },
    {
      id: 3,
      name: "Orange Printed Tshirt",
      quantity: 3,
      price: 78.0,
      size: "S",
      imgSrc: "./images/product/266.png",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <section
        id="page-header"
        className="h-52"
        style={{
          backgroundImage: `url("images/banner/image-4.jpg")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="flex h-full w-full flex-col items-center justify-center bg-[rgba(8,28,14,0.69)] text-center">
          <h2 className="text-2xl font-bold text-white">CHECKOUT</h2>
          <p className="text-white"></p>
          <a href="#" className="to-top">
            <i className="fas fa-chevron-up"></i>
          </a>
        </div>
      </section>

      <div className="container mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Sản phẩm */}
          <div className="order-1">
            <h3 className="mb-6 text-2xl font-semibold text-gray-800">
              Your Order
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="shadow-lg flex items-center space-x-4 rounded-lg border border-gray-200 bg-white p-4"
                >
                  <img
                    src={product.imgSrc}
                    alt={product.name}
                    className="h-24 w-24 rounded-lg"
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-[#006532]">
                      {product.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Quantity: {product.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      Size: {product.size}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      Price: ${product.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="shadow-lg mt-6 rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between border-b pb-2 text-gray-700">
                <span>Subtotal</span>
                <span>$234.00</span>
              </div>
              <div className="mb-2 flex items-center justify-between border-b pb-2 text-gray-700">
                <span>Delivery Fee</span>
                <span>$35.00</span>
              </div>
              <div className="flex items-center justify-between text-lg font-semibold text-[#006532]">
                <span>Total</span>
                <span>$269.00</span>
              </div>
            </div>
          </div>

          {/* Địa chỉ giao hàng và phương thức thanh toán */}
          <div className="order-2">
            <h3 className="mb-6 text-2xl font-semibold text-gray-800">
              Shipping Address
            </h3>
            <form className="shadow-lg space-y-4 rounded-lg border border-gray-200 bg-white p-6">
              {["Full Name", "Address", "City", "Country", "Phone"].map(
                (label, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-gray-700">
                      {label}
                    </label>
                    <input
                      type="text"
                      className="shadow-sm mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-green-600 focus:ring-green-600"
                    />
                  </div>
                ),
              )}
            </form>

            <div className="mt-8">
              <h3 className="mb-4 text-2xl font-semibold text-gray-800">
                Payment Method
              </h3>
              <div className="shadow-lg flex space-x-4 rounded-lg border border-gray-200 bg-white p-6">
                {["cash", "card"].map((method) => (
                  <button
                    key={method}
                    onClick={() => handlePaymentChange(method)}
                    className={`rounded border-2 border-[#006532] px-4 py-2 transition hover:bg-[#006532] hover:text-white ${
                      paymentMethod === method
                        ? "bg-[#006532] text-white"
                        : "bg-white text-gray-700 hover:bg-[#006532ca] hover:text-white"
                    }`}
                  >
                    {method === "cash"
                      ? "Cash on Delivery"
                      : "Credit/Debit Card"}
                  </button>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <button className="shadow-md w-full rounded-md border-2 border-[#006532] bg-[#006532] px-6 py-2 text-white transition hover:bg-[#006532ca] hover:text-white">
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section
        id="product1"
        className="mt-10 bg-[#f9f9f9] py-10 pt-10 text-center"
      >
        <div className="text-[46px] font-semibold leading-[54px] text-[#006532]">
          Newest Products
        </div>
        <div className="container mx-auto flex flex-wrap justify-evenly pt-5">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="pro ease relative m-4 w-1/5 min-w-[250px] cursor-pointer rounded-2xl border border-[#cce7d0] bg-white p-3 shadow-[20px_20px_30px_rgba(0,0,0,0.02)] transition duration-200 hover:shadow-[20px_20px_30px_rgba(0,0,0,0.06)]"
            >
              <img
                src="/images/products/262.png"
                alt={`Product ${index + 1}`}
                className="w-full rounded-xl"
              />
              <div className="des pt-3 text-start">
                <span className="text-[13px] text-[#1a1a1a]">Adidas</span>
                <h5 className="pt-2 text-[15px] font-semibold text-[#006532]">
                  Cotton shirts pure cotton
                </h5>
                <h5 className="pt-2 text-[13px] text-[#1a1a1a]">Bao: 20kg</h5>
                <h4 className="flex pt-2 text-[16px] font-semibold text-[#006532]">
                  <p className="mr-1 mt-[2px] text-sm font-normal underline">
                    đ
                  </p>
                  78000
                </h4>
              </div>
              <a
                href="#"
                className="cart absolute bottom-5 right-2 -mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#cce7d0] bg-[#e8f6ea] font-medium leading-10 text-[#006532]"
              >
                <PiShoppingCart />
              </a>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Payment;
