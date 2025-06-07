import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserId } from "../util/auth-local";
import { getCarts, updateCart, deleteCart } from "../services/cart-service";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [carts, setCarts] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [selectedCartItems, setSelectedCartItems] = useState([]);

  const [isLoading, setIsLoading] = useState(true); // Thêm trạng thái loading

  const updateSelectedCartItems = (items) => {
    setSelectedCartItems(items);
  };

  const fetchCarts = async () => {
    try {
      setIsLoading(true);
      const userId = getUserId();
      if (userId) {
        const response = await getCarts();
        const cartData = response.data.data.cart;
        const formattedCarts = cartData.map((item) => {
          let urlImages = {};

          // Kiểm tra nếu url_images có giá trị hợp lệ
          if (item.product.url_images) {
            const cleanedUrlImages = item.product.url_images.replace(
              /\\\"/g,
              '"',
            );
            try {
              urlImages = JSON.parse(cleanedUrlImages);
            } catch (error) {
              console.error("Error parsing url_images:", error);
              urlImages = {};
            }
          }

          return {
            ...item,
            product: {
              ...item.product,
              url_image1: urlImages.url_images1 || "",
              url_image2: urlImages.url_images2 || "",
            },
          };
        });
        console.log(formattedCarts);
        setCarts(formattedCarts);
        const quantity = response.data.data.total;
        setTotalQuantity(quantity);
      }
    } catch (error) {
      console.error("Error fetching carts:", error);
    } finally {
      setIsLoading(false); // Đánh dấu dữ liệu đã được tải xong
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  return (
    <CartContext.Provider
      value={{
        carts,
        totalCost,
        totalQuantity,
        selectedCartItems,
        setCarts,
        setTotalQuantity,
        setTotalCost,
        fetchCarts,
        updateSelectedCartItems,
      }}
    >
      {!isLoading && children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
