# Hướng dẫn chi tiết nhập liệu khi đăng ký Shop bán điện tử

## Tổng quan
Tài liệu này cung cấp thông tin chi tiết, ví dụ cụ thể và hướng dẫn nhập liệu cho từng trường input khi đăng ký shop.

---

## BƯỚC 1: TÀI KHOẢN & LIÊN HỆ

### 1.1. Email liên hệ (contactEmail)

**Thông tin:**
- **Loại**: Email input
- **Bắt buộc**: ✅ Có
- **Duy nhất**: ✅ Có (không được trùng với shop khác)
- **Format**: `email@domain.com`
- **Độ dài**: Tối đa 255 ký tự
- **Validation**: 
  - Phải có ký tự `@`
  - Phải có domain hợp lệ (ví dụ: `.com`, `.vn`, `.org`)
  - Không được có khoảng trắng

**Ví dụ hợp lệ:**
```
shop123@gmail.com
cua-hang-dien-tu@yahoo.com
my-shop@company.vn
contact@myshop.org
```

**Ví dụ không hợp lệ:**
```
shop123@gmail (thiếu domain)
shop @gmail.com (có khoảng trắng)
shop123gmail.com (thiếu @)
```

**Lưu ý:**
- Email này sẽ được dùng để nhận thông báo về shop
- Nên dùng email chính thức của doanh nghiệp/cá nhân
- Email phải có thể nhận được email (để xác thực)

---

### 1.2. Số điện thoại (contactPhone)

**Thông tin:**
- **Loại**: Tel input
- **Bắt buộc**: ✅ Có
- **Duy nhất**: ✅ Có (không được trùng với shop khác)
- **Format**: Số điện thoại Việt Nam
- **Độ dài**: 10-11 số
- **Validation**: 
  - Chỉ chứa số
  - Bắt đầu bằng 0 hoặc +84
  - Không có khoảng trắng hoặc ký tự đặc biệt

**Ví dụ hợp lệ:**
```
0912345678
0987654321
0123456789
+84912345678
```

**Ví dụ không hợp lệ:**
```
091 234 5678 (có khoảng trắng)
091-234-5678 (có dấu gạch ngang)
abc12345678 (có chữ cái)
123456789 (thiếu số 0 đầu)
```

**Lưu ý:**
- Số điện thoại này sẽ hiển thị công khai trên shop
- Nên dùng số điện thoại chính thức, có thể nhận cuộc gọi
- Format chuẩn: `0xxx xxx xxx` (10 số) hoặc `+84 xxx xxx xxx` (11 số)

---

### 1.3. Tên người liên hệ (contactName)

**Thông tin:**
- **Loại**: Text input
- **Bắt buộc**: ✅ Có
- **Format**: Họ và tên đầy đủ
- **Độ dài**: Tối thiểu 2 ký tự, tối đa 100 ký tự
- **Validation**: 
  - Không được để trống
  - Phải có ít nhất 2 từ (họ và tên)

**Ví dụ hợp lệ:**
```
Nguyễn Văn A
Trần Thị B
Lê Hoàng C
Phạm Đức D
```

**Ví dụ không hợp lệ:**
```
A (quá ngắn, chỉ có 1 từ)
Nguyễn123 (có số)
Nguyễn@Văn (có ký tự đặc biệt)
```

**Lưu ý:**
- Đây là tên người đại diện pháp luật của shop
- Nên nhập đúng họ tên như trên CCCD/CMND
- Tên này sẽ được dùng trong các tài liệu pháp lý

---

## BƯỚC 2: CHI TIẾT GIAN HÀNG

### 2.1. Tên gian hàng (shopName)

**Thông tin:**
- **Loại**: Text input
- **Bắt buộc**: ✅ Có
- **Duy nhất**: ✅ Có (không được trùng với shop khác)
- **Format**: Tên shop bằng tiếng Việt hoặc tiếng Anh
- **Độ dài**: Tối thiểu 3 ký tự, tối đa 100 ký tự
- **Validation**: 
  - Không được để trống
  - Không được chứa ký tự đặc biệt nguy hiểm: `<>{}[]|\\`
  - Có thể chứa dấu tiếng Việt, số, chữ cái, khoảng trắng

**Ví dụ hợp lệ:**
```
Cửa hàng điện tử ABC
Shop Quần Áo Thời Trang
My Fashion Store
Gian hàng Đồ Gia Dụng 123
```

**Ví dụ không hợp lệ:**
```
AB (quá ngắn)
Shop<>ABC (có ký tự đặc biệt)
   (chỉ có khoảng trắng)
```

**Lưu ý:**
- Tên này sẽ hiển thị công khai trên shop
- Nên chọn tên dễ nhớ, dễ tìm kiếm
- Tên shop sẽ được dùng để tự động tạo slug (đường dẫn)

---

### 2.2. Đường dẫn Shop / Slug (shopSlug)

**Thông tin:**
- **Loại**: Text input (read-only, tự động generate)
- **Bắt buộc**: ❌ Không (tự động tạo)
- **Duy nhất**: ✅ Có
- **Format**: Chỉ chữ thường, số, dấu gạch ngang
- **Độ dài**: Tối đa 100 ký tự
- **Tự động generate từ**: `shopName`

**Ví dụ tự động generate:**
```
Tên shop: "Cửa hàng điện tử ABC"
→ Slug: "cua-hang-dien-tu-abc"

Tên shop: "Shop Quần Áo Thời Trang"
→ Slug: "shop-quan-ao-thoi-trang"

Tên shop: "My Fashion Store"
→ Slug: "my-fashion-store"
```

**Lưu ý:**
- Slug được tạo tự động, người dùng không cần nhập
- Slug sẽ là URL của shop: `/shop/cua-hang-dien-tu-abc`
- Nếu slug bị trùng, hệ thống sẽ tự động thêm số vào cuối

---

### 2.3. Mô tả ngắn về Shop (shopDescription)

**Thông tin:**
- **Loại**: TextArea (4 dòng)
- **Bắt buộc**: ✅ Có
- **Format**: Văn bản mô tả shop
- **Độ dài**: Tối thiểu 20 ký tự, tối đa 500 ký tự
- **Validation**: 
  - Không được để trống
  - Phải có ít nhất 20 ký tự

**Ví dụ hợp lệ:**
```
Chuyên bán các sản phẩm điện tử, điện lạnh chính hãng. 
Cam kết giá tốt nhất thị trường, bảo hành chính hãng.
Giao hàng toàn quốc, thanh toán khi nhận hàng.
```

```
Shop chuyên cung cấp quần áo thời trang nam nữ, 
phụ kiện thời trang. Hàng nhập khẩu chất lượng cao, 
giá cả hợp lý. Miễn phí ship cho đơn hàng trên 500k.
```

**Ví dụ không hợp lệ:**
```
Shop bán hàng (quá ngắn, dưới 20 ký tự)
```

**Lưu ý:**
- Mô tả này sẽ hiển thị trên trang shop
- Nên viết rõ ràng về sản phẩm, dịch vụ, cam kết
- Có thể dùng để SEO (tối ưu tìm kiếm)

---

### 2.4. Logo cửa hàng (logo)

**Thông tin:**
- **Loại**: Image Upload
- **Bắt buộc**: ✅ Có
- **Format**: JPG, PNG, WEBP
- **Kích thước**: 
  - Tối thiểu: 200x200px
  - Tối đa: 2000x2000px
  - Tỷ lệ khuyến nghị: 1:1 (hình vuông)
- **Dung lượng**: Tối đa 5MB
- **Validation**: 
  - Phải có ít nhất 1 ảnh
  - Ảnh phải hợp lệ (không bị lỗi)

**Yêu cầu:**
- Logo rõ nét, không mờ
- Nền trong suốt hoặc nền trắng (khuyến nghị)
- Logo không bị cắt xén
- File ảnh hợp lệ

**Lưu ý:**
- Logo sẽ hiển thị ở nhiều nơi: header shop, kết quả tìm kiếm, email
- Nên dùng logo có độ phân giải cao
- Logo nên có kích thước nhỏ gọn để tải nhanh

---

### 2.5. Ảnh bìa/Banner (banner)

**Thông tin:**
- **Loại**: Image Upload
- **Bắt buộc**: ✅ Có
- **Format**: JPG, PNG, WEBP
- **Kích thước**: 
  - Tối thiểu: 1200x300px
  - Tối đa: 2000x800px
  - Tỷ lệ khuyến nghị: 4:1 hoặc 3:1 (ngang)
- **Dung lượng**: Tối đa 5MB
- **Validation**: 
  - Phải có ít nhất 1 ảnh
  - Ảnh phải hợp lệ

**Yêu cầu:**
- Banner rõ nét, chất lượng cao
- Nội dung phù hợp với shop (không vi phạm thuần phong mỹ tục)
- Banner không bị méo, bị cắt

**Lưu ý:**
- Banner hiển thị ở đầu trang shop
- Nên thiết kế banner có thông tin shop hoặc slogan
- Banner nên có màu sắc hài hòa, dễ nhìn

---

### 2.6. Địa chỉ (address)

**Thông tin:**
- **Loại**: AddressSelector (3 cấp)
- **Bắt buộc**: ✅ Có
- **Cấu trúc**: 
  - Tỉnh/Thành phố (provinceCode)
  - Quận/Huyện (districtCode)
  - Phường/Xã (wardCode)

**Ví dụ:**
```
Tỉnh/Thành phố: Hà Nội
Quận/Huyện: Quận Ba Đình
Phường/Xã: Phường Điện Biên
```

```
Tỉnh/Thành phố: TP. Hồ Chí Minh
Quận/Huyện: Quận 1
Phường/Xã: Phường Bến Nghé
```

```
Tỉnh/Thành phố: Đà Nẵng
Quận/Huyện: Quận Hải Châu
Phường/Xã: Phường Thanh Bình
```

**Lưu ý:**
- Phải chọn đầy đủ 3 cấp địa chỉ
- Địa chỉ này là địa chỉ trụ sở/địa điểm kinh doanh chính
- Địa chỉ sẽ hiển thị trên shop (có thể ẩn nếu cần)

---

## BƯỚC 3: PHÁP LÝ & TÀI CHÍNH

### 3.1. Hình thức kinh doanh (businessType)

**Thông tin:**
- **Loại**: Select dropdown
- **Bắt buộc**: ✅ Có
- **Options**: 
  - `"individual"`: Cá nhân
  - `"household"`: Hộ kinh doanh
  - `"enterprise"`: Doanh nghiệp

**Ví dụ chọn:**
```
Cá nhân → Chọn "Cá nhân"
Hộ kinh doanh → Chọn "Hộ kinh doanh"
Công ty TNHH → Chọn "Doanh nghiệp"
Công ty Cổ phần → Chọn "Doanh nghiệp"
```

**Lưu ý:**
- Lựa chọn này ảnh hưởng đến các trường bắt buộc khác:
  - Nếu chọn "Cá nhân": Không cần MST và Giấy phép kinh doanh
  - Nếu chọn "Hộ kinh doanh" hoặc "Doanh nghiệp": Cần MST và Giấy phép kinh doanh

---

### 3.2. Mã số thuế (taxId)

**Thông tin:**
- **Loại**: Text input
- **Bắt buộc**: ⚠️ Có điều kiện
  - Bắt buộc nếu `businessType !== "individual"`
  - Tùy chọn nếu là "Cá nhân"
- **Format**: Mã số thuế Việt Nam
- **Độ dài**: 10 hoặc 13 số
- **Validation**: 
  - Chỉ chứa số
  - 10 số (doanh nghiệp cũ) hoặc 13 số (doanh nghiệp mới)

**Ví dụ hợp lệ:**
```
0101234567 (10 số - doanh nghiệp cũ)
0101234567890 (13 số - doanh nghiệp mới)
```

**Ví dụ không hợp lệ:**
```
010-123-4567 (có dấu gạch ngang)
010 123 4567 (có khoảng trắng)
ABC1234567 (có chữ cái)
```

**Lưu ý:**
- MST có thể tra cứu trên website của Tổng cục Thuế
- MST phải đúng với Giấy phép kinh doanh
- Nếu là cá nhân, có thể để trống

---

### 3.3. Số CCCD/MST người đại diện (repId)

**Thông tin:**
- **Loại**: Text input
- **Bắt buộc**: ✅ Có
- **Format**: 
  - CCCD/CMND: 9 số (cũ) hoặc 12 số (mới)
  - MST cá nhân: 10 số
- **Độ dài**: 9, 10, hoặc 12 số
- **Validation**: 
  - Chỉ chứa số
  - Không được để trống

**Ví dụ hợp lệ:**
```
001234567 (9 số - CMND cũ)
001234567890 (12 số - CCCD mới)
0101234567 (10 số - MST cá nhân)
```

**Ví dụ không hợp lệ:**
```
001-234-567 (có dấu gạch ngang)
001 234 567 (có khoảng trắng)
ABC1234567 (có chữ cái)
```

**Lưu ý:**
- Đây là số CCCD/CMND hoặc MST của người đại diện pháp luật
- Phải khớp với tên người đại diện ở bước 1
- Số này sẽ được dùng để xác thực danh tính

---

### 3.4. Tên Ngân hàng (bankName)

**Thông tin:**
- **Loại**: Text input
- **Bắt buộc**: ✅ Có
- **Format**: Tên ngân hàng đầy đủ
- **Độ dài**: Tối thiểu 3 ký tự, tối đa 100 ký tự
- **Validation**: 
  - Không được để trống
  - Chỉ chữ cái, số, khoảng trắng

**Ví dụ hợp lệ:**
```
Ngân hàng Ngoại thương Việt Nam
Vietcombank
Ngân hàng Á Châu
ACB
Ngân hàng Đầu tư và Phát triển Việt Nam
BIDV
Ngân hàng Công thương Việt Nam
Vietinbank
```

**Ví dụ không hợp lệ:**
```
VCB (quá ngắn, nên viết đầy đủ)
Ngân hàng@ABC (có ký tự đặc biệt)
```

**Lưu ý:**
- Nên nhập tên đầy đủ của ngân hàng
- Tên ngân hàng phải khớp với số tài khoản
- Có thể tra cứu tên chính xác trên website ngân hàng

---

### 3.5. Số Tài khoản Ngân hàng (bankAccount)

**Thông tin:**
- **Loại**: Text input
- **Bắt buộc**: ✅ Có
- **Format**: Số tài khoản ngân hàng
- **Độ dài**: Tối thiểu 8 số, tối đa 20 số
- **Validation**: 
  - Chỉ chứa số
  - Không được để trống
  - Phải đúng format của ngân hàng

**Ví dụ hợp lệ:**
```
1234567890 (10 số)
001234567890 (12 số)
1234567890123456 (16 số)
```

**Ví dụ không hợp lệ:**
```
123-456-7890 (có dấu gạch ngang)
123 456 7890 (có khoảng trắng)
ABC1234567 (có chữ cái)
12345 (quá ngắn)
```

**Lưu ý:**
- Số tài khoản này sẽ dùng để nhận thanh toán từ khách hàng
- Phải đúng số tài khoản, kiểm tra kỹ trước khi nhập
- Số tài khoản phải khớp với tên chủ tài khoản

---

### 3.6. Tên Chủ Tài khoản (bankHolder)

**Thông tin:**
- **Loại**: Text input
- **Bắt buộc**: ✅ Có
- **Format**: Họ và tên chủ tài khoản
- **Độ dài**: Tối thiểu 3 ký tự, tối đa 100 ký tự
- **Validation**: 
  - Không được để trống
  - Chỉ chữ cái, khoảng trắng, dấu tiếng Việt

**Ví dụ hợp lệ:**
```
NGUYEN VAN A
Trần Thị B
LÊ HOÀNG C
Phạm Đức D
```

**Ví dụ không hợp lệ:**
```
A (quá ngắn)
Nguyễn123 (có số)
Nguyễn@Văn (có ký tự đặc biệt)
```

**Lưu ý:**
- Tên chủ tài khoản phải khớp chính xác với tên trên tài khoản ngân hàng
- Nếu tài khoản là tên công ty, nhập tên công ty đầy đủ
- Tên này sẽ được dùng để xác thực khi thanh toán

---

## BƯỚC 4: TÀI LIỆU

### 4.1. Ảnh CCCD/CMND (idCardImages)

**Thông tin:**
- **Loại**: Image Upload Multi (nhiều ảnh)
- **Bắt buộc**: ❌ Tùy chọn
- **Format**: JPG, PNG, PDF
- **Kích thước**: 
  - Tối thiểu: 800x600px
  - Tối đa: 4000x3000px
- **Dung lượng**: Tối đa 5MB/ảnh
- **Số lượng**: Tối đa 4 ảnh (2 mặt x 2 loại giấy tờ)

**Yêu cầu:**
- Ảnh rõ nét, không mờ
- Đầy đủ thông tin trên CCCD/CMND
- Không bị che khuất thông tin
- Khuyến nghị: Upload cả mặt trước và mặt sau

**Ví dụ upload:**
```
Ảnh 1: CCCD mặt trước
Ảnh 2: CCCD mặt sau
```

**Lưu ý:**
- Ảnh này dùng để xác thực danh tính người đại diện
- Nên chụp ảnh trong điều kiện ánh sáng tốt
- Đảm bảo thông tin trên ảnh dễ đọc

---

### 4.2. Giấy phép Kinh doanh (businessLicenseImages)

**Thông tin:**
- **Loại**: Image Upload Multi (nhiều ảnh)
- **Bắt buộc**: ⚠️ Có điều kiện
  - Bắt buộc nếu `businessType !== "individual"`
  - Tùy chọn nếu là "Cá nhân"
- **Format**: JPG, PNG, PDF
- **Kích thước**: 
  - Tối thiểu: 1200x800px
  - Tối đa: 4000x3000px
- **Dung lượng**: Tối đa 10MB/ảnh
- **Số lượng**: Tối đa 10 ảnh (nếu giấy phép nhiều trang)

**Yêu cầu:**
- Ảnh rõ nét, đầy đủ thông tin
- Upload đầy đủ tất cả các trang của giấy phép
- Thông tin trên giấy phép phải khớp với thông tin đã nhập (MST, tên công ty)

**Ví dụ upload:**
```
Ảnh 1: Trang 1 của Giấy phép kinh doanh
Ảnh 2: Trang 2 của Giấy phép kinh doanh (nếu có)
Ảnh 3: Phụ lục (nếu có)
```

**Lưu ý:**
- Giấy phép kinh doanh phải còn hiệu lực
- MST trên giấy phép phải khớp với MST đã nhập
- Nếu giấy phép có nhiều trang, upload đầy đủ

---

## BƯỚC 5: THIẾT LẬP BAN ĐẦU

### 5.1. Chính sách Vận chuyển (shippingPolicy)

**Thông tin:**
- **Loại**: TextArea (4 dòng)
- **Bắt buộc**: ❌ Tùy chọn
- **Format**: Văn bản mô tả chính sách
- **Độ dài**: Tối đa 1000 ký tự
- **Validation**: Có thể để trống

**Ví dụ nhập:**
```
1. Đơn vị vận chuyển:
- Giao hàng nhanh (GHN): 30.000đ - 50.000đ
- Giao hàng tiết kiệm (GHTK): 20.000đ - 40.000đ
- Viettel Post: 25.000đ - 45.000đ

2. Thời gian giao hàng:
- Nội thành: 1-2 ngày
- Tỉnh/thành phố khác: 3-5 ngày
- Vùng sâu vùng xa: 5-7 ngày

3. Miễn phí ship cho đơn hàng trên 500.000đ
```

**Lưu ý:**
- Chính sách này sẽ hiển thị công khai trên shop
- Nên viết rõ ràng về phí ship, thời gian giao hàng
- Có thể cập nhật sau khi shop hoạt động

---

### 5.2. Chính sách Đổi trả (returnPolicy)

**Thông tin:**
- **Loại**: TextArea (4 dòng)
- **Bắt buộc**: ✅ Có
- **Format**: Văn bản mô tả chính sách
- **Độ dài**: Tối thiểu 50 ký tự, tối đa 1000 ký tự
- **Validation**: 
  - Không được để trống
  - Phải có ít nhất 50 ký tự

**Ví dụ nhập:**
```
1. Điều kiện đổi trả:
- Sản phẩm còn nguyên seal, chưa sử dụng
- Còn đầy đủ phụ kiện, hộp đựng
- Có hóa đơn mua hàng

2. Thời gian đổi trả:
- Trong vòng 7 ngày kể từ ngày nhận hàng
- Áp dụng cho tất cả sản phẩm (trừ hàng đặc biệt)

3. Quy trình đổi trả:
- Liên hệ hotline: 0912345678
- Gửi ảnh sản phẩm và lý do đổi trả
- Shop sẽ xác nhận và hướng dẫn gửi hàng về
```

**Lưu ý:**
- Chính sách này bắt buộc phải có
- Nên viết rõ ràng, minh bạch
- Chính sách này sẽ hiển thị công khai và có giá trị pháp lý

---

### 5.3. Giờ mở cửa (openHour)

**Thông tin:**
- **Loại**: Text input
- **Bắt buộc**: ❌ Tùy chọn
- **Format**: HH:mm (24 giờ)
- **Validation**: 
  - Format: `HH:mm` (ví dụ: 08:00, 09:30)
  - Giờ hợp lệ: 00:00 - 23:59

**Ví dụ hợp lệ:**
```
08:00
09:30
07:00
```

**Ví dụ không hợp lệ:**
```
8:00 (thiếu số 0)
8h00 (sai format)
25:00 (giờ không hợp lệ)
```

**Lưu ý:**
- Giờ mở cửa để khách hàng biết khi nào shop hoạt động
- Có thể để trống nếu shop hoạt động 24/7

---

### 5.4. Giờ đóng cửa (closeHour)

**Thông tin:**
- **Loại**: Text input
- **Bắt buộc**: ❌ Tùy chọn
- **Format**: HH:mm (24 giờ)
- **Validation**: 
  - Format: `HH:mm`
  - Giờ hợp lệ: 00:00 - 23:59
  - Nên lớn hơn giờ mở cửa

**Ví dụ hợp lệ:**
```
17:00
18:30
22:00
```

**Lưu ý:**
- Nếu có giờ mở cửa thì nên có giờ đóng cửa
- Có thể để trống nếu shop hoạt động 24/7

---

### 5.5. Ngày làm việc (workingDays)

**Thông tin:**
- **Loại**: Text input
- **Bắt buộc**: ❌ Tùy chọn
- **Format**: Mô tả ngày làm việc
- **Độ dài**: Tối đa 50 ký tự
- **Validation**: Có thể để trống

**Ví dụ hợp lệ:**
```
T2 - T7
Thứ 2 đến Thứ 7
Tất cả các ngày
T2, T4, T6
Thứ 2 - Chủ nhật
```

**Lưu ý:**
- Mô tả ngắn gọn các ngày shop hoạt động
- Có thể viết bằng tiếng Việt hoặc ký hiệu

---

### 5.6. Facebook (facebook)

**Thông tin:**
- **Loại**: Text input
- **Bắt buộc**: ❌ Tùy chọn
- **Format**: URL Facebook page hoặc username
- **Độ dài**: Tối đa 200 ký tự
- **Validation**: 
  - Có thể để trống
  - Nếu nhập, nên là URL hợp lệ hoặc username

**Ví dụ hợp lệ:**
```
https://facebook.com/myshop
https://www.facebook.com/myshop
myshop (username)
@myshop
```

**Lưu ý:**
- Link Facebook sẽ hiển thị trên shop
- Có thể dùng để khách hàng liên hệ qua Facebook

---

### 5.7. Zalo (zalo)

**Thông tin:**
- **Loại**: Text input
- **Bắt buộc**: ❌ Tùy chọn
- **Format**: Số điện thoại Zalo hoặc link Zalo OA
- **Độ dài**: Tối đa 50 ký tự
- **Validation**: Có thể để trống

**Ví dụ hợp lệ:**
```
0912345678
https://zalo.me/0912345678
https://oa.zalo.me/1234567890
```

**Lưu ý:**
- Zalo là kênh liên hệ phổ biến ở Việt Nam
- Có thể nhập số điện thoại hoặc link Zalo Official Account

---

### 5.8. Instagram (instagram)

**Thông tin:**
- **Loại**: Text input
- **Bắt buộc**: ❌ Tùy chọn
- **Format**: URL Instagram profile
- **Độ dài**: Tối đa 200 ký tự
- **Validation**: Có thể để trống

**Ví dụ hợp lệ:**
```
https://instagram.com/myshop
https://www.instagram.com/myshop
@myshop (username)
```

**Lưu ý:**
- Link Instagram sẽ hiển thị trên shop
- Có thể dùng để showcase sản phẩm

---

## VÍ DỤ DỮ LIỆU MẪU HOÀN CHỈNH

### Ví dụ 1: Shop Cá nhân

```json
{
  "step1": {
    "contactEmail": "nguyenvana@gmail.com",
    "contactPhone": "0912345678",
    "contactName": "Nguyễn Văn A"
  },
  "step2": {
    "shopName": "Cửa hàng điện tử ABC",
    "shopSlug": "cua-hang-dien-tu-abc",
    "shopDescription": "Chuyên bán các sản phẩm điện tử, điện lạnh chính hãng. Cam kết giá tốt nhất thị trường, bảo hành chính hãng. Giao hàng toàn quốc, thanh toán khi nhận hàng.",
    "logo": "https://example.com/logo.jpg",
    "banner": "https://example.com/banner.jpg",
    "address": {
      "provinceCode": 1,
      "districtCode": 1,
      "wardCode": 1
    }
  },
  "step3": {
    "businessType": "individual",
    "taxId": "",
    "repId": "001234567890",
    "bankName": "Ngân hàng Ngoại thương Việt Nam",
    "bankAccount": "1234567890",
    "bankHolder": "NGUYEN VAN A"
  },
  "step4": {
    "idCardImages": ["https://example.com/cccd-front.jpg", "https://example.com/cccd-back.jpg"],
    "businessLicenseImages": []
  },
  "step5": {
    "shippingPolicy": "Giao hàng nhanh (GHN): 30.000đ - 50.000đ. Miễn phí ship cho đơn hàng trên 500.000đ",
    "returnPolicy": "Đổi trả trong vòng 7 ngày kể từ ngày nhận hàng. Sản phẩm còn nguyên seal, chưa sử dụng.",
    "openHour": "08:00",
    "closeHour": "17:00",
    "workingDays": "T2 - T7",
    "facebook": "https://facebook.com/cua-hang-dien-tu-abc",
    "zalo": "0912345678",
    "instagram": "https://instagram.com/cua-hang-dien-tu-abc"
  }
}
```

### Ví dụ 2: Shop Doanh nghiệp

```json
{
  "step1": {
    "contactEmail": "contact@company.vn",
    "contactPhone": "0987654321",
    "contactName": "Trần Thị B"
  },
  "step2": {
    "shopName": "Công ty TNHH Thời Trang XYZ",
    "shopSlug": "cong-ty-tnhh-thoi-trang-xyz",
    "shopDescription": "Công ty chuyên cung cấp quần áo thời trang nam nữ, phụ kiện thời trang. Hàng nhập khẩu chất lượng cao, giá cả hợp lý. Miễn phí ship cho đơn hàng trên 500k.",
    "logo": "https://example.com/logo-xyz.jpg",
    "banner": "https://example.com/banner-xyz.jpg",
    "address": {
      "provinceCode": 79,
      "districtCode": 760,
      "wardCode": 26734
    }
  },
  "step3": {
    "businessType": "enterprise",
    "taxId": "0101234567",
    "repId": "001234567890",
    "bankName": "Ngân hàng Á Châu",
    "bankAccount": "9876543210",
    "bankHolder": "CONG TY TNHH THOI TRANG XYZ"
  },
  "step4": {
    "idCardImages": ["https://example.com/cccd-front.jpg"],
    "businessLicenseImages": ["https://example.com/gpkd-page1.jpg", "https://example.com/gpkd-page2.jpg"]
  },
  "step5": {
    "shippingPolicy": "Giao hàng toàn quốc. Phí ship từ 20.000đ - 50.000đ tùy khu vực.",
    "returnPolicy": "Đổi trả trong vòng 14 ngày. Sản phẩm còn nguyên tag, chưa giặt, chưa sử dụng.",
    "openHour": "09:00",
    "closeHour": "18:00",
    "workingDays": "Tất cả các ngày",
    "facebook": "https://facebook.com/cong-ty-thoi-trang-xyz",
    "zalo": "https://oa.zalo.me/1234567890",
    "instagram": "https://instagram.com/thoi_trang_xyz"
  }
}
```

---

## CHECKLIST TRƯỚC KHI SUBMIT

Trước khi gửi đơn đăng ký, hãy kiểm tra:

### Bước 1: Tài khoản & Liên hệ
- [ ] Email hợp lệ và có thể nhận email
- [ ] Số điện thoại đúng format (10-11 số)
- [ ] Tên người liên hệ đầy đủ họ tên

### Bước 2: Chi tiết gian hàng
- [ ] Tên shop không trùng với shop khác
- [ ] Slug được tự động tạo (không cần nhập)
- [ ] Mô tả shop đầy đủ, rõ ràng (ít nhất 20 ký tự)
- [ ] Logo đã upload (hình vuông, rõ nét)
- [ ] Banner đã upload (tỷ lệ 4:1, rõ nét)
- [ ] Đã chọn đầy đủ 3 cấp địa chỉ

### Bước 3: Pháp lý & Tài chính
- [ ] Đã chọn hình thức kinh doanh
- [ ] Nếu là DN/HKD: Đã nhập MST
- [ ] Đã nhập số CCCD/MST người đại diện
- [ ] Tên ngân hàng đầy đủ, chính xác
- [ ] Số tài khoản đúng (kiểm tra kỹ)
- [ ] Tên chủ tài khoản khớp với tài khoản

### Bước 4: Tài liệu
- [ ] Nếu là cá nhân: Có thể upload CCCD (tùy chọn)
- [ ] Nếu là DN/HKD: Đã upload Giấy phép kinh doanh
- [ ] Ảnh tài liệu rõ nét, đầy đủ thông tin

### Bước 5: Thiết lập ban đầu
- [ ] Đã nhập Chính sách đổi trả (bắt buộc, ít nhất 50 ký tự)
- [ ] Chính sách vận chuyển (tùy chọn nhưng nên có)
- [ ] Giờ làm việc và ngày làm việc (nếu có)
- [ ] Thông tin mạng xã hội (tùy chọn)

---

## LƯU Ý CUỐI CÙNG

1. **Kiểm tra kỹ thông tin**: Tất cả thông tin sau khi submit sẽ được xét duyệt, khó sửa sau
2. **Tài liệu phải rõ nét**: Ảnh mờ, không rõ sẽ bị từ chối
3. **Thông tin phải khớp**: MST, tên công ty, tên người đại diện phải khớp với tài liệu
4. **Địa chỉ chính xác**: Địa chỉ phải đúng với địa điểm kinh doanh thực tế
5. **Tài khoản ngân hàng**: Phải đúng số tài khoản, kiểm tra kỹ trước khi submit
