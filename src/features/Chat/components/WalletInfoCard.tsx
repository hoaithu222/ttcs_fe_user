import React from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface WalletInfoCardProps {
    balance: number;
    currency?: string;
}

const WalletInfoCard: React.FC<WalletInfoCardProps> = ({
    balance,
    currency = "VND",
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/user/wallet");
    };

    return (
        <div
            onClick={handleClick}
            className="p-4 bg-gradient-to-br from-primary-6 to-primary-7 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group text-white"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium opacity-90">Ví của tôi</span>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>

            <div className="mb-3">
                <p className="text-xs opacity-75 mb-1">Số dư khả dụng</p>
                <p className="text-2xl font-bold">
                    {new Intl.NumberFormat("vi-VN").format(balance)}đ
                </p>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-white/20">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate("/user/wallet?action=deposit");
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-xs font-medium"
                >
                    <ArrowDownRight className="w-4 h-4" />
                    <span>Nạp tiền</span>
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate("/user/wallet?action=withdraw");
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-xs font-medium"
                >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Rút tiền</span>
                </button>
            </div>
        </div>
    );
};

export default WalletInfoCard;
