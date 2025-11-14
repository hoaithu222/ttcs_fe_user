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
import { getProductsStart, deleteProductStart } from "@/features/Shop/slice/shop.slice";
import {
  selectProducts,
  selectProductsStatus,
  selectProductsError,
  selectProductsPagination,
} from "@/features/Shop/slice/shop.selector";
import { ReduxStateType } from "@/app/store/types";
import { ShopProduct } from "@/core/api/shop-management/type";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { NAVIGATION_CONFIG } from "@/app/router/naviagtion.config";
import Image from "@/foundation/components/icons/Image";

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
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      dispatch(deleteProductStart({ productId }));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const isLoading = productsStatus === ReduxStateType.LOADING;

  return (
    <div>
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-9">Danh sách sản phẩm</h1>
            <p className="text-sm text-neutral-6">Quản lý tất cả sản phẩm của cửa hàng</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="flex flex-col gap-3 p-4 bg-background-1 rounded-lg border border-border-1 hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-2">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex justify-center items-center w-full h-full">
                          <Image alt="No image" className="w-12 h-12 text-neutral-4" />
                        </div>
                      )}
                      {!product.isActive && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-error/80 text-white text-xs rounded">
                          Ngừng bán
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-neutral-9 line-clamp-2">{product.name}</h3>
                      <div className="flex gap-2 items-center">
                        <span className="text-lg font-bold text-primary-6">
                          {formatPrice(product.price)}
                        </span>
                        {product.discount && product.discount > 0 && (
                          <span className="text-sm text-neutral-6 line-through">
                            {formatPrice(product.price + product.discount)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 items-center text-sm text-neutral-6">
                        <span>Kho: {product.stock || 0}</span>
                        {product.salesCount && <span>• Đã bán: {product.salesCount}</span>}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        color="blue"
                        variant="ghost"
                        size="sm"
                        icon={<Edit className="w-4 h-4" />}
                        onClick={() => handleEdit(product._id)}
                        className="flex-1"
                      >
                        Sửa
                      </Button>
                      <Button
                        color="red"
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => handleDelete(product._id)}
                      />
                    </div>
                  </div>
                ))}
              </div>

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
    </div>
  );
};

export default ListProduct;
