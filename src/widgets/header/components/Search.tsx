import React, { useEffect, useState } from "react";
import { Search as SearchIcon, ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import useMobile from "@/shared/hooks/useMobile";

const Search = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchPage, setSearchPage] = useState(false);
  const isMobile = useMobile();

  useEffect(() => {
    const isOnSearchPage = location.pathname === "/search";
    setSearchPage(isOnSearchPage);
  }, [location]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      navigate(`/products?page=1&limit=20&q=${searchValue}`);
    }
  };

  const handleSearchClick = () => {
    if (!isSearchPage) {
      navigate("/products?page=1&limit=20");
    } else if (searchValue) {
      navigate(`/products?page=1&limit=20&q=${searchValue}`);
    }
  };

  return (
    <div
      className="w-full max-w-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          relative overflow-hidden
          rounded-full border-2 border-dotted border-primary-6
          bg-gradient-to-r from-primary-6 to-primary-7
          transition-all duration-300 ease-in-out
          ${isHovered ? "shadow-lg scale-105" : ""}
        `}
      >
        <div className="flex items-center px-1.5 py-0.5 lg:px-3 lg:py-1">
          {!(isMobile && isSearchPage) ? (
            <SearchIcon
              onClick={handleSearchClick}
              className={`
              text-neutral-0 w-5 h-5 lg:w-6 lg:h-6 cursor-pointer
              transition-transform duration-300
              ${isHovered ? "scale-110" : ""}
            `}
            />
          ) : (
            <Link to="/">
              <ArrowLeft className="text-neutral-0 w-5 h-5 lg:w-6 lg:h-6" />
            </Link>
          )}

          {!isSearchPage ? (
            <div className="relative flex-1" onClick={handleSearchClick}>
              <TypeAnimation
                sequence={[
                  "Hãy tìm kiếm điện thoại smartphone",
                  2000,
                  "Hãy tìm kiếm laptop máy tính xách tay",
                  2000,
                  "Hãy tìm kiếm tai nghe bluetooth",
                  2000,
                  "Hãy tìm kiếm đồng hồ thông minh smartwatch",
                  2000,
                  "Hãy tìm kiếm máy ảnh camera",
                  2000,
                  "Hãy tìm kiếm loa bluetooth",
                  2000,
                  "Hãy tìm kiếm chuột bàn phím gaming",
                  2000,
                  "Hãy tìm kiếm màn hình máy tính",
                  2000,
                  "Hãy tìm kiếm ổ cứng SSD",
                  2000,
                  "Hãy tìm kiếm sạc dự phòng powerbank",
                  2000,
                  "Hãy tìm kiếm máy tính bảng tablet",
                  2000,
                  "Hãy tìm kiếm webcam camera",
                  2000,
                ]}
                wrapper="span"
                speed={50}
                className="ml-4 text-xs sm:text-sm lg:text-base text-neutral-0 font-medium"
                repeat={Infinity}
                cursor={true}
                style={{
                  display: "inline-block",
                  minWidth: "350px",
                }}
              />
              <div
                className={`
                  absolute inset-0 bg-gradient-to-r from-transparent via-neutral-0/10 to-transparent
                  transition-transform duration-1000 ease-in-out
                  ${isHovered ? "translate-x-full" : "-translate-x-full"}
                `}
              />
            </div>
          ) : (
            <div
              className="flex items-center flex-1 ml-3"
              onClick={handleSearchClick}
            >
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearch}
                autoFocus
                placeholder="Nhập từ khóa tìm kiếm..."
                className="w-full bg-transparent text-neutral-0 placeholder-neutral-0/70 outline-none text-xs sm:text-sm lg:text-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
