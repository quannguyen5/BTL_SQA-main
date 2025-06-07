import React from "react";
import { useLocation } from "react-router-dom";

const ShipHistory = () => {
    const location = useLocation();
    const deliveredOrders = location.state?.deliveredOrders || [];

    return (
        <div className="container mx-auto p-8 bg-gray-100 min-h-screen">
            <h2 className="text-3xl font-bold mb-8 text-[#225a3e]">Lịch sử Đơn Hàng Đã Giao</h2>
            <div className="space-y-6">
                {deliveredOrders.length > 0 ? (
                    deliveredOrders.map((order) => (
                        <div key={order.id} className="p-6 border rounded-lg shadow-lg bg-white">
                            <h3 className="text-xl font-semibold text-[#225a3e]">Đơn hàng #{order.id}</h3>
                            <p className="text-gray-700">Khách hàng: <span className="font-medium">{order.customerName}</span></p>
                            <p className="text-gray-700">Thông tin đơn hàng: <span className="font-medium">{order.orderDetails}</span></p>
                            <p className="text-gray-700">
                                Trạng thái: 
                                <span className="ml-2 font-semibold text-[#225a3e]">
                                    {order.status}
                                </span>
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-700">Không có đơn hàng đã giao.</p>
                )}
            </div>
        </div>
    );
};

export default ShipHistory;
