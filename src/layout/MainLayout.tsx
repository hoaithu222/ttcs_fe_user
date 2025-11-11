import { Outlet } from "react-router-dom";
import { lazy } from "react";
import ScrollView from "@/foundation/components/scroll/ScrollView";

const Header = lazy(() => import("@/widgets/header/Index"));
const Footer = lazy(() => import("@/widgets/footer/Index"));

const MainLayout = () => {
  return (
    <div className="relative">
      <Header />
      <main className="flex overflow-x-hidden flex-col flex-1 bg-background-1">
        <ScrollView className="overflow-x-hidden flex-1">
          <div className="overflow-x-hidden min-h-full bg-background-1">
            <Outlet />
          </div>
        </ScrollView>
      </main>
      <footer className="overflow-x-hidden">
        <Footer />
      </footer>
    </div>
  );
};

export default MainLayout;
