# Table Components

Bộ component bảng dữ liệu chuyên nghiệp cho hệ thống admin, hỗ trợ infinite scroll và phân trang (pagination) với thiết kế hiện đại và trải nghiệm người dùng tối ưu.

## Components

### 1. InfiniteScrollTable

Bảng hỗ trợ scroll vô hạn, tự động tải thêm dữ liệu khi scroll đến cuối. Phù hợp cho danh sách dài với khả năng load on-demand.

**Ưu điểm:**

- Tự động tải thêm dữ liệu khi scroll
- Hiệu suất cao với danh sách lớn
- UX mượt mà, không cần nhấp chuột

### 2. PaginatedTable

Bảng với phân trang đầy đủ tính năng, hiển thị số trang và điều hướng chi tiết. Pagination được cố định ở phía dưới và header được cố định ở trên khi scroll.

**Tính năng:**

- ⭐ **Header cố định** khi scroll với border rõ ràng
- ⭐ **Pagination cố định** ở bottom, luôn hiển thị
- ⭐ **Chiều cao mặc định** tối ưu cho dữ liệu (12px cell height)
- ⭐ **Hover effects** mượt mà với transition
- ⭐ **Border ngăn cách** rõ ràng giữa header và body
- ⭐ **Empty state** với chiều cao cố định
- Hỗ trợ sticky columns
- Row selection
- Summary rows (top & bottom)

### 3. Pagination

Component phân trang độc lập, có thể tái sử dụng ở nhiều nơi khác nhau trong ứng dụng.

**Tính năng:**

- Điều hướng trang với nút First/Last, Prev/Next
- Hiển thị thông tin "Hiển thị X-Y trong tổng Z mục"
- Button states rõ ràng (active, hover, disabled)
- Smooth animations và transitions

## Usage

### PaginatedTable Example

```tsx
import { PaginatedTable } from "@/foundation/components/table";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

const MyComponent = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10);
  const [data, setData] = useState<Product[]>([]);

  const columns: ColumnDef<Product>[] = [
    {
      id: "stt",
      header: "STT",
      cell: (info) => info.row.index + 1,
      meta: { className: "text-center" },
      size: 60,
    },
    {
      id: "name",
      header: "Tên sản phẩm",
      accessorKey: "name",
      meta: { className: "font-medium" },
    },
    {
      id: "price",
      header: "Giá",
      accessorKey: "price",
      cell: (info) => `${info.getValue()?.toLocaleString()} VND`,
      meta: { align: "text-right", className: "font-bold text-success" },
    },
    {
      id: "stock",
      header: "Tồn kho",
      accessorKey: "stock",
      meta: { align: "text-center" },
    },
  ];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Fetch data for new page
    fetchData(newPage);
  };

  return (
    <PaginatedTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      page={page}
      totalPages={totalPages}
      totalItems={total}
      itemsPerPage={10}
      onPageChange={handlePageChange}
      showIndex={true}
      indexOffset={(page - 1) * 10}
      onRowClick={(row) => console.log("Row clicked:", row)}
      testId="products-table"
    />
  );
};
```

### Pagination Component

```tsx
import { Pagination } from "@/foundation/components/table";

const MyPagination = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 20;
  const totalItems = 200;
  const itemsPerPage = 10;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Fetch data for new page
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPageChange={handlePageChange}
      showFirstLast={true}
      showPrevNext={true}
      maxVisiblePages={5}
      testId="my-pagination"
    />
  );
};
```

## Features

### Colors từ colors.json

Tất cả components sử dụng màu sắc từ `colors.json`:

- **Primary**: `button-default`, `primary-6`, `primary-10`
- **Neutral**: `neutral-7`, `neutral-10` (text colors)
- **Dividers**: `divider-1`, `divider-2`
- **Background**: `background-1`, `cell-header`

### PaginatedTable Props

| Prop                 | Type                     | Default  | Description                                    |
| -------------------- | ------------------------ | -------- | ---------------------------------------------- |
| `columns`            | `ColumnDef[]`            | Required | Định nghĩa cột                                 |
| `data`               | `T[]`                    | Required | Dữ liệu hiển thị                               |
| `isLoading`          | `boolean`                | `false`  | Đang tải dữ liệu                               |
| `page`               | `number`                 | `1`      | Trang hiện tại                                 |
| `totalPages`         | `number`                 | `1`      | Tổng số trang                                  |
| `totalItems`         | `number`                 | -        | Tổng số items                                  |
| `itemsPerPage`       | `number`                 | `10`     | Items trên mỗi trang                           |
| `onPageChange`       | `(page: number) => void` | -        | Callback khi đổi trang                         |
| `showIndex`          | `boolean`                | `false`  | Hiển thị cột STT                               |
| `indexOffset`        | `number`                 | `0`      | Offset cho STT (dùng khi phân trang)           |
| `onRowClick`         | `(row: T) => void`       | -        | Callback khi click row                         |
| `showPagination`     | `boolean`                | `true`   | Hiển thị control phân trang                    |
| `showPaginationInfo` | `boolean`                | `true`   | Hiển thị thông tin "Hiển thị X-Y trong tổng Z" |

### Pagination Props

| Prop              | Type                     | Default  | Description                             |
| ----------------- | ------------------------ | -------- | --------------------------------------- |
| `currentPage`     | `number`                 | Required | Trang hiện tại                          |
| `totalPages`      | `number`                 | Required | Tổng số trang                           |
| `totalItems`      | `number`                 | -        | Tổng số items (để hiển thị info)        |
| `itemsPerPage`    | `number`                 | -        | Items trên mỗi trang (để hiển thị info) |
| `onPageChange`    | `(page: number) => void` | Required | Callback khi đổi trang                  |
| `showFirstLast`   | `boolean`                | `true`   | Hiển thị nút trang đầu/cuối             |
| `showPrevNext`    | `boolean`                | `true`   | Hiển thị nút trang trước/sau            |
| `maxVisiblePages` | `number`                 | `5`      | Số trang hiển thị tối đa                |

## Visual Design

### Layout & Spacing

- **Header**: Chiều cao 48px (h-12), font semibold, sticky khi scroll với border-bottom
- **Body Cells**: Chiều cao 48px (h-12), padding 16px (px-4)
- **Row Borders**: Border-bottom giữa các dòng để tách biệt rõ ràng
- **Pagination**: Cố định ở bottom với border-top

### Colors (từ colors.json)

```typescript
// Primary colors
bg-button-default  // Nền cho nút active (#0F3460)
text-button-text   // Text cho nút active (#FFFFFF)
hover:bg-primary-10 // Hover effect (#E9F0FF)

// Text hierarchy
text-neutral-10    // Text chính (active, bold)
text-neutral-6     // Text thứ cấp (inactive)
text-neutral-5     // Text phụ (ellipsis, placeholders)

// Backgrounds
bg-background-1    // Nền chính (#FFFFFF)
bg-cell-header     // Nền header (#F1F1F1)
bg-neutral-1       // Hover background (#FAFAFA)

// Borders & Dividers
border-divider-1   // Border chính (#E0E0E0)
border-divider-1   // Border giữa header và body
```

### Visual Enhancements

- ✨ **Hover states** mượt mà với transition-colors
- ✨ **Active page button** có scale và shadow
- ✨ **Row hover** thay đổi background nhẹ nhàng
- ✨ **Borders** tách biệt rõ ràng các phần
- ✨ **Empty state** với chiều cao 96px (h-24) trung tâm

## Enhanced Cells

Trong folder `enhance/` có các cell components đặc biệt:

- `PriceCell`: Hiển thị giá tiền với format
- `TickerCell`: Hiển thị ticker với icon
- `VolumeCell`: Hiển thị volume với format

## Notes

- Components đã được optimize với React.memo và useMemo
- Hỗ trợ sticky columns, summary rows
- Tự động scroll to top khi đổi trang
- Fully typed với TypeScript
- Responsive design
- Accessibility friendly với ARIA attributes
