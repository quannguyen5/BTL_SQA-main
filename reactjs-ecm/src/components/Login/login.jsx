import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../../services/auth-api";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  NotificationList,
  notificationTypes,
  showNotification,
} from "../Notification/NotificationService";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string(),
});

function LoginForm() {
  const [notifications, setNotifications] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
    resolver: zodResolver(schema),
  });

  const { mutate } = useMutation({
    mutationFn: async (data) => {
      const response = await loginApi(data);
      return response;
    },
    onSuccess: (response) => {
      if (response && response.success === true) {
        localStorage.setItem(
          "token",
          JSON.stringify(response?.data.accessToken),
        );

        // Lưu userId vào localStorage
        localStorage.setItem("userId", JSON.stringify(response?.data.user.id));

        localStorage.setItem("role", JSON.stringify(response?.data.user.role));

        const role = response?.data.user.role;
        console.log("role", role);

        if (role === "admin") {
          sessionStorage.setItem(
            "notification",
            JSON.stringify({
              message: "Đăng nhập thành công! Chào mừng bạn trở lại.",
              type: notificationTypes.SUCCESS,
            }),
          );
          window.location.href = "/admin/dashboard";
        } else if (role === "user") {
          sessionStorage.setItem(
            "notification",
            JSON.stringify({
              message: "Đăng nhập thành công! Chào mừng bạn trở lại.",
              type: notificationTypes.SUCCESS,
            }),
          );
          window.location.href = "/";
        } else {
          sessionStorage.setItem(
            "notification",
            JSON.stringify({
              message: "Đăng nhập thành công! Chào mừng bạn trở lại.",
              type: notificationTypes.SUCCESS,
            }),
          );
          window.location.href = "/employee";
        }
      } else {
        showNotification(
          "Đăng nhập thất bại! Kiểm tra lại thông tin.",
          notificationTypes.ERROR,
          setNotifications,
        );
      }
    },
    onError: (error) => {
      console.log("Login failed:", error);
    },
  });

  const onSubmit = (data) => {
    mutate(data);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="shadow-lg mx-2 my-2 w-full max-w-lg overflow-hidden rounded-lg bg-white">
        <div className="bg-[#006532] p-6">
          <p className="relative text-2xl font-medium text-white">
            Đăng nhập
            <span className="absolute bottom-0 left-0 h-0.5 w-8 bg-gradient-to-r from-[#f37a65] to-[#d64141]" />
          </p>
        </div>
        {/* Hiển thị các thông báo */}
        <NotificationList notifications={notifications} />

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="flex flex-wrap justify-between gap-5">
            <div className="mb-3 w-full">
              <label htmlFor="email" className="mb-1 block font-medium">
                Email
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="email"
                placeholder="Nhập email của bạn"
                {...register("email")}
                className="duration-120 shadow-sm focus:shadow-lg h-11 w-full rounded-md border-none bg-gray-100 pl-3 text-base outline-none transition-all ease-out focus:ring-2 focus:ring-[#006532]"
              />
              {errors.email && (
                <span className="text-red-500">{errors.email.message}</span>
              )}
            </div>

            <div className="mb-3 w-full relative">
              <label htmlFor="password" className="mb-1 block font-medium">
                Mật khẩu
                <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Nhập mật khẩu của bạn"
                {...register("password")}
                className="duration-120 shadow-sm focus:shadow-lg h-11 w-full rounded-md border-none bg-gray-100 pl-3 pr-10 text-base outline-none transition-all ease-out focus:ring-2 focus:ring-[#006532]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-12 transform -translate-y-1/2 flex items-center text-gray-500"
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5" />
                ) : (
                  <FaEye className="h-5 w-5" />
                )}
              </button>
              {errors.password && (
                <span className="text-red-500">{errors.password.message}</span>
              )}
            </div>
          </div>

          <div className="p-6">
            <input
              type="submit"
              value="Đăng nhập"
              className={`shadow-md h-11 w-full cursor-pointer rounded-md bg-[#006532] font-medium tracking-wide text-white transition-all duration-300 ease-in-out hover:bg-[#004d26] disabled:bg-gray-300`}
            />
          </div>
        </form>

        <div className="pb-6 pl-6 pr-6">
          <span className="text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-medium text-[#006532] underline hover:font-bold"
            >
              Đăng ký
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
