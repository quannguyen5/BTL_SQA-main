import axios from "axios";
import { getToken, getUserId } from "../util/auth-local";

const BASE_URL = "http://localhost:6006";
const token = getToken();

const userId = getUserId();

export const getUserOrders = async (userId, page = 1, limit = 10) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/order/all-user-order/${userId}`,
      { page, limit }, // body nếu không cần thêm dữ liệu
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};

export async function getAddresses() {
  try {
    const res = await axios.get(`${BASE_URL}/location-user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  } catch (error) {
    console.error("Error fetching addresses:", error);
    throw error;
  }
}

export const createNewAddress = async (data) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/location-user/${userId}`,
      {
        name: data.name,
        address: data.address,
        phone: data.phone,
        default_location: true,
        user_id: userId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res;
  } catch (error) {
    console.error("Error creating new address:", error);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  console.log("orderData", orderData);
  try {
    const res = await axios.post(`${BASE_URL}/order/${userId}`, orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("res", res);
    return res;
  } catch (error) {
    console.error("Error creating order", error);
    throw error;
  }
};

// Lấy danh sách đơn hàng (pagination và filter)
export const getOrderManagement = async (page, limit, filters = {}) => {
  try {
    const token = getToken();
    const { orderStatus, paymentStatus } = filters;
    const res = await axios.get(`${BASE_URL}/manage-order/${page}/${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { orderStatus, paymentStatus },
    });
    return res.data; // Trả về dữ liệu đã xử lý
  } catch (error) {
    console.error("Error fetching order management:", error);
    throw error;
  }
};

// Lấy chi tiết đơn hàng
export const getDetailOrder = async (id) => {
  try {
    const token = getToken();
    const res = await axios.get(`${BASE_URL}/manage-order/detail/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching order detail:", error);
    throw error;
  }
};

// Cập nhật đơn hàng
export const updateOrder = async (updateData) => {
  try {
    const token = getToken();
    const res = await axios.patch(`${BASE_URL}/order`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

export async function getOrdersAdmin(
  page,
  limit,
  orderStatus,
  paymentStatus,
  includeExcluded,
) {
  try {
    const token = getToken();
    const res = await axios.get(
      `${BASE_URL}/order/manage-order/${page}/${limit}?orderStatus=${orderStatus}&paymentStatus=${paymentStatus}&includeExcluded=${includeExcluded}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      },
    );
    console.log("api", res.data);
    return res.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

export const updateOrderAdmin = async (orderData) => {
  try {
    const token = getToken(); // Lấy token
    const userId = getUserId();
    const res = await axios.patch(`${BASE_URL}/order/${userId}`, orderData, {
      headers: {
        Authorization: `Bearer ${token}`, // Truyền token ở đây
      },
    });
    console.log("1", res.data);
    return res.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const getOrderDetails = async (orderId) => {
  try {
    const token = getToken();
    const res = await axios.get(
      `${BASE_URL}/order/detail/${userId}/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
};

export const getOrderUserDashboard = async (userId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/order/order-user-dashboard/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching order dashboard data:', error);
    throw error;
  }
};