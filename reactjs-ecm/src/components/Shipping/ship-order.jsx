import React, { useState } from 'react';
import ShipperHeader from "./ShipperHeader/ship-header.jsx";

// Dữ liệu giả lập danh sách đơn hàng
const initialOrders = [
    { id: 1, customerName: 'John Doe', orderDetails: '5 bags of animal feed', status: 'Confirmed' },
    { id: 2, customerName: 'Jane Smith', orderDetails: '10 bags of chicken feed', status: 'Confirmed' }
];

const ShipOrder = () => {
    const [orders, setOrders] = useState(initialOrders);
    const [deliveredOrders, setDeliveredOrders] = useState([]);

    const handleDelivered = (orderId) => {
        const updatedOrders = orders.filter(order => order.id !== orderId);
        const deliveredOrder = orders.find(order => order.id === orderId);
    
        setOrders(updatedOrders);
        setDeliveredOrders([...deliveredOrders, { ...deliveredOrder, status: 'Delivered' }]);
    };

    return (
        <>
            <ShipperHeader />
            <div className="container mx-auto p-8 bg-gray-100 min-h-screen">
                <h2 className="text-3xl font-bold mb-8 text-[#225a3e]">Shipping Orders</h2>

                {/* Hiển thị danh sách đơn hàng */}
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="p-6 border rounded-lg shadow-lg bg-white">
                            <h3 className="text-xl font-semibold text-[#225a3e]">Đơn hàng #{order.id}</h3>
                            <p className="text-gray-700">Khách hàng: <span className="font-medium">{order.customerName}</span></p>
                            <p className="text-gray-700">Thông tin đơn hàng: <span className="font-medium">{order.orderDetails}</span></p>
                            <p className="text-gray-700">
                                Trạng thái: 
                                <span className={`ml-2 font-semibold ${order.status === 'Delivered' ? 'text-[#225a3e]' : 'text-yellow-600'}`}>
                                    {order.status}
                                </span>
                            </p>

                            {order.status === 'Confirmed' && (
                                <button
                                    onClick={() => handleDelivered(order.id)}
                                    className="
                                        mt-4 px-6 py-2
                                        bg-[#225a3e] text-white
                                        font-semibold
                                        rounded-full
                                        shadow-md
                                        hover:bg-[#1b4d35]
                                        transition duration-200
                                    "
                                >
                                    Xác nhận giao hàng
                                </button>
                            )}
                            {order.status === 'Delivered' && (
                                <span className="mt-4 inline-block text-[#225a3e] font-semibold">Giao hàng thành công</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ShipOrder;
