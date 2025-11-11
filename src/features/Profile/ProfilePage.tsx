import Page from "@/foundation/components/layout/Page";
import Sidebar from "./components/nav-bar/SideBar";
import InfoAccountPanel from "./components/info-account/InfoAccountPanel";
import AddressesPanel from "./components/address/AddressesPanel";
import OrdersPanel from "./components/orders/OrdersPanel";
import { useSearchParams } from "react-router-dom";

const ProfilePage = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "account";
  return (
    <Page>
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <Sidebar />
          </div>
          <div className="space-y-6 lg:col-span-9">
            <h1 className="text-2xl font-semibold">Hồ sơ cá nhân</h1>
            {tab === "account" && <InfoAccountPanel />}
            {tab === "address" && <AddressesPanel />}
            {tab === "orders" && <OrdersPanel />}
          </div>
        </div>
      </div>
    </Page>
  );
};

export default ProfilePage;
