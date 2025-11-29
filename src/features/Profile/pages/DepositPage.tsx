import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "@/foundation/components/buttons/Button";
import Input from "@/foundation/components/input/Input";
import Loading from "@/foundation/components/loading/Loading";
import { ArrowLeft, Building2, Clock } from "lucide-react";
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

type DepositMethod = "bank";

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
        <div className="px-4 py-8 container mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: thông tin số dư + số tiền muốn nạp */}
            <div className="lg:col-span-1">
              <Section className="relative overflow-hidden rounded-2xl border border-border-1 bg-gradient-to-br from-primary-6 to-primary-7 text-white shadow-md">
                {/* Overlay gradient để mềm hơn */}
                <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                <div className="relative p-5 space-y-4">
                  <div>
                    <p className="text-xs opacity-80 mb-1">Số dư hiện tại</p>
                    <p className="text-3xl font-bold leading-tight">
                      {formatPriceVND(currentWallet?.balance || 0)}
                    </p>
                  </div>

                  {/* Thông tin số tiền muốn nạp & số dư dự kiến */}
                  {depositAmount && parseFloat(depositAmount) > 0 && (
                    <div className="mt-2 rounded-xl bg-white/8 px-3 py-3 space-y-2 text-xs backdrop-blur-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="opacity-90">Số tiền muốn nạp</span>
                        <span className="font-semibold">
                          {formatPriceVND(parseFloat(depositAmount) || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="opacity-90">Số dư sau nạp (dự kiến)</span>
                        <span className="font-semibold">
                          {formatPriceVND(
                            (currentWallet?.balance || 0) + (parseFloat(depositAmount) || 0)
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Mã ví (ID rút gọn) nếu có */}
                  {currentWallet?._id && (
                    <div className="pt-2 border-t border-white/10 mt-2">
                      <p className="text-[11px] opacity-80">
                        Mã ví:{" "}
                        <span className="font-mono tracking-wide">
                          {String(currentWallet._id).slice(0, 8)}…
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </Section>
            </div>

            {/* Right column: form hoặc QR nạp tiền */}
            <div className="lg:col-span-2 space-y-6">
          {depositStatus === "form" && (
            <Section className="bg-background-1 rounded-2xl p-6 border border-border-1 shadow-sm space-y-6">
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
            <Section className="bg-background-1 rounded-2xl p-6 border border-border-1 shadow-sm space-y-6">
              {/* Processing Status */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-warning/10">
                  <Clock className="w-8 h-8 text-warning animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-neutral-9">
                  Yêu cầu nạp tiền đang được xử lý
                </h2>
                <p className="text-sm text-neutral-6 max-w-xl mx-auto">
                  Vui lòng quét mã QR hoặc chuyển khoản theo thông tin phía dưới. Hệ thống sẽ tự động
                  cập nhật số dư sau khi nhận được chuyển khoản qua Sepay.
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

