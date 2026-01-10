import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/foundation/components/buttons/Button";
import Modal from "@/foundation/components/modal/Modal";
import Input from "@/foundation/components/input/Input";
import Loading from "@/foundation/components/loading/Loading";
import { Plus, Wallet } from "lucide-react";
import { userWalletApi } from "@/core/api/wallet";
import { useAppDispatch } from "@/app/store";
import { addToast } from "@/app/store/slices/toast";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";
import * as Form from "@radix-ui/react-form";
import type { WalletBalanceResponse } from "@/core/api/wallet/type";
import { useWalletTransactions } from "../../hooks/useWalletTransactions";
import TransactionList from "./TransactionList";

const WalletPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState<WalletBalanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBankInfoModalOpen, setIsBankInfoModalOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [isUpdatingBankInfo, setIsUpdatingBankInfo] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
  });
  const [walletTypeForBankInfo, setWalletTypeForBankInfo] = useState<"user" | "shop">("user");

  // Use wallet transactions hook
  const {
    transactions,
    isLoading: isLoadingTransactions,
    loadMore,
    refresh: refreshTransactions,
    hasMore,
  } = useWalletTransactions({
    page: 1,
    limit: 10,
    autoLoad: true,
  });

  const loadBalance = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await userWalletApi.getBalance();
      if (response.success && response.data) {
        setWalletData(response.data);
        // Pre-fill bank info if exists
        if (response.data.wallet?.bankInfo) {
          setBankInfo(response.data.wallet.bankInfo);
        }
      }
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          message: error?.response?.data?.message || "Không thể tải số dư ví",
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);


  const handleUpdateBankInfo = useCallback(async () => {
    if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountHolder) {
      dispatch(addToast({ type: "error", message: "Vui lòng điền đầy đủ thông tin ngân hàng" }));
      return;
    }

    setIsUpdatingBankInfo(true);
    try {
      const response = await userWalletApi.updateBankInfo({
        ...bankInfo,
        walletType: walletTypeForBankInfo,
      });
      if (response.success && response.data) {
        dispatch(addToast({ type: "success", message: "Cập nhật thông tin ngân hàng thành công" }));
        setIsBankInfoModalOpen(false);
        loadBalance();
      }
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          message: error?.response?.data?.message || "Không thể cập nhật thông tin ngân hàng",
        })
      );
    } finally {
      setIsUpdatingBankInfo(false);
    }
  }, [bankInfo, walletTypeForBankInfo, dispatch, loadBalance]);


  const handleRetryTransaction = useCallback(async (transactionId: string) => {
    try {
      const response = await userWalletApi.retryTransaction(transactionId);
      console.log("[WalletPage] Retry response:", response);
      
      if (response.success && response.data) {
        console.log("[WalletPage] Retry data:", {
          transaction: response.data.transaction?._id,
          qrCode: response.data.qrCode,
          bankAccount: response.data.bankAccount,
        });
        
        dispatch(
          addToast({
            type: "success",
            message: "Vui lòng hoàn tất thanh toán lại cho giao dịch này",
          })
        );
        
        // Navigate to deposit page with retry transaction info
        navigate("/wallet/deposit", {
          state: {
            retryTransaction: response.data.transaction,
            qrCode: response.data.qrCode,
            bankAccount: response.data.bankAccount,
            walletType: "user",
          },
        });
      }
    } catch (error: any) {
      console.error("[WalletPage] Retry error:", error);
      dispatch(
        addToast({
          type: "error",
          message: error?.response?.data?.message || "Không thể thử lại giao dịch",
        })
      );
    }
  }, [dispatch, navigate]);


  if (isLoading) {
    return (
      <div className="border border-border-1 rounded-2xl p-3 bg-gradient-to-br from-background-2 to-background-1 my-6 mr-4">
        <Loading layout="centered" message="Đang tải số dư ví..." />
      </div>
    );
  }

  const userWallet = walletData?.wallet;

  return (
    <>
      <div className="space-y-4">
       <div className="grid grid-cols-12 gap-4">
                {/* Unified Wallet */}
                <div className="col-span-12 border border-border-1 rounded-2xl p-6 bg-gradient-to-br from-background-2 to-background-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-6 rounded-xl">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary-6">Ví của bạn</h2>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                window.location.href = `/wallet/deposit?walletType=user&returnUrl=${encodeURIComponent("/profile?tab=wallet")}`;
              }}
            >
              Nạp tiền
            </Button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-neutral-6">Số dư khả dụng</p>
            <p className="text-xl font-bold text-primary-6">
              {formatPriceVND(userWallet?.balance || 0)} <span className="text-xl">VNĐ</span>
            </p>
          </div>

          {userWallet?.bankInfo && (
            <div className="bg-background-2 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-neutral-7 mb-1">Thông tin ngân hàng:</p>
              <p className="text-xs text-neutral-6">{userWallet.bankInfo.bankName} - {userWallet.bankInfo.accountNumber}</p>
              <p className="text-xs text-neutral-6">{userWallet.bankInfo.accountHolder}</p>
            </div>
          )}
        </div>

       </div>

        {/* Transaction History */}
        <TransactionList
          transactions={transactions}
          isLoading={isLoadingTransactions}
          onLoadMore={loadMore}
          hasMore={hasMore}
          onRefresh={refreshTransactions}
          onRetry={handleRetryTransaction}
        />
      </div>


      {/* Bank Info Modal */}
      <Modal
        open={isBankInfoModalOpen}
        onOpenChange={setIsBankInfoModalOpen}
        title={`Đăng ký thông tin ngân hàng - ${walletTypeForBankInfo === "user" ? "Ví cá nhân" : "Ví shop"}`}
        size="md"
        hideFooter
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-6">
            Vui lòng đăng ký thông tin ngân hàng để có thể nạp tiền vào ví.
          </p>
          <Form.Root onSubmit={(e) => e.preventDefault()}>
            <Input
              name="bankName"
              label="Tên ngân hàng *"
              placeholder="Ví dụ: MBBank, Vietcombank..."
              value={bankInfo.bankName}
              onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
              required
            />
            <Input
              name="accountNumber"
              label="Số tài khoản *"
              placeholder="Nhập số tài khoản"
              value={bankInfo.accountNumber}
              onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
              required
            />
            <Input
              name="accountHolder"
              label="Chủ tài khoản *"
              placeholder="Nhập tên chủ tài khoản"
              value={bankInfo.accountHolder}
              onChange={(e) => setBankInfo({ ...bankInfo, accountHolder: e.target.value })}
              required
            />
          </Form.Root>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsBankInfoModalOpen(false);
              }}
            >
              Hủy
            </Button>
            <Button
              variant="solid"
              onClick={handleUpdateBankInfo}
              loading={isUpdatingBankInfo}
            >
              Lưu thông tin
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default WalletPage;
