import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, Plus, Edit2, Check, RefreshCw, ChevronDown } from "lucide-react";
import * as Form from "@radix-ui/react-form";
import type { Address, CreateAddressRequest } from "@/core/api/addresses/type";
import { NAVIGATION_CONFIG } from "@/app/router/naviagtion.config";
import Section from "@/foundation/components/sections/Section";
import SectionTitle from "@/foundation/components/sections/SectionTitle";
import Button from "@/foundation/components/buttons/Button";
import Loading from "@/foundation/components/loading/Loading";
import Modal from "@/foundation/components/modal/Modal";
import Input from "@/foundation/components/input/Input";
import Checkbox from "@/foundation/components/input/Checkbox";
import ScrollView from "@/foundation/components/scroll/ScrollView";
import IconCircleWrapper from "@/foundation/components/icons/IconCircleWrapper";
import AlertMessage from "@/foundation/components/info/AlertMessage";
import AddressSelector from "@/shared/components/AddressSelector";
import { addToast } from "@/app/store/slices/toast";
import { useAppDispatch } from "@/app/store";
import { useProfileAddresses } from "@/features/Profile/hooks/useAddress";
import { ReduxStateType } from "@/app/store/types";
import addressData, {
  AddressProvince,
} from "@/shared/common/data-address/addressData";

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
  
  // Use Redux store for addresses
  const { addresses, status, defaultAddress, loadAddresses } = useProfileAddresses();
  const isLoading = status === ReduxStateType.LOADING || status === ReduxStateType.INIT;
  
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const previousPathRef = useRef<string>("");
  const hasLoadedRef = useRef<boolean>(false);
  const onSelectAddressRef = useRef(onSelectAddress);
  const previousAddressCountRef = useRef<number>(0);
  
  // Add address form state
  const { createAddress } = useProfileAddresses();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cityCode, setCityCode] = useState<number | "">("");
  const [districtCode, setDistrictCode] = useState<number | "">("");
  const [wardCode, setWardCode] = useState<number | "">("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  
  const provinces = addressData as AddressProvince[];
  
  const districts = useMemo(() => {
    const province = provinces.find((p) => p.code === cityCode);
    return province?.districts || [];
  }, [cityCode, provinces]);
  
  const wards = useMemo(() => {
    const district = districts.find((d) => d.code === districtCode);
    return district?.wards || [];
  }, [districts, districtCode]);

  // Keep ref updated
  useEffect(() => {
    onSelectAddressRef.current = onSelectAddress;
  }, [onSelectAddress]);

  // Select address based on addresses from Redux store
  useEffect(() => {
    if (addresses.length > 0 && !hasLoadedRef.current) {
      // Find address to select
      let addressToSelect: Address | null = null;
      
      if (selectedAddressId) {
        const selected = addresses.find((addr: Address) => addr._id === selectedAddressId);
        addressToSelect = selected || defaultAddress || addresses[0] || null;
      } else {
        addressToSelect = defaultAddress || addresses[0] || null;
      }

      if (addressToSelect) {
        setSelectedAddress(addressToSelect);
        onSelectAddressRef.current(addressToSelect);
        hasLoadedRef.current = true;
        previousAddressCountRef.current = addresses.length;
      }
    }
  }, [addresses, selectedAddressId, defaultAddress]);

  // Update selected address when addresses change (e.g., after create/update/delete)
  useEffect(() => {
    if (addresses.length > 0 && hasLoadedRef.current) {
      const currentSelectedId = selectedAddress?._id;
      
      // If current selected address no longer exists, select default or first
      if (currentSelectedId && !addresses.find((addr: Address) => addr._id === currentSelectedId)) {
        const newSelected = defaultAddress || addresses[0] || null;
        if (newSelected) {
          setSelectedAddress(newSelected);
          onSelectAddressRef.current(newSelected);
        }
      }
      // If selectedAddressId prop changed, update selection
      else if (selectedAddressId && selectedAddressId !== currentSelectedId) {
        const selected = addresses.find((addr: Address) => addr._id === selectedAddressId);
        if (selected) {
          setSelectedAddress(selected);
          onSelectAddressRef.current(selected);
        }
      }
    }
  }, [addresses, selectedAddressId, defaultAddress]);

  // Load addresses on mount - only once
  useEffect(() => {
    if (!hasLoadedRef.current && status === ReduxStateType.INIT) {
      loadAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Reload addresses when returning from profile page
  useEffect(() => {
    const currentPath = location.pathname;
    const wasOnProfilePage = previousPathRef.current.includes("/profile");
    const isOnCheckoutPage = currentPath.includes("/checkout");

    // If we were on profile page and now on checkout, reload addresses
    if (wasOnProfilePage && isOnCheckoutPage && hasLoadedRef.current) {
      loadAddresses();
    }

    previousPathRef.current = currentPath;
  }, [location.pathname, loadAddresses]);

  // Reset form when add modal opens/closes
  useEffect(() => {
    if (isAddModalOpen) {
      // Reset form when opening
      setName("");
      setPhone("");
      setCityCode("");
      setDistrictCode("");
      setWardCode("");
      setAddressLine1("");
      setAddressLine2("");
      setIsDefault(false);
    }
  }, [isAddModalOpen]);
  
  useEffect(() => {
    setDistrictCode("");
    setWardCode("");
  }, [cityCode]);

  useEffect(() => {
    setWardCode("");
  }, [districtCode]);

  // Update parent when selected address changes
  useEffect(() => {
    if (selectedAddress && onAddressChange) {
      onAddressChange(selectedAddress);
    }
  }, [selectedAddress, onAddressChange]);
  
  // Auto-select newly created address
  useEffect(() => {
    if (addresses.length > 0 && hasLoadedRef.current) {
      const currentCount = addresses.length;
      const previousCount = previousAddressCountRef.current;
      
      // If address count increased, a new address was created
      if (currentCount > previousCount) {
        // Select the newly created address (usually the last one or default)
        const newAddress = defaultAddress || addresses[addresses.length - 1];
        if (newAddress) {
          setSelectedAddress(newAddress);
          onSelectAddressRef.current(newAddress);
        }
      }
      // Also check if default address changed
      else if (defaultAddress && defaultAddress._id !== selectedAddress?._id) {
        // If a new default was set, select it
        setSelectedAddress(defaultAddress);
        onSelectAddressRef.current(defaultAddress);
      }
      
      previousAddressCountRef.current = currentCount;
    }
  }, [addresses, defaultAddress, selectedAddress]);

  const handleSelectAddress = useCallback((address: Address) => {
    setSelectedAddress(address);
    onSelectAddress(address);
    setIsModalOpen(false); // Close modal after selection
  }, [onSelectAddress]);

  const handleAddAddress = useCallback(() => {
    // Open add address modal instead of navigating
    setIsAddModalOpen(true);
  }, []);

  const handleCloseAddAddressModal = useCallback(() => {
    if (isSubmitting) return;
    setIsAddModalOpen(false);
  }, [isSubmitting]);
  
  const handleSubmitAddAddress = useCallback(async () => {
    if (!name || !phone || !cityCode || !districtCode || !wardCode) {
      dispatch(
        addToast({
          type: "error",
          message: "Vui lòng điền đầy đủ thông tin",
        })
      );
      return;
    }
    
    setIsSubmitting(true);
    try {
      const city = provinces.find((p) => p.code === cityCode)?.name || "";
      const district = districts.find((d) => d.code === districtCode)?.name || "";
      const ward = wards.find((w) => w.code === wardCode)?.name || "";
      const address: CreateAddressRequest = {
        name,
        phone,
        address: [addressLine2, addressLine1].filter(Boolean).join(" ").trim(),
        city,
        district,
        ward,
        isDefault,
      };

      createAddress(address);
      loadAddresses();
      dispatch(
        addToast({
          type: "success",
          message: "Đã thêm địa chỉ mới thành công",
        })
      );
      setIsAddModalOpen(false);
    } catch (error: any) {
      dispatch(
        addToast({
          type: "error",
          message: error.message || "Không thể thêm địa chỉ",
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    name,
    phone,
    cityCode,
    districtCode,
    wardCode,
    addressLine1,
    addressLine2,
    isDefault,
    provinces,
    districts,
    wards,
    createAddress,
    dispatch,
    loadAddresses,
  ]);

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

  // Get display address (selected or default or first)
  const displayAddress = selectedAddress || defaultAddress || (addresses.length > 0 ? addresses[0] : null);

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
    <Section className="bg-background-2 max-h-[200px] rounded-2xl p-6 border border-border-1">
      <div className="flex items-center gap-3 mb-4">
        <MapPin className="w-5 h-5 text-primary-6" />
        <SectionTitle>Địa chỉ giao hàng</SectionTitle>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-2">
         
          <p className="text-sm text-neutral-6 mb-4">Bạn chưa có địa chỉ nào</p>
          <Button variant="solid" size="sm" onClick={handleAddAddress}>
            Thêm địa chỉ mới
          </Button>
        </div>
      ) : displayAddress ? (
        <div
          className="relative p-4 rounded-lg border-2 border-border-1 bg-background-1 hover:border-primary-3 cursor-pointer transition-all"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-neutral-9">{displayAddress.name}</h4>
                {displayAddress.isDefault && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary-6 text-white">
                    Mặc định
                  </span>
                )}
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-neutral-2 text-neutral-6">
                  {displayAddress.type === "home"
                    ? "Nhà riêng"
                    : displayAddress.type === "office"
                    ? "Văn phòng"
                    : "Khác"}
                </span>
              </div>
              <p className="text-sm text-neutral-7 mb-1">{displayAddress.phone}</p>
              <p className="text-sm text-neutral-6">{formatAddress(displayAddress)}</p>
              {displayAddress.notes && (
                <p className="text-xs text-neutral-5 mt-1 italic">
                  Ghi chú: {displayAddress.notes}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ChevronDown className="w-5 h-5 text-neutral-5" />
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal for adding new address */}
      <Modal
        open={isAddModalOpen}
        size="3xl"
        onOpenChange={(open) => {
          if (!open) {
            handleCloseAddAddressModal();
          } else {
            setIsAddModalOpen(true);
          }
        }}
        onCancel={handleCloseAddAddressModal}
        onConfirm={handleSubmitAddAddress}
        closeText="Hủy"
        confirmText={isSubmitting ? "Đang lưu..." : "Thêm địa chỉ"}
        disabled={isSubmitting}
        title={
          <div className="flex gap-3 items-center">
            <IconCircleWrapper size="md" color="info">
              <MapPin className="text-info" />
            </IconCircleWrapper>
            <div>
              <h2 className="text-xl font-bold text-neutral-9">Thêm địa chỉ mới</h2>
              <p className="text-sm text-neutral-6 mt-0.5">Quản lý nơi nhận hàng của bạn</p>
            </div>
          </div>
        }
        headerPadding="pb-6"
        className="flex flex-col gap-6"
      >
        <Form.Root
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmitAddAddress();
          }}
        >
          <ScrollView className="h-[520px]" hideScrollbarY={false}>
            <div className="space-y-6 pr-1">
              <AlertMessage
                type="info"
                title="Hướng dẫn"
                message="Thông tin nhận hàng cần chính xác để hỗ trợ xác minh và giao nhận nhanh chóng."
              />
              <div className="grid grid-cols-1 gap-3">
                <Input
                  name="address-fullname"
                  label="Họ và tên"
                  placeholder="Nhập họ và tên"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  name="address-phone"
                  label="Số điện thoại"
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="numeric"
                  required
                />
                <AddressSelector
                  value={{ provinceCode: cityCode, districtCode, wardCode }}
                  onChange={(val) => {
                    setCityCode((val.provinceCode ?? "") as number | "");
                    setDistrictCode((val.districtCode ?? "") as number | "");
                    setWardCode((val.wardCode ?? "") as number | "");
                  }}
                  labels={{
                    province: "Tỉnh/Thành phố",
                    district: "Quận/Huyện",
                    ward: "Phường/Xã",
                  }}
                />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Input
                    name="address-line-1"
                    label="Địa chỉ cụ thể"
                    placeholder="Xóm, đường..."
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                  />
                  <Input
                    name="address-line-2"
                    label="Số nhà"
                    placeholder="Số nhà"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                  />
                </div>
                <Checkbox
                  label="Đặt làm địa chỉ mặc định"
                  checked={isDefault}
                  onCheckedChange={(checked) => setIsDefault(Boolean(checked))}
                  wrapperClassName="justify-start"
                  testId="is-default-address"
                />
              </div>
              <Form.Submit asChild>
                <button type="submit" className="hidden" aria-hidden />
              </Form.Submit>
            </div>
          </ScrollView>
        </Form.Root>
      </Modal>

      {/* Modal for address selection */}
      <Modal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Chọn địa chỉ giao hàng"
        size="2xl"
        hideFooter
      >
        <div className="space-y-4">
          {/* Header actions */}
          <div className="flex items-center justify-between pb-4 border-b border-border-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={handleRefresh}
                title="Làm mới danh sách địa chỉ"
              />
            </div>
            <Button
              variant="solid"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleAddAddress}
            >
              Thêm địa chỉ
            </Button>
          </div>

          {/* Address list */}
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-neutral-4" />
              <p className="text-sm text-neutral-6 mb-4">Bạn chưa có địa chỉ nào</p>
              <Button variant="solid" size="sm" onClick={handleAddAddress}>
                Thêm địa chỉ mới
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {addresses.map((addr: Address) => (
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
        </div>
      </Modal>
    </Section>
  );
};

export default PaymentAddressSelector;

