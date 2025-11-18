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
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  qrCode,
  instructions,
  accountInfo,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Section className="bg-background-2 rounded-2xl p-6 border border-border-1">
      <SectionTitle className="mb-4">Thông tin thanh toán</SectionTitle>

      <div className="space-y-6">
        {/* QR Code */}
        {qrCode && (
          <div className="flex flex-col items-center">
            <div className="p-4 bg-white rounded-lg border-2 border-border-1">
              <img src={qrCode} alt="QR Code" className="w-48 h-48" />
            </div>
            <p className="mt-3 text-sm text-neutral-6 text-center">
              Quét mã QR để thanh toán
            </p>
          </div>
        )}

        {/* Account Info */}
        {accountInfo && (
          <div className="p-4 bg-background-1 rounded-lg border border-border-1 space-y-3">
            <h3 className="text-base font-semibold text-neutral-9">Thông tin tài khoản</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-neutral-6">Ngân hàng</p>
                <p className="text-sm font-medium text-neutral-9">{accountInfo.bankName}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-6">Số tài khoản</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-neutral-9 font-mono">
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
              <div>
                <p className="text-xs text-neutral-6">Chủ tài khoản</p>
                <p className="text-sm font-medium text-neutral-9">{accountInfo.accountHolder}</p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {instructions && (
          <div className="p-4 bg-primary-10 rounded-lg border border-primary-4">
            <h3 className="text-sm font-semibold text-primary-9 mb-2">Hướng dẫn thanh toán</h3>
            <p className="text-sm text-primary-8 whitespace-pre-line">
              {instructions}
            </p>
          </div>
        )}
      </div>
    </Section>
  );
};

export default QRCodeDisplay;

