import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../Header/header.jsx";
import { PiShoppingCart } from "react-icons/pi";
import { fetchProductDetail } from "../../services/product-service.js";
import { getCategory } from "../../services/category-service.js";
import Footer from "../Footer/footer.jsx";
import { PiMinusBold, PiPlusBold } from "react-icons/pi";
import {
  authLocal,
  userIdLocal,
  getToken,
  getUserId,
} from "../../util/auth-local.js"; // Import the auth methods
import {
  getCarts,
  createCart,
  updateCart,
} from "../../services/cart-service.js"; // Assuming you have a cart service to handle API calls
import img from "../../../public/images/checkout-banner.jpg";
import LatestProducts from "../HomePages/LatestProducts.jsx";
import {
  NotificationList,
  notificationTypes,
  showNotification,
} from "../Notification/NotificationService.jsx";
import { useCart } from "../../Context/CartContext.jsx";

const Image = ({ mainImage, setMainImage, productImages }) => {
  return (
    <div className="single-pro-image md:mr-12 md:w-1/3 xl:mr-12 xl:w-2/3">
      {/* Ảnh chính */}
      <div className="flex h-[450px] justify-center">
        <img src={mainImage} className="mb-2 h-full" alt="Main Product" />
      </div>
      {/* Nhóm ảnh nhỏ */}
      <div className="small-img-group mt-1 flex h-1/4 w-full justify-between">
        {productImages.map((img, index) => (
          <div
            key={index}
            className={`small-img-col w-24p w-1/2 cursor-pointer ${
              img === mainImage ? "border-2 border-[#0065322a]" : ""
            }`}
            onClick={() => setMainImage(img)}
          >
            <img
              src={img}
              className="h-full w-full"
              alt={`Thumbnail ${index + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  // const [carts, setCarts] = useState([]);

  const [notifications, setNotifications] = useState([]);

  const { carts, setCarts, setTotalCost, setTotalQuantity } = useCart();

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1)); // Không cho phép số âm
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategory(1, 20);
        setCategory(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await fetchProductDetail(productId);
        if (data) {
          let urlImages = {};
          if (data.url_images) {
            const cleanedUrlImages = data.url_images.replace(/\\\"/g, '"');
            try {
              urlImages = JSON.parse(cleanedUrlImages);
            } catch (error) {
              console.error("Error parsing url_images:", error);
              urlImages = {};
            }
          }

          setProduct({
            ...data,
            url_image1: urlImages.url_images1 || "",
            url_image2: urlImages.url_images2 || "",
          });
          setMainImage(urlImages.url_images1 || "");
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const getCartsOnPage = async () => {
      try {
        let token = getToken();
        if (token) {
          let userId = userIdLocal.getUserId();
          userId = userId.replace(/^"|"$/g, "");

          if (userId) {
            const cartsData = await getCarts(); // Lấy giỏ hàng từ API
            setCarts(cartsData.data.data.cart); // Cập nhật giỏ hàng
          }
        }
      } catch (error) {
        console.log("Error fetching carts:", error);
      }
    };

    getCartsOnPage();
  }, []);

  const handleAddToCart = async () => {
    try {
      let token = getToken();
      if (token) {
        let userId = userIdLocal.getUserId();
        userId = userId.replace(/^"|"$/g, "");

        if (userId) {
          const cartIndex = carts.findIndex(
            (cart) => cart.product_id === productId,
          );

          const cartData = {
            quantity: quantity,
            product_id: productId,
            user_id: userId,
          };

          if (cartIndex !== -1) {
            await updateCart(
              {
                ...carts[cartIndex],
                quantity: carts[cartIndex].quantity + quantity,
              },
              token,
            );
          } else {
            await createCart(cartData, token);
            // setTotalQuantity((prev) => prev + 1); // Cập nhật ngay lập tức
          }

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

            // const cost = cartData.reduce(
            //   (total, item) => total + item.quantity * item.product.priceout,
            //   0,
            // );
            // setTotalCost(cost);
          }

          showNotification(
            "Sản phẩm đã được thêm vào giỏ hàng!",
            notificationTypes.SUCCESS,
            setNotifications,
          );
        } else {
          alert("User ID is missing. Please log in.");
        }
      } else {
        alert("Token is missing. Please log in.");
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found.</div>;

  // const productImages = product.images || [product.url_images];
  const productImages = [product.url_image1, product.url_image2];

  return (
    <>
      <Header />
      {/* Hiển thị các thông báo */}
      <NotificationList notifications={notifications} />
      <section
        id="page-header"
        className="h-56"
        style={{
          backgroundImage: `url(${img})`,
          backgroundPosition: "center 20%",
          backgroundSize: "cover",
        }}
      >
        <div className="flex h-full w-full flex-col items-start justify-end bg-[rgba(8,28,14,0.50)] text-center">
          <div className="mb-10 ml-60 flex flex-col items-start justify-start border-l-[8px] border-[#39a56f] pl-7">
            <h1 className="mb-2 text-4xl font-extrabold leading-tight tracking-tight text-[#fff]">
              {product.name}
            </h1>

            <h2 className="text-xl font-semibold leading-tight tracking-tight text-[#fff]">
              Home /{" "}
              {category.find((category) => category.id === product.category_id)
                ?.name || "Không rõ"}
            </h2>
          </div>
        </div>
      </section>

      <section
        id="prodetails"
        className="mx-10 mt-5 flex flex-col md:flex-row xl:mx-28"
      >
        <Image
          mainImage={mainImage}
          setMainImage={setMainImage}
          productImages={productImages}
        />
        <div className="single-pro-details pt-8 md:w-2/3 xl:w-full">
          <h4 className="py-5 text-4xl font-bold text-[#006532]">
            {product.name}
          </h4>
          <h2 className="flex text-2xl font-semibold text-[#006532]">
            {/* {product.priceout}đ */}
            <p className="mr-1 mt-[2px] text-lg font-normal underline">đ</p>
            {new Intl.NumberFormat("vi-VN").format(product.priceout)}
          </h2>
          <div className="mt-4 flex">
            <div className="product__details__quantity">
              <div className="flex h-[48px] w-[140px] items-center rounded border-2 border-[#00653265] bg-white">
                <button
                  className="ml-[18px] mr-1 text-base font-normal text-gray-600 hover:bg-gray-300 focus:outline-none"
                  onClick={handleDecrease}
                >
                  <PiMinusBold />
                </button>
                <input
                  type="text"
                  value={quantity}
                  readOnly
                  className="mr-1 w-16 border-0 text-center text-base font-normal text-gray-600 focus:outline-none"
                />
                <button
                  className="text-base font-normal text-gray-600 hover:bg-gray-300 focus:outline-none"
                  onClick={handleIncrease}
                >
                  <PiPlusBold />
                </button>
              </div>
            </div>
            <button
              className="ml-4 h-12 rounded bg-[#006532] px-4 py-2 text-white"
              onClick={handleAddToCart}
            >
              Thêm vào giỏ hàng
            </button>
          </div>
          <h4 className="pb-5 pt-10 text-2xl font-semibold text-[#777777]">
            Chi tiết sản phẩm
          </h4>
          <p className="text-l leading-[25px] text-[#777777]">
            {product.description}
          </p>
          <p className="text-l leading-[25px] text-[#777777]">
            Kho: {product.stockQuantity}{" "}
          </p>
          <p className="text-l leading-[25px] text-[#777777]">
            Bao: {product.weight}kg
          </p>
        </div>
      </section>

      <div className="bg-[#f9f9f9]">
        <LatestProducts />
      </div>

      <Footer />
    </>
  );
};

export default ProductDetail;
