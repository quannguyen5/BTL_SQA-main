import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getRole } from "../util/auth-local";

const PrivateRoute = ({ allowedRoles, children }) => {
  const location = useLocation();
  const role = getRole();

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Trường hợp không có quyền truy cập
    console.warn(
      `Người dùng không có quyền truy cập trang: ${location.pathname}`,
    );
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <h2>Bạn không có quyền truy cập vào trang này!</h2>
        <button
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            backgroundColor: "#006532",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => (window.location.href = "/home-page")}
        >
          Trở về trang chủ
        </button>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;
