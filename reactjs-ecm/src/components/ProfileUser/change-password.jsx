import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { changePassword } from '../../services/user-service';
import Header from '../Header/header';
import Footer from '../Footer/footer';

const ChangePassword = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    try {
      await changePassword(userId, {
        password: form.currentPassword, // Mật khẩu hiện tại
        newPassword: form.newPassword, // Mật khẩu mới
        newPasswordCf: form.confirmPassword, // Xác nhận mật khẩu mới
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(`/user/${userId}`);
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Đã xảy ra lỗi khi thay đổi mật khẩu.'
      );
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center h-screen px-4">
        <div className="border border-[#006532] bg-white p-8 rounded-md shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-semibold text-center text-[#006532] mb-6">
            Thay đổi mật khẩu
          </h2>

          {success && (
            <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-md">
              Mật khẩu đã được thay đổi thành công! Đang chuyển hướng...
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#006532] focus:ring-[#006532] p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mật khẩu mới
              </label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#006532] focus:ring-[#006532] p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#006532] focus:ring-[#006532] p-3"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-[#006532] text-white font-semibold rounded-md hover:bg-green-700"
            >
              Xác nhận thay đổi
            </button>
          </form>
        </div>
      </div>
      <Footer />
      </>
  );
};

export default ChangePassword;
