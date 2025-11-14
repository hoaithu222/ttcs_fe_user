import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Page from "@/foundation/components/layout/Page";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import { Card } from "@/foundation/components/info/Card";
import Button from "@/foundation/components/buttons/Button";
import Loading from "@/foundation/components/loading/Loading";
import Empty from "@/foundation/components/empty/Empty";
import Sidebar from "@/features/Shop/components/manager/Sidebar";
import {
  getShopInfoStart,
  getProductsStart,
  getOrdersStart,
} from "@/features/Shop/slice/shop.slice";
import {
  selectShopInfo,
  selectShopInfoStatus,
  selectShopInfoError,
  selectProducts,
  selectProductsStatus,
  selectOrders,
  selectOrdersStatus,
  selectShopCurrentStatus,
} from "@/features/Shop/slice/shop.selector";
import { ReduxStateType } from "@/app/store/types";
import { ShopInfo } from "@/core/api/shop-management/type";
import { ShopStatus } from "@/features/Shop/slice/shop.type";
import { NAVIGATION_CONFIG } from "@/app/router/naviagtion.config";
import { Store, Package, ShoppingCart, TrendingUp, Settings, Plus } from "lucide-react";

const ShopDashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shopInfo = useSelector(selectShopInfo) as ShopInfo | null;
  const shopInfoStatus = useSelector(selectShopInfoStatus);
  const shopInfoError = useSelector(selectShopInfoError);
  const products = useSelector(selectProducts);
  const productsStatus = useSelector(selectProductsStatus);
  const orders = useSelector(selectOrders);
  const ordersStatus = useSelector(selectOrdersStatus);
  const currentStatus = useSelector(selectShopCurrentStatus);

  useEffect(() => {
    dispatch(getShopInfoStart());
    dispatch(getProductsStart({ page: 1, limit: 5 }));
    dispatch(getOrdersStart({ page: 1, limit: 5 }));
  }, [dispatch]);

  const isLoading =
    shopInfoStatus === ReduxStateType.LOADING ||
    productsStatus === ReduxStateType.LOADING ||
    ordersStatus === ReduxStateType.LOADING;

  const canEdit = currentStatus === ShopStatus.ACTIVE || currentStatus === ShopStatus.APPROVED;

  if (isLoading) {
    return (
      <Page>
        <div className="container px-4 py-8 mx-auto">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <Sidebar />
            </div>
            <div className="lg:col-span-9">
              <Loading layout="centered" message="Đang tải thông tin cửa hàng..." />
            </div>
          </div>
        </div>
      </Page>
    );
  }

  if (shopInfoError && !shopInfo) {
    return (
      <Page>
        <div className="container px-4 py-8 mx-auto">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <Sidebar />
            </div>
            <div className="lg:col-span-9">
              <Empty
                variant="default"
                title="Lỗi tải dữ liệu"
                description={shopInfoError || undefined}
              />
            </div>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="space-y-6 lg:col-span-9">
            {/* Shop Info Header */}
            {shopInfo && (
              <Card className="mb-6">
                <div className="flex flex-col gap-6 items-start md:flex-row md:items-center">
                  <div className="flex flex-1 gap-4 items-center">
                    {shopInfo.logo ? (
                      <img
                        src={shopInfo.logo}
                        alt={shopInfo.name}
                        className="object-cover w-20 h-20 rounded-lg border border-border-1"
                      />
                    ) : (
                      <div className="flex justify-center items-center w-20 h-20 rounded-lg bg-primary-6">
                        <Store className="w-10 h-10 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h1 className="mb-1 text-2xl font-bold text-neutral-9">{shopInfo.name}</h1>
                      {shopInfo.description && (
                        <p className="text-sm text-neutral-6 line-clamp-2">
                          {shopInfo.description}
                        </p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm text-neutral-6">
                        {shopInfo.rating && (
                          <span>
                            ⭐ {shopInfo.rating.toFixed(1)} ({shopInfo.reviewCount || 0} đánh giá)
                          </span>
                        )}
                        {shopInfo.productsCount !== undefined && (
                          <span>• {shopInfo.productsCount} sản phẩm</span>
                        )}
                        {shopInfo.followersCount !== undefined && (
                          <span>• {shopInfo.followersCount} người theo dõi</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {canEdit && (
                      <Button
                        color="blue"
                        variant="outline"
                        size="md"
                        icon={<Settings className="w-5 h-5" />}
                        onClick={() => navigate(NAVIGATION_CONFIG.shop.path)}
                      >
                        Quản lý cửa hàng
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6">
                <div className="flex gap-4 items-center">
                  <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-primary-6/20 text-primary-6">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-neutral-6">Tổng sản phẩm</p>
                    <p className="text-2xl font-bold text-neutral-9">
                      {products?.length || shopInfo?.productsCount || 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex gap-4 items-center">
                  <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-success/20 text-success">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-neutral-6">Tổng đơn hàng</p>
                    <p className="text-2xl font-bold text-neutral-9">{orders?.length || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex gap-4 items-center">
                  <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-warning/20 text-warning">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-neutral-6">Đánh giá trung bình</p>
                    <p className="text-2xl font-bold text-neutral-9">
                      {shopInfo?.rating ? shopInfo.rating.toFixed(1) : "0.0"}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex gap-4 items-center">
                  <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-brand/20 text-brand">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-neutral-6">Trạng thái</p>
                    <p className="text-lg font-bold text-neutral-9">
                      {currentStatus === ShopStatus.ACTIVE
                        ? "Đang hoạt động"
                        : currentStatus === ShopStatus.PENDING_REVIEW
                          ? "Chờ duyệt"
                          : currentStatus === ShopStatus.APPROVED
                            ? "Đã duyệt"
                            : "Khác"}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Section>
              <SectionTitle>Thao tác nhanh</SectionTitle>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {canEdit && (
                  <>
                    <Button
                      color="blue"
                      variant="outline"
                      size="lg"
                      fullWidth
                      icon={<Plus className="w-5 h-5" />}
                      onClick={() => navigate(NAVIGATION_CONFIG.addProduct.path)}
                    >
                      Thêm sản phẩm mới
                    </Button>
                    <Button
                      color="blue"
                      variant="outline"
                      size="lg"
                      fullWidth
                      icon={<Package className="w-5 h-5" />}
                      onClick={() => navigate(NAVIGATION_CONFIG.listProduct.path)}
                    >
                      Quản lý sản phẩm
                    </Button>
                    <Button
                      color="blue"
                      variant="outline"
                      size="lg"
                      fullWidth
                      icon={<ShoppingCart className="w-5 h-5" />}
                      onClick={() => navigate(NAVIGATION_CONFIG.ordersShopManager.path)}
                    >
                      Quản lý đơn hàng
                    </Button>
                  </>
                )}
                {!canEdit && (
                  <Card className="col-span-full p-6">
                    <div className="text-center">
                      <p className="mb-2 text-lg font-semibold text-neutral-9">
                        Cửa hàng chưa được kích hoạt
                      </p>
                      <p className="text-sm text-neutral-6">
                        {currentStatus === ShopStatus.PENDING_REVIEW
                          ? "Cửa hàng của bạn đang chờ được xét duyệt. Vui lòng đợi quản trị viên phê duyệt."
                          : currentStatus === ShopStatus.REJECTED
                            ? "Đơn đăng ký cửa hàng của bạn đã bị từ chối. Vui lòng liên hệ quản trị viên để biết thêm chi tiết."
                            : "Vui lòng hoàn tất đăng ký cửa hàng để sử dụng các tính năng quản lý."}
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </Section>

            {/* Recent Products */}
            {canEdit && products && products.length > 0 && (
              <Section>
                <div className="flex justify-between items-center mb-4">
                  <SectionTitle>Sản phẩm gần đây</SectionTitle>
                  <Button
                    color="blue"
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(NAVIGATION_CONFIG.listProduct.path)}
                  >
                    Xem tất cả
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                  {products.slice(0, 5).map((product) => (
                    <Card key={product._id} className="p-4">
                      <div className="overflow-hidden mb-3 rounded-lg aspect-square bg-neutral-2">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex justify-center items-center w-full h-full">
                            <Package className="w-8 h-8 text-neutral-4" />
                          </div>
                        )}
                      </div>
                      <h3 className="mb-1 text-sm font-semibold text-neutral-9 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm font-bold text-primary-6">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(product.price)}
                      </p>
                    </Card>
                  ))}
                </div>
              </Section>
            )}

            {/* Recent Orders */}
            {canEdit && orders && orders.length > 0 && (
              <Section>
                <div className="flex justify-between items-center mb-4">
                  <SectionTitle>Đơn hàng gần đây</SectionTitle>
                  <Button
                    color="blue"
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(NAVIGATION_CONFIG.ordersShopManager.path)}
                  >
                    Xem tất cả
                  </Button>
                </div>
                <div className="space-y-2">
                  {orders.slice(0, 5).map((order) => (
                    <Card key={order._id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-neutral-9">#{order.orderNumber}</p>
                          <p className="text-sm text-neutral-6">
                            {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary-6">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(order.totalAmount)}
                          </p>
                          <p className="text-xs capitalize text-neutral-6">{order.orderStatus}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Section>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
};

export default ShopDashboardPage;
