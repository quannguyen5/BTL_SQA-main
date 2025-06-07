import React, { useEffect, useState } from "react";
import { PER_PAGE } from "../../constants/per-page";
import { createCart, getCarts, updateCart } from "../../services/cart-service";
import { getProducts, getQueryProducts } from "../../services/product-service";
import Header from "../Header/header";
import Footer from "../Footer/footer";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { PiShoppingCart } from "react-icons/pi";
import { getCategory } from "../../services/category-service";
import { getUserId } from "../../util/auth-local";
import img from "../../../public/images/de-heus-animal-nutrition_animals_poultry_hero.png";
import {
  NotificationList,
  notificationTypes,
  showNotification,
} from "../Notification/NotificationService";
import { useCart } from "../../Context/CartContext";
const ShopGrid = () => {
  const { page: pageParam, limit: limitParam } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [searchTerm, setSearchTerm] = useState(queryParams.get("name") || "");
  const [filterStatus, setFilterStatus] = useState(
    queryParams.get("category") || "",
  );
  const navigate = useNavigate();

  const [params, setParams] = useState({
    limit: Number(limitParam),
    page: Number(pageParam),
    total: 0,
    name: "",
    category_id: "",
  });

  const [category, setCategory] = useState([]);

  const [products, setProducts] = useState([]);

  const { carts, setCarts, setTotalQuantity } = useCart();

  const [notifications, setNotifications] = useState([]);

  // Cập nhật URL khi thay đổi filter
  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.set("name", searchTerm);
    if (filterStatus) queryParams.set("category", filterStatus);
    window.history.replaceState(
      null,
      "",
      `/product/search/${params.page}/${params.limit}?${queryParams.toString()}`,
    );
  }, [searchTerm, filterStatus, params.page, params.limit]);

  useEffect(() => {
    getCategoryOnPage();
  }, []);

  useEffect(() => {
    getQueryProductsOnPage();
  }, [params.name, params.category_id, params.page]);

  const getCategoryOnPage = async () => {
    try {
      const response = await getCategory(1, 20);

      setCategory(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getQueryProductsOnPage = async () => {
    try {
      const response = await getQueryProducts(
        params.page,
        params.limit,
        params.name,
        params.category_id,
      );

      const products = response.data.products.map((product) => {
        let urlImages = {};

        // Kiểm tra nếu url_images có giá trị hợp lệ
        if (product.url_images) {
          const cleanedUrlImages = product.url_images.replace(/\\\"/g, '"');
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
      setProducts(products);

      if (response.data.total !== params.total) {
        setParams((prev) => ({
          ...prev,
          total: response.data.total,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePageChange = (page) => {
    setParams((prev) => ({ ...prev, page: page }));
  };

  const handleAddToCart = async (productId) => {
    const product = products.find((prod) => prod.id === productId);
    const cartIndex = carts.findIndex((cart) => cart.product_id === product.id);

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
          product_id: product.id,
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

  const handleSearch = (e) => {
    const value = e.target.value.trim();
    setSearchTerm(value);
    setParams((prev) => ({
      ...prev,
      name: value,
      page: 1,
    }));
  };

  const handleFilter = (e) => {
    const value = e.target.value.trim();
    setFilterStatus(value);
    setParams((prev) => ({
      ...prev,
      category_id: value,
      page: 1,
    }));
  };

  const renderProducts = () => {
    if (products.length === 0) return;

    return products.map((product) => (
      <div
        key={product.id}
        onClick={() => navigate(`/product-detail/${product.id}`)}
        className="pro ease relative m-4 w-1/5 min-w-[250px] cursor-pointer border border-[#cce7d0] bg-white p-3 shadow-[20px_20px_30px_rgba(0,0,0,0.02)] transition duration-200 hover:shadow-[20px_20px_30px_rgba(0,0,0,0.06)]"
      >
        <img
          src={product.url_image1}
          alt={product.name}
          className="aspect-square w-full border-[1px] object-contain"
        />

        <div className="des pt-3 text-start">
          <span className="text-[13px] text-[#1a1a1a]">
            {product.category.name}
          </span>
          <h5 className="pt-2 text-[15px] font-semibold text-[#006532]">
            {product.name}
          </h5>
          <h5 className="pt-2 text-[13px] text-[#1a1a1a]">
            Bao: {product.weight}kg
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
              data-id={product.id}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleAddToCart(product.id);
              }}
            />
          </Link>
        </a>
      </div>
    ));
  };

  const renderPagination = () => {
    if (params.total < PER_PAGE) return null;

    const totalPages = Math.ceil(params.total / params.limit);
    const visiblePages = 5; // Hiển thị tối đa 5 trang

    const startPage = Math.max(1, params.page - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);

    return (
      <div id="pagination" className="section-p1">
        {params.page > 1 && (
          <button
            className="page mx-1 rounded bg-gray-200 p-2"
            onClick={() => handlePageChange(params.page - 1)}
          >
            Trước
          </button>
        )}
        {[...Array(endPage - startPage + 1)].map((_, index) => (
          <a
            key={startPage + index}
            data-page={startPage + index}
            className={`page ${
              params.page === startPage + index
                ? "active bg-[#006532] text-white"
                : "bg-gray-200"
            } mx-1 rounded p-2`}
            onClick={() => handlePageChange(startPage + index)}
          >
            {startPage + index}
          </a>
        ))}
        {params.page < totalPages && (
          <button
            className="page mx-1 rounded bg-gray-200 p-2"
            onClick={() => handlePageChange(params.page + 1)}
          >
            Tiếp
          </button>
        )}
      </div>
    );
  };

  return (
    <div>
      <Header />
      {/* Hiển thị các thông báo */}
      <NotificationList notifications={notifications} />
      <section
        id="page-header"
        className="h-[47vh]"
        style={{
          backgroundImage: `url(${img})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="flex h-full w-full flex-col items-start justify-end bg-[rgba(8,28,14,0.50)] text-center">
          <div className="mb-10 ml-28 flex flex-col items-start justify-start border-l-[8px] border-[#39a56f] pl-7">
            <h1 className="mb-2 text-5xl font-extrabold leading-tight tracking-tight text-[#fff]">
              FIVEFEED
            </h1>

            <h2 className="text-xl font-extrabold leading-tight tracking-tight text-[#fff]">
              Nuôi dưỡng thành công, gặt hái mùa vàng !
            </h2>
          </div>
        </div>
      </section>

      <section id="newsletter" className="section-p1 section-m1">
        <div className="flex flex-wrap items-center justify-between bg-[#006532] bg-[url(src/assets/images/b14.png)] bg-[20%_30%] bg-no-repeat p-4">
          <div className="relative ml-20 w-1/3">
            <select
              onChange={handleFilter}
              className="h-[3.125rem] w-full rounded border border-transparent px-5 text-[14px]"
            >
              <option value="">Tất cả</option>
              {category.map((cate) => (
                <option key={cate.id} value={cate.id}>
                  {cate.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form mr-20 flex w-1/3">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              id="search"
              onInput={handleSearch}
              className="h-[3.125rem] w-full rounded border border-transparent px-5 text-[14px]"
            />
          </div>
        </div>
      </section>

      <section id="product1" className="section-p1 px-[80px] py-[40px]">
        <div
          className="pro-container flex flex-wrap justify-between pt-[20px] tablet:justify-center"
          id="product-render"
        >
          {renderProducts()}
        </div>
      </section>

      <section
        id="pagination"
        className="section-p1 flex justify-center space-x-2"
      >
        <div className="mb-4 mt-2 flex justify-center">
          {renderPagination()}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ShopGrid;
