import AdminHeader from "../AdminHeader/admin-header.jsx";
import React, { useEffect, useState } from "react";
import banner from "../../../../public/images/banner-admin.png";
import {
  LineChart,
  AreaChart,
  RadarChart,
  Line,
  Area,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";
import { BarChart, Bar } from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import {
  getDashboardData,
  getDataLineChart,
  getSalesByCategory,
  getSalesBySupplier,
  getTopCustomers,
  getTopProducts,
} from "../../../services/report-service.js";
import { getUser } from "../../../services/user-service.js";

const Report = () => {
  const [timeFilter, setTimeFilter] = useState("Tuần");
  const [dataLineChartFilter, setDataLineChartFilter] = useState("Tuần");
  const [topProductsFilter, setTopProductsFilter] = useState("Tuần");
  const [topCustomersFilter, setTopCustomersFilter] = useState("Tuần");
  const [categorySalesFilter, setCategorySalesFilter] = useState("Tuần");
  const [supplierSalesFilter, setSupplierSalesFilter] = useState("Tuần");

  const [dashboardData, setDashboardData] = useState(null);
  const [dataLineChart, setDataLineChart] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [salesBySupplier, setSalesBySupplier] = useState([]);
  const [user, setUser] = useState(null);

  // Fetch dữ liệu dashboard tổng quan
  const fetchDashboardData = async (filter) => {
    try {
      const response = await getDashboardData(filter);

      if (response.success) {
        setDashboardData(response.data);
      } else {
        console.error("Failed to fetch dashboard data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser();
        console.log("admin", response.data);
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };

    fetchUser();
  }, []);

  const formattedLastName = user?.lastName ? user.firstName.toUpperCase() + " " + user.lastName.toUpperCase() : "Admin";

  // Fetch dữ liệu Doanh thu Ngân Sách Lãi
  const fetchDataLineChart = async (dataLineChartFilter) => {
    try {
      const response = await getDataLineChart(dataLineChartFilter);

      if (response.success) {
        setDataLineChart(response.data);
      } else {
        console.error("Failed to fetch LineChart data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching LineChart data:", error);
    }
  };

  // Fetch dữ liệu Top 5 sản phẩm
  const fetchTopProducts = async (topProductsFilter) => {
    try {
      const response = await getTopProducts(topProductsFilter);

      if (response.success) {
        setTopProducts(response.data);
      } else {
        console.error("Failed to fetch top products data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching top products data:", error);
    }
  };

  const fetchTopCustomers = async (topCustomersFilter) => {
    try {
      const response = await getTopCustomers(topCustomersFilter);

      if (response.success) {
        setTopCustomers(response.data);
      } else {
        console.error("Failed to fetch top customers data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching top customers:", error);
    }
  };

  const fetchSalesByCategory = async (categorySalesFilter) => {
    try {
      const response = await getSalesByCategory(categorySalesFilter);

      if (response.success) {
        setSalesByCategory(response.data);
      } else {
        console.error(
          "Failed to fetch revenue by category data:",
          response.message,
        );
      }
    } catch (error) {
      console.error("Error fetch revenue by category data:", error);
    }
  };

  const fetchSalesBySupplier = async (supplierSalesFilter) => {
    try {
      const response = await getSalesBySupplier(supplierSalesFilter);

      if (response.success) {
        setSalesBySupplier(response.data);
      } else {
        console.error(
          "Failed to fetch revenue by supplier data:",
          response.message,
        );
      }
    } catch (error) {
      console.error("Error fetch revenue by supplier data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData(timeFilter);
  }, [timeFilter]);

  useEffect(() => {
    fetchDataLineChart(dataLineChartFilter);
  }, [dataLineChartFilter]);

  useEffect(() => {
    fetchTopProducts(topProductsFilter);
  }, [topProductsFilter]);

  useEffect(() => {
    fetchTopCustomers(topCustomersFilter);
  }, [topCustomersFilter]);

  useEffect(() => {
    fetchSalesByCategory(categorySalesFilter);
  }, [categorySalesFilter]);

  useEffect(() => {
    fetchSalesBySupplier(supplierSalesFilter);
  }, [supplierSalesFilter]);

  const getComparisonText = (timeFilter) => {
    switch (timeFilter) {
      case "Tuần":
        return "So với tuần trước:";
      case "Tháng":
        return "So với tháng trước:";
      case "Quý":
        return "So với quý trước:";
      case "Năm":
        return "So với năm trước:";
      default:
        return "So với thời gian trước:";
    }
  };

  const formatYAxis = (tickItem) => {
    const absValue = Math.abs(tickItem);
    if (absValue >= 1000000) {
      return (tickItem / 1000000).toFixed(1) + "M";
    } else if (absValue >= 1000) {
      return (tickItem / 1000).toFixed(1) + "K";
    } else {
      return tickItem;
    }
  };

  return (
    <div>
      <AdminHeader />
      <div className="min-h-screen bg-gray-100 px-8 py-4">
        <div className="ml-[250px] w-5/6 p-4">
          <div className="mb-4">
            {/* Chọn thời gian */}
            <div className="mb-6 flex justify-start">
              {["Tuần", "Tháng", "Quý", "Năm"].map((filter) => (
                <button
                  key={filter}
                  className={`shadow-md border px-3 py-2 text-[#222222] ${
                    timeFilter === filter
                      ? "bg-[#006532] text-white"
                      : "bg-white"
                  } hover:bg-[#004d26] hover:text-white`}
                  onClick={() => {
                    setTimeFilter(filter);
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="flex md:flex-wrap">
            <div className="mb-8 mr-6 h-1/2 w-[45%]">
              {/* Các thẻ thông tin */}
              <div>
                <div
                  id="page-header"
                  className="mb-4 h-48"
                  style={{
                    backgroundImage: `url(${banner})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }}
                >
                  <div className="flex h-full w-full flex-col items-start justify-center bg-[rgba(8,28,14,0.4)] text-center">
                    <h2 className="ml-5 w-2/4 text-2xl font-bold text-white">
                      Chào mừng bạn trở lại, {formattedLastName}
                    </h2>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
                <div className="shadow-lg border border-gray-200 bg-white p-6">
                  <h4 className="text-xl font-semibold text-[#222222]">
                    Doanh thu
                  </h4>
                  <p className="text-2xl font-bold text-[#006532]">
                    {dashboardData?.thisTime?.revenue || 0} VND
                  </p>
                  <p className="text-sm text-gray-500">
                    {getComparisonText(timeFilter)} +
                    {(dashboardData?.thisTime?.revenue || 0) -
                      (dashboardData?.lastTime?.revenue || 0)}{" "}
                    VND
                  </p>
                </div>
                <div className="shadow-lg rounded-lg border border-gray-200 bg-white p-6">
                  <h4 className="text-xl font-semibold text-[#222222]">
                    Sản phẩm
                  </h4>
                  <p className="text-2xl font-bold text-[#006532]">
                    {dashboardData?.thisTime?.product || 0}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getComparisonText(timeFilter)} +
                    {(dashboardData?.thisTime?.product || 0) -
                      (dashboardData?.lastTime?.product || 0)}{" "}
                    sản phẩm
                  </p>
                </div>
                <div className="shadow-lg rounded-lg border border-gray-200 bg-white p-6">
                  <h4 className="text-xl font-semibold text-[#222222]">
                    Khách hàng
                  </h4>
                  <p className="text-2xl font-bold text-[#006532]">
                    {dashboardData?.thisTime?.customer || 0}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getComparisonText(timeFilter)} +
                    {(dashboardData?.thisTime?.customer || 0) -
                      (dashboardData?.lastTime?.customer || 0)}{" "}
                    khách hàng
                  </p>
                </div>
                <div className="shadow-lg rounded-lg border border-gray-200 bg-white p-6">
                  <h4 className="text-xl font-semibold text-[#222222]">
                    Đơn hàng
                  </h4>
                  <p className="text-2xl font-bold text-[#006532]">
                    {dashboardData?.thisTime?.order || 0}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getComparisonText(timeFilter)} +
                    {(dashboardData?.thisTime?.order || 0) -
                      (dashboardData?.lastTime?.order || 0)}{" "}
                    đơn hàng
                  </p>
                </div>
              </div>
            </div>
            {/* Biểu đồ Line */}
            <div className="shadow-md mb-8 w-[53%] rounded-lg bg-white p-4">
              <div className="flex items-center gap-4">
                <h4 className="mb-4 text-2xl font-semibold text-[#222222]">
                  Doanh thu và Lợi nhuận
                </h4>
                <select
                  className="mb-4 rounded border px-3 py-2 text-sm"
                  value={dataLineChartFilter}
                  onChange={(e) => setDataLineChartFilter(e.target.value)}
                >
                  <option value="Tuần">Tuần</option>
                  <option value="Tháng">Tháng</option>
                  <option value="Quý">Quý</option>
                  <option value="Năm">Năm</option>
                </select>
              </div>
              <div>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={dataLineChart} margin={{ left: 30 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#ddd"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="time_period"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={formatYAxis}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                        borderColor: "#ddd",
                      }}
                      itemStyle={{ color: "#333" }}
                      formatter={(value) => {
                        const absValue = Math.abs(value);
                        if (absValue >= 1000000) {
                          return (value / 1000000).toFixed(1) + "M";
                        } else if (absValue >= 1000) {
                          return (value / 1000).toFixed(1) + "K";
                        } else {
                          return value;
                        }
                      }}
                    />
                    <Legend
                      iconType="circle"
                      layout="horizontal"
                      verticalAlign="top"
                      align="center"
                    />
                    <Line
                      type="linear"
                      dataKey="total_revenue"
                      stroke="#427b70"
                      strokeWidth={3}
                      dot={{ r: 2 }}
                    />
                    <Line
                      type="linear"
                      dataKey="total_cost"
                      stroke="#c49a75"
                      strokeWidth={3}
                      dot={{ r: 2 }}
                    />
                    <Line
                      type="linear"
                      dataKey="profit"
                      stroke="#30476c"
                      strokeWidth={3}
                      dot={{ r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {/* Biểu đồ Bar: Top5 sản phẩm */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="shadow-lg rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h4 className="mb-4 text-xl font-semibold text-[#222222]">
                  Top 5 sản phẩm có doanh thu cao nhất
                </h4>
                <select
                  className="mb-4 rounded border px-3 py-2 text-sm"
                  value={topProductsFilter}
                  onChange={(e) => setTopProductsFilter(e.target.value)}
                >
                  <option value="Tuần">Tuần</option>
                  <option value="Tháng">Tháng</option>
                  <option value="Quý">Quý</option>
                  <option value="Năm">Năm</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="productName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#006532" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="shadow-lg rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h4 className="mb-4 text-xl font-semibold text-[#222222]">
                  Top 5 khách hàng mua nhiều nhất
                </h4>
                <select
                  className="mb-4 rounded border px-3 py-2 text-sm"
                  value={topCustomersFilter}
                  onChange={(e) => setTopCustomersFilter(e.target.value)}
                >
                  <option value="Tuần">Tuần</option>
                  <option value="Tháng">Tháng</option>
                  <option value="Quý">Quý</option>
                  <option value="Năm">Năm</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCustomers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="userName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Biểu đồ Donut */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="shadow-lg rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h4 className="mb-4 text-xl font-semibold text-[#006532]">
                  Doanh số theo danh mục
                </h4>
                <select
                  className="mb-4 rounded border px-3 py-2 text-sm"
                  value={categorySalesFilter}
                  onChange={(e) => setCategorySalesFilter(e.target.value)}
                >
                  <option value="Tuần">Tuần</option>
                  <option value="Tháng">Tháng</option>
                  <option value="Quý">Quý</option>
                  <option value="Năm">Năm</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    dataKey="revenue"
                    nameKey="categoryName"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#006532"
                    label={(entry) => `${entry.categoryName}: ${entry.revenue}`}
                  >
                    {salesByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.revenue > 300 ? "#82ca9d" : "#ff7300"}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="shadow-lg rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h4 className="mb-4 text-xl font-semibold text-[#006532]">
                  Doanh số theo nhà cung cấp
                </h4>
                <select
                  className="mb-4 rounded border px-3 py-2 text-sm"
                  value={supplierSalesFilter}
                  onChange={(e) => setSupplierSalesFilter(e.target.value)}
                >
                  <option value="Tuần">Tuần</option>
                  <option value="Tháng">Tháng</option>
                  <option value="Quý">Quý</option>
                  <option value="Năm">Năm</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={salesBySupplier}
                    dataKey="revenue"
                    nameKey="supplierName"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#006532"
                    label={(entry) => `${entry.supplierName}: ${entry.revenue}`}
                  >
                    {salesBySupplier.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.revenue > 300 ? "#82ca9d" : "#ff7300"}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
