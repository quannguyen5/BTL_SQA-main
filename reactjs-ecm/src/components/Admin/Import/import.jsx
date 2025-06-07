import React, { useState } from 'react';
import AdminHeader from "../AdminHeader/admin-header.jsx";
import { FaPlus, FaSave, FaTrash, FaEye, FaSearch, FaFilter, FaSort } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';
import { MdOutlineInbox, MdOutlineCancel } from "react-icons/md";

const initialImports = [
  {
    id: 'IMP001',
    total_amount: 1000000,
    employee_name: 'Nguyen Van A',
    createdAt: '2024-10-20',
    products: [
      { id: 'IP001', quantity: 10, price_in: 100000, product_name: 'Product A' },
      { id: 'IP002', quantity: 20, price_in: 50000, product_name: 'Product B' }
    ]
  },
  {
    id: 'IMP002',
    total_amount: 500000,
    employee_name: 'Tran Thi B',
    createdAt: '2024-10-21',
    products: [
      { id: 'IP003', quantity: 5, price_in: 200000, product_name: 'Product C' },
      { id: 'IP004', quantity: 10, price_in: 30000, product_name: 'Product D' }
    ]
  },
  // Thêm các đơn nhập hàng khác nếu cần
];

const productList = ['Product A', 'Product B', 'Product C', 'Product D'];

const ImportProduct = () => {
  const [imports, setImports] = useState(initialImports);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [currentImport, setCurrentImport] = useState(null);
  
  // State cho tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [newImport, setNewImport] = useState({
    id: '',
    total_amount: '',
    employee_name: '',
    createdAt: '',
    products: [{ id: '', quantity: '', price_in: '', product_name: '' }]
  });

  const sortedImports = React.useMemo(() => {
    let sortableImports = [...imports];
    if (sortConfig !== null) {
      sortableImports.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableImports;
  }, [imports, sortConfig]);

  const requestSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleViewImport = (imp) => {
    setCurrentImport(imp);
    setShowViewPopup(true);
  };

  const handleDeleteImport = (id) => {
    setImports(imports.filter(imp => imp.id !== id));
  };

  const handleAddImport = () => {
    setImports([...imports, newImport]);
    setShowAddPopup(false);
    setNewImport({
      id: '',
      total_amount: '',
      employee_name: '',
      createdAt: '',
      products: [{ id: '', quantity: '', price_in: '', product_name: '' }]
    });
  };

  const handleAddProductField = () => {
    setNewImport({
      ...newImport,
      products: [...newImport.products, { id: '', quantity: '', price_in: '', product_name: '' }]
    });
  };

  // Hàm để lọc đơn nhập hàng
  const filteredImports = sortedImports.filter(imp => {
    return imp.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-gray-100 min-h-screen">
      <AdminHeader />
      <div className="w-full p-4">
        <h1 className="text-4xl font-bold mb-8 mt-4 text-[#006532] text-center">Quản lý đơn nhập hàng</h1>

        {/* Tìm kiếm và lọc */}
        <div className="flex items-center flex-col md:flex-row  mt-4 mb-3 px-6 py-3 bg-white rounded-lg">
          <div className="flex items-center space-x-2 mb-2 md:mb-0 w-full md:w-2/5 ">
            <div className="relative w-full ">
              <input 
                type="text" 
                placeholder="Tìm kiếm ...." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-lg px-4 py-2 w-full"
              />
              <FaSearch className="absolute top-3 right-4 text-gray-400" />
            </div>
          </div>
          
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-[#006532] text-white">
              <tr>
                <th className="py-3 px-6 text-left">ID <FaSort className="inline ml-1 cursor-pointer" onClick={() => requestSort('id')}/></th>
                <th className="py-3 px-6 text-left">Tổng số tiền <FaSort className="inline ml-1 cursor-pointer" onClick={() => requestSort('total_amount')}/></th>
                <th className="py-3 px-6 text-left">Tên nhân viên <FaSort className="inline ml-1 cursor-pointer" onClick={() => requestSort('employee_name')}/></th>
                <th className="py-3 px-6 text-left">Ngày tạo <FaSort className="inline ml-1 cursor-pointer" onClick={() => requestSort('createdAt')}/></th>
                <th className="py-3 px-6 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredImports.map((imp, index) => (
                <tr key={index} className="border-b hover:bg-indigo-50">
                  <td className="py-4 px-6">{imp.id}</td>
                  <td className="py-4 px-6">{imp.total_amount}</td>
                  <td className="py-4 px-6">{imp.employee_name}</td>
                  <td className="py-4 px-6">{imp.createdAt}</td>
                  <td className="py-4 px-6">
                    <button onClick={() => handleViewImport(imp)} className="text-blue-500 hover:text-blue-700 mr-2"><FaEye /></button>
                    <button onClick={() => handleDeleteImport(imp.id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
            
          </table>
          
        </div>

        {showViewPopup && currentImport && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-8 w-1/2">
              <h2 className="text-2xl font-bold mb-4">Chi tiết đơn nhập</h2>
              <div className="mb-4">
                <p><strong>ID:</strong> {currentImport.id}</p>
                <p><strong>Tổng số tiền:</strong> {currentImport.total_amount}</p>
                <p><strong>Tên nhân viên:</strong> {currentImport.employee_name}</p>
                <p><strong>Ngày tạo:</strong> {currentImport.createdAt}</p>
                <h3 className="text-xl font-bold mt-4">Sản phẩm</h3>
                <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden mt-4">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="py-2 px-4 text-left">Tên sản phẩm</th>
                      <th className="py-2 px-4 text-left">Số lượng</th>
                      <th className="py-2 px-4 text-left">Giá nhập</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentImport.products.map((product, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-4">{product.product_name}</td>
                        <td className="py-2 px-4">{product.quantity}</td>
                        <td className="py-2 px-4">{product.price_in}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={() => setShowViewPopup(false)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700">Đóng</button>
            </div>
          </div>
        )}

        {showAddPopup && (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
    <div className="relative bg-white rounded-lg p-8 w-11/12 md:w-3/4 lg:w-1/2 max-h-full overflow-y-auto">
     
      <h2 className="text-2xl font-bold mb-4">Thêm đơn nhập hàng</h2>
      <div className="flex flex-wrap -mx-2 mb-4">
       
        <div className="w-full md:w-1/2 px-2 mb-4">
          <label className="block mb-2">Tổng số tiền:</label>
          <input
            type="number"
            value={newImport.total_amount}
            onChange={(e) => setNewImport({ ...newImport, total_amount: e.target.value })}
            className="border rounded-lg px-4 py-2 w-full"
          />
        </div>
        <div className="w-full md:w-1/2 px-2 mb-4">
          <label className="block mb-2">Tên nhân viên:</label>
          <input
            type="text"
            value={newImport.employee_name}
            onChange={(e) => setNewImport({ ...newImport, employee_name: e.target.value })}
            className="border rounded-lg px-4 py-2 w-full"
          />
        </div>
      </div>
      <h3 className="text-xl font-bold mt-4 mb-4">Sản phẩm</h3>
      {newImport.products.map((product, index) => (
        <div key={index} className="flex flex-wrap -mx-2 mb-4">
          <div className="w-full md:w-1/2 px-2 mb-4">
            <label className="block mb-2">Tên sản phẩm:</label>
            <select
              value={product.product_name}
              onChange={(e) => {
                const updatedProducts = newImport.products.map((p, i) =>
                  i === index ? { ...p, product_name: e.target.value } : p
                );
                setNewImport({ ...newImport, products: updatedProducts });
              }}
              className="border rounded-lg px-4 py-2 w-full"
            >
              <option value="">Chọn sản phẩm</option>
              {productList.map((prod, i) => (
                <option key={i} value={prod}>{prod}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-1/2 px-2 mb-4">
            <label className="block mb-2">Số lượng:</label>
            <input
              type="number"
              value={product.quantity}
              onChange={(e) => {
                const updatedProducts = newImport.products.map((p, i) =>
                  i === index ? { ...p, quantity: e.target.value } : p
                );
                setNewImport({ ...newImport, products: updatedProducts });
              }}
              className="border rounded-lg px-4 py-2 w-full"
            />
          </div>
          <div className="w-full md:w-1/2 px-2 mb-4">
            <label className="block mb-2">Giá nhập:</label>
            <input
              type="number"
              value={product.price_in}
              onChange={(e) => {
                const updatedProducts = newImport.products.map((p, i) =>
                  i === index ? { ...p, price_in: e.target.value } : p
                );
                setNewImport({ ...newImport, products: updatedProducts });
              }}
              className="border rounded-lg px-4 py-2 w-full"
            />
          </div>
        </div>
      ))}
      <button
        onClick={handleAddProductField}
        className="bg-[#006532] text-white px-4 py-2 rounded-lg hover:bg-[#004f29] mb-4"
      >
        Thêm sản phẩm
      </button>
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleAddImport}
          className="bg-[#006532] text-white px-4 py-2 rounded-lg hover:bg-[#004f29]"
        >
          Lưu
        </button>
        <button
          onClick={() => setShowAddPopup(false)}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Hủy
        </button>
      </div>
    </div>
  </div>
)}
          

          <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowAddPopup(true)}
                className="fixed bottom-4 right-4 bg-[#006532] hover:bg-[#005a2f] text-white p-4 rounded-full shadow-lg flex items-center justify-center"
              >
                <FaPlus size={24} /> {/* Icon nút */}
            </button>
          </div>

       
      </div>
    </div>
  );
}

export default ImportProduct;
