import React, { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { PiShoppingCartBold } from "react-icons/pi";
import Footer from "../Footer/footer";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Header/header";
import NotificationHandler from "../Notification/notification-handle";
import { createCart, getCarts, updateCart } from "../../services/cart-service";
import {
  getFeatureProducts,
  getLatestProducts,
  getProducts,
  getQueryProducts,
} from "../../services/product-service";
import { PiShoppingCart } from "react-icons/pi";
import { getCategory } from "../../services/category-service";
import { getUserId } from "../../util/auth-local";
import img from "../../../public/images/banner/image-4.jpg";
import {
  NotificationList,
  notificationTypes,
  showNotification,
} from "../Notification/NotificationService";
import { useCart } from "../../Context/CartContext";

function LatestProducts() {
  const [latestProducts, setLatestProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const { carts, setCarts, setTotalQuantity } = useCart();
  const handleAddToCartLatest = async (productId) => {
    const product = latestProducts.find((prod) => prod.productId === productId);
    const cartIndex = carts.findIndex(
      (cart) => cart.product_id === product.productId,
    );

    let userId = getUserId();

    try {
      if (cartIndex !== -1) {
        // Nếu sản phẩm đã tồn tại trong giỏ hàng
        await updateCart({
          ...carts[cartIndex],
          quantity: carts[cartIndex].quantity + 1,
        });
      } else {
        // Nếu sản phẩm chưa tồn tại
        await createCart({
          product_id: product.productId,
          quantity: 1,
          user_id: userId,
        });
      }

      showNotification(
        "Sản phẩm đã được thêm vào giỏ hàng!",
        notificationTypes.SUCCESS,
        setNotifications,
      );

      let userIdd = getUserId();
      if (userIdd) {
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
      console.error("Error adding to cart:", error);
      showNotification(
        "Thêm sản phẩm vào giỏ hàng thất bại!",
        notificationTypes.ERROR,
        setNotifications,
      );
    }
  };
  const renderLatestProducts = () => {
    if (latestProducts.length === 0) return;

    return latestProducts.slice(0, 4).map((product) => (
      <div
        key={product.productId}
        onClick={() => navigate(`/product-detail/${product.productId}`)}
        className="pro ease relative m-4 w-1/5 min-w-[250px] cursor-pointer border border-[#cce7d0] bg-white p-3 shadow-[20px_20px_30px_rgba(0,0,0,0.02)] transition duration-200 hover:shadow-[20px_20px_30px_rgba(0,0,0,0.06)]"
      >
        <img
          src={product.url_image1}
          alt={product.productName}
          className="aspect-square w-full border-[1px] object-contain"
        />
        <div className="des pt-3 text-start">
          <span className="text-[13px] text-[#1a1a1a]">
            {product.categoryName}
          </span>
          <h5 className="pt-2 text-[15px] font-semibold text-[#006532]">
            {product.productName}
          </h5>
          <h4 className="flex pt-2 text-[16px] font-semibold text-[#006532]">
            <p className="mr-1 mt-[2px] text-sm font-normal underline">đ</p>
            {new Intl.NumberFormat("vi-VN").format(product.priceOut)}
          </h4>
        </div>
        <a
          href="#"
          className="cart absolute bottom-5 right-2 -mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#cce7d0] bg-[#e8f6ea] font-medium leading-10 text-[#006532]"
        >
          <Link to="">
            <PiShoppingCart
              data-id={product.productId}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleAddToCartLatest(product.productId);
              }}
            />
          </Link>
        </a>
      </div>
    ));
  };
  const getLatestProductsOnPage = async () => {
    try {
      const response = await getLatestProducts();
      const data = response.data.map((product) => {
        let urlImages = {};

        // Kiểm tra nếu url_images có giá trị hợp lệ
        if (product.productImages) {
          const cleanedUrlImages = product.productImages.replace(/\\\"/g, '"');
          try {
            urlImages = JSON.parse(cleanedUrlImages);
          } catch (error) {
            console.error("Error parsing url_images:", error);
            urlImages = {};
          }
        }

        return {
          ...product,
          url_image1: urlImages.url_images1 || "",
          url_image2: urlImages.url_images2 || "",
        };
      });
      console.log(data);
      setLatestProducts(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getLatestProductsOnPage();
  }, []);
  return (
    <div>
      <NotificationHandler setNotifications={setNotifications} />

      <NotificationList notifications={notifications} />
      <section
        id="product2"
        className="section-p1 px-[80px] py-[40px] text-center"
      >
        <h2 className="text-[46px] leading-[54px] text-[#222] mobile:text-[32px]">
          Sản phẩm mới nhất
        </h2>
        <p className="my-[15px] mb-[20px] text-[16px] text-[#465b52]">
          New Products
        </p>
        <div
          className="pro-container flex flex-wrap justify-between pt-[20px] tablet:justify-center"
          id="product-render"
        >
          {renderLatestProducts()}
        </div>
      </section>
    </div>
  );
}

export default LatestProducts;
