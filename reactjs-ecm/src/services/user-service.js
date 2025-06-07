import axios from "axios";
import { getToken, getUserId } from "../util/auth-local";

const BASE_URL = "http://localhost:6006";

export async function getUserById(userId) {
  try {
    const token = getToken();
    const res = await axios.get(`${BASE_URL}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export const editInfoUser = async (userId, userData) => {
  try {
    const token = getToken();
    const res = await axios.patch(`${BASE_URL}/users/${userId}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`, // Truyền token ở đây
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export async function getUsers(page, limit) {
  try {
    const token = getToken();
    const res = await axios.get(`${BASE_URL}/users/${page}/${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

// Xóa người dùng theo ID
export async function deleteUser(adminId,userId) {
  try {
    const token = getToken();
    const res = await axios.delete(`${BASE_URL}/users/${adminId}/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Truyền token ở đây
        accept: "*/*",
      },
    });
    return res.data.data; 
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

// Cập nhật người dùng
export const updateUser = async ( adminId ,userId, userData) => {
  try {
    const token = getToken(); // Lấy token
    const res = await axios.patch(`${BASE_URL}/users/${adminId}/${userId}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`, // Truyền token ở đây
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Tạo người dùng mới
export const createUser = async (userData) => {
  try {
    const token = getToken(); // Lấy token
    const res = await axios.post(`${BASE_URL}/users`, userData, {
      headers: {
        Authorization: `Bearer ${token}`, // Truyền token ở đây
      },
    });
    console.log(res.data.data);
    return res.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export async function getUser() {
  try {
    const userId = getUserId();
    const token = getToken();
    const res = await axios.get(`${BASE_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });
    return res.data; 
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

export const changePassword = async (userId, data) => {
  try {
    const token = getToken();
    const res = await axios.post(`${BASE_URL}/change-password/${userId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

export async function getSearchUsers(page, limit, searchData) {
  try {
    const token = getToken();
    const res = await axios.post(`${BASE_URL}/users/search/${page}/${limit}`, searchData, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
        'Content-Type': 'application/json'
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
}

export async function getUserByAdmin(userId) {
  try {
    const token = getToken();

    const res = await axios.get(`${BASE_URL}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function getEmployees() {
  const page=1;
  const limit= 100;
  const searchData={ 
    lastName: "",
    phone: "",
    email: "",
    isActive: true,
    role: "employee"
  }
  try {
    const token = getToken();
    const res = await axios.post(`${BASE_URL}/users/search/${page}/${limit}`, searchData, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
        'Content-Type': 'application/json'
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
}