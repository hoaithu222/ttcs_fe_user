import Page from "@/foundation/components/layout/Page";
import Sidebar from "./components/nav-bar/SideBar";
import InfoAccountPanel from "./components/info-account/InfoAccountPanel";
import AddressesPanel from "./components/address/AddressesPanel";
import OrdersPanel from "./components/orders/OrdersPanel";
import { Navigate, useSearchParams } from "react-router-dom";
import WalletPage from "./components/wallet/WalletPage";
import WishlistPage from "../Wishlist/WishlistPage";
import FollowingShopsPage from "../FollowingShops/FollowingShopsPage";
import { NAVIGATION_CONFIG } from "@/app/router/naviagtion.config";
import { selectUser } from "../Auth/components/slice/auth.selector";
import { useAppSelector } from "@/app/store";
import OrderReview from "./components/orders/components/OrderReview";


const ProfilePage = () => {
  const [searchParams] = useSearchParams();
  // Check chua login thi redirect to login
  const user = useAppSelector(selectUser);
  if (!user) {
    return <Navigate to={NAVIGATION_CONFIG.login.path} />;
  }
  const tab = searchParams.get("tab") || "account";
  return (
    <Page>
      <div className="px-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 min-h-[calc(100vh-80px)]">
          <div className="lg:col-span-3">
            <Sidebar />
          </div>
          <div className="py-4 space-y-6 lg:col-span-9 mt-4 lg:mt-0 min-h-[calc(100vh-90px)] max-h-[calc(100vh-90px)] overflow-y-auto pr-1">
            {tab === "account" && <InfoAccountPanel />}
            {tab === "address" && <AddressesPanel />}
            {tab === "orders" && <OrdersPanel />}
            {tab === "reviews" && <OrderReview />}
            {tab === "wishlist" && <WishlistPage />}
            {tab === "followingShops" && <FollowingShopsPage />}
            {tab === "wallet" && <WalletPage />}
          </div>
        </div>
      </div>
    </Page>
  );
};

export default ProfilePage;
