import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { Dialog } from '@headlessui/react';
import { getUserById, editInfoUser } from '../../services/user-service';
import { getLocationUserById, updateLocationUser } from '../../services/location-user-service';
import { uploadImage } from "../../services/image-service.js";
import { showNotification, notificationTypes, NotificationList } from '../Notification/NotificationService.jsx';
import NotificationHandler from '../Notification/notification-handle.jsx';
import Header from '../Header/header';
import Footer from '../Footer/footer';

const UserProfile = () => {
  const { userId } = useParams(); // Lấy userId từ URL
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);
  const [locationData, setLocationData] = useState({
    phone: '',
    address: '',
    id: '',
    default_location: true,
    user_id: userId,
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    url_image: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Gọi cả 2 API cùng một lúc
        const [user, location] = await Promise.all([
          getUserById(userId),
          getLocationUserById(userId),
        ]);
        if (location.data && Array.isArray(location.data.data) && location.data.data.length > 0) {
          setLocationData(location.data.data[0]);
        } else {
          setLocationData({
            phone: '',
            address: '',
            id: '',
            default_location: true,
            user_id: userId,
          });
        }

        // Lưu dữ liệu người dùng
        setUserData(user.data);

      } catch (error) {
        console.error("Failed to fetch data:", error);
        setLocationData({
          phone: '',
          address: '',
          id: '',
          default_location: true,
          user_id: userId,
        });
      }
    };

    fetchUserData();
  }, [userId]);

  const handleChangePasswordClick = () => {
    navigate(`/change-password/${userId}`);
  };

  const handleOrderHistoryClick = () => {
    navigate(`/order-history/${userId}`);
  };

  const handleEditClick = () => {
    // Lấy dữ liệu hiện tại để hiển thị trong form
    setEditForm({
      firstName: userData.firstName,
      lastName: userData.lastName,
      address: locationData.address,
      phone: locationData.phone,
      url_image: userData.url_image
    });
    setIsEditing(true);
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
  
    // Cập nhật giá trị cho input text
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleFileChange = async (e) => {
    const { name, files } = e.target;
  
    if (files && files.length > 0) {
      setLoading(true); // Bắt đầu trạng thái tải
      try {
        const response = await uploadImage(files[0]); // Gửi file lên server
        if (response && Array.isArray(response) && response.length > 0) {
          let imageUrl = JSON.stringify(response[0]);
          // Loại bỏ dấu ngoặc kép nếu có
          if (imageUrl.startsWith('"') && imageUrl.endsWith('"')) {
            imageUrl = imageUrl.slice(1, -1);
          }
          // Cập nhật URL ảnh vào state của form
          setEditForm((prev) => ({
            ...prev,
            [name]: imageUrl,
          }));
        } else {
          console.error("No URL returned from the server.");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        sessionStorage.setItem(
          "notification",
          JSON.stringify({
            message: "Lỗi trong quá trình thêm ảnh. Vui lòng thử lại",
            type: notificationTypes.ERROR,
          })
        );
      } finally {
        setLoading(false); // Kết thúc trạng thái tải
      }
    }
  };
  
  

  const handleSave = async () => {
    try {
      // Gửi yêu cầu cập nhật thông tin người dùng
      await editInfoUser(userId, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        url_image: editForm.url_image
      });
      await updateLocationUser({
        user_id: userId, // đảm bảo `user_id` là id người dùng
        address: editForm.address,
        phone: editForm.phone
      });
      setUserData({ ...userData, ...editForm });
      setLocationData({ ...locationData, address: editForm.address, phone: editForm.phone });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update user data:", error);
    }
  };

  if (!userData) {
    return <div className="text-center text-gray-500">Loading...</div>; // Hiển thị khi đang tải dữ liệu
  }

  return (
    <>
      <Header />
      <div className="flex">
        {/* Sidebar Taskbar */}
        <div className="w-1/5 p-6 bg-[#006532] min-h-screen text-white">
          <h3 className="text-xl font-semibold mb-8 text-center">Tùy chọn</h3>
          <ul className="space-y-4">
            <li
              onClick={handleEditClick}
              className="flex items-center p-3 rounded-md cursor-pointer hover:bg-green-700"
            >
              <span>Chỉnh sửa thông tin</span>
            </li>
            <li
              onClick={handleChangePasswordClick}
              className="flex items-center p-3 rounded-md cursor-pointer hover:bg-green-700"
            >
              <span>Đổi mật khẩu</span>
            </li>
            <li
              onClick={handleOrderHistoryClick}
              className="flex items-center p-3 rounded-md cursor-pointer hover:bg-green-700"
            >
              <span>Lịch sử đơn hàng</span>
            </li>
          </ul>
        </div>
  
        {/* Main Content */}
        <div className="w-3/4 max-w-3xl mx-auto p-8 bg-white shadow-md rounded-lg mt-12">
          <h2 className="text-3xl font-semibold text-[#006532] mb-6 text-center">Thông tin người dùng</h2>

          <div className="flex items-start justify-between">
            {/* Thông tin cá nhân */}
            <div className="space-y-4 w-2/3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#006532] text-lg">Họ Tên:</span>
                <span className="text-gray-800 text-lg">
                  {userData.firstName} {userData.lastName}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-[#006532] text-lg">Email:</span>
                <span className="text-gray-800 text-lg">{userData.email}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-[#006532] text-lg">Địa chỉ:</span>
                <span className="text-gray-800 text-lg">
                  {locationData.address || "No Address Found"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-[#006532] text-lg">Điện thoại:</span>
                <span className="text-gray-800 text-lg">
                  {locationData.phone || "No Phone Found"}
                </span>
              </div>
            </div>

            {/* Avatar */}
            <div className="w-1/3 ml-12 flex justify-center items-center">
              <img
                src={userData.url_image}
                alt={`${userData.firstName} ${userData.lastName}`}
                className="h-48 w-48 rounded-full object-cover shadow-md border-4 border-[#006532]"
              />
            </div>
          </div>
        </div>
      </div>
  
      {/* Dialog for Editing */}
      <Dialog
        open={isEditing}
        onClose={() => setIsEditing(false)}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto space-y-6">
          <Dialog.Title className="text-2xl font-semibold text-[#006532] mb-4 text-center">
            Chỉnh sửa thông tin
          </Dialog.Title>
          <div className="space-y-4">
            {loading && (
              <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-900 bg-opacity-50">
                <ClipLoader color="#006532" size={50} loading={loading} />
              </div>
            )}
            {/* First and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Họ</label>
                <input
                  type="text"
                  name="firstName"
                  value={editForm.firstName}
                  onChange={handleTextChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#006532] focus:ring-[#006532] p-3"
                />
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên</label>
                <input
                  type="text"
                  name="lastName"
                  value={editForm.lastName}
                  onChange={handleTextChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#006532] focus:ring-[#006532] p-3"
                />
              </div>
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
              <input
                type="text"
                name="address"
                value={editForm.address}
                onChange={handleTextChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#006532] focus:ring-[#006532] p-3"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input
                type="text"
                name="phone"
                value={editForm.phone}
                onChange={handleTextChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#006532] focus:ring-[#006532] p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ảnh</label>
              <input
                type="file"
                name="url_image"
                onChange={handleFileChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#006532] focus:ring-[#006532] p-3"
              />
            </div>
          </div>
  
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-[#006532] text-white font-semibold rounded-md hover:bg-green-700"
            >
              Lưu
            </button>
          </div>
        </div>
      </Dialog>
      <Footer />
    </>
  );
  
  
};

export default UserProfile;