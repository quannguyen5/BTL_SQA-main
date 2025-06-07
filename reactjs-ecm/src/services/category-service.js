import axios from "axios";
import { getToken } from "../util/auth-local";

const BASE_URL = "http://localhost:6006";

const token = getToken();

export async function getCategory(page, limit) {
  try {
    const res = await axios.get(`${BASE_URL}/category/${page}/${limit}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching category:", error);
    throw error;
  }
}

export async function getQueryCategory(page, limit, name, status) {
  try {
    const res = await axios.get(
      `${BASE_URL}/category/${page}/${limit}?name=${name}&status=${status}`,
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching category:", error);
    throw error;
  }
}

export async function deleteCategory(categoryId) {
  try {
    const res = await axios.delete(`${BASE_URL}/category/${categoryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}

export async function deleteCategories(categoryId) {
  await axios.delete(`${BASE_URL}/category/${categoryId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export const updateCategory = async (categoryData) => {
  try {
    const res = await axios.patch(`${BASE_URL}/category`, categoryData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error updating category:", error);
  }
};

export const createCategory = async (categoryData) => {
  try {
    const res = await axios.post(`${BASE_URL}/category`, categoryData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error adding category:", error);
  }
};
