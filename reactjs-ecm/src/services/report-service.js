import axios from "axios";
import { getToken } from "../util/auth-local";

const BASE_URL = "http://localhost:6006/dashboard";

const token = getToken();

export async function getDashboardData(filter) {
  try {
    const response = await axios.get(
      `${BASE_URL}/summary?timeFilter=${filter}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error getDashboardData:", error);
    throw error;
  }
}

export async function getDataLineChart(filter) {
  try {
    const response = await axios.get(
      `${BASE_URL}/summary-financial?timeFilter=${filter}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error getDashboardData:", error);
    throw error;
  }
}

export async function getTopProducts(filter) {
  try {
    const response = await axios.get(
      `${BASE_URL}/top-products?timeFilter=${filter}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error getTopProducts:", error);
    throw error;
  }
}

export async function getTopCustomers(filter) {
  try {
    const response = await axios.get(
      `${BASE_URL}/top-customers?timeFilter=${filter}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error getTopCustomers:", error);
    throw error;
  }
}

export async function getSalesByCategory(filter) {
  try {
    const response = await axios.get(
      `${BASE_URL}/revenue-by-category?timeFilter=${filter}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error getSalesByCategory:", error);
    throw error;
  }
}

export async function getSalesBySupplier(filter) {
  try {
    const response = await axios.get(
      `${BASE_URL}/revenue-by-supplier?timeFilter=${filter}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error getSalesBySupplier:", error);
    throw error;
  }
}

export const getManageUserDashboard = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/manage-user-dashboard`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};