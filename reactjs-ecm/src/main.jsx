import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import Home from "./components/HomePages/home-page.jsx";
import ProductDetail from "./components/ProductDetails/product-detail.jsx";
import "./index.css";
import Cart from "./components/Cart/Cart.jsx";
import RegisterForm from "./components/Register/register.jsx";
import LoginForm from "./components/Login/login.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OTPPage from "./components/OTP/otp.jsx";
import ShopGrid from "./components/ShopGrid/shop-grid.jsx";
import OrderHistory from "./components/OrderHistory/order-history.jsx";
import OrderSuccess from "./components/OrderSuccess/order-success.jsx";
import ManageCategory from "./components/Admin/ManageCategory/manage-category.jsx";
import ManageOrder from "./components/Admin/ManageOrder/manage-order.jsx";
import ManageProduct from "./components/Admin/ManageProduct/manage-product.jsx";
import ManageUser from "./components/Admin/ManageUser/manage-user.jsx";

import Report from "./components/Admin/Report/report.jsx";
import ManageSupplier from "./components/Admin/ManageSupplier/manage-supplier.jsx";
import Checkout from "./components/Checkout/checkout.jsx";
import ShipOrder from "./components/Shipping/ship-order.jsx";
import ShipHistory from "./components/Shipping/ship-history.jsx";
import OrderDetails from "./components/OrderDetails/order-details";
import NotificationsPage from "./components/Notification/notification.jsx";
import ManageImport from "./components/Admin/Import/manage-import.jsx";
import UserProfile from "./components/ProfileUser/profile-user.jsx";
import ManageOrderComplete from "./components/Admin/ManageOrder/manage-order-complete.jsx";
import ChangePassword from "./components/ProfileUser/change-password.jsx";
import "react-toastify/dist/ReactToastify.css";
import { CartProvider } from "./Context/CartContext.jsx";
import { NotificationProvider } from "./components/Notification/NotificationProvider.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

const queryClient = new QueryClient();

const rootElement = document.getElementById("root");
rootElement.style.width = "100%";
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route
            path="*"
            element={
              <CartProvider>
                <Routes>
                  <Route
                    path="*"
                    element={<Navigate to="/home-page" replace />}
                  />
                  <Route path="/register" element={<RegisterForm />} />
                  <Route path="/otp" element={<OTPPage />} />
                  <Route path="/login" element={<LoginForm />} />
                  <Route
                    path="/ship-order"
                    element={
                      <PrivateRoute allowedRoles={["employee"]}>
                        <ShipOrder />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/ship-history"
                    element={
                      <PrivateRoute allowedRoles={["employee"]}>
                        <ShipHistory />
                      </PrivateRoute>
                    }
                  />
                  <Route path="/home-page" element={<Home />} />
                  <Route
                    path="/product/search/:page/:limit"
                    element={<ShopGrid />}
                  />
                  <Route
                    path="/product-detail/:productId"
                    element={<ProductDetail />}
                  />
                  <Route
                    path="/cart"
                    element={
                      <PrivateRoute allowedRoles={["user"]}>
                        <Cart />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/order-success"
                    element={
                      <PrivateRoute allowedRoles={["user"]}>
                        <OrderSuccess />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/order-details"
                    element={
                      <PrivateRoute allowedRoles={["user"]}>
                        <OrderDetails />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <PrivateRoute allowedRoles={["user"]}>
                        <Checkout />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/user/:userId"
                    element={
                      <PrivateRoute allowedRoles={["user"]}>
                        <UserProfile />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/change-password/:userId"
                    element={
                      <PrivateRoute allowedRoles={["user"]}>
                        <ChangePassword />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/order-history/:userId"
                    element={
                      <PrivateRoute allowedRoles={["user"]}>
                        <OrderHistory />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </CartProvider>
            }
          />
          <Route
            path="/admin/*"
            element={
              <NotificationProvider>
                <Routes>
                  <Route
                    path="/manage-category/:page/:limit"
                    element={
                      <PrivateRoute allowedRoles={["admin"]}>
                        <ManageCategory />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/manage-order/:currentPage/:ordersPerPage"
                    element={
                      <PrivateRoute allowedRoles={["admin"]}>
                        <ManageOrder />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/manage-order-complete/:currentPage/:ordersPerPage"
                    element={
                      <PrivateRoute allowedRoles={["admin"]}>
                        <ManageOrderComplete />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/manage-import/:currentPage/:usersPerPage"
                    element={
                      <PrivateRoute allowedRoles={["admin"]}>
                        <ManageImport />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/manage-product/:currentPage/:productsPerPage"
                    element={
                      <PrivateRoute allowedRoles={["admin"]}>
                        <ManageProduct />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/manage-user/:currentPage/:usersPerPage"
                    element={
                      <PrivateRoute allowedRoles={["admin"]}>
                        <ManageUser />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute allowedRoles={["admin"]}>
                        <Report />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/manage-supplier/:page/:limit"
                    element={
                      <PrivateRoute allowedRoles={["admin"]}>
                        <ManageSupplier />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/test-notification"
                    element={
                      <PrivateRoute allowedRoles={["admin"]}>
                        <NotificationsPage />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </NotificationProvider>
            }
          />
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
