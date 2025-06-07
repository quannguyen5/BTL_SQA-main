import axios from "axios";
import { getToken } from "../util/auth-local";

const BASE_URL = 'http://localhost:6006';

export async function getSupplier(page, limit) {
    try {
        const token = getToken(); 
        const res = await axios.get(
          `${BASE_URL}/supplier/${page}/${limit}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        return res.data;
      } catch (error) {
        console.error("Error fetching supplier:", error.response ? error.response.data : error.message);
        throw error; // Ném lại lỗi để xử lý ở nơi gọi
      }
}

// Xóa nhà cung cấp
export async function deleteSupplier(supplierId) {
  try {
    const token = getToken(); 
    const res = await axios.delete(
      `${BASE_URL}/supplier/${supplierId}`,
      {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
      }
    );
    console.log(`Deleted supplier with id ${supplierId}:`, res.data);

    return res.data;
  } catch (error) {
    console.error("Error deleting supplier:", error.response ? error.response.data : error.message);
    throw error;
  }
}

// Tạo nhà cung cấp mới
export const createSupplier = async (supplierData) => {
  try {
    const token = getToken(); 
    const res = await axios.post(
      `${BASE_URL}/supplier`,
      supplierData,
      {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error adding supplier:", error.response ? error.response.data : error.message);
    throw error;
  }
};


export async function updateSupplier(supplierId, supplierData) {
    try {
      const token = getToken(); 
  
      const res = await axios.patch(
        `${BASE_URL}/supplier/${supplierId}`,
        supplierData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error updating supplier:", error.response ? error.response.data : error.message);
      throw error;
    }
  }

  export async function getSearchSuppliers(page, limit, searchData) {
    try {
      const token = getToken();
      const res = await axios.post(`${BASE_URL}/supplier/search/${page}/${limit}`, searchData, {
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