import axios from "./custom-service.js";

export async function getProducts(query) {
  try {
    const res = await axios.get(`/api/products?${query}`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

