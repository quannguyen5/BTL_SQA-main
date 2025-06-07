import { apiClient } from "./custom-auth-api";
import axios from 'axios';
import { getToken, getUserId } from '../util/auth-local'; 

export async function loginApi(params) {
  try {
    const response = await apiClient.post("/login", params);
    return response?.data;
  } catch (error) {
    return error?.response.data;
  }
}

const BASE_URL = 'http://localhost:6006';

export async function logoutUser() {
  try {
    const userId = getUserId();
    const token = getToken();
    const res = await axios.post(`${BASE_URL}/logout/${userId}`, {
      token: token,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
        'Content-Type': 'application/json'
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
}
