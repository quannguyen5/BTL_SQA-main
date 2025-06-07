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
import LatestProducts from "./LatestProducts";

function HomePage() {
  const [featureProducts, setFeatureProducts] = useState([]);

  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();

  const { carts, setCarts, setTotalQuantity } = useCart();

  const handleAddToCartFeature = async (productId) => {
    const product = featureProducts.find(
      (prod) => prod.productId === productId,
    );
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

  const renderFeatureProducts = () => {
    if (featureProducts.length === 0) return;

    return featureProducts.slice(0, 4).map((product) => (
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
            {new Intl.NumberFormat("vi-VN").format(product.priceout)}
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
                handleAddToCartFeature(product.productId);
              }}
            />
          </Link>
        </a>
      </div>
    ));
  };

  const getFeatureProductsOnPage = async () => {
    try {
      const response = await getFeatureProducts();
      const data = response.data.map((product) => {
        let urlImages = {};

        // Kiểm tra nếu url_images có giá trị hợp lệ
        if (product.productImage) {
          const cleanedUrlImages = product.productImage.replace(/\\\"/g, '"');
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
      setFeatureProducts(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getFeatureProductsOnPage();
  }, []);

  return (
    <div className="body w-full">
      <Header />
      <NotificationHandler setNotifications={setNotifications} />

      <NotificationList notifications={notifications} />

      <section className="hero mobile:bg-custom h-[90vh] w-full bg-[url('/images/hero4.jpg')] bg-cover bg-[top_25%_right_0] tablet:h-[70vh] tablet:bg-[top_30%_right_30%] tablet:px-[80px] mobile:px-[20px] mobile:py-[0px]">
        <div className="flex h-full w-full flex-col items-start justify-center bg-[rgba(8,28,14,0.38)] px-[80px]">
          <h2 className="text-[46px] font-bold leading-[54px] tracking-tight text-[#fff] mobile:text-[32px]">
            THỨC ĂN CHĂN NUÔI
          </h2>
          <p className="my-[15px] mb-[20px] text-[16px] tracking-tight text-[#fff]">
            Chất lượng vượt trội, dinh dưỡng vẹn toàn – Đồng hành cùng sự phát
            triển của đàn gia súc
          </p>
          <button className="cursor-pointer border-0 bg-transparent bg-[url('/images/button.png')] bg-no-repeat px-[80px] py-[14px] pl-[65px] pr-[80px] text-[15px] font-bold text-white">
            Mua ngay!!!
          </button>
        </div>
      </section>

      <section className="feature section-p1 flex flex-wrap items-center justify-evenly px-[80px] py-[40px] tablet:justify-center tablet:p-[40px] mobile:p-[20px]">
        <div className="fe-box my-[15px] w-[180px] rounded-[4px] border border-[#cce7d0] px-[15px] py-[25px] text-center shadow-[20px_20px_34px_rgba(0,0,0,0.03)] hover:shadow-[10px_10px_54px_rgba(70,62,221,0.1)] tablet:m-[15px]">
          <img
            src="images/features/duck.jpg"
            alt=""
            className="mb-[10px] w-full"
          />
          <h6 className="inline-block rounded-[4px] bg-[#cdebbc] px-[8px] pb-[6px] pt-[9px] text-[12px] font-bold leading-[1] text-[#088178]">
            Vịt
          </h6>
        </div>
        <div className="fe-box my-[15px] w-[180px] rounded-[4px] border border-[#cce7d0] px-[15px] py-[25px] text-center shadow-[20px_20px_34px_rgba(0,0,0,0.03)] hover:shadow-[10px_10px_54px_rgba(70,62,221,0.1)] tablet:m-[15px]">
          <img
            src="images/features/pig.jpg"
            alt=""
            className="mb-[10px] w-full"
          />
          <h6 className="inline-block rounded-[4px] bg-[#cdebbc] px-[8px] pb-[6px] pt-[9px] text-[12px] font-bold leading-[1] text-[#088178]">
            Lợn
          </h6>
        </div>
        <div className="fe-box my-[15px] w-[180px] rounded-[4px] border border-[#cce7d0] px-[15px] py-[25px] text-center shadow-[20px_20px_34px_rgba(0,0,0,0.03)] hover:shadow-[10px_10px_54px_rgba(70,62,221,0.1)] tablet:m-[15px]">
          <img
            src="images/features/fish.jpg"
            alt=""
            className="mb-[10px] w-full"
          />
          <h6 className="inline-block rounded-[4px] bg-[#cdebbc] px-[8px] pb-[6px] pt-[9px] text-[12px] font-bold leading-[1] text-[#088178]">
            Cá
          </h6>
        </div>
        <div className="fe-box my-[15px] w-[180px] rounded-[4px] border border-[#cce7d0] px-[15px] py-[25px] text-center shadow-[20px_20px_34px_rgba(0,0,0,0.03)] hover:shadow-[10px_10px_54px_rgba(70,62,221,0.1)] tablet:m-[15px]">
          <img
            src="images/features/chicken.jpg"
            alt=""
            className="mb-[10px] w-full bg-[#fff]"
          />
          <h6 className="inline-block rounded-[4px] bg-[#cdebbc] px-[8px] pb-[6px] pt-[9px] text-[12px] font-bold leading-[1] text-[#088178]">
            Gà
          </h6>
        </div>
      </section>

      <section
        id="product1"
        className="section-p1 px-[80px] py-[40px] text-center"
      >
        <h2 className="text-[46px] leading-[54px] text-[#222] mobile:text-[32px]">
          Sản phẩm nổi bật
        </h2>
        <p className="my-[15px] mb-[20px] text-[16px] text-[#465b52]">
          Featured products
        </p>
        <div
          className="pro-container flex flex-wrap justify-between pt-[20px] tablet:justify-center"
          id="product-render"
        >
          {renderFeatureProducts()}
        </div>
      </section>

      <section className="banner section-m1 my-[40px] flex h-[40vh] w-full flex-col items-center justify-center bg-[url('images/equipment-hero.webp')] bg-cover bg-center text-center tablet:h-[20vh]">
        <h2 className="py-[10px] text-[30px] leading-[54px] text-white mobile:text-[32px]">
          Chọn ngay hôm nay – Thức ăn chăn nuôi chuẩn chất lượng, tăng năng suất
          vượt trội!
        </h2>
        <button className="normal cursor-pointer rounded-[4px] border-0 bg-white px-[30px] py-[15px] text-[14px] font-semibold text-[#000] outline-none transition duration-200 ease-in-out hover:bg-[rgb(255,240,107)] hover:text-white">
          Khám phá thêm
        </button>
      </section>

      <LatestProducts />

      <section className="sm-banner section-p1 flex w-full flex-wrap justify-between px-[80px] py-[40px]">
        <div className="banner-box h-[50vh] w-full min-w-[300px] bg-[url('/images/GLOBADRY-banner.jpg')] bg-cover bg-center text-center tablet:h-[30vh] tablet:w-full mobile:mb-[20px] mobile:h-[40vh]">
          <div className="flex h-full w-full flex-col items-start justify-center bg-[rgba(8,28,14,0.45)] p-[30px]">
            <h2 className="text-[28px] font-extrabold leading-[54px] text-white mobile:text-[32px]">
              Đừng bỏ lỡ! Ưu đãi hấp dẫn mỗi ngày
            </h2>
            <span className="pb-[15px] text-[14px] font-medium text-white">
              Mua nhiều, tiết kiệm lớn!
            </span>
            <button className="white cursor-pointer border border-white bg-transparent px-[18px] py-[11px] text-[13px] font-semibold text-white outline-none transition duration-200 ease-in-out hover:bg-[rgb(255,240,107)]">
              Xem thêm
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;
