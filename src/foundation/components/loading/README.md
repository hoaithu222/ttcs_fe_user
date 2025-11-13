# Loading Component

Component loading đa dạng để sử dụng với React Suspense và các trạng thái loading khác trong ứng dụng.

## Tính năng

- ✅ **Nhiều variant**: spinner, dots, pulse, skeleton
- ✅ **Nhiều kích thước**: sm, md, lg, xl
- ✅ **Nhiều layout**: fullscreen, centered, inline
- ✅ **Tùy chỉnh message**: Hiển thị thông báo khi đang tải
- ✅ **Tương thích Suspense**: Sử dụng làm fallback cho React Suspense
- ✅ **Tailwind CSS**: Sử dụng Tailwind CSS theo chuẩn project

## Cách sử dụng

### 1. Với React Suspense

```tsx
import { Suspense } from "react";
import { Loading } from "@/foundation/components/loading";

const MyComponent = () => {
  return (
    <Suspense fallback={<Loading layout="fullscreen" variant="spinner" />}>
      <LazyComponent />
    </Suspense>
  );
};
```

### 2. Loading Fullscreen

```tsx
import { Loading } from "@/foundation/components/loading";

// Fullscreen với spinner
<Loading layout="fullscreen" variant="spinner" message="Đang tải..." />

// Fullscreen với dots
<Loading layout="fullscreen" variant="dots" size="lg" />
```

### 3. Loading Centered

```tsx
import { Loading } from "@/foundation/components/loading";

// Centered trong container
<div className="h-96">
  <Loading layout="centered" variant="pulse" size="xl" />
</div>;
```

### 4. Loading Inline

```tsx
import { Loading } from "@/foundation/components/loading";

// Inline loading
<Loading variant="spinner" size="sm" />;
```

### 5. Skeleton Loading

```tsx
import { Loading } from "@/foundation/components/loading";

// Skeleton cho content đang tải
<Loading variant="skeleton" layout="centered" />;
```

## Props

| Prop         | Type                                           | Default     | Mô tả                                               |
| ------------ | ---------------------------------------------- | ----------- | --------------------------------------------------- |
| `variant`    | `"spinner" \| "dots" \| "pulse" \| "skeleton"` | `"spinner"` | Loại loading indicator                              |
| `size`       | `"sm" \| "md" \| "lg" \| "xl"`                 | `"md"`      | Kích thước loading                                  |
| `layout`     | `"fullscreen" \| "inline" \| "centered"`       | `"inline"`  | Cách hiển thị loading                               |
| `message`    | `string`                                       | `undefined` | Thông báo hiển thị khi đang tải                     |
| `className`  | `string`                                       | `""`        | CSS classes bổ sung                                 |
| `fullScreen` | `boolean`                                      | `undefined` | (Deprecated) Sử dụng `layout="fullscreen"` thay thế |

## Variants

### Spinner

Loading indicator dạng xoay tròn, sử dụng icon `Loader2` từ lucide-react.

```tsx
<Loading variant="spinner" size="md" />
```

### Dots

Ba chấm nhảy lên xuống với animation bounce.

```tsx
<Loading variant="dots" size="lg" />
```

### Pulse

Vòng tròn phóng to thu nhỏ với animation pulse.

```tsx
<Loading variant="pulse" size="xl" />
```

### Skeleton

Hiển thị skeleton loading cho content.

```tsx
<Loading variant="skeleton" layout="centered" />
```

## Sizes

- `sm`: Kích thước nhỏ (4x4 cho spinner)
- `md`: Kích thước trung bình (6x6 cho spinner) - **Mặc định**
- `lg`: Kích thước lớn (8x8 cho spinner)
- `xl`: Kích thước rất lớn (12x12 cho spinner)

## Layouts

### Fullscreen

Hiển thị full màn hình với backdrop blur, phù hợp cho Suspense fallback.

```tsx
<Loading layout="fullscreen" />
```

### Centered

Căn giữa trong container, phù hợp cho loading trong một section.

```tsx
<Loading layout="centered" />
```

### Inline

Hiển thị inline, phù hợp cho button loading hoặc inline loading.

```tsx
<Loading layout="inline" />
```

## Ví dụ sử dụng với Router

```tsx
import { Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Loading } from "@/foundation/components/loading";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense
        fallback={<Loading layout="fullscreen" variant="spinner" message="Đang tải trang..." />}
      >
        <HomePage />
      </Suspense>
    ),
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};
```

## Ví dụ sử dụng với Lazy Loading

```tsx
import { lazy, Suspense } from "react";
import { Loading } from "@/foundation/components/loading";

const LazyComponent = lazy(() => import("./LazyComponent"));

const App = () => {
  return (
    <Suspense fallback={<Loading layout="fullscreen" variant="dots" size="lg" />}>
      <LazyComponent />
    </Suspense>
  );
};
```
