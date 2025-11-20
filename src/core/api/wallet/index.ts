import { WALLET_API_PATHS } from "./path";
import type {
  WalletBalanceResponse,
  CreateDepositRequest,
  CreateDepositResponse,
  WalletTransactionsQuery,
  WalletTransactionsResponse,
  UpdateBankInfoRequest,
  TransferBetweenWalletsRequest,
  Wallet,
  ApiSuccess,
} from "./type";
import { VpsHttpClient } from "@/core/base/http-client";
import { API_BASE_URL } from "@/app/config/env.config";

// Wallet API service for users
class UserWalletApiService extends VpsHttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  // Get wallet balance
  async getBalance(): Promise<ApiSuccess<WalletBalanceResponse>> {
    const response = await this.get(WALLET_API_PATHS.BALANCE);
    return response.data;
  }

  // Create deposit request
  // walletType: "user" | "shop" - which wallet to deposit to
  // depositMethod: "bank" | "vnpay" - payment method
  async createDeposit(
    data: CreateDepositRequest,
    walletType: "user" | "shop" = "user"
  ): Promise<ApiSuccess<CreateDepositResponse>> {
    const response = await this.post(
      `${WALLET_API_PATHS.DEPOSIT}?walletType=${walletType}`,
      data
    );
    return response.data;
  }

  // Get wallet transactions
  async getTransactions(
    query?: WalletTransactionsQuery
  ): Promise<ApiSuccess<WalletTransactionsResponse>> {
    const response = await this.get(WALLET_API_PATHS.TRANSACTIONS, {
      params: query,
    });
    return response.data;
  }

  // Update bank information
  async updateBankInfo(
    data: UpdateBankInfoRequest
  ): Promise<ApiSuccess<{ wallet: Wallet }>> {
    const response = await this.put(WALLET_API_PATHS.UPDATE_BANK_INFO, data);
    return response.data;
  }

  // Transfer between user and shop wallets
  async transferBetweenWallets(
    data: TransferBetweenWalletsRequest
  ): Promise<ApiSuccess<{ userWallet: Wallet; shopWallet: Wallet; message: string }>> {
    const response = await this.post(WALLET_API_PATHS.TRANSFER, data);
    return response.data;
  }
}

// Export singleton instance
export const userWalletApi = new UserWalletApiService();

// Export default
export default userWalletApi;

