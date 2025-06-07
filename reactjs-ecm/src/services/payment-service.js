import axios from "axios";
import { getToken, getUserId } from "../util/auth-local";

const BASE_URL = "http://localhost:6006";

export const paymentMOMO = async (paymentData) => {
    try {
      const token = getToken(); // Lấy token
      const res = await axios.post(`${BASE_URL}/momo/create-payment`, paymentData, {
        headers: {
          Authorization: `Bearer ${token}`, // Truyền token ở đây
        },
      });
      console.log(res);
      return res.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
};