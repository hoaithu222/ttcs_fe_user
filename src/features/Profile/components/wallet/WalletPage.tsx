import { useEffect, useState, useCallback } from "react";
import Button from "@/foundation/components/buttons/Button";
import Modal from "@/foundation/components/modal/Modal";
import Input from "@/foundation/components/input/Input";
import Loading from "@/foundation/components/loading/Loading";
import { Plus, Wallet, Store, ArrowLeftRight, CheckCircle2, XCircle } from "lucide-react";
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
  const [walletData, setWalletData] = useState<WalletBalanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isBankInfoModalOpen, setIsBankInfoModalOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [transferFrom, setTransferFrom] = useState<"user" | "shop">("user");
  const [isTransferring, setIsTransferring] = useState(false);
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


  const handleTransfer = useCallback(async () => {
    const amount = parseFloat(transferAmount);
    if (!amount || amount <= 0) {
      dispatch(addToast({ type: "error", message: "Vui lòng nhập số tiền hợp lệ" }));
      return;
    }

    setIsTransferring(true);
    try {
      const response = await userWalletApi.transferBetweenWallets({
        amount,
        from: transferFrom,
        to: transferFrom === "user" ? "shop" : "user",
      });
      if (response.success && response.data) {
        dispatch(addToast({ type: "success", message: "Chuyển tiền thành công" }));
        setIsTransferModalOpen(false);
        setTransferAmount("");
        loadBalance();
        refreshTransactions(); // Refresh transaction list after transfer
      }
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          message: error?.response?.data?.message || "Không thể chuyển tiền",
        })
      );
    } finally {
      setIsTransferring(false);
    }
  }, [transferAmount, transferFrom, dispatch, loadBalance]);

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


  if (isLoading) {
    return (
      <div className="border border-border-1 rounded-2xl p-3 bg-gradient-to-br from-background-2 to-background-1 my-6 mr-4">
        <Loading layout="centered" message="Đang tải số dư ví..." />
      </div>
    );
  }

  const userWallet = walletData?.wallet;
  const shopWallet = walletData?.shopWallet;
  const isShopOwner = !!walletData?.shop;

  return (
    <>
      <div className="space-y-4  ">
       <div className="grid grid-cols-12 gap-4">
                {/* User Wallet */}
                <div className="col-span-6 border border-border-1 rounded-2xl p-6 bg-gradient-to-br from-background-2 to-background-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-6 rounded-xl">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary-6">Ví cá nhân</h2>
                <div className="flex items-center gap-2 mt-1">
                  {userWallet?.isVerified ? (
                    <span className="text-xs text-success flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Đã xác thực
                    </span>
                  ) : (
                    <span className="text-xs text-warning flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Chưa xác thực
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                const wallet = walletData?.wallet;
                if (!wallet?.isVerified && !wallet?.bankInfo) {
                  setWalletTypeForBankInfo("user");
                  setIsBankInfoModalOpen(true);
                  return;
                }
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

        {/* Shop Wallet */}
        {isShopOwner && shopWallet && (
          <div className="col-span-6 border border-border-1 rounded-2xl p-6 bg-gradient-to-br from-background-2 to-background-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success rounded-xl">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-success">Ví shop</h2>
                  <p className="text-xs text-neutral-6">{walletData?.shop?.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {shopWallet.isVerified ? (
                      <span className="text-xs text-success flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Đã xác thực
                      </span>
                    ) : (
                      <span className="text-xs text-warning flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Chưa xác thực
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  const wallet = walletData?.shopWallet;
                  if (!wallet?.isVerified && !wallet?.bankInfo) {
                    setWalletTypeForBankInfo("shop");
                    setIsBankInfoModalOpen(true);
                    return;
                  }
                  window.location.href = `/wallet/deposit?walletType=shop&returnUrl=${encodeURIComponent("/profile?tab=wallet")}`;
                }}
              >
                Nạp tiền
              </Button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-neutral-6">Số dư khả dụng</p>
              <p className="text-xl font-bold text-success">
                {formatPriceVND(shopWallet.balance || 0)} <span className="text-xl">VNĐ</span>
              </p>
            </div>

            {shopWallet.bankInfo && (
              <div className="bg-background-2 rounded-lg p-3 mb-4">
                <p className="text-xs font-semibold text-neutral-7 mb-1">Thông tin ngân hàng:</p>
                <p className="text-xs text-neutral-6">{shopWallet.bankInfo.bankName} - {shopWallet.bankInfo.accountNumber}</p>
                <p className="text-xs text-neutral-6">{shopWallet.bankInfo.accountHolder}</p>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="gap-2 w-full justify-center"
              icon={<ArrowLeftRight className="w-4 h-4" />}
              onClick={() => setIsTransferModalOpen(true)}
            >
              Chuyển tiền giữa 2 ví
            </Button>
          </div>
        )}
       </div>

        {/* Transaction History */}
        <TransactionList
          transactions={transactions}
          isLoading={isLoadingTransactions}
          onLoadMore={loadMore}
          hasMore={hasMore}
          onRefresh={refreshTransactions}
        />
      </div>


      {/* Transfer Modal */}
      <Modal
        open={isTransferModalOpen}
        onOpenChange={setIsTransferModalOpen}
        title="Chuyển tiền giữa 2 ví"
        size="md"
        hideFooter
      >
        <div className="space-y-4">
          <div className="bg-background-2 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-neutral-9">Ví cá nhân</p>
            <p className="text-lg font-bold text-primary-6">{formatPriceVND(userWallet?.balance || 0)}</p>
          </div>
          <div className="bg-background-2 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-neutral-9">Ví shop</p>
            <p className="text-lg font-bold text-success">{formatPriceVND(shopWallet?.balance || 0)}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-9 mb-2">
              Chuyển từ
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTransferFrom("user")}
                className={`flex-1 p-3 rounded-lg border-2 ${
                  transferFrom === "user"
                    ? "border-primary-6 bg-primary-1"
                    : "border-border-1 bg-background-1"
                }`}
              >
                <p className="text-sm font-semibold">Ví cá nhân</p>
                <p className="text-xs text-neutral-6">{formatPriceVND(userWallet?.balance || 0)}</p>
              </button>
              <button
                type="button"
                onClick={() => setTransferFrom("shop")}
                className={`flex-1 p-3 rounded-lg border-2 ${
                  transferFrom === "shop"
                    ? "border-primary-6 bg-primary-1"
                    : "border-border-1 bg-background-1"
                }`}
              >
                <p className="text-sm font-semibold">Ví shop</p>
                <p className="text-xs text-neutral-6">{formatPriceVND(shopWallet?.balance || 0)}</p>
              </button>
            </div>
          </div>

          <Form.Root onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-semibold text-neutral-9 mb-2">
                Số tiền chuyển (VNĐ)
              </label>
              <Input
                name="transferAmount"
                type="number"
                placeholder="Nhập số tiền"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
            </div>
          </Form.Root>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsTransferModalOpen(false);
                setTransferAmount("");
              }}
            >
              Hủy
            </Button>
            <Button
              variant="solid"
              onClick={handleTransfer}
              loading={isTransferring}
              disabled={!transferAmount || parseFloat(transferAmount) <= 0}
            >
              Chuyển tiền
            </Button>
          </div>
        </div>
      </Modal>

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
