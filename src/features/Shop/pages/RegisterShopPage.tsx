import Section from "@/foundation/components/sections/Section";
import Button from "@/foundation/components/buttons/Button";
import * as Form from "@radix-ui/react-form";
import Tabs from "@/foundation/components/navigation/tabs/Tab";
import { useAppSelector, useAppDispatch } from "@/app/store";
import { selectProfile } from "@/features/Profile/slice/profile.selector";
import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AlertMessage from "@/foundation/components/info/AlertMessage";
import Step1AccountContact, { Step1Data } from "../components/register/Step1AccountContact";
import Step2ShopDetails, { Step2Data } from "../components/register/Step2ShopDetails";
import Step3LegalFinance, { Step3Data } from "../components/register/Step3LegalFinance";
import Step4Documents, { Step4Data } from "../components/register/Step4Documents";
import Step5InitialSetup, { Step5Data } from "../components/register/Step5InitialSetup";
import {
  createShopStart,
  fetchOwnShopStart,
  fetchShopStatusByUserStart,
  setRegistrationData,
  resetCreateShopState,
} from "../slice/shop.slice";
import { imagesApi } from "@/core/api/images";
import {
  selectShopUiScreens,
  selectShopFetchStatus,
  selectShopData,
  selectCreateShopStatus,
  selectCreateShopError,
  selectShopStatusByUser,
  selectShopStatusByUserStatus,
} from "../slice/shop.selector";
import { ReduxStateType } from "@/app/store/types";

const STEPS = ["info", "details", "legal", "documents", "setup"] as const;
type Step = (typeof STEPS)[number];

interface FormData {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
}

const RegisterShopPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const profile = useAppSelector(selectProfile);
  const ui = useAppSelector(selectShopUiScreens);
  const shopFetchStatus = useAppSelector(selectShopFetchStatus);
  const shopData = useAppSelector(selectShopData);
  const createShopStatus = useAppSelector(selectCreateShopStatus);
  const createShopError = useAppSelector(selectCreateShopError);
  const shopStatusByUser = useAppSelector(selectShopStatusByUser);
  const shopStatusByUserStatus = useAppSelector(selectShopStatusByUserStatus);

  // Fetch shop status on mount - sử dụng getShopStatusByUserId để check chính xác
  useEffect(() => {
    // Guard: Don't fetch if currently creating shop
    if (isSubmittingRef.current) {
      console.log("Fetch shop status: Currently creating shop, skip fetch");
      return;
    }

    if (profile?._id) {
      // Fetch shop status để check và redirect đúng
      // Don't reset state here to avoid resetting createShop status
      dispatch(fetchShopStatusByUserStart({ userId: profile._id }));
      // Also fetch shop list as fallback
      dispatch(fetchOwnShopStart({ userId: profile._id, page: 1, limit: 1 }));
    }
  }, [dispatch, profile?._id]);

  // Redirect if shop already exists based on shopStatusByUser
  useEffect(() => {
    // Wait for shop status to be loaded
    if (shopStatusByUserStatus === ReduxStateType.LOADING) return;
    if (shopFetchStatus === ReduxStateType.LOADING) return;

    // Check shopStatusByUser first (most accurate)
    if (shopStatusByUser) {
      const { shopStatus } = shopStatusByUser;
      if (shopStatus === "pending_review" || shopStatus === "approved") {
        navigate("/shop/review", { replace: true });
        return;
      }
      if (shopStatus === "active") {
        navigate("/shop/dashboard", { replace: true });
        return;
      }
      if (shopStatus === "blocked" || shopStatus === "suspended") {
        // Show suspended/blocked message, don't allow registration
        navigate("/shop/review", { replace: true });
        return;
      }
      if (shopStatus === "rejected") {
        // Allow user to edit and resubmit
        return;
      }
      // If not_registered, allow registration
    }

    // Fallback: Check UI screens (computed from currentStatus)
    if (ui.showPendingReview) {
      navigate("/shop/review", { replace: true });
      return;
    }

    if (ui.showActiveDashboard) {
      navigate("/shop/dashboard", { replace: true });
      return;
    }

    if (ui.showRejected) {
      // Allow user to edit and resubmit
      return;
    }
  }, [ui, shopFetchStatus, shopStatusByUser, shopStatusByUserStatus, navigate]);

  // Pre-fill form if shop exists and was rejected
  useEffect(() => {
    if (shopData && (shopData as any)?._id && ui.showRejected) {
      // Pre-fill form with existing shop data for editing
      setFormData((prev) => ({
        ...prev,
        step1: {
          contactEmail: (shopData as any)?.contactEmail || prev.step1.contactEmail,
          contactPhone: (shopData as any)?.contactPhone || prev.step1.contactPhone,
          contactName: (shopData as any)?.contactName || prev.step1.contactName,
        },
        step2: {
          shopName: (shopData as any)?.name || prev.step2.shopName,
          shopSlug: (shopData as any)?.slug || prev.step2.shopSlug,
          shopDescription: (shopData as any)?.description || prev.step2.shopDescription,
          logo: (shopData as any)?.logo
            ? { url: (shopData as any).logo, publicId: (shopData as any).logo }
            : prev.step2.logo,
          banner: (shopData as any)?.banner
            ? { url: (shopData as any).banner, publicId: (shopData as any).banner }
            : prev.step2.banner,
          address: (shopData as any)?.address || prev.step2.address,
        },
        step3: {
          businessType: (shopData as any)?.businessType || prev.step3.businessType,
          taxId: (shopData as any)?.taxId || prev.step3.taxId,
          repId: (shopData as any)?.repId || prev.step3.repId,
          bankName: (shopData as any)?.bankName || prev.step3.bankName,
          bankAccount: (shopData as any)?.bankAccount || prev.step3.bankAccount,
          bankHolder: (shopData as any)?.bankHolder || prev.step3.bankHolder,
        },
        step4: {
          idCardImages: Array.isArray((shopData as any)?.idCardImages)
            ? (shopData as any).idCardImages.map((img: string) => ({ url: img, publicId: img }))
            : prev.step4.idCardImages,
          businessLicenseImages: Array.isArray((shopData as any)?.businessLicenseImages)
            ? (shopData as any).businessLicenseImages.map((img: string) => ({
                url: img,
                publicId: img,
              }))
            : prev.step4.businessLicenseImages,
        },
        step5: {
          shippingPolicy: (shopData as any)?.shippingPolicy || prev.step5.shippingPolicy,
          returnPolicy: (shopData as any)?.returnPolicy || prev.step5.returnPolicy,
          openHour: (shopData as any)?.openHour || prev.step5.openHour,
          closeHour: (shopData as any)?.closeHour || prev.step5.closeHour,
          workingDays: (shopData as any)?.workingDays || prev.step5.workingDays,
          facebook: (shopData as any)?.facebook || prev.step5.facebook,
          zalo: (shopData as any)?.zalo || prev.step5.zalo,
          instagram: (shopData as any)?.instagram || prev.step5.instagram,
        },
      }));
    }
  }, [shopData, ui.showRejected]);

  const [errors, setErrors] = useState<Partial<Record<string, Record<string, string>>>>({});
  const isSubmitting = createShopStatus === ReduxStateType.LOADING;
  const submitError = createShopError;
  // Use ref to track submitting state to prevent duplicate submissions
  const isSubmittingRef = useRef(false);
  // Use ref to store current status to avoid stale closure in callbacks
  const createShopStatusRef = useRef(createShopStatus);

  // Sync refs with actual state
  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
    createShopStatusRef.current = createShopStatus;
  }, [isSubmitting, createShopStatus]);

  // Handle createShop success/error
  useEffect(() => {
    if (createShopStatus === ReduxStateType.SUCCESS) {
      // Reset submitting flag
      isSubmittingRef.current = false;
      // Reset createShop state trước khi navigate
      dispatch(resetCreateShopState());
      // Navigate to review page
      navigate("/shop/review", { replace: true });
    } else if (createShopStatus === ReduxStateType.ERROR) {
      // Reset submitting flag on error
      isSubmittingRef.current = false;
    }
  }, [createShopStatus, navigate, dispatch]);

  const [currentStep, setCurrentStep] = useState<Step>("info");
  const [formData, setFormData] = useState<FormData>({
    step1: {
      contactEmail: profile?.email || "",
      contactPhone: profile?.phone || "",
      contactName: profile?.name || "",
    },
    step2: {
      shopName: "",
      shopSlug: "",
      shopDescription: "",
      logo: null,
      banner: null,
      address: {
        provinceCode: "",
        districtCode: "",
        wardCode: "",
      },
    },
    step3: {
      businessType: "",
      taxId: "",
      repId: "",
      bankName: "",
      bankAccount: "",
      bankHolder: "",
    },
    step4: {
      idCardImages: [],
      businessLicenseImages: [],
    },
    step5: {
      shippingPolicy: "",
      returnPolicy: "",
      openHour: "",
      closeHour: "",
      workingDays: "",
      facebook: "",
      zalo: "",
      instagram: "",
    },
  });

  // Validation functions
  const validateStep1 = useCallback((): boolean => {
    const stepErrors: Partial<Record<keyof Step1Data, string>> = {};
    if (!formData.step1.contactEmail?.trim()) {
      stepErrors.contactEmail = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.step1.contactEmail)) {
      stepErrors.contactEmail = "Email không hợp lệ";
    }
    if (!formData.step1.contactPhone?.trim()) {
      stepErrors.contactPhone = "Số điện thoại là bắt buộc";
    }
    if (!formData.step1.contactName?.trim()) {
      stepErrors.contactName = "Tên người liên hệ là bắt buộc";
    }
    setErrors((prev) => ({ ...prev, step1: stepErrors }));
    return Object.keys(stepErrors).length === 0;
  }, [formData.step1]);

  const validateStep2 = useCallback((): boolean => {
    const stepErrors: Partial<Record<keyof Step2Data, string>> = {};
    if (!formData.step2.shopName?.trim()) {
      stepErrors.shopName = "Tên gian hàng là bắt buộc";
    }
    if (!formData.step2.shopSlug?.trim()) {
      stepErrors.shopSlug = "Đường dẫn shop là bắt buộc";
    }
    if (!formData.step2.shopDescription?.trim()) {
      stepErrors.shopDescription = "Mô tả shop là bắt buộc";
    }
    if (!formData.step2.logo) {
      stepErrors.logo = "Logo là bắt buộc";
    }
    if (!formData.step2.banner) {
      stepErrors.banner = "Banner là bắt buộc";
    }
    if (
      !formData.step2.address.provinceCode ||
      !formData.step2.address.districtCode ||
      !formData.step2.address.wardCode
    ) {
      stepErrors.address = "Vui lòng chọn đầy đủ địa chỉ";
    }
    setErrors((prev) => ({ ...prev, step2: stepErrors }));
    return Object.keys(stepErrors).length === 0;
  }, [formData.step2]);

  const validateStep3 = useCallback((): boolean => {
    const stepErrors: Partial<Record<keyof Step3Data, string>> = {};
    if (!formData.step3.businessType) {
      stepErrors.businessType = "Hình thức kinh doanh là bắt buộc";
    }
    if (formData.step3.businessType !== "individual" && !formData.step3.taxId?.trim()) {
      stepErrors.taxId = "Mã số thuế là bắt buộc cho DN/HKD";
    }
    if (!formData.step3.repId?.trim()) {
      stepErrors.repId = "Số CCCD/MST người đại diện là bắt buộc";
    }
    if (!formData.step3.bankName?.trim()) {
      stepErrors.bankName = "Tên ngân hàng là bắt buộc";
    }
    if (!formData.step3.bankAccount?.trim()) {
      stepErrors.bankAccount = "Số tài khoản là bắt buộc";
    }
    if (!formData.step3.bankHolder?.trim()) {
      stepErrors.bankHolder = "Tên chủ tài khoản là bắt buộc";
    }
    setErrors((prev) => ({ ...prev, step3: stepErrors }));
    return Object.keys(stepErrors).length === 0;
  }, [formData.step3]);

  const validateStep4 = useCallback((): boolean => {
    const stepErrors: Partial<Record<keyof Step4Data, string>> = {};
    if (!formData.step4.idCardImages || formData.step4.idCardImages.length === 0) {
      stepErrors.idCardImages = "Ảnh CCCD/CMND là bắt buộc";
    }
    if (
      formData.step3.businessType !== "individual" &&
      (!formData.step4.businessLicenseImages || formData.step4.businessLicenseImages.length === 0)
    ) {
      stepErrors.businessLicenseImages = "Giấy phép kinh doanh là bắt buộc cho DN/HKD";
    }
    setErrors((prev) => ({ ...prev, step4: stepErrors }));
    return Object.keys(stepErrors).length === 0;
  }, [formData.step4, formData.step3.businessType]);

  const validateStep5 = useCallback((): boolean => {
    const stepErrors: Partial<Record<keyof Step5Data, string>> = {};
    if (!formData.step5.shippingPolicy?.trim()) {
      stepErrors.shippingPolicy = "Chính sách vận chuyển là bắt buộc";
    }
    if (!formData.step5.returnPolicy?.trim()) {
      stepErrors.returnPolicy = "Chính sách đổi trả là bắt buộc";
    }
    setErrors((prev) => ({ ...prev, step5: stepErrors }));
    return Object.keys(stepErrors).length === 0;
  }, [formData.step5]);

  const validateCurrentStep = useCallback((): boolean => {
    switch (currentStep) {
      case "info":
        return validateStep1();
      case "details":
        return validateStep2();
      case "legal":
        return validateStep3();
      case "documents":
        return validateStep4();
      case "setup":
        return validateStep5();
      default:
        return true;
    }
  }, [currentStep, validateStep1, validateStep2, validateStep3, validateStep4, validateStep5]);

  const handleNext = useCallback(() => {
    if (!validateCurrentStep()) {
      return;
    }
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  }, [currentStep, validateCurrentStep]);

  const handlePrevious = useCallback(() => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    // Guard: Prevent multiple submissions using ref (avoids stale closure)
    if (isSubmittingRef.current) {
      console.log("Already submitting (ref check), return");
      return;
    }

    // Get current status from ref (synced via useEffect)
    const currentStatus = createShopStatusRef.current;
    if (currentStatus === ReduxStateType.LOADING) {
      console.log("Already submitting (status ref check), return");
      return;
    }

    // Set submitting flag immediately
    isSubmittingRef.current = true;

    console.log("handleSubmit called", { currentStatus });

    // Reset createShop state trước khi submit để đảm bảo status sạch
    // Điều này đảm bảo saga không bị block bởi guard check LOADING
    if (currentStatus === ReduxStateType.ERROR) {
      dispatch(resetCreateShopState());
    }

    // Validate tất cả các bước
    const step1Valid = validateStep1();
    const step2Valid = validateStep2();
    const step3Valid = validateStep3();
    const step4Valid = validateStep4();
    const step5Valid = validateStep5();

    console.log("Validation results:", {
      step1Valid,
      step2Valid,
      step3Valid,
      step4Valid,
      step5Valid,
    });

    if (!step1Valid || !step2Valid || !step3Valid || !step4Valid || !step5Valid) {
      // Reset submitting flag on validation failure
      isSubmittingRef.current = false;
      // Navigate đến bước đầu tiên có lỗi
      if (!step1Valid) {
        console.log("Step1 invalid, navigating to info");
        setCurrentStep("info");
      } else if (!step2Valid) {
        console.log("Step2 invalid, navigating to details");
        setCurrentStep("details");
      } else if (!step3Valid) {
        console.log("Step3 invalid, navigating to legal");
        setCurrentStep("legal");
      } else if (!step4Valid) {
        console.log("Step4 invalid, navigating to documents");
        setCurrentStep("documents");
      } else if (!step5Valid) {
        console.log("Step5 invalid, navigating to setup");
        setCurrentStep("setup");
      }
      return;
    }

    // Chuẩn bị payload để gửi lên backend
    const payload = {
      name: formData.step2.shopName.trim(),
      slug: formData.step2.shopSlug.trim(),
      description: formData.step2.shopDescription.trim(),
      // Ưu tiên url để hiển thị được, nếu không có thì dùng publicId
      logo: formData.step2.logo?.url || formData.step2.logo?.publicId || "",
      banner: formData.step2.banner?.url || formData.step2.banner?.publicId || "",
      contactEmail: formData.step1.contactEmail.trim(),
      contactPhone: formData.step1.contactPhone.trim(),
      contactName: formData.step1.contactName.trim(),
      address: {
        provinceCode: Number(formData.step2.address.provinceCode) || 0,
        districtCode: Number(formData.step2.address.districtCode) || 0,
        wardCode: Number(formData.step2.address.wardCode) || 0,
      },
      businessType: formData.step3.businessType,
      taxId: formData.step3.taxId?.trim() || "",
      repId: formData.step3.repId.trim(),
      bankName: formData.step3.bankName.trim(),
      bankAccount: formData.step3.bankAccount.trim(),
      bankHolder: formData.step3.bankHolder.trim(),
      // Ưu tiên url để hiển thị được
      idCardImages: formData.step4.idCardImages
        .map((img) => img.url || img.publicId || "")
        .filter(Boolean),
      businessLicenseImages: formData.step4.businessLicenseImages
        .map((img) => img.url || img.publicId || "")
        .filter(Boolean),
      shippingPolicy: formData.step5.shippingPolicy.trim(),
      returnPolicy: formData.step5.returnPolicy.trim(),
      openHour: formData.step5.openHour.trim(),
      closeHour: formData.step5.closeHour.trim(),
      workingDays: formData.step5.workingDays.trim(),
      facebook: formData.step5.facebook.trim() || "",
      zalo: formData.step5.zalo.trim() || "",
      instagram: formData.step5.instagram.trim() || "",
    };

    // Lưu registration data vào Redux state để hiển thị ở review page
    dispatch(
      setRegistrationData({
        name: payload.name,
        description: payload.description,
        logo: payload.logo,
        banner: payload.banner,
        legalInfo: payload.taxId || payload.repId || "",
        bankAccount: payload.bankAccount,
        documents: [
          ...payload.idCardImages.filter(Boolean),
          ...payload.businessLicenseImages.filter(Boolean),
        ],
      })
    );

    // Dispatch action để tạo shop
    console.log("Dispatching createShopStart with payload:", payload);
    dispatch(createShopStart(payload as any));
    console.log("createShopStart dispatched");
  }, [
    dispatch,
    formData,
    // Note: Removed createShopStatus and isSubmitting from dependencies
    // to prevent callback recreation. We use refs instead.
    validateStep1,
    validateStep2,
    validateStep3,
    validateStep4,
    validateStep5,
  ]);

  const updateStepData = useCallback(
    <K extends keyof FormData>(step: K, data: Partial<FormData[K]>) => {
      setFormData((prev) => ({
        ...prev,
        [step]: { ...prev[step], ...data },
      }));
    },
    []
  );

  // Upload functions
  const handleLogoUpload = useCallback(
    async (file: File): Promise<{ url: string; publicId?: string }> => {
      try {
        const result = await imagesApi.uploadImage(file);
        return {
          url: result.url,
          publicId: result.publicId,
        };
      } catch (error) {
        console.error("Logo upload failed:", error);
        throw new Error("Tải lên logo thất bại. Vui lòng thử lại.");
      }
    },
    []
  );

  const handleBannerUpload = useCallback(
    async (file: File): Promise<{ url: string; publicId?: string }> => {
      try {
        const result = await imagesApi.uploadImage(file);
        return {
          url: result.url,
          publicId: result.publicId,
        };
      } catch (error) {
        console.error("Banner upload failed:", error);
        throw new Error("Tải lên banner thất bại. Vui lòng thử lại.");
      }
    },
    []
  );

  const handleIdCardUpload = useCallback(
    async (file: File): Promise<{ url: string; publicId?: string }> => {
      try {
        const result = await imagesApi.uploadImage(file);
        return {
          url: result.url,
          publicId: result.publicId,
        };
      } catch (error) {
        console.error("ID card upload failed:", error);
        throw new Error("Tải lên ảnh CCCD/CMND thất bại. Vui lòng thử lại.");
      }
    },
    []
  );

  const handleBusinessLicenseUpload = useCallback(
    async (file: File): Promise<{ url: string; publicId?: string }> => {
      try {
        const result = await imagesApi.uploadImage(file);
        return {
          url: result.url,
          publicId: result.publicId,
        };
      } catch (error) {
        console.error("Business license upload failed:", error);
        throw new Error("Tải lên giấy phép kinh doanh thất bại. Vui lòng thử lại.");
      }
    },
    []
  );

  const currentStepIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  return (
    <Section title="Đăng ký mở cửa hàng">
      <Form.Root
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log(
            "Form onSubmit called, isLastStep:",
            isLastStep,
            "isSubmitting:",
            isSubmitting
          );

          // Guard: Prevent submission if already submitting
          if (isSubmitting || isSubmittingRef.current) {
            console.log("Form onSubmit: Already submitting, return");
            return;
          }

          if (isLastStep) {
            handleSubmit();
          } else {
            handleNext();
          }
        }}
      >
        <div className="container px-4 mx-auto my-6 space-y-6">
          {submitError && createShopStatus === ReduxStateType.ERROR && (
            <AlertMessage
              type="error"
              title="Không thể đăng ký cửa hàng"
              message={submitError}
              onClose={() => dispatch(resetCreateShopState())}
            />
          )}
          <Tabs value={currentStep} onValueChange={(v) => setCurrentStep(v as Step)}>
            <Tabs.List
              variant="solid"
              hasBottomBorder
              className="overflow-x-auto mb-2 whitespace-nowrap"
            >
              <Tabs.Trigger value="info" disabled={currentStep !== "info"}>
                Tài khoản & Liên hệ
              </Tabs.Trigger>
              <Tabs.Trigger value="details" disabled={currentStep !== "details"}>
                Chi tiết gian hàng
              </Tabs.Trigger>
              <Tabs.Trigger value="legal" disabled={currentStep !== "legal"}>
                Pháp lý & Tài chính
              </Tabs.Trigger>
              <Tabs.Trigger value="documents" disabled={currentStep !== "documents"}>
                Tài liệu
              </Tabs.Trigger>
              <Tabs.Trigger value="setup" disabled={currentStep !== "setup"}>
                Thiết lập ban đầu
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="info" activeValue={currentStep}>
              <Step1AccountContact
                data={formData.step1}
                onChange={(data) => updateStepData("step1", data)}
                errors={errors.step1}
              />
            </Tabs.Content>

            <Tabs.Content value="details" activeValue={currentStep}>
              <Step2ShopDetails
                data={formData.step2}
                onChange={(data) => updateStepData("step2", data)}
                errors={errors.step2}
                onLogoUpload={handleLogoUpload}
                onBannerUpload={handleBannerUpload}
              />
            </Tabs.Content>

            <Tabs.Content value="legal" activeValue={currentStep}>
              <Step3LegalFinance
                data={formData.step3}
                onChange={(data) => updateStepData("step3", data)}
                errors={errors.step3}
              />
            </Tabs.Content>

            <Tabs.Content value="documents" activeValue={currentStep}>
              <Step4Documents
                data={formData.step4}
                onChange={(data) => updateStepData("step4", data)}
                errors={errors.step4}
                onIdCardUpload={handleIdCardUpload}
                onBusinessLicenseUpload={handleBusinessLicenseUpload}
              />
            </Tabs.Content>

            <Tabs.Content value="setup" activeValue={currentStep}>
              <Step5InitialSetup
                data={formData.step5}
                onChange={(data) => updateStepData("step5", data)}
                errors={errors.step5}
              />
            </Tabs.Content>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="flex gap-2 justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep || isSubmitting}
            >
              Quay lại
            </Button>
            <div className="flex gap-2">
              {!isLastStep && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  Tiếp theo
                </Button>
              )}
              {isLastStep && (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Submit button clicked", {
                      isSubmitting,
                      isSubmittingRef: isSubmittingRef.current,
                    });

                    // Guard: Prevent multiple clicks
                    if (isSubmitting || isSubmittingRef.current) {
                      console.log("Submit button: Already submitting, return");
                      return;
                    }

                    handleSubmit();
                  }}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi duyệt"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Form.Root>
    </Section>
  );
};

export default RegisterShopPage;
