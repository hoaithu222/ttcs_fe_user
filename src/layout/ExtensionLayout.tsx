import ScrollView from "@/foundation/components/scroll/ScrollView";
import { lazy } from "react";
import { Outlet } from "react-router-dom";

const Header = lazy(() => import("@/widgets/header/Index"));

const ExtensionLayout = () => {
  return (
    <div>
      <Header />
      <main>
        <ScrollView className="overflow-x-hidden flex-1">
          <div className="overflow-x-hidden min-h-full bg-background-1">
            <Outlet />
          </div>
        </ScrollView>
      </main>
    </div>
  );
};

export default ExtensionLayout;
