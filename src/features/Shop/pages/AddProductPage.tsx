import React from "react";
import Page from "@/foundation/components/layout/Page";
import Sidebar from "@/features/Shop/components/manager/Sidebar";
import AddProduct from "@/features/Shop/components/manager/AddProduct";

const AddProductPage: React.FC = () => {
  return (
    <Page>
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <AddProduct />
          </div>
        </div>
      </div>
    </Page>
  );
};

export default AddProductPage;

