import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "@/foundation/components/buttons/Button";
import Input from "@/foundation/components/input/Input";
import Loading from "@/foundation/components/loading/Loading";
import { ArrowLeft, Wallet, Building2, CreditCard, CheckCircle2, Clock, XCircle } from "lucide-react";
import { userWalletApi } from "@/core/api/wallet";
import { useAppDispatch } from "@/app/store";
import { addToast } from "@/app/store/slices/toast";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";
import * as Form from "@radix-ui/react-form";
import type { WalletBalanceResponse } from "@/core/api/wallet/type";
import Page from "@/foundation/components/layout/Page";
import Chip from "@/foundation/components/info/Chip";

type DepositMethod = "bank" | "vnpay";

const QUICK_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000, 3000000];

const DepositPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  
  const walletType = (searchParams.get("walletType") || "user") as "user" | "shop";
  const returnUrl = searchParams.get("returnUrl") || "/profile?tab=wallet";

  const [walletData, setWalletData] = useState<WalletBalanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [depositMethod, setDepositMethod] = useState<DepositMethod>("bank");
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
          depositMethod: depositMethod // Pass deposit method to backend
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
        
        // If VNPay method, redirect to payment URL
        if (depositMethod === "vnpay" && response.data.paymentUrl) {
          window.location.href = response.data.paymentUrl;
          return;
        }
        
        // If bank transfer, show processing status
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

  const currentWallet = walletType === "user" ? walletData?.wallet : walletData?.shopWallet;
  const walletName = walletType === "user" ? "Ví cá nhân" : `Ví shop ${walletData?.shop?.name || ""}`;

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
      <div className="min-h-screen bg-background-1">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(returnUrl)}
              className="gap-2"
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Quay lại
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-6 rounded-xl">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-9">Nạp tiền vào ví</h1>
                <p className="text-sm text-neutral-6">{walletName}</p>
              </div>
            </div>
          </div>

          {/* Current Balance */}
          <div className="bg-gradient-to-br from-primary-6 to-primary-8 rounded-2xl p-6 mb-6 text-white">
            <p className="text-sm opacity-90 mb-2">Số dư hiện tại</p>
            <p className="text-3xl font-bold">
              {formatPriceVND(currentWallet?.balance || 0)}
            </p>
          </div>

          {depositStatus === "form" && (
            <div className="bg-background-2 rounded-2xl p-6 border border-border-1 space-y-6">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-neutral-9 mb-3">
                  Nhập số tiền bạn muốn nạp (VNĐ) *
                </label>
                <Form.Root onSubmit={(e) => e.preventDefault()}>
                  <Input
                    name="amount"
                    type="number"
                    placeholder="Nhập số tiền muốn nạp"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                    className="text-lg"
                  />
                </Form.Root>
              </div>

              {/* Quick Amount Selection */}
              <div>
                <label className="block text-sm font-semibold text-neutral-9 mb-3">
                  Chọn nhanh
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {QUICK_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setDepositAmount(amount.toString())}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        depositAmount === amount.toString()
                          ? "border-primary-6 bg-primary-1"
                          : "border-border-1 bg-background-1 hover:border-primary-3"
                      }`}
                    >
                      <span className="text-sm font-semibold text-primary-6">
                        {formatPriceVND(amount)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Deposit Method Selection */}
              <div>
                <label className="block text-sm font-semibold text-neutral-9 mb-3">
                  Phương thức nạp tiền
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDepositMethod("bank")}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      depositMethod === "bank"
                        ? "border-primary-6 bg-primary-1"
                        : "border-border-1 bg-background-1 hover:border-primary-3"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          depositMethod === "bank"
                            ? "bg-primary-6 text-white"
                            : "bg-neutral-2 text-neutral-7"
                        }`}
                      >
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-9">Chuyển khoản ngân hàng</p>
                        <p className="text-xs text-neutral-6">Quét QR code hoặc chuyển khoản</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositMethod("vnpay")}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      depositMethod === "vnpay"
                        ? "border-primary-6 bg-primary-1"
                        : "border-border-1 bg-background-1 hover:border-primary-3"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          depositMethod === "vnpay"
                            ? "bg-primary-6 text-white"
                            : "bg-neutral-2 text-neutral-7"
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-9">VNPay</p>
                        <p className="text-xs text-neutral-6">Thanh toán qua VNPay</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Deposit Info */}
              {depositAmount && parseFloat(depositAmount) > 0 && (
                <div className="bg-background-1 rounded-lg p-4 border border-border-1">
                  <p className="text-sm font-semibold text-neutral-9 mb-2">Thông tin nạp tiền</p>
                  <p className="text-sm text-neutral-7">
                    Số tiền sẽ được cộng:{" "}
                    <span className="font-semibold text-success">
                      + {formatPriceVND(parseFloat(depositAmount) || 0)}
                    </span>
                  </p>
                  <p className="text-sm text-neutral-7 mt-1">
                    Số dư sau nạp:{" "}
                    <span className="font-semibold text-primary-6">
                      {formatPriceVND((currentWallet?.balance || 0) + (parseFloat(depositAmount) || 0))}
                    </span>
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                variant="solid"
                size="lg"
                fullWidth
                onClick={handleDeposit}
                loading={isCreatingDeposit}
                disabled={!depositAmount || parseFloat(depositAmount) <= 0}
              >
                {depositMethod === "vnpay" ? "Thanh toán qua VNPay" : "Tạo yêu cầu nạp tiền"}
              </Button>
            </div>
          )}

          {depositStatus === "processing" && depositData && (
            <div className="bg-background-2 rounded-2xl p-6 border border-border-1 space-y-6">
              {/* Processing Status */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-warning/20 mb-4">
                  <Clock className="w-8 h-8 text-warning animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-neutral-9 mb-2">
                  Yêu cầu nạp tiền đang được xử lý
                </h2>
                <p className="text-sm text-neutral-6 mb-4">
                  {depositMethod === "vnpay" 
                    ? "Bạn đã được chuyển đến trang thanh toán VNPay. Nếu chưa thanh toán, vui lòng quay lại và thử lại."
                    : "Vui lòng chuyển khoản theo thông tin bên dưới. Hệ thống sẽ tự động cập nhật số dư sau khi nhận được chuyển khoản."}
                </p>
                <Chip
                  colorClass="bg-warning text-white border-none"
                  className="shadow-sm"
                  rounded="full"
                  size="sm"
                >
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Đang chờ xử lý</span>
                  </span>
                </Chip>
              </div>

              {/* VNPay Payment Link (only if VNPay method) */}
              {depositMethod === "vnpay" && depositData.paymentUrl && (
                <div className="text-center">
                  <p className="text-sm font-semibold text-neutral-9 mb-3">
                    Link thanh toán VNPay
                  </p>
                  <div className="bg-background-1 rounded-lg p-4 border border-border-1">
                    <a
                      href={depositData.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-6 hover:underline break-all"
                    >
                      {depositData.paymentUrl}
                    </a>
                    <Button
                      variant="solid"
                      className="mt-3 w-full"
                      onClick={() => window.open(depositData.paymentUrl, "_blank")}
                    >
                      Mở trang thanh toán VNPay
                    </Button>
                  </div>
                </div>
              )}

              {/* QR Code (only for bank transfer) */}
              {depositMethod === "bank" && depositData.qrCode && (
                <div className="text-center">
                  <p className="text-sm font-semibold text-neutral-9 mb-3">
                    Quét QR code để chuyển khoản
                  </p>
                  <div className="flex justify-center">
                    <div className="relative">
                      <img
                        src={depositData.qrCode}
                        alt="QR Code"
                        className="w-64 h-64 border-2 border-border-1 rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <Wallet className="w-8 h-8 text-primary-6" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Account Info (only for bank transfer) */}
              {depositMethod === "bank" && depositData.bankAccount && (
                <div className="bg-background-1 rounded-lg p-4 border border-border-1 space-y-3">
                  <p className="text-sm font-semibold text-neutral-9 mb-3">Thông tin tài khoản nhận tiền:</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-6">Ngân hàng:</span>
                      <span className="text-sm font-semibold text-neutral-9">
                        {depositData.bankAccount.bankName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-6">Số tài khoản:</span>
                      <span className="text-sm font-semibold text-neutral-9 font-mono">
                        {depositData.bankAccount.accountNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-6">Chủ tài khoản:</span>
                      <span className="text-sm font-semibold text-neutral-9">
                        {depositData.bankAccount.accountHolder}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-6">Số tiền:</span>
                      <span className="text-sm font-semibold text-primary-6">
                        {formatPriceVND(parseFloat(depositAmount))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-6">Nội dung:</span>
                      <span className="text-sm font-semibold text-neutral-9">
                        Nap tien {depositData.transactionId.substring(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              {depositData.instructions && (
                <div className="bg-primary-1 rounded-lg p-4 border border-primary-3">
                  <p className="text-xs text-primary-7 whitespace-pre-line">
                    {depositData.instructions}
                  </p>
                </div>
              )}

              {/* Expiration Time */}
              {depositData.expiresAt && (
                <div className="bg-warning/10 rounded-lg p-3 border border-warning/20">
                  <p className="text-xs text-warning text-center">
                    QR code sẽ hết hạn vào: {new Date(depositData.expiresAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
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
                  fullWidth
                  onClick={() => {
                    loadBalance();
                    dispatch(addToast({ type: "info", message: "Đang kiểm tra số dư..." }));
                  }}
                >
                  Làm mới số dư
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate(returnUrl)}
                >
                  Quay lại ví
                </Button>
              </div>

              <p className="text-xs text-center text-neutral-5">
                Sau khi chuyển khoản, hệ thống sẽ tự động cập nhật số dư ví của bạn (thường trong vòng 5-10 phút).
                Bạn có thể quay lại trang này để kiểm tra trạng thái.
              </p>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

export default DepositPage;

