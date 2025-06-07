import axios from "axios";
import { getToken, getUserId } from "../util/auth-local";

const BASE_URL = "http://localhost:6006";

export async function getImportPrById(importId) {
  try {
    const token = getToken();
    const res = await axios.get(`${BASE_URL}/import/${importId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.error('Error fetching import:', error);
    throw error;
  }
}

export async function getImportPrs(page, limit) {
  try {
    const token = getToken();
    const res = await axios.get(`${BASE_URL}/import/${page}/${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    });
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.error("Error fetching imports:", error);
    throw error;
  }
}

// Xóa người dùng theo ID
export async function deleteImportPr(importId) {
  try {
    const token = getToken();
    const res = await axios.delete(`${BASE_URL}/import/${importId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Truyền token ở đây
        accept: "*/*",
      },
    });
    return res.data.data; 
  } catch (error) {
    console.error("Error deleting import:", error);
    throw error;
  }
}

// Cập nhật người dùng
export const updateImportPr = async (importData) => {
  try {
    const token = getToken(); // Lấy token
    const res = await axios.patch(`${BASE_URL}/import`, importData, {
      headers: {
        Authorization: `Bearer ${token}`, // Truyền token ở đây
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error updating import:", error);
    throw error;
  }
};

// Tạo người dùng mới
export const createImportPr = async (importData) => {
  try {
    const token = getToken(); // Lấy token
    const res = await axios.post(`${BASE_URL}/import`, importData, {
      headers: {
        Authorization: `Bearer ${token}`, // Truyền token ở đây
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error creating import:", error);
    throw error;
  }
};