import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../services/custom-auth-api";

function OTPPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [otpError, setOtpError] = useState("");

  const { email } = location.state || {};
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      otp: "",
    },
    mode: "onBlur",
  });

  const { mutate } = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.patch("/register", {
        email,
        otp: data.otp,
      });
      return response.data;
    },
    onSuccess: () => {
      alert("Đăng ký thành công!");
      navigate("/login");
    },
    onError: (error) => {
      setOtpError("OTP không hợp lệ. Vui lòng thử lại.");
    },
  });

  const onSubmit = (data) => {
    mutate(data);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="shadow-lg mx-2 my-2 w-full max-w-md overflow-hidden rounded-lg bg-white">
        <div className="bg-[#006532] p-6">
          <p className="relative text-2xl font-medium text-white">
            Xác minh OTP
            <span className="absolute bottom-0 left-0 h-0.5 w-16 bg-gradient-to-r from-[#f37a65] to-[#d64141]" />
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="mb-4">
            <label className="mb-1 block font-medium">Email đã đăng ký:</label>
            <p className="text-base font-semibold text-gray-900">{email}</p>
          </div>

          <div className="mb-4">
            <label htmlFor="otp" className="mb-1 block font-medium">
              Nhập OTP:
            </label>
            <input
              type="text"
              id="otp"
              placeholder="Nhập OTP"
              {...register("otp", { required: "OTP không hợp lệ" })}
              className="duration-120 shadow-sm focus:shadow-lg h-11 w-full rounded-md border-none bg-gray-100 pl-3 text-base outline-none transition-all ease-out focus:ring-2 focus:ring-[#006532]"
            />
            {errors.otp && (
              <span className="text-red-500">{errors.otp.message}</span>
            )}
            {otpError && <span className="text-red-500">{otpError}</span>}
          </div>

          <div>
            <input
              type="submit"
              value="Xác minh OTP"
              className="shadow-md h-11 w-full cursor-pointer rounded-md bg-[#006532] font-medium tracking-wide text-white transition-all duration-300 ease-in-out hover:bg-[#004d26]"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default OTPPage;
