import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Button from "@/foundation/components/buttons/Button";
import Input from "@/foundation/components/input/Input";
import Loading from "@/foundation/components/loading/Loading";
import { ArrowLeft, Building2, Clock, Sparkles, Wallet, Shield, Coins, Zap } from "lucide-react";
import { userWalletApi } from "@/core/api/wallet";
import { useAppDispatch } from "@/app/store";
import { addToast } from "@/app/store/slices/toast";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";
import * as Form from "@radix-ui/react-form";
import type { WalletBalanceResponse } from "@/core/api/wallet/type";
import Page from "@/foundation/components/layout/Page";
import Chip from "@/foundation/components/info/Chip";
import Section from "@/foundation/components/sections/Section";
import AlertMessage from "@/foundation/components/info/AlertMessage";
import { QRCodeDisplay } from "@/features/Payment/components";
import { useSocketRefresh } from "@/shared/contexts/SocketRefreshContext";

type DepositMethod = "bank";

const QUICK_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000, 3000000];

const DepositPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { subscribeDepositRefresh } = useSocketRefresh();
  
  const walletType = (searchParams.get("walletType") || "user") as "user" | "shop";
  const returnUrl = searchParams.get("returnUrl") || "/profile?tab=wallet";

  const [walletData, setWalletData] = useState<WalletBalanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [depositMethod] = useState<DepositMethod>("bank");
  const [isCreatingDeposit, setIsCreatingDeposit] = useState(false);
  const [depositData, setDepositData] = useState<{
    transactionId: string;
    qrCode?: string;
    paymentUrl?: string;
    expiresAt?: string;
    bankAccount?: { bankName: string; accountNumber: string; accountHolder: string };
    instructions?: string;
  } | null>(null);
  const [depositStatus, setDepositStatus] = useState<"form" | "processing" | "completed">("form");

  const loadBalance = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await userWalletApi.getBalance();
      if (response.success && response.data) {
        setWalletData(response.data);
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

  // Subscribe to socket refresh events for deposit
  useEffect(() => {
    const unsubscribe = subscribeDepositRefresh(async () => {
      console.log("[DepositPage] Socket refresh triggered for deposit");
      // Reload balance khi nhận được socket notification
      const response = await userWalletApi.getBalance();
      if (response.success && response.data) {
        const newBalance = response.data.wallet?.balance || 0;
        const oldBalance = walletData?.wallet?.balance || 0;
        
        // Nếu số dư tăng lên và đang ở trạng thái processing, cập nhật status
        if (newBalance > oldBalance && depositStatus === "processing") {
          setDepositStatus("completed");
          setWalletData(response.data);
        } else if (newBalance !== oldBalance) {
          // Cập nhật wallet data nếu có thay đổi
          setWalletData(response.data);
        }
      }
    });

    return unsubscribe;
  }, [subscribeDepositRefresh, depositStatus, walletData]);

  // Check for success query param (from VNPay return)
  useEffect(() => {
    const success = searchParams.get("deposit");
    const transactionId = searchParams.get("transactionId");
    if (success === "success" && transactionId) {
      setDepositStatus("processing");
      dispatch(addToast({ 
        type: "info", 
        message: "Đang kiểm tra trạng thái giao dịch..." 
      }));
      // Refresh balance after successful deposit
      setTimeout(() => {
        loadBalance();
      }, 2000);
    }
  }, [searchParams, loadBalance, dispatch]);

  // Handle retry transaction from WalletPage
  useEffect(() => {
    const state = (location.state as any);
    console.log("[DepositPage] location.state:", state);
    
    if (state?.retryTransaction) {
      // Set deposit data from retry
      const amount = state.retryTransaction.amount || 0;
      
      console.log("[DepositPage] Processing retry transaction:", {
        transactionId: state.retryTransaction._id,
        amount,
        qrCode: state.qrCode,
        bankAccount: state.bankAccount,
      });
      
      setDepositData({
        transactionId: state.retryTransaction._id,
        qrCode: state.qrCode,
        bankAccount: state.bankAccount,
        instructions: "Vui lòng chuyển khoản lại cho giao dịch nạp tiền này. Hệ thống sẽ tự động cập nhật số dư sau khi nhận được chuyển khoản.",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
      });
      setDepositStatus("processing");
      setDepositAmount(amount.toString());
      
      dispatch(addToast({
        type: "info",
        message: "Thử lại giao dịch - Vui lòng hoàn tất thanh toán",
      }));
    }
  }, [dispatch, location.state]);

  const handleDeposit = useCallback(async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      dispatch(addToast({ type: "error", message: "Vui lòng nhập số tiền hợp lệ" }));
      return;
    }

    setIsCreatingDeposit(true);
    try {
      const response = await userWalletApi.createDeposit(
        { 
          amount,
          depositMethod: "bank"
        }, 
        walletType
      );
      if (response.success && response.data) {
        setDepositData({
          transactionId: response.data.transaction._id,
          qrCode: response.data.qrCode,
          paymentUrl: response.data.paymentUrl,
          expiresAt: response.data.expiresAt,
          bankAccount: response.data.bankAccount,
          instructions: response.data.instructions,
        });

        // Với Sepay (chuyển khoản ngân hàng), luôn hiển thị màn hình hướng dẫn/QR
        setDepositStatus("processing");
        dispatch(addToast({ type: "success", message: "Đã tạo yêu cầu nạp tiền. Vui lòng chuyển khoản theo thông tin bên dưới." }));
      }
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          message: error?.response?.data?.message || "Không thể tạo yêu cầu nạp tiền",
        })
      );
    } finally {
      setIsCreatingDeposit(false);
    }
  }, [depositAmount, depositMethod, walletType, dispatch]);

  // Ví đã gộp: luôn dùng ví theo user
  const currentWallet = walletData?.wallet;

  if (isLoading) {
    return (
      <Page>
        <div className="container mx-auto px-4 py-8">
          <Loading layout="centered" message="Đang tải thông tin ví..." />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="px-4 min-h-[calc(100vh-80px)]">
        <div className="px-4 py-4 container mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(returnUrl)}
              className="gap-2"
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Quay lại
            </Button>
            <div className="flex items-center gap-3" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left column: thông tin số dư + số tiền muốn nạp */}
                        {/* Left column: thông tin số dư + thống kê */}
                        <div className="lg:col-span-1 space-y-6">
              {/* Balance Card - Modern Bank Style */}
              <Section className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary-6 via-primary-7 to-primary-8 text-white shadow-2xl">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-3xl" />
                <Sparkles className="absolute top-4 right-4 w-6 h-6 text-white/20" />
                
                <div className="relative p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <span className="text-sm opacity-90">Ví của tôi</span>
                    </div>
                    <Chip
                      colorClass="bg-white/20 text-white border-none backdrop-blur-sm"
                      rounded="full"
                      size="sm"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Bảo mật
                    </Chip>
                  </div>

                  <div>
                    <p className="text-xs opacity-80 mb-2 uppercase tracking-wider">Số dư hiện tại</p>
                    <p className="text-4xl font-bold leading-tight mb-1">
                      {formatPriceVND(currentWallet?.balance || 0)}
                    </p>
                    <p className="text-xs opacity-70">VNĐ</p>
                  </div>

                  {/* Thông tin số tiền muốn nạp & số dư dự kiến */}
                  {depositAmount && parseFloat(depositAmount) > 0 && (
                    <div className="mt-4 rounded-2xl bg-white/10 px-4 py-4 space-y-3 text-sm backdrop-blur-md border border-white/10">
                      <div className="flex items-center justify-between gap-2">
                        <span className="opacity-90">Số tiền muốn nạp</span>
                        <span className="font-bold text-lg">
                          {formatPriceVND(parseFloat(depositAmount) || 0)}
                        </span>
                      </div>
                      <div className="h-px bg-white/20" />
                      <div className="flex items-center justify-between gap-2">
                        <span className="opacity-90">Số dư sau nạp</span>
                        <span className="font-bold text-lg">
                          {formatPriceVND(
                            (currentWallet?.balance || 0) + (parseFloat(depositAmount) || 0)
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                   {/* Thông tin ví */}
                   <div className="bg-background-4 rounded-2xl p-4 border border-border-2 shadow-sm space-y-6">
                    <div className="flex items-center justify-start">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-start">
                          <p className="text-sm font-semibold text-white">Mã ví</p>
                          <p className="text-xs text-white">{String(currentWallet?._id).slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                   </div>
                  </div>
                </Section>
              </div>

            {/* Right column: form hoặc QR nạp tiền */}
            <div className="lg:col-span-2 space-y-4">
          {depositStatus === "form" && (
            <Section className="bg-background-1 rounded-2xl p-4 border border-border-1 shadow-sm space-y-6">
              {/* Amount Input Section - Modern Bank Style */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary-6 to-primary-7">
                    <Coins className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <label className="block text-start text-base font-bold text-neutral-9">
                      Nhập số tiền bạn muốn nạp
                    </label>
                    <p className="text-xs text-neutral-6 mt-0.5 text-start">Số tiền tối thiểu: 10,000 VNĐ</p>
                  </div>
                </div>

                <Form.Root onSubmit={(e) => e.preventDefault()}>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="text-lg font-semibold text-neutral-6">₫</span>
                    </div>
                    <Input
                      name="amount"
                      type="number"
                      placeholder="0"
                      value={depositAmount}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Chỉ cho phép số dương
                        if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                          setDepositAmount(value);
                        }
                      }}
                      required
                      className="text-xl font-bold pl-10 pr-4 py-4 h-16 border-2 focus:border-primary-6 transition-colors"
                      min="10000"
                      step="1000"
                    />
                    {depositAmount && parseFloat(depositAmount) > 0 && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <span className="text-sm font-medium text-neutral-5">VNĐ</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Amount Preview */}
                  {depositAmount && parseFloat(depositAmount) >= 10000 && (
                    <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-primary-1 to-primary-2 border border-primary-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-7">Số tiền sẽ nạp:</span>
                        <span className="text-lg font-bold text-primary-7">
                          {formatPriceVND(parseFloat(depositAmount))}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {depositAmount && parseFloat(depositAmount) > 0 && parseFloat(depositAmount) < 10000 && (
                    <div className="mt-3 p-3 rounded-xl bg-error/10 border border-error/20">
                      <p className="text-sm text-error flex items-center gap-2">
                        <span>⚠️</span>
                        <span>Số tiền tối thiểu là 10,000 VNĐ</span>
                      </p>
                    </div>
                  )}
                </Form.Root>
              </div>

              {/* Quick Amount Selection - Modern Cards */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary-6" />
                  <label className="text-sm font-semibold text-neutral-9">
                    Chọn nhanh số tiền
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {QUICK_AMOUNTS.map((amount) => {
                    const isSelected = depositAmount === amount.toString();
                    return (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setDepositAmount(amount.toString())}
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-primary-6 bg-gradient-to-br from-primary-6 to-primary-7 text-white shadow-lg shadow-primary-6/30 scale-105"
                            : "border-border-1 bg-background-1 hover:border-primary-4 hover:bg-primary-1 hover:shadow-md"
                        }`}
                      >
                        <div className={`text-center ${isSelected ? "text-white" : ""}`}>
                          <p className={`text-xs font-medium mb-1 ${isSelected ? "text-white/80" : "text-neutral-6"}`}>
                            {amount >= 1000000 ? `${amount / 1000000}M` : amount >= 1000 ? `${amount / 1000}K` : amount}
                          </p>
                          <p className={`text-sm font-bold ${isSelected ? "text-white" : "text-primary-6"}`}>
                            {formatPriceVND(amount)}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deposit Method Selection */}
              <div>
                <label className="block text-sm font-semibold text-neutral-9 mb-3">
                  Phương thức nạp tiền
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <div
                    className="p-4 rounded-lg border-2 border-primary-6 bg-primary-1 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary-6 text-white">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-9">Chuyển khoản qua ngân hàng (Sepay)</p>
                        <p className="text-xs text-neutral-6">Quét QR code hoặc chuyển khoản theo thông tin hiển thị</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                variant="solid"
                size="lg"
                fullWidth
                onClick={handleDeposit}
                loading={isCreatingDeposit}
                disabled={!depositAmount || parseFloat(depositAmount) <= 0}
              >
                Tạo yêu cầu nạp tiền
              </Button>
            </Section>
          )}

          {depositStatus === "processing" && depositData && (
            <Section className="bg-background-1 rounded-2xl p-4 border border-border-1 shadow-sm space-y-6">
              {/* Processing Status */}
              {/* <AlertMessage
                type="warning"
                title="Yêu cầu nạp tiền đang được xử lý"
                message="Vui lòng quét mã QR hoặc chuyển khoản theo thông tin phía dưới. Hệ thống sẽ tự động cập nhật số dư sau khi nhận được chuyển khoản qua Sepay."
                icon={<Clock className="w-5 h-5 animate-spin" />}
              /> */}

              {/* QR + Thông tin tài khoản - dùng lại UI giống PaymentPage */}
              <QRCodeDisplay
                qrCode={depositData.qrCode}
                instructions={depositData.instructions}
                accountInfo={depositData.bankAccount}
              />

              {/* Thông tin số tiền nạp */}
              <AlertMessage
                type="info"
                title="Thông tin số tiền nạp"
                message={
                  <>
                    Số tiền bạn cần chuyển:{" "}
                    <span className="font-semibold text-primary-6">
                      {formatPriceVND(parseFloat(depositAmount))} VNĐ
                    </span>
                    . Hệ thống có thể hiển thị số tiền trên QR nhỏ hơn để phục vụ chế độ test SePay,
                    nhưng khi nhận đúng nội dung giao dịch, ví vẫn được cộng chính xác.
                  </>
                }
              />

              {/* Expiration Time */}
              {depositData.expiresAt && (
                <div className="bg-warning/10 rounded-lg p-3 border border-warning/20">
                  <p className="text-xs text-warning text-center">
                    QR code sẽ hết hạn vào:{" "}
                    {new Date(depositData.expiresAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setDepositStatus("form");
                    setDepositData(null);
                    setDepositAmount("");
                  }}
                >
                  Tạo yêu cầu mới
                </Button>
                <Button
                  variant="solid"
                  className="flex-1"
                  onClick={() => {
                    loadBalance();
                    dispatch(addToast({ type: "info", message: "Đang kiểm tra số dư..." }));
                  }}
                >
                  Làm mới số dư
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(returnUrl)}
                >
                  Quay lại ví
                </Button>
              </div>

              <p className="text-xs text-center text-neutral-5">
                Sau khi chuyển khoản, hệ thống sẽ tự động cập nhật số dư ví của bạn (thường trong vòng
                5–10 phút). Bạn có thể quay lại trang này để kiểm tra trạng thái.
              </p>
            </Section>
          )}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default DepositPage;

