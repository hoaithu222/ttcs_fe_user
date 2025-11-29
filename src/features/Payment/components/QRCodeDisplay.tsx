import React from "react";
import { Copy, Check } from "lucide-react";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import Button from "@/foundation/components/buttons/Button";

interface QRCodeDisplayProps {
  qrCode?: string;
  instructions?: string;
  accountInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  expiresInMinutes?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  qrCode,
  instructions,
  accountInfo,
  expiresInMinutes,
  onRefresh,
  isRefreshing = false,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [remainingSeconds, setRemainingSeconds] = React.useState<number | null>(
    expiresInMinutes ? expiresInMinutes * 60 : null
  );
  const handleDownloadQr = () => {
    if (!qrCode) return;
  
    // Nếu QR là ảnh base64 (data:image...)
    if (qrCode.startsWith("data:image")) {
      const link = document.createElement("a");
      link.href = qrCode;
      link.download = "qr-payment.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
  
    // Nếu QR là URL ảnh thông thường
    fetch(qrCode)
      .then(response => response.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "qr-payment.png";
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
      })
      .catch(() => {
        console.error("Download QR failed");
      });
  };
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset countdown when QR or expire time thay đổi
  React.useEffect(() => {
    if (!expiresInMinutes) {
      setRemainingSeconds(null);
      return;
    }
    setRemainingSeconds(expiresInMinutes * 60);
  }, [expiresInMinutes, qrCode]);

  // Đếm ngược mỗi giây
  React.useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingSeconds]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <Section className="bg-background-1 rounded-2xl p-6 border border-border-1 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <SectionTitle className="mb-1">Thông tin thanh toán</SectionTitle>
          <p className="text-xs text-neutral-6">
            Quét mã QR hoặc chuyển khoản thủ công theo thông tin bên cạnh.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* QR Code */}
        {qrCode && (
          <div className="flex flex-col items-center lg:items-start">
            <div className="p-4 bg-white rounded-xl border-2 border-border-1 shadow-sm">
              <img src={qrCode} alt="QR Code" className="w-52 h-52 lg:w-60 lg:h-60" />
            </div>
            <p className="mt-3 text-sm text-neutral-6 text-center lg:text-left">
              Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử để thanh toán nhanh.
            </p>
            <div className="mt-3">
              <Button size="sm" variant="outline" onClick={handleDownloadQr}>
                Tải mã QR
              </Button>
            </div>
            {expiresInMinutes && remainingSeconds !== null && remainingSeconds > 0 && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-background-1 px-3 py-1 border border-border-1">
                <span className="text-xs text-neutral-6">Mã QR sẽ hết hạn trong</span>
                <span className="text-xs font-semibold text-error">
                  {formatTime(remainingSeconds)}
                </span>
              </div>
            )}
            {expiresInMinutes && remainingSeconds === 0 && (
              <div className="mt-3 flex flex-col items-center lg:items-start gap-2">
                <p className="text-xs text-error">
                  Mã QR đã hết hạn. Vui lòng lấy lại mã QR mới để tiếp tục thanh toán.
                </p>
                {onRefresh && (
                  <Button
                    size="sm"
                    variant="solid"
                    onClick={onRefresh}
                    loading={isRefreshing}
                  >
                    Lấy lại mã QR
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {/* Account Info */}
          {accountInfo && (
            <div className="p-4 bg-background-2 rounded-xl border border-border-1 space-y-3">
              <h3 className="text-sm font-semibold text-neutral-9">Thông tin tài khoản nhận</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-neutral-6">Ngân hàng</p>
                  <p className="text-sm font-medium text-neutral-9 truncate text-right">
                    {accountInfo.bankName}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-neutral-6">Số tài khoản</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-neutral-9 font-mono tracking-wide">
                      {accountInfo.accountNumber}
                    </p>
                    <Button
                      variant="ghost"
                      size="xs"
                      icon={copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      onClick={() => handleCopy(accountInfo.accountNumber)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-neutral-6">Chủ tài khoản</p>
                  <p className="text-sm font-medium text-neutral-9 text-right truncate">
                    {accountInfo.accountHolder}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {instructions && (
            <div className="p-4 bg-background-2 rounded-xl border border-border-1">
              <h3 className="text-sm font-semibold text-primary-9 mb-2">Hướng dẫn thanh toán</h3>
              <p className="text-sm text-neutral-8 whitespace-pre-line">
                {instructions}
              </p>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
};

export default QRCodeDisplay;

