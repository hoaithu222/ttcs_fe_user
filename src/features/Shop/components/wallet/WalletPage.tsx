import { useEffect, useState, useCallback } from "react";
import Button from "@/foundation/components/buttons/Button";
import Modal from "@/foundation/components/modal/Modal";
import Input from "@/foundation/components/input/Input";
import Loading from "@/foundation/components/loading/Loading";
import { Plus, Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { userWalletApi } from "@/core/api/wallet";
import { useAppDispatch } from "@/app/store";
import { addToast } from "@/app/store/slices/toast";
import { formatPriceVND } from "@/shared/utils/formatPriceVND";
import * as Form from "@radix-ui/react-form";

const WalletPage = () => {
  const dispatch = useAppDispatch();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [isCreatingDeposit, setIsCreatingDeposit] = useState(false);
  const [depositData, setDepositData] = useState<{
    qrCode?: string;
    bankAccount?: { bankName: string; accountNumber: string; accountHolder: string };
    instructions?: string;
  } | null>(null);

  const loadBalance = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await userWalletApi.getBalance();
      if (response.success && response.data) {
        setBalance(response.data.balance || 0);
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

  const handleDeposit = useCallback(async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      dispatch(addToast({ type: "error", message: "Vui lòng nhập số tiền hợp lệ" }));
      return;
    }

    setIsCreatingDeposit(true);
    try {
      const response = await userWalletApi.createDeposit({ amount });
      if (response.success && response.data) {
        setDepositData({
          qrCode: response.data.qrCode,
          bankAccount: response.data.bankAccount,
          instructions: response.data.instructions,
        });
        dispatch(addToast({ type: "success", message: "Đã tạo yêu cầu nạp tiền" }));
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
  }, [depositAmount, dispatch]);

  if (isLoading) {
    return (
      <div className="border border-border-1 rounded-2xl p-3 bg-gradient-to-br from-background-2 to-background-1 my-6 mr-4">
        <Loading layout="centered" message="Đang tải số dư ví..." />
      </div>
    );
  }

  return (
    <>
      <div className="border border-border-1 rounded-2xl p-3 bg-gradient-to-br from-background-2 to-background-1 my-6 mr-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-6 rounded-xl">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold">Ví của tôi</h2>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsDepositModalOpen(true)}
          >
            Nạp tiền
          </Button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-neutral-6">Số dư khả dụng</p>
          <p className="text-xl font-bold text-primary-6">
            {formatPriceVND(balance || 0)} <span className="text-xl">VNĐ</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 justify-start"
            icon={<ArrowDownLeft className="w-4 h-4 text-green-600" />}
            disabled
            title="Tính năng đang phát triển"
          >
            Rút tiền
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 justify-start"
            icon={<ArrowUpRight className="w-4 h-4 text-blue-600" />}
            disabled
            title="Tính năng đang phát triển"
          >
            Chuyển tiền
          </Button>
        </div>
      </div>

      {/* Deposit Modal */}
      <Modal
        open={isDepositModalOpen}
        onOpenChange={setIsDepositModalOpen}
        title="Nạp tiền vào ví"
        size="2xl"
        hideFooter
      >
        <div className="space-y-4">
          {!depositData ? (
            <>
              <Form.Root onSubmit={(e) => e.preventDefault()}>
                <Input
                  name="amount"
                  label="Số tiền nạp (VNĐ)"
                  type="number"
                  placeholder="Nhập số tiền muốn nạp"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                />
              </Form.Root>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDepositModalOpen(false);
                    setDepositAmount("");
                  }}
                >
                  Hủy
                </Button>
                <Button
                  variant="solid"
                  onClick={handleDeposit}
                  loading={isCreatingDeposit}
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                >
                  Tạo yêu cầu nạp tiền
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <p className="text-sm text-neutral-6 mb-4">
                  Vui lòng quét QR code hoặc chuyển khoản theo thông tin bên dưới
                </p>
                {depositData.qrCode && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={depositData.qrCode}
                      alt="QR Code"
                      className="w-64 h-64 border border-border-1 rounded-lg"
                    />
                  </div>
                )}
                {depositData.bankAccount && (
                  <div className="bg-background-2 rounded-lg p-4 space-y-2 mb-4">
                    <p className="text-sm font-semibold text-neutral-9">Thông tin tài khoản:</p>
                    <p className="text-sm text-neutral-7">
                      Ngân hàng: <span className="font-semibold">{depositData.bankAccount.bankName}</span>
                    </p>
                    <p className="text-sm text-neutral-7">
                      Số tài khoản: <span className="font-semibold">{depositData.bankAccount.accountNumber}</span>
                    </p>
                    <p className="text-sm text-neutral-7">
                      Chủ tài khoản: <span className="font-semibold">{depositData.bankAccount.accountHolder}</span>
                    </p>
                    <p className="text-sm text-neutral-7">
                      Số tiền: <span className="font-semibold text-primary-6">{formatPriceVND(parseFloat(depositAmount))}</span>
                    </p>
                  </div>
                )}
                {depositData.instructions && (
                  <div className="bg-primary-1 rounded-lg p-3 mb-4">
                    <p className="text-xs text-primary-7 whitespace-pre-line">{depositData.instructions}</p>
                  </div>
                )}
                <p className="text-xs text-neutral-5 mb-4">
                  Sau khi chuyển khoản, hệ thống sẽ tự động cập nhật số dư ví của bạn (thường trong vòng 5-10 phút).
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDepositModalOpen(false);
                    setDepositAmount("");
                    setDepositData(null);
                    loadBalance();
                  }}
                >
                  Đóng
                </Button>
                <Button
                  variant="solid"
                  onClick={() => {
                    loadBalance();
                  }}
                >
                  Làm mới số dư
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default WalletPage;