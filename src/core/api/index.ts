// Core API exports for users
export { userAuthApi, userOtpApi, userSocialAuthApi } from "./auth";
export { userProductsApi } from "./products";
export { userCategoriesApi } from "./categories";
export { userShopsApi } from "./shops";
export { userCartApi } from "./cart";
export { userOrdersApi } from "./orders";
export { userAddressesApi } from "./addresses";
export { userReviewsApi } from "./reviews";
export { userWishlistApi } from "./wishlist";
export { userNotificationsApi } from "./notifications";
export { userPaymentsApi } from "./payments";
export { shopManagementApi } from "./shop-management";
export { userAttributeTypesApi } from "./attribute-type";
export { userAttributeValuesApi } from "./attribute-value";
export { userProductAttributesApi } from "./product-attribute";

// Re-export types (only unique ones to avoid conflicts)
export type {
  RegisterUserRequest,
  LoginRequest,
  ResendVerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  OtpRequest,
  OtpVerifyRequest,
  User,
  LoginResponseData,
  RegisterResponseData,
  SimpleMessageData,
  SocialLoginResponseData,
  AuthResponse,
  RefreshTokenResponse,
  UserRole,
  TokenPayload,
} from "./auth/type";
export type {
  AttributeType,
  AttributeTypeListQuery,
  AttributeTypeListResponse,
} from "./attribute-type/type";
export type {
  AttributeValue,
  AttributeValueListQuery,
  AttributeValueListResponse,
} from "./attribute-value/type";
export type {
  ProductAttribute,
  ProductAttributeListQuery,
  ProductAttributeListResponse,
} from "./product-attribute/type";

// Re-export endpoints (only unique ones to avoid conflicts)
export { USER_AUTH_ENDPOINTS, USER_OTP_ENDPOINTS, USER_SOCIAL_AUTH_ENDPOINTS } from "./auth/path";
export { USER_ATTRIBUTE_TYPES_ENDPOINTS } from "./attribute-type/path";
export { USER_ATTRIBUTE_VALUES_ENDPOINTS } from "./attribute-value/path";
export { USER_PRODUCT_ATTRIBUTES_ENDPOINTS } from "./product-attribute/path";
