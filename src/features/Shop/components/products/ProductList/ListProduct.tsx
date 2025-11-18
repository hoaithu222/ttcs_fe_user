import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as Form from "@radix-ui/react-form";
import Section from "@/foundation/components/sections/Section";
import Input from "@/foundation/components/input/Input";
import Select from "@/foundation/components/input/Select";
import Button from "@/foundation/components/buttons/Button";
import Loading from "@/foundation/components/loading/Loading";
import Empty from "@/foundation/components/empty/Empty";
import ConfirmModal from "@/foundation/components/modal/ModalConfirm";
import { getProductsStart, deleteProductStart } from "@/features/Shop/slice/shop.slice";
import {
  selectProducts,
  selectProductsStatus,
  selectProductsError,
  selectProductsPagination,
} from "@/features/Shop/slice/shop.selector";
import { ReduxStateType } from "@/app/store/types";
import { ShopProduct } from "@/core/api/shop-management/type";
import { Plus, Search, LayoutGrid, Table2 } from "lucide-react";
import { NAVIGATION_CONFIG } from "@/app/router/naviagtion.config";
import { TableListProduct, GridViewProduct } from "@/features/Shop/components/products/ProductList";

const ListProduct: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const products = useSelector(selectProducts) as ShopProduct[];
  const productsStatus = useSelector(selectProductsStatus);
  const productsError = useSelector(selectProductsError);
  const pagination = useSelector(selectProductsPagination);

  const [searchTerm, setSearchTerm] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewList, setViewList] = useState<boolean>(true); // true = table, false = grid
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    dispatch(
      getProductsStart({
        page: currentPage,
        limit: 12,
        search: searchTerm || undefined,
        isActive: isActiveFilter === "all" ? undefined : isActiveFilter === "active",
      })
    );
  }, [dispatch, currentPage, searchTerm, isActiveFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setIsActiveFilter(value);
    setCurrentPage(1);
  };

  const handleEdit = (productId: string) => {
    navigate(`/shop/products/${productId}/edit`);
  };

  const handleDelete = (productId: string) => {
    setProductToDelete(productId);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      dispatch(deleteProductStart({ productId: productToDelete }));
    }
    setProductToDelete(null);
  };

  const fetchData = () => {
    dispatch(
      getProductsStart({
        page: currentPage,
        limit: 12,
        search: searchTerm || undefined,
        isActive: isActiveFilter === "all" ? undefined : isActiveFilter === "active",
      })
    );
  };

  const isLoading = productsStatus === ReduxStateType.LOADING;

  return (
    <div>
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-9">Danh sách sản phẩm</h1>
            <p className="text-sm text-neutral-6">Quản lý tất cả sản phẩm của cửa hàng</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex gap-1 p-1 bg-neutral-2 rounded-lg border border-border-1">
              <button
                onClick={() => setViewList(true)}
                className={`p-2 rounded transition-colors ${
                  viewList
                    ? "bg-primary-6 text-white"
                    : "text-neutral-7 hover:text-neutral-9 hover:bg-neutral-3"
                }`}
                title="Xem dạng bảng"
              >
                <Table2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewList(false)}
                className={`p-2 rounded transition-colors ${
                  !viewList
                    ? "bg-primary-6 text-white"
                    : "text-neutral-7 hover:text-neutral-9 hover:bg-neutral-3"
                }`}
                title="Xem dạng lưới"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
            <Button
              color="blue"
              variant="solid"
              size="md"
              icon={<Plus className="w-5 h-5" />}
              onClick={() => navigate(NAVIGATION_CONFIG.addProduct.path)}
            >
              Thêm sản phẩm
            </Button>
          </div>
        </div>

        <Section>
          <Form.Root>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  name="search"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={handleSearch}
                  iconLeft={<Search className="w-5 h-5 text-neutral-6" />}
                />
              </div>
              <div className="w-full md:w-48">
                <Select
                  name="status"
                  value={isActiveFilter}
                  onChange={handleFilterChange}
                  options={[
                    { value: "all", label: "Tất cả" },
                    { value: "active", label: "Đang bán" },
                    { value: "inactive", label: "Ngừng bán" },
                  ]}
                  placeholder="Lọc theo trạng thái"
                />
              </div>
            </div>
          </Form.Root>

          {isLoading ? (
            <Loading layout="centered" message="Đang tải sản phẩm..." />
          ) : productsError ? (
            <Empty
              variant="default"
              title="Lỗi tải dữ liệu"
              description={productsError || undefined}
            />
          ) : !products || products.length === 0 ? (
            <Empty
              variant="data"
              title="Chưa có sản phẩm"
              description="Hãy thêm sản phẩm đầu tiên của bạn"
            />
          ) : (
            <>
              {viewList ? (
                <TableListProduct data={products} fetchData={fetchData} />
              ) : (
                <GridViewProduct data={products} fetchData={fetchData} />
              )}

              {pagination && pagination.totalPages > 1 && (
                <div className="flex gap-2 justify-center items-center mt-6">
                  <Button
                    color="blue"
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Trước
                  </Button>
                  <span className="text-sm text-neutral-7">
                    Trang {currentPage} / {pagination.totalPages}
                  </span>
                  <Button
                    color="blue"
                    variant="outline"
                    size="sm"
                    disabled={currentPage === pagination.totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          )}
        </Section>
        <ConfirmModal
          open={!!productToDelete}
          onOpenChange={(open) => !open && setProductToDelete(null)}
          title="Xóa sản phẩm"
          content="Bạn có chắc chắn muốn xóa sản phẩm này khỏi cửa hàng? Hành động này không thể hoàn tác."
          confirmText="Xóa sản phẩm"
          cancelText="Hủy"
          iconType="warning"
          onConfirm={handleConfirmDelete}
          onCancel={() => setProductToDelete(null)}
          disabled={isLoading}
        />
    </div>
  );
};

export default ListProduct;
