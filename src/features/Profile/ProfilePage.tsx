import Page from "@/foundation/components/layout/Page";
import Sidebar from "./components/nav-bar/SideBar";
import InfoAccountPanel from "./components/info-account/InfoAccountPanel";
import AddressesPanel from "./components/address/AddressesPanel";
import OrdersPanel from "./components/orders/OrdersPanel";
import { useSearchParams } from "react-router-dom";
import WalletPage from "./components/wallet/WalletPage";
import WishlistPage from "../Wishlist/WishlistPage";
import FollowingShopsPage from "../FollowingShops/FollowingShopsPage";

const ProfilePage = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "account";
  return (
    <Page>
      <div className="px-4 ">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <Sidebar />
          </div>
          <div className="space-y-6 lg:col-span-9 mt-6 min-h-[calc(100vh-100px)] max-h-[calc(100vh-100px)]">
            {tab === "account" && <InfoAccountPanel />}
            {tab === "address" && <AddressesPanel />}
            {tab === "orders" && <OrdersPanel />}
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
