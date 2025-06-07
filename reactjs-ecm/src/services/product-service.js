import axios from "axios";
import { format } from "date-fns";
import { getToken, getUserId, userIdLocal } from "../util/auth-local";

const BASE_URL = "http://localhost:6006";

const userId = getUserId();

export async function getProducts(page, limit) {
  try {
    const response = await axios.get(`${BASE_URL}/product/${page}/${limit}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getFeatureProducts() {
  try {
    const response = await axios.get(`${BASE_URL}/dashboard/feature-product`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getLatestProducts() {
  try {
    const response = await axios.get(`${BASE_URL}/dashboard/latest-product`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getQueryProducts(page, limit, name, category_id) {
  try {
    const response = await axios.get(
      `${BASE_URL}/product/search/${page}/${limit}?name=${name}&category=${category_id}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Hàm lấy chi tiết sản phẩm
export const fetchProductDetail = async (productId) => {
  try {
    const response = await axios.get(`${BASE_URL}/product/${productId}`);
    if (response.status === 200 && response.data && response.data.data) {
      return response.data.data.products;
    } else {
      console.error("No data received from server.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching product detail:", error);
    throw error;
  }
};

// Hàm lấy danh sách sản phẩm
export const fetchProducts = async (currentPage, productsPerPage) => {
  try {
    const token = getToken();
    const response = await axios.get(
      `${BASE_URL}/product/${currentPage}/${productsPerPage}`,
    );
    if (
      response.status === 200 &&
      response.data.success &&
      Array.isArray(response.data.data.products)
    ) {
      const totalProducts = response.data.data.total;
      return {
        products: response.data.data.products.map((product) => ({
          id: product.id,
          name: product.name,
          priceout: product.priceout,
          category_id: product.category_id,
          supplier_id: product.supplier_id,
          url_images: product.url_images,
          description: product.description,
          stockQuantity: product.stockQuantity,
          weight: product.weight,
          expire_date: format(new Date(product.expire_date), "yyyy-MM-dd"),
        })),
        totalProducts,
      };
    } else {
      console.error("No products data received from server.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Hàm tìm kiểm sản phẩm
export const searchProducts = async (page, limit, filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.name) {
      params.append("name", filters.name.trim());
    }
    if (filters.category_id) {
      params.append("category", filters.category_id.trim());
    }

    const response = await axios.get(
      `${BASE_URL}/product/search/${page}/${limit}`,
      {
        params,
      },
    );

    if (
      response.status === 200 &&
      response.data.success &&
      Array.isArray(response.data.data.products)
    ) {
      return {
        products: response.data.data.products.map((product) => ({
          id: product.id,
          name: product.name,
          priceout: product.priceout,
          category_id: product.category_id,
          supplier_id: product.supplier_id,
          url_images: product.url_images,
          description: product.description,
          stockQuantity: product.stockQuantity,
          weight: product.weight,
          expire_date: format(new Date(product.expire_date), "yyyy-MM-dd"),
        })),
        totalProducts: response.data.data.totalProducts || 0,
      };
    } else {
      console.error("No products data received from server for search.");
      return [];
    }
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
};

// Hàm thêm sản phẩm mới
export const addProduct = async (formData) => {
  try {
    const token = getToken();
    const response = await axios.post(`${BASE_URL}/product`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

// Hàm chỉnh sửa sản phẩm
export const editProduct = async (id, formData) => {
  try {
    const token = getToken();
    const response = await axios.patch(
      `${BASE_URL}/product/${userIdLocal}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      console.error("Failed to edit product. No data returned.");
      return null;
    }
  } catch (error) {
    console.error("Error editing product:", error);
    throw error;
  }
};

// Hàm xóa sản phẩm
export const deleteProduct = async (id) => {
  try {
    const token = getToken();
    if (!token) throw new Error("No token found in localStorage");
    const response = await axios.delete(`${BASE_URL}/product/${userId}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      console.error("Failed to delete product. No data returned.");
      return null;
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};
