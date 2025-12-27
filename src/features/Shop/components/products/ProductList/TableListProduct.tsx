import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Edit, CheckCircle2, XCircle, Package, AlertTriangle, Lock, Unlock, Clock } from "lucide-react";
import { ShopProduct } from "@/core/api/shop-management/type";
import { ProductService } from "@/features/Shop/api";
import { addToast } from "@/app/store/slices/toast";
import Button from "@/foundation/components/buttons/Button";
import Image from "@/foundation/components/icons/Image";
import Tooltip from "@/foundation/components/tooltip/Tooltip";
import ModalChatSupport from "@/features/Chat/components/ModalChatSuppport";
import { createConversationStart, setCurrentConversation } from "@/app/store/slices/chat/chat.slice";
import { useAppSelector } from "@/app/store";
import { selectCurrentConversation, selectConversations } from "@/app/store/slices/chat/chat.selector";
import { socketClients, SOCKET_EVENTS } from "@/core/socket";

interface TableListProductProps {
  data: ShopProduct[];
  fetchData: () => void;
}

const TableListProduct: React.FC<TableListProductProps> = ({ data, fetchData }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [productToUnlock, setProductToUnlock] = useState<ShopProduct | null>(null);
  
  const conversations = useAppSelector(selectConversations);
  const currentConversation = useAppSelector(selectCurrentConversation);

  const toggleRow = (productId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getImageUrl = (images: any[]): string => {
    if (!images || images.length === 0) return "";
    const firstImage = images[0];
    if (typeof firstImage === "string") return firstImage;
    return (firstImage as any)?.url || "";
  };

  const handleToggleStatus = async (product: ShopProduct) => {
    if (loading) return;

    setLoading(product._id);
    try {
      await ProductService.toggleProductStatus(product._id, !product.isActive);

      dispatch(
        addToast({
          type: "success",
          message: "Đã cập nhật trạng thái thành công",
        })
      );
      fetchData();
    } catch (error: any) {
      console.error("Error updating product:", error);
      dispatch(
        addToast({
          type: "error",
          message: error?.message || "Có lỗi xảy ra khi cập nhật trạng thái",
        })
      );
    } finally {
      setLoading(null);
    }
  };

  const handleEdit = (productId: string) => {
    navigate(`/shop/products/${productId}/edit`);
  };

  const handleUnlockViolation = async (product: ShopProduct) => {
    if (loading) return;

    setProductToUnlock(product);
    
    // Find existing CSKH conversation
    const cskhConversation = conversations.find(
      (conv: any) => conv.type === "admin" && conv.metadata?.context === "CSKH"
    );

    if (cskhConversation) {
      // Use existing conversation
      dispatch(setCurrentConversation(cskhConversation));
      setIsChatModalOpen(true);
    } else {
      // Create new CSKH conversation
      dispatch(
        createConversationStart({
          data: {
            type: "admin",
            metadata: {
              context: "CSKH",
              isSupport: true,
            },
          },
        })
      );
      setIsChatModalOpen(true);
    }
  };

  // Send unlock request message when conversation is ready and modal is open
  useEffect(() => {
    if (
      isChatModalOpen &&
      productToUnlock &&
      currentConversation &&
      currentConversation.type === "admin" &&
      currentConversation.metadata?.context === "CSKH"
    ) {
      // Wait a bit for conversation to be fully loaded
      const timer = setTimeout(() => {
        const socketClient = socketClients.adminChat;
        if (socketClient) {
          const socket = socketClient.connect();
          if (socket && socket.connected) {
            const unlockMessage = `Yêu cầu mở khóa sản phẩm vi phạm:\n\n` +
              `📦 Tên sản phẩm: ${productToUnlock.name}\n` +
              `🆔 Mã sản phẩm: ${productToUnlock._id}\n` +
              (productToUnlock.violationNote
                ? `⚠️ Lý do vi phạm: ${productToUnlock.violationNote}\n`
                : "") +
              `\nVui lòng xem xét và mở khóa sản phẩm này.`;

            socket.emit(SOCKET_EVENTS.CHAT_MESSAGE_SEND, {
              conversationId: currentConversation._id,
              message: unlockMessage,
              type: "text",
              metadata: {
                productId: productToUnlock._id,
                productName: productToUnlock.name,
                requestType: "unlock_violation",
                violationNote: productToUnlock.violationNote,
              },
            });

            // Clear product to unlock after sending
            setProductToUnlock(null);
          }
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isChatModalOpen, productToUnlock, currentConversation]);

  const getStatusBadge = (product: ShopProduct) => {
    const status = product.status || "approved";
    
    if (status === "violated") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-error-7 bg-error-1 rounded-md border border-error-3">
          <AlertTriangle className="w-3.5 h-3.5" />
          Vi phạm
        </span>
      );
    }
    
    if (status === "hidden") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-warning-7 bg-warning-1 rounded-md border border-warning-3">
          <Lock className="w-3.5 h-3.5" />
          Đã ẩn
        </span>
      );
    }
    
    if (status === "approved" && product.isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-success-7 bg-success-1 rounded-md">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Đang hiển thị
        </span>
      );
    }
    
    if (status === "pending") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-yellow-7 bg-yellow-1 rounded-md">
          <Clock className="w-3.5 h-3.5" />
          Chờ duyệt
        </span>
      );
    }
    
    // Default: hidden/inactive
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-neutral-7 bg-neutral-1 rounded-md">
        <XCircle className="w-3.5 h-3.5" />
        Đã ẩn
      </span>
    );
  };
  return (
    <div className="overflow-hidden bg-background-1 rounded-xl shadow-lg border border-border-1">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-primary-6 to-primary-7">
            <tr>
              <th className="p-4 w-8"></th>
              <th className="p-4 font-semibold text-left text-white">Hình ảnh</th>
              <th className="p-4 font-semibold text-left text-white">Tên sản phẩm</th>
              <th className="p-4 font-semibold text-left text-white">Giá</th>
              <th className="p-4 font-semibold text-left text-white">Kho hàng</th>
              <th className="p-4 font-semibold text-left text-white">Trạng thái</th>
              <th className="p-4 font-semibold text-left text-white">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-1">
            {data?.map((product) => (
              <React.Fragment key={product._id}>
                <tr className="transition-colors hover:bg-neutral-1">
                  <td className="p-4">
                    {product.variants && product.variants.length > 0 && (
                      <button
                        onClick={() => toggleRow(product._id)}
                        className="p-1.5 rounded-full transition-all hover:bg-neutral-2 text-neutral-7 hover:text-neutral-9 hover:scale-110"
                        title={expandedRows.has(product._id) ? "Thu gọn" : "Mở rộng"}
                      >
                        {expandedRows.has(product._id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="relative overflow-hidden w-20 h-20 rounded-lg border-2 border-border-1 group shadow-sm">
                      {getImageUrl(product.images) ? (
                        <img
                          src={getImageUrl(product.images)}
                          alt={product.name}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex justify-center items-center w-full h-full bg-neutral-2">
                          <Image alt="No image" className="w-8 h-8 text-neutral-4" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 transition-opacity duration-300 group-hover:bg-opacity-20" />
                    </div>
                  </td>
                  <td className="p-4 w-[30%]">
                    <p className="font-semibold text-neutral-9 hover:text-primary-6 line-clamp-1 mb-1 transition-colors">
                      {product.name}
                    </p>
                    <p className="text-xs text-neutral-6 font-mono">ID: {product._id.slice(-8)}</p>
                    {/* { product.salesCount && product.salesCount > 0 && product.salesCount != 0 && (
                      <p className="text-xs text-success-6 mt-1">Đã bán:  {product.salesCount}</p>
                    )} */}
                  </td>
                  <td className="p-4 text-left">
                    <div className="flex flex-col gap-1">
                      {(() => {
                        const discountPercent = Math.min(
                          Math.max(product.discount ?? 0, 0),
                          100
                        );
                        const hasDiscount = discountPercent > 0;
                        const finalPrice =
                          product.price -
                            (product.price * discountPercent) / 100;
                        return (
                          <>
                            <span className="font-semibold text-primary-6">
                              {formatPrice(Math.max(0, finalPrice))}
                            </span>
                            {hasDiscount && (
                              <span className="text-xs text-neutral-6 line-through">
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Package className="w-4 h-4 text-neutral-6" />
                      <span className="text-neutral-7 font-medium">{product.stock || 0}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(product)}
                    {product.status === "violated" && product.violationNote && (
                      <Tooltip content={product.violationNote} side="top" delayDuration={100}>
                        <div className="mt-1 text-xs text-error-6 cursor-help line-clamp-1">
                          Lý do: {product.violationNote}
                        </div>
                      </Tooltip>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 items-center flex-wrap">
                      {product.status === "violated" ? (
                        <>
                          <Tooltip content="Yêu cầu admin/CSKH mở khóa sản phẩm vi phạm" side="top" delayDuration={100}>
                            <Button
                              color="blue"
                              variant="ghost"
                              size="sm"
                              icon={<Unlock className="w-4 h-4" />}
                              onClick={() => handleUnlockViolation(product)}
                              disabled={loading === product._id}
                              className="min-w-[120px]"
                            >
                              Yêu cầu mở khóa
                            </Button>
                          </Tooltip>
                          <Button
                            color="blue"
                            variant="ghost"
                            size="sm"
                            icon={<Edit className="w-4 h-4" />}
                            onClick={() => handleEdit(product._id)}
                            disabled={loading === product._id}
                          >
                            Sửa
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            color={product.isActive ? "red" : "green"}
                            variant="ghost"
                            size="sm"
                            icon={
                              product.isActive ? (
                                <XCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )
                            }
                            onClick={() => handleToggleStatus(product)}
                            disabled={loading === product._id || (product.status as string) === "violated"}
                            className="min-w-[100px]"
                          >
                            {product.isActive ? "Ẩn" : "Kích hoạt"}
                          </Button>
                          <Button
                            color="blue"
                            variant="ghost"
                            size="sm"
                            icon={<Edit className="w-4 h-4" />}
                            onClick={() => handleEdit(product._id)}
                            disabled={loading === product._id}
                          >
                            Sửa
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedRows.has(product._id) &&
                  product.variants &&
                  product.variants.length > 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 bg-gradient-to-br from-neutral-1 to-neutral-2">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="h-px flex-1 bg-border-1"></div>
                            <h3 className="font-semibold text-neutral-9 px-3">Biến thể sản phẩm</h3>
                            <div className="h-px flex-1 bg-border-1"></div>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            {product.variants.map((variant: any) => (
                              <div
                                key={variant._id || variant.id}
                                className="p-4 bg-background-1 rounded-lg border border-border-1 shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div className="grid grid-cols-5 gap-4">
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-neutral-6 uppercase tracking-wide">
                                      Mã SKU
                                    </p>
                                    <p className="font-semibold text-neutral-9 font-mono">
                                      {variant.sku || "N/A"}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-neutral-6 uppercase tracking-wide">
                                      Thuộc tính
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {variant.attributes &&
                                        Object.entries(variant.attributes).map(([key, value]) => (
                                          <span
                                            key={key}
                                            className="px-2.5 py-1 text-xs font-medium text-primary-7 bg-primary-1 rounded-md border border-primary-2"
                                          >
                                            {key}: {value as string}
                                          </span>
                                        ))}
                                      {(!variant.attributes ||
                                        Object.keys(variant.attributes).length === 0) && (
                                        <span className="text-xs text-neutral-5 italic">
                                          Không có thuộc tính
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-neutral-6 uppercase tracking-wide">
                                      Giá
                                    </p>
                                    <p className="font-semibold text-primary-6">
                                      {formatPrice(variant.price || product.price)}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-start font-medium text-neutral-6 uppercase tracking-wide">
                                      Kho
                                    </p>
                                    <div className="flex items-center gap-1">
                                      <Package className="w-3.5 h-3.5 text-neutral-6" />
                                      <p className="font-semibold text-center text-neutral-9">
                                        {variant.stock || 0}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="space-y-1 text-center items-center">
                                    <p className="text-start text-xs font-medium text-neutral-6 uppercase tracking-wide">
                                      Hình ảnh
                                    </p>
                                    {variant.image ? (
                                      <img
                                        src={
                                          typeof variant.image === "string"
                                            ? variant.image
                                            : (variant.image as any)?.url || ""
                                        }
                                        alt={`${product.name} - ${variant.sku || ""}`}
                                        className="object-cover w-16 h-16 rounded-lg border-2 border-border-1 shadow-sm hover:shadow-md transition-shadow"
                                      />
                                    ) : (
                                      <div className="flex justify-center items-center w-16 h-16 bg-neutral-2 rounded-lg border-2 border-border-1">
                                        <span className="text-xs text-neutral-5">No image</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chat Modal for unlock request */}
      <ModalChatSupport
        open={isChatModalOpen}
        onOpenChange={(open) => {
          setIsChatModalOpen(open);
          if (!open) {
            setProductToUnlock(null);
          }
        }}
      />
    </div>
  );
};

export default TableListProduct;
