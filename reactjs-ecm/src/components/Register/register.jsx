import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { REGEX } from "../../constants/regex";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../../services/custom-auth-api";

const schema = z
  .object({
    firstName: z.string().min(2, "Họ min = 2").max(20, "Họ max = 20"),
    lastName: z.string().min(2, "Tên min = 2").max(20, "Tên max = 20"),
    email: z.string().email("Email không hợp lệ"),
    phone: z.string().regex(REGEX.phoneNumber, "Số điện thoại không hợp lệ"),
    password: z.string(),
    confirmPass: z.string(),
    address: z.string().min(2, "Địa chỉ min = 2").max(50, "Địa chỉ max = 50"),
  })
  .refine((data) => data.password === data.confirmPass, {
    message: "Mật khẩu không khớp",
    path: ["confirmPass"],
  });

function RegisterForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPass: "",
      address: "",
    },
    mode: "onBlur",
    resolver: zodResolver(schema),
  });

  const { mutate } = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post("/register", data);
      console.log("response", response);
      return response.data;
    },
    onSuccess: (response) => {
      console.log("response", response);
      if (response && response.success === true) {
        alert("Vui lòng kiểm tra Email nhận OTP");
        navigate("/otp", { state: { email } });
      }
    },
    onError: (error) => {
      console.error("Error:", error.response ? error.response.data : error);
    },
  });

  const [email, setEmail] = useState("");

  const onSubmit = (data) => {
    const { confirmPass, ...registerData } = data; // Loại bỏ confirmPass
    setEmail(registerData.email);
    mutate(registerData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="shadow-lg mx-2 my-2 w-full max-w-lg overflow-hidden rounded-lg bg-white">
        <div className="bg-[#006532] p-6 text-white">
          <h2 className="text-2xl font-semibold">
            Đăng ký
            <span className="mt-2 block h-1 w-24 bg-gradient-to-r from-[#f37a65] to-[#d64141]" />
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="mb-1 block font-medium">
                Họ
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                placeholder="Nhập họ của bạn"
                {...register("firstName")}
                className="duration-120 shadow-sm focus:shadow-lg h-11 w-full rounded-md border-none bg-gray-100 pl-3 text-base outline-none transition-all ease-out focus:ring-2 focus:ring-[#006532]"
              />
              {errors.firstName && (
                <span className="text-red-500">{errors.firstName.message}</span>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="mb-1 block font-medium">
                Tên
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                placeholder="Nhập tên của bạn"
                {...register("lastName")}
                className="duration-120 shadow-sm focus:shadow-lg h-11 w-full rounded-md border-none bg-gray-100 pl-3 text-base outline-none transition-all ease-out focus:ring-2 focus:ring-[#006532]"
              />
              {errors.lastName && (
                <span className="text-red-500">{errors.lastName.message}</span>
              )}
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block font-medium">
                Email
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                placeholder="Nhập email của bạn"
                {...register("email")}
                className="duration-120 shadow-sm focus:shadow-lg h-11 w-full rounded-md border-none bg-gray-100 pl-3 text-base outline-none transition-all ease-out focus:ring-2 focus:ring-[#006532]"
              />
              {errors.email && (
                <span className="text-red-500">{errors.email.message}</span>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block font-medium">
                Số điện thoại
                <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                placeholder="Nhập số điện thoại của bạn"
                {...register("phone")}
                className="duration-120 shadow-sm focus:shadow-lg h-11 w-full rounded-md border-none bg-gray-100 pl-3 text-base outline-none transition-all ease-out focus:ring-2 focus:ring-[#006532]"
              />
              {errors.phone && (
                <span className="text-red-500">{errors.phone.message}</span>
              )}
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block font-medium">
                Mật khẩu
                <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                placeholder="Nhập mật khẩu của bạn"
                {...register("password")}
                className="duration-120 shadow-sm focus:shadow-lg h-11 w-full rounded-md border-none bg-gray-100 pl-3 text-base outline-none transition-all ease-out focus:ring-2 focus:ring-[#006532]"
              />
              {errors.password && (
                <span className="text-red-500">{errors.password.message}</span>
              )}
            </div>
            <div>
              <label htmlFor="address" className="mb-1 block font-medium">
                Địa chỉ
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                placeholder="Nhập địa chỉ của bạn"
                {...register("address")}
                className="duration-120 shadow-sm focus:shadow-lg h-11 w-full rounded-md border-none bg-gray-100 pl-3 text-base outline-none transition-all ease-out focus:ring-2 focus:ring-[#006532]"
              />
              {errors.address && (
                <span className="text-red-500">{errors.address.message}</span>
              )}
            </div>
            <div>
              <label htmlFor="confirmPass" className="mb-1 block font-medium">
                Xác nhận mật khẩu
                <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPass"
                placeholder="Xác nhận mật khẩu của bạn"
                {...register("confirmPass")}
                className="duration-120 shadow-sm focus:shadow-lg h-11 w-full rounded-md border-none bg-gray-100 pl-3 text-base outline-none transition-all ease-out focus:ring-2 focus:ring-[#006532]"
              />
              {errors.confirmPass && (
                <span className="text-red-500">
                  {errors.confirmPass.message}
                </span>
              )}
            </div>
          </div>
          <div className="p-6">
            <input
              type="submit"
              value="Đăng ký"
              className="shadow-md h-11 w-full cursor-pointer rounded-md bg-[#006532] font-medium tracking-wide text-white transition-all duration-300 ease-in-out hover:bg-[#004d26] disabled:bg-gray-300"
            />
          </div>
        </form>

        <div className="pb-6 pl-6 pr-6">
          <span className="text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="font-medium text-[#006532] underline hover:font-bold"
            >
              Đăng nhập
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
