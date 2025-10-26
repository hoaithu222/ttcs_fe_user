import Page from "@/foundation/components/layout/Page";
import { useParams } from "react-router-dom";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Page>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Chi tiết sản phẩm</h1>
        <p className="text-gray-600">Sản phẩm ID: {id}</p>
        {/* TODO: Implement product detail */}
      </div>
    </Page>
  );
};

export default ProductDetailPage;
