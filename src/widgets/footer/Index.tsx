import Image from "@/foundation/components/icons/Image";
import "./footer.css";

const Index = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border-1 bg-background-2 overflow-x-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background-1 via-background-2 to-background-1 pointer-events-none opacity-50" />

      {/* Main Footer Content */}
      <div className="relative px-6 py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Company Info */}
            <div className="space-y-6 animate-fade-in">
              <div className="transform transition-transform w-32 h-32 rounded-xl overflow-hidden relative duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                <Image name="logo" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <p className="text-sm leading-relaxed text-neutral-7 max-w-xs">
                Cửa hàng điện tử hiện đại với hàng ngàn sản phẩm chất lượng cao. Cam kết giao hàng
                nhanh, giá tốt nhất thị trường.
              </p>
              <div className="flex space-x-3 pt-2">
                <a
                  href="#"
                  className="group relative w-11 h-11 flex items-center justify-center rounded-xl bg-background-1 border border-border-1 hover:bg-primary-6 text-neutral-6 hover:text-white transition-all duration-300 transform hover:scale-110 hover:rotate-3 hover:shadow-lg hover:shadow-primary-6/30"
                  aria-label="Facebook"
                >
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="group relative w-11 h-11 flex items-center justify-center rounded-xl bg-background-1 border border-border-1 hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600 text-neutral-6 hover:text-white transition-all duration-300 transform hover:scale-110 hover:rotate-3 hover:shadow-lg hover:shadow-pink-500/30"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="group relative w-11 h-11 flex items-center justify-center rounded-xl bg-background-1 border border-border-1 hover:bg-primary-6 text-neutral-6 hover:text-white transition-all duration-300 transform hover:scale-110 hover:rotate-3 hover:shadow-lg hover:shadow-primary-6/30"
                  aria-label="Twitter"
                >
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="group relative w-11 h-11 flex items-center justify-center rounded-xl bg-background-1 border border-border-1 hover:bg-red-600 text-neutral-6 hover:text-white transition-all duration-300 transform hover:scale-110 hover:rotate-3 hover:shadow-lg hover:shadow-red-600/30"
                  aria-label="YouTube"
                >
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Về Chúng Tôi */}
            <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <h3 className="font-bold text-neutral-9 mb-2 text-lg relative inline-block">
                Về Chúng Tôi
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-6 via-primary-5 to-primary-6 rounded-full" />
              </h3>
              <ul className="space-y-3.5 mt-6">
                {[
                  "Giới thiệu",
                  "Tuyển dụng",
                  "Chính sách bảo mật",
                  "Điều khoản sử dụng",
                  "Chính sách đổi trả",
                ].map((item, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="group relative text-sm text-neutral-7 hover:text-primary-6 transition-colors duration-300 inline-block font-medium"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {item}
                      </span>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-6 transition-all duration-300 group-hover:w-full rounded-full" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hỗ Trợ Khách Hàng */}
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h3 className="font-bold text-neutral-9 mb-2 text-lg relative inline-block">
                Hỗ Trợ Khách Hàng
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-6 via-primary-5 to-primary-6 rounded-full" />
              </h3>
              <ul className="space-y-3.5 mt-6">
                {[
                  "Trung tâm trợ giúp",
                  "Hướng dẫn mua hàng",
                  "Hướng dẫn thanh toán",
                  "Chính sách vận chuyển",
                  "Câu hỏi thường gặp",
                ].map((item, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="group relative text-sm text-neutral-7 hover:text-primary-6 transition-colors duration-300 inline-block font-medium"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {item}
                      </span>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-6 transition-all duration-300 group-hover:w-full rounded-full" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Liên Hệ */}
            <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <h3 className="font-bold text-neutral-9 mb-2 text-lg relative inline-block">
                Liên Hệ
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-6 via-primary-5 to-primary-6 rounded-full" />
              </h3>
              <ul className="space-y-4 mt-6">
                <li className="flex items-start space-x-3 group">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary-1 border border-primary-3 flex items-center justify-center text-primary-6 transition-all duration-300 group-hover:bg-primary-6 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-primary-6/30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-neutral-7 group-hover:text-primary-6 transition-colors duration-300 flex-1 font-medium">
                    Học Viện Kỹ Thuật Mật Mã, Hà Nội
                  </span>
                </li>
                <li className="flex items-center space-x-3 group">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary-1 border border-primary-3 flex items-center justify-center text-primary-6 transition-all duration-300 group-hover:bg-primary-6 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-primary-6/30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <a
                    href="tel:1900xxxx"
                    className="text-sm text-neutral-7 hover:text-primary-6 transition-colors duration-300 font-medium"
                  >
                    1900 xxxx
                  </a>
                </li>
                <li className="flex items-center space-x-3 group">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary-1 border border-primary-3 flex items-center justify-center text-primary-6 transition-all duration-300 group-hover:bg-primary-6 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-primary-6/30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <a
                    href="mailto:support@shop.com"
                    className="text-sm text-neutral-7 hover:text-primary-6 transition-colors duration-300 font-medium"
                  >
                    support@shop.com
                  </a>
                </li>
                <li className="flex items-center space-x-3 group">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary-1 border border-primary-3 flex items-center justify-center text-primary-6 transition-all duration-300 group-hover:bg-primary-6 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-primary-6/30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-neutral-7 group-hover:text-primary-6 transition-colors duration-300 font-medium">
                    8:00 - 22:00 hàng ngày
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-border-1 bg-background-1">
        <div className="px-6 py-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-neutral-7">
              © {currentYear}{" "}
              <span className="font-bold text-primary-6">Cửa hàng Điện Tử</span>. All rights
              reserved.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-neutral-7 font-medium hidden sm:inline">
                Phương thức thanh toán:
              </span>
              <div className="flex space-x-2">
                {[
                  { label: "COD", desc: "Thanh toán khi nhận hàng", color: "from-green-500 to-green-600" },
                  { label: "Sepay", desc: "Chuyển khoản ngân hàng", color: "from-blue-500 to-blue-600" },
                  { label: "Ví", desc: "Thanh toán bằng ví", color: "from-primary-6 to-primary-7" },
                ].map((method, index) => (
                  <div
                    key={index}
                    className="group relative px-4 h-8 bg-background-2 border border-border-1 hover:bg-gradient-to-br hover:from-primary-6 hover:to-primary-7 rounded-lg flex items-center justify-center shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 cursor-default"
                    title={method.desc}
                  >
                    <span className="text-xs font-bold text-neutral-7 group-hover:text-white transition-colors duration-300">
                      {method.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Index;
