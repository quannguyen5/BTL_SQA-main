import axios from "axios";
import { getToken } from "../util/auth-local";

// Hàm upload hình ảnh
export const uploadImage = async (file) => {
  const token = getToken(); // Lấy token
  const formData = new FormData();
  formData.append("files", file);
  console.log("FormData contents:", formData.get("files"));
  try {
    const res = await axios.post(
      "http://localhost:6006/image/upload",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 20000, // Thiết lập timeout
      },
    );
    return res.data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
