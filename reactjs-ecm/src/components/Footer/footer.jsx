import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import img from '../../../public/images/Crops organic farm (1).png'
function Footer() {
  return (
    <footer className="bg-[#006532] text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center">
            <img 
              className="h-20 w-20 mr-3" 
              src={img}
              alt="SIGMA" 
            />
            <h1 className="text-2xl font-bold">FIVE FEEDS</h1>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <FaFacebookF />
            </a>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <FaYoutube />
            </a>
          </div>
        </div>
        
        <div className="bg-[#1d5137] text-[#006532] p-6 rounded-lg">
          <h2 className="text-xl text-white font-bold mb-4">Gửi phản hồi cho chúng tôi</h2>
          <form className="flex flex-col">
            <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
              <input
                type="text"
                placeholder="Họ tên"
                className="border bg-slate-100 border-gray-300 rounded-lg p-2 flex-1 mb-4 md:mb-0"
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="border bg-slate-100 border-gray-300 rounded-lg p-2 flex-1 mb-4 md:mb-0"
                required
              />
              <button
                type="submit"
                className="bg-white text-[#006532] hover:text-white hover:bg-[#006532] rounded-lg px-4 py-2"
              >
                Gửi
              </button>
            </div>
            <div className="flex flex-col mb-4">
              <textarea
                placeholder="Ghi chú"
                className="border bg-slate-100 border-gray-300 rounded-lg p-2 flex-1 mb-4"
                rows="3"
                required
              ></textarea>
            </div>
            
          </form>
        </div>

        <div className="mt-6">
          <ul className="flex space-x-4 justify-center">
            <li><a href="/" className="hover:text-gray-200">Trang chủ</a></li>
            <li><span>|</span></li>
            <li><a href="/" className="hover:text-gray-200">Về chúng tôi</a></li>
            <li><span>|</span></li>
            <li><a href="/" className="hover:text-gray-200">Liên hệ</a></li>
          </ul>
        </div>

        <div className="footer-bottom mt-4 flex justify-between items-center">
          <div>
            <span>© 2024 FIVE FEEDS.</span>
          </div>
          <div>
            <a href="/" className="hover:text-gray-200" target="_blank" rel="noopener noreferrer">
              Powered by PTIT
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;