import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { IoMenu, IoClose } from "react-icons/io5";

function ShipperHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="sticky top-0 z-50 flex flex-col items-end bg-[#225a3e] px-12 py-3 shadow-lg shadow-custom-dark">
      {/* Logo */}
      <a href="/home-page" className="-mt-1 absolute left-10">
        <img
          src="images/Crops organic farm.png"
          className="rounded-[0_20px_20px_20px] hover:rounded-[20px_20px_0_20px] shadow-custom-dark transition-all duration-500 ease-in-out p-1 w-20 h-[85px] md:w-[90px] md:h-[95px] bg-white fadeInUp md:border-0 border-2 border-[#006633]"
          alt="Logo"
        />
      </a>
      <div className="flex items-center -mt-5 pt-6">
        <button id="bar" className="px-4" onClick={toggleMenu}>
          {isMenuOpen ? (
            <IoClose className="h-[35px] w-[35px] text-white" aria-hidden="true" />
          ) : (
            <IoMenu className="h-[40px] w-[30px] text-white" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-[250px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out border-r-2 border-[#006532] ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo in Sidebar */}
        <a href="/home-page" className="block p-6 bg-white border-b-2 border-[#006532]">
          <img
            src="images/Crops organic farm.png"
            className="w-24 h-auto rounded-[0_30px_30px_30px] mx-auto"
            alt="Logo"
          />
        </a>

        {/* Navigation Links */}
        <ul className="flex flex-col items-start text-[#006532] font-semibold">
          <li className="w-full px-6 py-4 border-b border-[#006532] hover:bg-[#80c9a4] hover:text-white transition-colors duration-300">
            <NavLink
              to="/shipping"
              className={({ isActive }) =>
                isActive
                  ? "text-[#006532] border-l-4 border-[#006532] pl-2"
                  : "text-[#006532] hover:text-white"
              }
            >
              Đơn hàng
            </NavLink>
          </li>
          <li className="w-full px-6 py-4 border-b border-[#006532] hover:bg-[#80c9a4] hover:text-white transition-colors duration-300">
            <NavLink
              to="/ship-history"
              className={({ isActive }) =>
                isActive
                  ? "text-[#006532] border-l-4 border-[#006532] pl-2"
                  : "text-[#006532] hover:text-white"
              }
            >
              Lịch sử
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ShipperHeader;
