# Danh sách đầy đủ các trường input khi đăng ký Shop bán điện tử

## Tổng quan
Quy trình đăng ký shop được chia thành **5 bước (steps)** với tổng cộng **28 trường input** và **2 loại tài liệu upload**.

---

## BƯỚC 1: TÀI KHOẢN & LIÊN HỆ (Step 1 - Account & Contact)

### 1.1. Email liên hệ (contactEmail)
- **Loại**: Input text (type="email")
- **Bắt buộc**: ✅ Có
- **Duy nhất**: ✅ Có
- **Placeholder**: "email@domain.com"
- **Validation**: 
  - Không được để trống
  - Phải đúng định dạng email
- **Mô tả**: Email chính thức để liên hệ với shop

### 1.2. Số điện thoại (contactPhone)
- **Loại**: Input text (type="tel")
- **Bắt buộc**: ✅ Có
- **Duy nhất**: ✅ Có
- **Placeholder**: "Số điện thoại"
- **Validation**: Không được để trống
- **Mô tả**: Số điện thoại liên hệ chính thức

### 1.3. Tên người liên hệ (contactName)
- **Loại**: Input text
- **Bắt buộc**: ✅ Có
- **Placeholder**: "Họ và tên người đại diện"
- **Validation**: Không được để trống
- **Mô tả**: Họ và tên người đại diện pháp luật của shop

---

## BƯỚC 2: CHI TIẾT GIAN HÀNG (Step 2 - Shop Details)

### 2.1. Tên gian hàng (shopName)
- **Loại**: Input text
- **Bắt buộc**: ✅ Có
- **Duy nhất**: ✅ Có
- **Placeholder**: "Tên gian hàng"
- **Validation**: Không được để trống
- **Mô tả**: Tên thương hiệu/cửa hàng hiển thị công khai

### 2.2. Đường dẫn Shop / Slug (shopSlug)
- **Loại**: Input text (read-only, disabled)
- **Bắt buộc**: ❌ Không (tự động generate)
- **Duy nhất**: ✅ Có
- **Placeholder**: "ten-gian-hang"
- **Tính năng đặc biệt**: 
  - **Tự động generate** từ `shopName` khi người dùng nhập tên shop
  - Tự động bỏ dấu tiếng Việt
  - Tự động loại bỏ ký tự đặc biệt
  - Trường này **chỉ đọc** (read-only), người dùng không thể chỉnh sửa
- **Validation**: Không cần validation (tự động generate)
- **Mô tả**: URL slug cho shop (ví dụ: `/shop/ten-gian-hang`) - được tạo tự động từ tên shop

### 2.3. Mô tả ngắn về Shop (shopDescription)
- **Loại**: TextArea (4 rows)
- **Bắt buộc**: ✅ Có
- **Placeholder**: "Giới thiệu chung về sản phẩm/lĩnh vực kinh doanh"
- **Validation**: Không được để trống
- **Mô tả**: Mô tả tổng quan về shop, sản phẩm, lĩnh vực kinh doanh

### 2.4. Logo cửa hàng (logo)
- **Loại**: Image Upload (ImageIconUpload, size="xl")
- **Bắt buộc**: ✅ Có
- **Placeholder**: "Logo"
- **Validation**: Phải có ít nhất 1 ảnh
- **Mô tả**: Logo chính thức của shop (hình vuông, kích thước lớn)

### 2.5. Ảnh bìa/Banner (banner)
- **Loại**: Image Upload (ImageBannerUpload)
- **Bắt buộc**: ✅ Có
- **Validation**: Phải có ít nhất 1 ảnh
- **Mô tả**: Banner/ảnh bìa hiển thị ở đầu trang shop

### 2.6. Địa chỉ (address)
- **Loại**: AddressSelector (Component chọn địa chỉ 3 cấp)
- **Bắt buộc**: ✅ Có
- **Cấu trúc**:
  - **Tỉnh/Thành phố** (provinceCode): Bắt buộc
  - **Quận/Huyện** (districtCode): Bắt buộc
  - **Phường/Xã** (wardCode): Bắt buộc
- **Validation**: Phải chọn đầy đủ 3 cấp địa chỉ
- **Mô tả**: Địa chỉ trụ sở/địa điểm kinh doanh chính

---

## BƯỚC 3: PHÁP LÝ & TÀI CHÍNH (Step 3 - Legal & Finance)

### 3.1. Hình thức kinh doanh (businessType)
- **Loại**: Select dropdown
- **Bắt buộc**: ✅ Có
- **Options**:
  - `"individual"`: Cá nhân
  - `"household"`: Hộ kinh doanh
  - `"enterprise"`: Doanh nghiệp
- **Placeholder**: "Chọn"
- **Validation**: Phải chọn một trong các option
- **Mô tả**: Hình thức pháp lý của shop

### 3.2. Mã số thuế (taxId)
- **Loại**: Input text
- **Bắt buộc**: ⚠️ Có điều kiện
  - **Bắt buộc** nếu `businessType !== "individual"` (tức là HKD hoặc DN)
  - **Tùy chọn** nếu là Cá nhân
- **Placeholder**: "MST (nếu là DN/HKD)"
- **Validation**: 
  - Bắt buộc nếu không phải cá nhân
  - Có thể để trống nếu là cá nhân
- **Mô tả**: Mã số thuế của doanh nghiệp/hộ kinh doanh

### 3.3. Số CCCD/MST người đại diện (repId)
- **Loại**: Input text
- **Bắt buộc**: ✅ Có
- **Placeholder**: "CCCD/MST đại diện"
- **Validation**: Không được để trống
- **Mô tả**: Số căn cước công dân hoặc mã số thuế của người đại diện pháp luật

### 3.4. Tên Ngân hàng (bankName)
- **Loại**: Input text
- **Bắt buộc**: ✅ Có
- **Placeholder**: "Tên ngân hàng"
- **Validation**: Không được để trống
- **Mô tả**: Tên ngân hàng nơi mở tài khoản thanh toán

### 3.5. Số Tài khoản Ngân hàng (bankAccount)
- **Loại**: Input text
- **Bắt buộc**: ✅ Có
- **Placeholder**: "Số tài khoản"
- **Validation**: Không được để trống
- **Mô tả**: Số tài khoản ngân hàng để nhận thanh toán

### 3.6. Tên Chủ Tài khoản (bankHolder)
- **Loại**: Input text
- **Bắt buộc**: ✅ Có
- **Placeholder**: "Họ tên chủ tài khoản"
- **Validation**: Không được để trống
- **Mô tả**: Tên chủ tài khoản ngân hàng (phải khớp với tài khoản)

---

## BƯỚC 4: TÀI LIỆU (Step 4 - Documents)

### 4.1. Ảnh CCCD/CMND (idCardImages)
- **Loại**: Image Upload Multi (nhiều ảnh)
- **Bắt buộc**: ❌ Tùy chọn
- **Mô tả**: "Ảnh CCCD/CMND (cả hai mặt, tùy chọn)"
- **Validation**: Không bắt buộc (có thể để trống)
- **Lưu ý**: Nên upload cả mặt trước và mặt sau

### 4.2. Giấy phép Kinh doanh (businessLicenseImages)
- **Loại**: Image Upload Multi (nhiều ảnh)
- **Bắt buộc**: ⚠️ Có điều kiện
  - **Bắt buộc** nếu `businessType !== "individual"` (tức là HKD hoặc DN)
  - **Tùy chọn** nếu là Cá nhân
- **Mô tả**: "Giấy phép Kinh doanh (nếu là DN/HKD)"
- **Validation**: 
  - Bắt buộc nếu không phải cá nhân
  - Có thể để trống nếu là cá nhân
- **Lưu ý**: Cần upload đầy đủ các trang của giấy phép kinh doanh

---

## BƯỚC 5: THIẾT LẬP BAN ĐẦU (Step 5 - Initial Setup)

### 5.1. Chính sách Vận chuyển (shippingPolicy)
- **Loại**: TextArea (4 rows)
- **Bắt buộc**: ❌ Tùy chọn
- **Placeholder**: "Đơn vị vận chuyển, phí ship..."
- **Validation**: Có thể để trống
- **Mô tả**: Chính sách về đơn vị vận chuyển, phí ship, thời gian giao hàng

### 5.2. Chính sách Đổi trả (returnPolicy)
- **Loại**: TextArea (4 rows)
- **Bắt buộc**: ✅ Có
- **Placeholder**: "Điều kiện và thời gian đổi trả..."
- **Validation**: Không được để trống
- **Mô tả**: Điều kiện, thời gian và quy trình đổi trả hàng

### 5.3. Giờ mở cửa (openHour)
- **Loại**: Input text
- **Bắt buộc**: ❌ Tùy chọn
- **Placeholder**: "08:00"
- **Validation**: Có thể để trống
- **Mô tả**: Giờ mở cửa hàng ngày (format: HH:mm)

### 5.4. Giờ đóng cửa (closeHour)
- **Loại**: Input text
- **Bắt buộc**: ❌ Tùy chọn
- **Placeholder**: "17:00"
- **Validation**: Có thể để trống
- **Mô tả**: Giờ đóng cửa hàng ngày (format: HH:mm)

### 5.5. Ngày làm việc (workingDays)
- **Loại**: Input text
- **Bắt buộc**: ❌ Tùy chọn
- **Placeholder**: "T2 - T7"
- **Validation**: Có thể để trống
- **Mô tả**: Các ngày trong tuần shop hoạt động (ví dụ: "T2 - T7", "Tất cả các ngày")

### 5.6. Facebook (facebook)
- **Loại**: Input text
- **Bắt buộc**: ❌ Tùy chọn
- **Placeholder**: "https://facebook.com/..."
- **Validation**: Có thể để trống
- **Mô tả**: Link Facebook page hoặc profile của shop

### 5.7. Zalo (zalo)
- **Loại**: Input text
- **Bắt buộc**: ❌ Tùy chọn
- **Placeholder**: "SĐT Zalo / Link OA"
- **Validation**: Có thể để trống
- **Mô tả**: Số điện thoại Zalo hoặc link Zalo Official Account

### 5.8. Instagram (instagram)
- **Loại**: Input text
- **Bắt buộc**: ❌ Tùy chọn
- **Placeholder**: "https://instagram.com/..."
- **Validation**: Có thể để trống
- **Mô tả**: Link Instagram profile của shop

---

## TỔNG KẾT

### Thống kê theo mức độ bắt buộc:

#### ✅ Bắt buộc (Required) - 17 trường:
1. contactEmail
2. contactPhone
3. contactName
4. shopName
5. shopDescription
6. logo
7. banner
8. address (provinceCode, districtCode, wardCode)
9. businessType
10. repId
11. bankName
12. bankAccount
13. bankHolder
14. returnPolicy

#### 🔄 Tự động generate (Auto-generated) - 1 trường:
1. **shopSlug**: Tự động tạo từ `shopName` (không cần nhập)

#### ⚠️ Bắt buộc có điều kiện (Conditionally Required) - 2 trường:
1. **taxId**: Bắt buộc nếu businessType !== "individual"
2. **businessLicenseImages**: Bắt buộc nếu businessType !== "individual"

#### ❌ Tùy chọn (Optional) - 8 trường:
1. idCardImages
2. shippingPolicy
3. openHour
4. closeHour
5. workingDays
6. facebook
7. zalo
8. instagram

### Tổng số trường: **27 trường input** (17 bắt buộc + 1 tự động + 2 có điều kiện + 8 tùy chọn) + **2 loại tài liệu upload**

---

## LƯU Ý QUAN TRỌNG

1. **Validation**: Mỗi bước có validation riêng, chỉ khi bước hiện tại hợp lệ mới được chuyển sang bước tiếp theo
2. **Upload ảnh**: Tất cả ảnh được upload lên server và trả về `url` và `publicId`
3. **Địa chỉ**: Sử dụng component AddressSelector với 3 cấp: Tỉnh/TP → Quận/Huyện → Phường/Xã
4. **Slug**: Tự động generate từ tên shop, bỏ dấu tiếng Việt và ký tự đặc biệt. Người dùng không cần nhập, trường này chỉ đọc (read-only)
5. **Business Type**: Ảnh hưởng đến validation của `taxId` và `businessLicenseImages`
6. **Form State**: Dữ liệu được lưu trong Redux state và có thể pre-fill khi shop bị rejected

---

## CẤU TRÚC DỮ LIỆU GỬI LÊN SERVER

Khi submit form, dữ liệu được gửi dưới dạng:

```typescript
{
  name: string,                    // shopName
  slug: string,                    // shopSlug
  description: string,             // shopDescription
  logo: string,                    // URL hoặc publicId
  banner: string,                  // URL hoặc publicId
  contactEmail: string,
  contactPhone: string,
  contactName: string,
  address: {
    provinceCode: number,
    districtCode: number,
    wardCode: number
  },
  businessType: "individual" | "household" | "enterprise",
  taxId: string,                   // Rỗng nếu là cá nhân
  repId: string,
  bankName: string,
  bankAccount: string,
  bankHolder: string,
  idCardImages: string[],          // Array of URLs
  businessLicenseImages: string[], // Array of URLs
  shippingPolicy: string,          // Có thể rỗng
  returnPolicy: string,
  openHour: string,
  closeHour: string,
  workingDays: string,
  facebook: string,                // Có thể rỗng
  zalo: string,                    // Có thể rỗng
  instagram: string                // Có thể rỗng
}
```
