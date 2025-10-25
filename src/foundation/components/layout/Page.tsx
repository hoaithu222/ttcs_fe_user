interface PageProps {
  children: React.ReactNode;
}

/**
 * Page
 *
 * Layout wrapper component dùng để bao toàn bộ nội dung 1 trang (page).
 *
 * Props:
 * - children: React.ReactNode — Nội dung của trang.
 *
 * Notes:
 * - Áp dụng style mặc định cho trang: font size `text-body-14`, màu chữ `text-neutral-9`, và kích thước `size-full`.
 * - Sử dụng để chuẩn hóa bố cục và style cơ bản cho toàn bộ page.
 *
 * Example:
 * ```tsx
 * <Page>
 *   <h1>Dashboard</h1>
 *   <p>Welcome to your dashboard.</p>
 * </Page>
 * ```
 */
const Page: React.FC<PageProps> = ({ children }) => (
  <div className="text-body-14 size-full text-neutral-9">{children}</div>
);

export default Page;
