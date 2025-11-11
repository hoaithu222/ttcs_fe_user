import BannerHome from "./components/banner-home/BannerHome";
import ListCategory from "./components/list-category/ListCategory";
import BestSelling from "./components/best-selling/BestSelling";
import FlashSale from "./components/flash-sale/FlashSale";

const HomePage = () => {
  return (
    <div className="overflow-x-hidden bg-background-1 min-h-screen">
      <div className="container mx-auto  space-y-8">
        {/* Banner Section */}
        <BannerHome />

        {/* Categories Section */}
        <ListCategory />

        {/* Best Selling Products Section */}
        <BestSelling />

        {/* Flash Sale Section */}
        <FlashSale />
      </div>
    </div>
  );
};

export default HomePage;
