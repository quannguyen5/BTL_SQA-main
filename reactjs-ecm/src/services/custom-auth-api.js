import axios from "axios";

const getToken = () => {
  return localStorage.getItem("accessToken"); // Hoặc dùng state nếu bạn lưu token ở đó
};
export const apiClient = axios.create({
  baseURL: "http://localhost:6006",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);