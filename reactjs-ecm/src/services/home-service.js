import axios from "axios";

export async function getProducts(query) {
  try {
    const res = await axios.get(`http://localhost:4444/api/products?${query}`);
    return res.data;
  } catch (error) {
    throw error;
  }
}
