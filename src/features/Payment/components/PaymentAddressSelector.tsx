import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, Plus, Edit2, Check, RefreshCw } from "lucide-react";
import type { Address } from "@/core/api/addresses/type";
import { userAddressesApi } from "@/core/api/addresses";
import { NAVIGATION_CONFIG } from "@/app/router/naviagtion.config";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import Button from "@/foundation/components/buttons/Button";
import Loading from "@/foundation/components/loading/Loading";
import { addToast } from "@/app/store/slices/toast";
import { useAppDispatch } from "@/app/store";

interface PaymentAddressSelectorProps {
  selectedAddressId?: string;
  onSelectAddress: (address: Address) => void;
  onAddressChange?: (address: Address) => void;
}

const PaymentAddressSelector: React.FC<PaymentAddressSelectorProps> = ({
  selectedAddressId,
  onSelectAddress,
  onAddressChange,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const previousPathRef = useRef<string>("");
  const hasLoadedRef = useRef<boolean>(false);
  const onSelectAddressRef = useRef(onSelectAddress);
  const loadAddressesRef = useRef<(() => Promise<void>) | null>(null);

  // Keep ref updated
  useEffect(() => {
    onSelectAddressRef.current = onSelectAddress;
  }, [onSelectAddress]);

  // Load addresses function - removed onSelectAddress from dependencies to prevent infinite loop
  const loadAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await userAddressesApi.getAddresses();
      
      if (response.success && response.data) {
        const addressList = Array.isArray(response.data.addresses)
          ? response.data.addresses
          : Array.isArray(response.data)
          ? response.data
          : [];
        
        setAddresses(addressList);
        
        // Find default address
        const defaultAddr = addressList.find((addr: Address) => addr.isDefault) || 
                           response.data.defaultAddress ||
                           addressList[0] || null;
        
        // Set selected address - only call onSelectAddress if not initial load or if address changed
        let addressToSelect: Address | null = null;
        
        if (selectedAddressId) {
          const selected = addressList.find((addr: Address) => addr._id === selectedAddressId);
          addressToSelect = selected || defaultAddr;
        } else {
          addressToSelect = defaultAddr;
        }

        if (addressToSelect) {
          const prevAddressId = selectedAddress?._id;
          setSelectedAddress(addressToSelect);
          // Only notify parent if address actually changed or on first load
          if (!hasLoadedRef.current || prevAddressId !== addressToSelect._id) {
            onSelectAddressRef.current(addressToSelect);
          }
        }
        
        hasLoadedRef.current = true;
      }
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          message: error?.response?.data?.message || "Không thể tải danh sách địa chỉ",
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedAddressId, dispatch]); // Removed selectedAddress?._id to prevent infinite loop

  // Store loadAddresses in ref
  useEffect(() => {
    loadAddressesRef.current = loadAddresses;
  }, [loadAddresses]);

  // Load addresses on mount - only once
  useEffect(() => {
    if (!hasLoadedRef.current && loadAddressesRef.current) {
      loadAddressesRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Reload addresses when returning from profile page
  useEffect(() => {
    const currentPath = location.pathname;
    const wasOnProfilePage = previousPathRef.current.includes("/profile");
    const isOnCheckoutPage = currentPath.includes("/checkout");

    // If we were on profile page and now on checkout, reload addresses
    if (wasOnProfilePage && isOnCheckoutPage && hasLoadedRef.current && loadAddressesRef.current) {
      loadAddressesRef.current();
    }

    previousPathRef.current = currentPath;
  }, [location.pathname]); // Only depend on location.pathname

  // Update parent when selected address changes
  useEffect(() => {
    if (selectedAddress && onAddressChange) {
      onAddressChange(selectedAddress);
    }
  }, [selectedAddress, onAddressChange]);

  const handleSelectAddress = useCallback((address: Address) => {
    setSelectedAddress(address);
    onSelectAddress(address);
  }, [onSelectAddress]);

  const handleAddAddress = useCallback(() => {
    // Navigate to profile address tab
    navigate(`${NAVIGATION_CONFIG.profile.path}?tab=address`);
    dispatch(
      addToast({
        type: "info",
        message: "Vui lòng thêm địa chỉ mới, sau đó quay lại trang thanh toán",
      })
    );
  }, [navigate, dispatch]);

  const handleEditAddress = useCallback((_address: Address) => {
    // Navigate to profile address tab
    // Note: address parameter kept for future use (e.g., highlighting specific address)
    navigate(`${NAVIGATION_CONFIG.profile.path}?tab=address`);
    dispatch(
      addToast({
        type: "info",
        message: "Vui lòng chỉnh sửa địa chỉ, sau đó quay lại trang thanh toán",
      })
    );
  }, [navigate, dispatch]);

  const handleRefresh = useCallback(() => {
    loadAddresses();
    dispatch(
      addToast({
        type: "success",
        message: "Đã làm mới danh sách địa chỉ",
      })
    );
  }, [loadAddresses, dispatch]);

  const formatAddress = (address: Address): string => {
    return `${address.address}, ${address.ward}, ${address.district}, ${address.city}`;
  };

  if (isLoading) {
    return (
      <Section className="bg-background-2 rounded-2xl p-6 border border-border-1">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-5 h-5 text-primary-6" />
          <SectionTitle>Địa chỉ giao hàng</SectionTitle>
        </div>
        <Loading layout="centered" message="Đang tải địa chỉ..." />
      </Section>
    );
  }

  return (
    <Section className="bg-background-2 rounded-2xl p-6 border border-border-1">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary-6" />
          <SectionTitle>Địa chỉ giao hàng</SectionTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={handleRefresh}
            title="Làm mới danh sách địa chỉ"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddAddress}
          >
            Thêm địa chỉ
          </Button>
        </div>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-neutral-4" />
          <p className="text-sm text-neutral-6 mb-4">Bạn chưa có địa chỉ nào</p>
          <Button variant="solid" size="sm" onClick={handleAddAddress}>
            Thêm địa chỉ mới
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedAddress?._id === addr._id
                  ? "border-primary-6 bg-primary-1"
                  : "border-border-1 bg-background-1 hover:border-primary-3"
              }`}
              onClick={() => handleSelectAddress(addr)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-neutral-9">{addr.name}</h4>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary-6 text-white">
                        Mặc định
                      </span>
                    )}
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-neutral-2 text-neutral-6">
                      {addr.type === "home"
                        ? "Nhà riêng"
                        : addr.type === "office"
                        ? "Văn phòng"
                        : "Khác"}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-7 mb-1">{addr.phone}</p>
                  <p className="text-sm text-neutral-6">{formatAddress(addr)}</p>
                  {addr.notes && (
                    <p className="text-xs text-neutral-5 mt-1 italic">
                      Ghi chú: {addr.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedAddress?._id === addr._id && (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-6">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Edit2 className="w-4 h-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAddress(addr);
                    }}
                  >
                    Sửa
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAddress && (
        <div className="mt-4 p-3 rounded-lg bg-primary-1 border border-primary-3">
          <p className="text-xs font-medium text-primary-7 mb-1">Địa chỉ đã chọn:</p>
          <p className="text-sm text-primary-9">
            {selectedAddress.name} - {selectedAddress.phone}
          </p>
          <p className="text-xs text-primary-6 mt-1">{formatAddress(selectedAddress)}</p>
        </div>
      )}
    </Section>
  );
};

export default PaymentAddressSelector;

