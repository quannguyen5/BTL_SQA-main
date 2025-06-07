import axios from "axios";
import { getToken, getUserId } from "../util/auth-local";

const BASE_URL = "http://localhost:6006";

const token = getToken();

const userId = getUserId();

export async function getCarts() {
  return await axios.get(`${BASE_URL}/cart/all-product/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export const createCart = async (data) => {
  return await axios.post(`${BASE_URL}/cart/add-to-cart/${userId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateCart = async (data) => {
  return await axios.patch(`${BASE_URL}/cart/${userId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export async function deleteCart(cartId) {
  return await axios.delete(`${BASE_URL}/cart/${userId}/${cartId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function deleteCartItems(cartIds) {
  try {
    const response = await axios.delete(`${BASE_URL}/cart/${userId}`, {
      data: { cart_ids: cartIds }, //  với DELETE, payload phải nằm trong 'data'
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting cart items:",
      error.response?.data || error.message,
    );
    throw error;
  }
}
