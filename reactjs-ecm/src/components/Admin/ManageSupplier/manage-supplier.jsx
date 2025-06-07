import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../AdminHeader/admin-header.jsx";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import {
  createSupplier,
  deleteSupplier,
  getSupplier,
  updateSupplier,
  getSearchSuppliers,
} from "../../../services/supplier-service.js";
import { uploadImage } from "../../../services/image-service.js";
import { ClipLoader } from "react-spinners";
import {
  showNotification,
  notificationTypes,
  NotificationList,
} from "../../Notification/NotificationService.jsx";
import NotificationHandler from "../../Notification/notification-handle.jsx";

const Modal = ({ children, showModal, setShowModal }) =>
  showModal ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="shadow-lg rounded-lg bg-white p-6">
        {children}
        <button
          onClick={() => setShowModal(false)}
          className="ml-4 mt-4 rounded bg-red-500 px-4 py-2 text-white"
        >
          Close
        </button>
      </div>
    </div>
  ) : null;

const ManageSupplier = () => {
  const { page: paramPage, limit: paramLimit } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [suppliers, setSuppliers] = useState([]);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    url_image: "",
    phone: "",
    address: "",
  });
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState(queryParams.get("search") || "");
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [page, setPage] = useState(Number(paramPage) || 1);
  const [limit, setLimit] = useState(Number(paramLimit) || 4);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [showConfirmDeleteMultiple, setShowConfirmDeleteMultiple] =
    useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.set("search", searchTerm);
    window.history.replaceState(
      null,
      "",
      `/admin/manage-supplier/${page}/${limit}?${queryParams.toString()}`,
    );
  }, [searchTerm, page, limit]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        if (searchTerm) {
          const searchData = {
            name: searchTerm,
            phone: "",
          };
          console.log(searchData);

          const result = await getSearchSuppliers(page, limit, searchData);
          if (Array.isArray(result.data.data)) {
            setSuppliers(result.data.data);
            const totalPages = Math.ceil(
              parseInt(result.data.total) / parseInt(result.data.limit),
            );
            setTotalPages(totalPages);
          } else {
            console.error(
              "Data returned from API is not an array:",
              result.data.data,
            );
            sessionStorage.setItem(
              "notification",
              JSON.stringify({
                message: "Lỗi trong quá trình xử lý. Vui lòng thử lại",
                type: notificationTypes.ERROR,
              }),
            );
          }
        } else {
          const fetchedSupplier = [];
          let newpage = 1;
          let totalUsers = 0;
          do {
            const result = await getSupplier(newpage, limit);
            console.log(result.data);

            if (result.success) {
              fetchedSupplier.push(...result.data.data);
              totalUsers = result.data.total;
              newpage++;
            } else {
              console.error("Failed to fetch users:", result.message);
              break;
            }
          } while (fetchedSupplier.length < totalUsers);

          setSuppliers(fetchedSupplier.slice((page - 1) * limit, page * limit));
          setTotalPages(Math.ceil(totalUsers / limit));
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        sessionStorage.setItem(
          "notification",
          JSON.stringify({
            message: "Lỗi trong quá trình xử lý",
            type: notificationTypes.ERROR,
          }),
        );
      }
    };

    fetchSuppliers();
  }, [searchTerm, page, limit]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearchChange = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    setPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSupplier({ ...newSupplier, [name]: value });
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    setLoading(true);
    if (files.length > 0) {
      try {
        const response = await uploadImage(files[0]);
        if (response && Array.isArray(response) && response.length > 0) {
          response[0] = JSON.stringify(response[0]);
          if (response[0].startsWith('"') && response[0].endsWith('"')) {
            response[0] = response[0].slice(1, -1); // Loại bỏ dấu ngoặc kép
          }
          setNewSupplier({ ...newSupplier, [name]: response[0] });
          console.log("Uploaded image URL:", response[0]);
        } else {
          console.error("No URL returned from the server.");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        sessionStorage.setItem(
          "notification",
          JSON.stringify({
            message: "Lỗi trong quá trình thêm ảnh. Vui lòng thử lại",
            type: notificationTypes.ERROR,
          }),
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const addSupplier = async (supplierData) => {
    try {
      const response = await createSupplier(supplierData);
      if (response.success) {
        setSuppliers([...suppliers, response.data]);
        setShowModal(false);
        setNewSupplier({
          name: "",
          url_image: "",
          phone: "",
          address: "",
        });
      }
      sessionStorage.setItem(
        "notification",
        JSON.stringify({
          message: "Thêm nhà cung cấp thành công!",
          type: notificationTypes.SUCCESS,
        }),
      );
      window.location.reload();
    } catch (error) {
      console.error("Failed to add supplier:", error);
      sessionStorage.setItem(
        "notification",
        JSON.stringify({
          message: "Thêm không thành công. Vui long thử lại",
          type: notificationTypes.ERROR,
        }),
      );
      window.location.reload();
    }
  };

  const handleAddSupplier = () => {
    if (!newSupplier.url_image) {
      console.error("Image is required for adding supplier.");
      showNotification(
        "Chưa có ảnh!",
        notificationTypes.WARNING,
        setNotifications,
      );
      window.location.reload();
      return;
    }
    addSupplier(newSupplier);
  };

  const updateOneSupplier = async (supplierData) => {
    const supplierId = supplierData.id;
    console.log(supplierId);
    try {
      const response = await updateSupplier(supplierId, supplierData);
      if (response.success) {
        setSuppliers((prevSuppliers) =>
          prevSuppliers.map((supplier) =>
            supplier.id === supplierData.id ? response.data : supplier,
          ),
        );
        setEditingSupplier(null);
        setShowModal(false);
        window.location.reload();
        sessionStorage.setItem(
          "notification",
          JSON.stringify({
            message: "Cập nhật nhà cung cấp thành công!",
            type: notificationTypes.SUCCESS,
          }),
        );
      }
    } catch (error) {
      console.error("Failed to update supplier:", error);
      window.location.reload();
      sessionStorage.setItem(
        "notification",
        JSON.stringify({
          message: "Cập nhật không thành công. Vui long thử lại",
          type: notificationTypes.ERROR,
        }),
      );
    }
  };

  const handleUpdateSupplier = () => {
    if (editingSupplier) {
      if (!newSupplier.url_image) {
        console.error("Image is required for updating supplier.");
        return; // Nếu không có ảnh, không thực hiện cập nhật
      }

      newSupplier.id = editingSupplier.id;
      console.log(newSupplier);
      updateOneSupplier(newSupplier);

      setNewSupplier({
        name: "",
        url_image: "",
        phone: "",
        address: "",
        id: "",
      });
    }
  };

  const deleteOneSupplier = async (id) => {
    try {
      const response = await deleteSupplier(id);
      if (response.success) {
        setSuppliers((prevSuppliers) =>
          prevSuppliers.filter((supplier) => supplier.id !== id),
        );
        sessionStorage.setItem(
          "notification",
          JSON.stringify({
            message: "Xóa nhà cung cấp thành công!",
            type: notificationTypes.SUCCESS,
          }),
        );
      } else {
        throw new Error("Failed to delete supplier");
      }
    } catch (error) {
      console.error("Failed to delete supplier:", error);
      sessionStorage.setItem(
        "notification",
        JSON.stringify({
          message: "Xóa không thành công. Vui long thử lại",
          type: notificationTypes.ERROR,
        }),
      );
    }
  };

  const handleDeleteSupplier = async (id) => {
    setShowConfirmDelete(true);
    setSupplierToDelete(id);
  };

  const confirmDeleteSupplier = async () => {
    if (supplierToDelete !== null) {
      await deleteOneSupplier(supplierToDelete);
      setSupplierToDelete(null);
      setShowConfirmDelete(false);
      window.location.reload();
    }
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier(supplier);
    setShowModal(true);
  };

  const handleSelectSupplier = (id) => {
    if (selectedSuppliers.includes(id)) {
      setSelectedSuppliers(selectedSuppliers.filter((cateId) => cateId !== id));
    } else {
      setSelectedSuppliers([...selectedSuppliers, id]);
    }
  };

  const deleteSelectedSuppliers = async () => {
    try {
      console.log("Selected suppliers to delete:", selectedSuppliers);

      await Promise.all(
        selectedSuppliers.map(async (id) => {
          const response = await deleteSupplier(id);
          if (!response.success) {
            throw new Error(`Failed to delete supplier with id ${id}`);
          }
          return response;
        }),
      );

      setSuppliers(
        suppliers.filter(
          (supplier) => !selectedSuppliers.includes(supplier.id),
        ),
      );

      setSelectedSuppliers([]);
      sessionStorage.setItem(
        "notification",
        JSON.stringify({
          message: "Xóa nhà cung cấp thành công!",
          type: notificationTypes.SUCCESS,
        }),
      );

      console.log("Suppliers after deletion:", suppliers);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting selected suppliers:", error);
      sessionStorage.setItem(
        "notification",
        JSON.stringify({
          message: "Xóa không thành công. Vui lòng thử lại",
          type: notificationTypes.ERROR,
        }),
      );
    }
  };

  const handleDeleteSelectedSuppliers = () => {
    setShowConfirmDeleteMultiple(true);
  };

  const confirmDeleteSelectedSuppliers = async () => {
    await deleteSelectedSuppliers();
    setShowConfirmDeleteMultiple(false);
    window.location.reload();
  };
  // Hàm lọc danh sách suppliers
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const renderPagination = () => {
    const visiblePages = 5; // Hiển thị tối đa 5 trang

    const startPage = Math.max(1, page - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);

    return (
      <div id="pagination" className="section-p1">
        {page > 1 && (
          <button
            className="page mx-1 rounded bg-gray-200 p-2"
            onClick={() => handlePageChange(page - 1)}
          >
            Trước
          </button>
        )}
        {[...Array(endPage - startPage + 1)].map((_, index) => (
          <a
            key={startPage + index}
            data-page={startPage + index}
            className={`page px-3 ${
              page === startPage + index
                ? "active bg-[#006532] text-white"
                : "bg-gray-200"
            } mx-1 rounded p-2`}
            onClick={() => handlePageChange(startPage + index)}
          >
            {startPage + index}
          </a>
        ))}
        {page < totalPages && (
          <button
            className="page mx-1 rounded bg-gray-200 p-2"
            onClick={() => handlePageChange(page + 1)}
          >
            Tiếp
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed z-50 space-y-3">
        <NotificationList notifications={notifications} />
      </div>
      <NotificationHandler setNotifications={setNotifications} />
      <AdminHeader />
      <div className="ml-[260px] w-5/6 p-4">
        <h1 className="mb-8 mt-4 text-start text-4xl font-bold text-[#222222]">
          Quản lý nhà cung cấp
        </h1>

        <Modal showModal={showModal} setShowModal={setShowModal}>
          <h2 className="mb-4 text-2xl font-semibold text-[#006532]">
            {editingSupplier ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp"}
          </h2>
          {loading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
              <ClipLoader color="#006532" size={50} loading={loading} />
            </div>
          )}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <input
              type="text"
              name="name"
              value={newSupplier.name}
              onChange={handleInputChange}
              placeholder="Tên nhà cung cấp"
              className="rounded border p-2"
            />
            <input
              type="file"
              name="url_image"
              onChange={handleFileChange}
              className="rounded border p-2"
            />

            <input
              type="text"
              name="phone"
              value={newSupplier.phone}
              onChange={handleInputChange}
              placeholder="Số điện thoại"
              className="rounded border p-2"
            />

            <input
              type="text"
              name="address"
              value={newSupplier.address}
              onChange={handleInputChange}
              placeholder="Địa chỉ"
              className="rounded border p-2"
            />
          </div>
          <button
            onClick={editingSupplier ? handleUpdateSupplier : handleAddSupplier}
            className="shadow mt-4 rounded bg-[#006532] px-4 py-2 text-white hover:bg-[#005a2f]"
          >
            {editingSupplier ? "Update Supplier" : "Add Supplier"}
          </button>
        </Modal>

        {/* Thanh tìm kiếm và lọc */}
        <div className="mb-3 mt-4 flex flex-col justify-between rounded-lg bg-white px-6 py-3 md:flex-row">
          <div className="flex w-1/5 items-center space-x-2">
            <div className="mt-1 pr-4 tablet:absolute tablet:left-10 tablet:mt-[148px]">
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedSuppliers(
                      suppliers.map((supplier) => supplier.id),
                    );
                  } else {
                    setSelectedSuppliers([]);
                  }
                }}
              />
            </div>
            <div className="tablet:absolute tablet:left-16 tablet:mt-36">
              {selectedSuppliers.length > 0 && (
                <FaTrash
                  onClick={handleDeleteSelectedSuppliers}
                  className="text-gray-400 hover:text-red-500"
                />
              )}
            </div>
          </div>
          <div className="mb-2 flex w-full items-center space-x-2 md:mb-0 md:w-2/5">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm kiếm bằng tên"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full rounded-lg border border-[#00653287] px-4 py-2"
              />
              <FaSearch className="absolute right-4 top-3 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="shadow-md rounded-lg border border-t-4 border-[#e0e0e0] border-t-[#006532] bg-white p-6 transition-shadow duration-300 ease-in-out hover:shadow-custom-dark"
              >
                <h3 className="mb-2 text-xl font-semibold text-[#006532]">
                  {supplier.name}
                </h3>
                <p className="mb-2 text-gray-600">
                  {/* <strong>Ảnh:</strong>{" "} */}
                  <img
                    src={supplier.url_image}
                    alt={supplier.name}
                    className="h-16 w-16 rounded"
                  />
                </p>
                <p className="mb-2 text-gray-600">
                  <strong>Điện thoại:</strong> {supplier.phone}
                </p>
                <p className="mb-2 text-gray-600">
                  <strong>Địa chỉ:</strong>
                  {supplier.address}
                </p>

                <div className="mt-4 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedSuppliers.includes(supplier.id)}
                    onChange={() => handleSelectSupplier(supplier.id)}
                    className="mt-[2px] size-[14px]"
                  />
                  <button
                    onClick={() => handleEditSupplier(supplier)}
                    className="rounded py-1 pl-1 text-[#006532] hover:text-[#56bb89]"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteSupplier(supplier.id)}
                    className="rounded py-1 pl-1 text-red-700 hover:text-red-500"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {showConfirmDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="shadow-lg rounded-lg bg-white p-6">
              <h2 className="mb-4 text-2xl font-semibold text-gray-600">
                Xác nhận xóa
              </h2>
              <p>Bạn có chắc chắn muốn xóa nhà cung cấp này không?</p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="mr-2 rounded bg-gray-300 px-4 py-2 font-bold text-gray-800 hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDeleteSupplier}
                  className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pop-up xác nhận xóa nhiều nhà cung cấp */}
        {showConfirmDeleteMultiple && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="shadow-lg rounded-lg bg-white p-6">
              <h2 className="mb-4 text-2xl font-semibold text-gray-600">
                Xác nhận xóa
              </h2>
              <p>Bạn có chắc chắn muốn xóa những nhà cung cấp đã chọn không?</p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowConfirmDeleteMultiple(false)}
                  className="mr-2 rounded bg-gray-300 px-4 py-2 font-bold text-gray-800 hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDeleteSelectedSuppliers}
                  className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Nút phân trang */}
        {/* <div className="mt-4 flex justify-center"> */}
        {/* {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`mx-1 px-3 py-1 rounded ${index + 1 === page ? 'bg-[#006532] text-white' : 'bg-gray-200 text-gray-800 hover:bg-blue-200'}`}
            disabled={index + 1 === page} // Vô hiệu hóa nút hiện tại
          >
            {index + 1}
          </button>
        ))} */}
        {/* </div> */}
        <section
          id="pagination"
          className="section-p1 mt-5 flex justify-center space-x-2"
        >
          <div className="mb-4 mt-2 flex justify-center">
            {renderPagination()}
          </div>
        </section>

        <button
          onClick={() => {
            setNewSupplier({
              name: "",
              url_image: "",
              phone: "",
              address: "",
            });
            setEditingSupplier(null);
            setShowModal(true);
          }}
          className="shadow-lg fixed bottom-10 right-10 rounded-full bg-[#006532] p-4 text-white transition-colors duration-300 hover:bg-[#4d9d75]"
        >
          <FaPlus size={24} />
        </button>
      </div>
    </div>
  );
};

export default ManageSupplier;
