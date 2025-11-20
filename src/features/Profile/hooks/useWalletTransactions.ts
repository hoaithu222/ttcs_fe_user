import { useState, useCallback, useEffect } from "react";
import { userWalletApi } from "@/core/api/wallet";
import { useAppDispatch } from "@/app/store";
import { addToast } from "@/app/store/slices/toast";
import type {
  WalletTransaction,
  WalletTransactionType,
  WalletTransactionStatus,
  WalletTransactionsResponse,
} from "@/core/api/wallet/type";

interface UseWalletTransactionsOptions {
  page?: number;
  limit?: number;
  type?: WalletTransactionType;
  status?: WalletTransactionStatus;
  autoLoad?: boolean;
}

export function useWalletTransactions(options: UseWalletTransactionsOptions = {}) {
  const dispatch = useAppDispatch();
  const {
    page: initialPage = 1,
    limit: initialLimit = 10,
    type: initialType,
    status: initialStatus,
    autoLoad = true,
  } = options;

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    type: initialType,
    status: initialStatus,
  });

  const loadTransactions = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      type?: WalletTransactionType;
      status?: WalletTransactionStatus;
    }) => {
      try {
        setIsLoading(true);
        const query = {
          page: params?.page ?? pagination.page,
          limit: params?.limit ?? pagination.limit,
          type: params?.type ?? filters.type,
          status: params?.status ?? filters.status,
        };

        const response = await userWalletApi.getTransactions(query);
        console.log("[useWalletTransactions] API Response:", response);
        
        if (response.success && response.data) {
          const data = response.data as WalletTransactionsResponse;
          
          // Handle both old format (data is array) and new format (data has transactions and pagination)
          if (Array.isArray(data)) {
            // Old format: data is transactions array, pagination in meta
            console.log("[useWalletTransactions] Using old format (array)");
            setTransactions(data || []);
            setPagination({
              page: (response.meta?.page as number) || query.page,
              limit: (response.meta?.limit as number) || query.limit,
              total: (response.meta?.total as number) || 0,
              totalPages: (response.meta?.totalPages as number) || 0,
            });
          } else {
            // New format: data has transactions and pagination
            console.log("[useWalletTransactions] Using new format (object)", {
              transactionsCount: data.transactions?.length || 0,
              pagination: data.pagination,
            });
            setTransactions(data.transactions || []);
            setPagination(data.pagination || {
              page: query.page,
              limit: query.limit,
              total: 0,
              totalPages: 0,
            });
          }
          
          // Update filters if provided
          if (params?.type !== undefined) {
            setFilters((prev) => ({ ...prev, type: params.type }));
          }
          if (params?.status !== undefined) {
            setFilters((prev) => ({ ...prev, status: params.status }));
          }
        }
      } catch (error: any) {
        dispatch(
          addToast({
            type: "error",
            message: error?.response?.data?.message || "Không thể tải lịch sử giao dịch",
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, pagination.page, pagination.limit, filters.type, filters.status]
  );

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      loadTransactions({ page: pagination.page + 1 });
    }
  }, [pagination.page, pagination.totalPages, loadTransactions]);

  const refresh = useCallback(() => {
    loadTransactions({ page: 1 });
  }, [loadTransactions]);

  useEffect(() => {
    if (autoLoad) {
      loadTransactions();
    }
  }, []); // Only run once on mount if autoLoad is true

  return {
    transactions,
    isLoading,
    pagination,
    filters,
    loadTransactions,
    loadMore,
    refresh,
    hasMore: pagination.page < pagination.totalPages,
  };
}

