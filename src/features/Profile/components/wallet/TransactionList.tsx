import React from "react";
import { WalletTransaction, WalletTransactionType, WalletTransactionStatus } from "@/core/api/wallet/type";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";
import { CheckCircle2, XCircle, Clock, ArrowDownCircle, ArrowUpCircle, RefreshCw, ArrowLeftRight } from "lucide-react";
import Chip from "@/foundation/components/info/Chip";
import Button from "@/foundation/components/buttons/Button";
import Loading from "@/foundation/components/loading/Loading";
import ScrollView from "@/foundation/components/scroll/ScrollView";

interface TransactionListProps {
  transactions: WalletTransaction[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onRefresh?: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  onRefresh,
}) => {
  const getTypeIcon = (type: WalletTransactionType) => {
    switch (type) {
      case WalletTransactionType.DEPOSIT:
        return <ArrowDownCircle className="w-5 h-5 text-success" />;
      case WalletTransactionType.WITHDRAW:
        return <ArrowUpCircle className="w-5 h-5 text-error" />;
      case WalletTransactionType.PAYMENT:
        return <ArrowDownCircle className="w-5 h-5 text-primary-6" />;
      case WalletTransactionType.REFUND:
        return <RefreshCw className="w-5 h-5 text-warning" />;
      case WalletTransactionType.TRANSFER:
        return <ArrowLeftRight className="w-5 h-5 text-primary-7" />;
      default:
        return <Clock className="w-5 h-5 text-neutral-6" />;
    }
  };

  const getTypeLabel = (type: WalletTransactionType) => {
    const typeMap: Record<WalletTransactionType, string> = {
      [WalletTransactionType.DEPOSIT]: "Nạp tiền",
      [WalletTransactionType.WITHDRAW]: "Rút tiền",
      [WalletTransactionType.PAYMENT]: "Thanh toán",
      [WalletTransactionType.REFUND]: "Hoàn tiền",
      [WalletTransactionType.TRANSFER]: "Chuyển tiền",
    };
    return typeMap[type] || type;
  };

  const getStatusChip = (status: WalletTransactionStatus) => {
    switch (status) {
      case WalletTransactionStatus.COMPLETED:
        return (
          <Chip
            colorClass="bg-success text-white border-none"
            className="shadow-sm"
            rounded="full"
            size="sm"
          >
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Hoàn thành</span>
            </span>
          </Chip>
        );
      case WalletTransactionStatus.PENDING:
        return (
          <Chip
            colorClass="bg-warning text-white border-none"
            className="shadow-sm"
            rounded="full"
            size="sm"
          >
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Đang chờ</span>
            </span>
          </Chip>
        );
      case WalletTransactionStatus.FAILED:
        return (
          <Chip
            colorClass="bg-error text-white border-none"
            className="shadow-sm"
            rounded="full"
            size="sm"
          >
            <span className="flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              <span>Thất bại</span>
            </span>
          </Chip>
        );
      case WalletTransactionStatus.CANCELLED:
        return (
          <Chip
            colorClass="bg-neutral-4 text-neutral-10 border-none"
            className="shadow-sm"
            rounded="full"
            size="sm"
          >
            <span className="flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              <span>Đã hủy</span>
            </span>
          </Chip>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Hôm qua";
    } else if (days < 7) {
      return `${days} ngày trước`;
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  const getAmountColor = (type: WalletTransactionType, status: WalletTransactionStatus) => {
    if (status !== WalletTransactionStatus.COMPLETED) {
      return "text-neutral-6";
    }
    switch (type) {
      case WalletTransactionType.DEPOSIT:
      case WalletTransactionType.REFUND:
        return "text-success";
      case WalletTransactionType.WITHDRAW:
      case WalletTransactionType.PAYMENT:
        return "text-error";
      case WalletTransactionType.TRANSFER:
        return "text-primary-6";
      default:
        return "text-neutral-9";
    }
  };

  const getAmountPrefix = (type: WalletTransactionType) => {
    switch (type) {
      case WalletTransactionType.DEPOSIT:
      case WalletTransactionType.REFUND:
        return "+";
      case WalletTransactionType.WITHDRAW:
      case WalletTransactionType.PAYMENT:
        return "-";
      default:
        return "";
    }
  };

  if (isLoading && transactions.length === 0) {
    return (
      <div className="border border-border-1 rounded-2xl p-6 bg-gradient-to-br from-background-2 to-background-1">
        <Loading layout="centered" message="Đang tải lịch sử giao dịch..." />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="border border-border-1 rounded-2xl p-6 bg-gradient-to-br from-background-2 to-background-1">
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-neutral-4 mx-auto mb-3" />
          <p className="text-sm text-neutral-6">Chưa có giao dịch nào</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollView className="overflow-y-auto hidden-scrollbar">
    <div className="border border-border-1 rounded-2xl p-6 bg-gradient-to-br from-background-2 to-background-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-neutral-10">Lịch sử giao dịch</h3>
        {onRefresh && (
          <Button
            variant="primary"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-2"
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Làm mới
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction._id}
            className="bg-background-1 rounded-lg p-4 border border-border-1 hover:border-primary-3 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5">{getTypeIcon(transaction.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-neutral-9">
                      {getTypeLabel(transaction.type)}
                    </p>
                    {getStatusChip(transaction.status)}
                  </div>
                  {transaction.description && (
                    <p className="text-xs text-neutral-6 mb-1 line-clamp-1">
                      {transaction.description}
                    </p>
                  )}
                  <p className="text-xs text-neutral-5">
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-base font-bold ${getAmountColor(
                    transaction.type,
                    transaction.status
                  )}`}
                >
                  {getAmountPrefix(transaction.type)}
                  {formatPriceVND(transaction.metadata?.originalAmount)}
                </p>
                {transaction.status === WalletTransactionStatus.PENDING && (
                  <p className="text-xs text-warning mt-1">Đang xử lý...</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoading}
            loading={isLoading}
          >
            Tải thêm
          </Button>
        </div>
      )}

      {isLoading && transactions.length > 0 && (
        <div className="mt-4 text-center">
          <Loading layout="inline" message="Đang tải..." />
        </div>
      )}
    </div>
    </ScrollView>
  );
};

export default TransactionList;

