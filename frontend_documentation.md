# Tài Liệu Kỹ Thuật Frontend - Express Cafe

Tài liệu này được biên soạn chi tiết dành cho các lập trình viên hoặc AI tiếp quản dự án Express Cafe để hiểu rõ kiến trúc, các trang mới thiết kế, cách thức hoạt động và luồng dữ liệu trên Frontend (Next.js 16 + React 19 + Tailwind CSS v4).

---

## 1. Công Nghệ & Thư Viện Sử Dụng (Tech Stack)
* **Framework**: Next.js 16 (App Router) với **React 19** chạy ở chế độ standalone.
* **Styling**: Tailwind CSS v4 sử dụng trực tiếp các token màu trong `@theme` (`app/globals.css`).
* **Icons**: `lucide-react` để hiển thị các biểu tượng trực quan.
* **Form & Validation**: `react-hook-form` kết hợp cùng **Zod** (`@hookform/resolvers/zod`) để quản lý trạng thái form và kiểm tra dữ liệu nghiêm ngặt.
* **State Management & Caching**: `@tanstack/react-query` để quản lý các truy vấn API từ Backend NestJS, tối ưu hóa bộ nhớ đệm (caching) và tự động đồng bộ dữ liệu.

---

## 2. Các Thành Phần Giao Diện Chung (Global Components)

### 2.1. Header Component ([Header.tsx](file:///d:/TrangWebCongTy/exprees-cafe/frontend/components/layout/Header.tsx))
* **Mô tả**: Thanh điều hướng cao cấp, đáp ứng responsive hoàn chỉnh (tự động thu nhỏ trên điện thoại di động).
* **Đặc điểm nổi bật**:
  * Chứa logo Express Cafe nổi bật cùng biểu tượng linh vật (mascot).
  * Hiển thị trạng thái tích cực (active highlight) của liên kết hiện tại bằng màu cam đặc trưng (`text-orange-500`).
  * Thực hiện cơ chế ngăn chặn tràn trang bằng menu hamburger dạng ngăn kéo mượt mà trên mobile.

### 2.2. Footer Component ([Footer.tsx](file:///d:/TrangWebCongTy/exprees-cafe/frontend/components/layout/Footer.tsx))
* **Mô tả**: Khối chân trang được thiết kế lại theo tông màu sáng (Light Theme) gồm các dải màu trắng sữa và trắng tinh khiết xếp lớp.
* **Cập nhật thông tin doanh nghiệp**:
  * Đơn vị quản lý thương hiệu: **AIZEN WORLD**.
  * Địa chỉ trụ sở chính: `112 Lý Phục Man, Phường Tân Thuận, Quận 7, Thành phố Hồ Chí Minh`.
  * Điện thoại liên hệ: `0362 077 399`.
  * Email liên lạc: `info@aizenworld.com`.
  * Bản đồ & Hệ thống liên kết: Chứa các liên kết mạng xã hội (Facebook, Youtube, Tiktok) sử dụng mã SVG nội tuyến (inline SVG) để tránh lỗi import biểu tượng từ thư viện ngoài.

---

## 3. Kiến Trúc Các Trang Mới Redesign & Tích Hợp

### 3.1. Trang Blog & Tin Tức (`/blog` - [page.tsx](file:///d:/TrangWebCongTy/exprees-cafe/frontend/app/blog/page.tsx))
* **Bố cục (Layout)**: Gồm 2 cột (Double Column Grid) hiện đại trên nền xám nhẹ.
  * **Cột chính (Trái - 8 cols)**: Hiển thị lưới bài viết dạng Card.
  * **Cột Sidebar (Phải - 4 cols)**: Hiển thị danh mục lọc và các bài viết mới nhất.
* **Xử lý dữ liệu động**:
  * Sử dụng hook `useArticlesQuery` để lấy tất cả bài viết từ PostgreSQL.
  * Loại bỏ các bài viết dạng Dịch vụ (có `blogHandle === 'services'`), chỉ hiển thị các bài viết tin tức/kinh nghiệm (`news` hoặc `blog`).
* **Tính năng lọc nhanh (Category Filtering)**: Các nút lọc danh mục động (Tất cả, Tin tức F&B, Kinh nghiệm/Blogs) tự động cập nhật số lượng bài viết tương ứng có trong cơ sở dữ liệu.
* **Điều hướng chi tiết trực tiếp**:
  * Loại bỏ cơ chế hiển thị modal popup cũ.
  * Toàn bộ phần ảnh đại diện, tiêu đề bài viết và nút **"ĐỌC TIẾP"** đều được bọc trong thẻ `<Link href={`/blog/${article.slug}`}>` của Next.js để thực hiện chuyển hướng trực tiếp đến đường dẫn chi tiết.
* **Phân trang (Pagination)**: Tính toán phân trang phía Client dựa trên hằng số `ARTICLES_PER_PAGE = 6`, tích hợp hiệu ứng cuộn mượt (smooth scroll) lên đầu trang mỗi khi chuyển trang.
* **Đăng ký nhận bản tin (Newsletter)**: Pre-footer form thu thập email khách hàng, ngăn chặn gửi trùng lặp và phản hồi thông báo thành công dạng nhấp nháy (pulse glow).

### 3.2. Trang Chi Tiết Bài Viết (`/blog/[slug]` - [page.tsx](file:///d:/TrangWebCongTy/exprees-cafe/frontend/app/blog/%5Bslug%5D/page.tsx))
* **Xử lý React 19 / Next.js 16 Asynchronous `params`**:
  * Trong Next.js 16, `params` được truyền dưới dạng một `Promise`. Lập trình viên bắt buộc phải sử dụng API unwrap không đồng bộ:
    ```tsx
    const { slug } = React.use(params);
    ```
* **Lấy dữ liệu**: Gọi hook `useArticleBySlugQuery(slug)` để truy vấn thông tin chi tiết bài viết trực tiếp từ API Backend theo `slug`.
* **Hiển thị**: Renders giao diện bài viết chuẩn SEO, sử dụng thẻ `dangerouslySetInnerHTML` để hiển thị bài viết định dạng phong phú (Rich Text HTML) từ Backend kết hợp các Tailwind classes trong `prose prose-zinc` để định dạng đẹp mắt cho ảnh, danh mục và các khối trích dẫn.

### 3.3. Trang Liên Hệ (`/contact` - [page.tsx](file:///d:/TrangWebCongTy/exprees-cafe/frontend/app/contact/page.tsx))
* **Bản đồ bên trái**: Bản đồ Google Maps iframe chiếm chiều cao toàn cột (`h-[450px]` hoặc `lg:h-[600px]`) ghim chính xác địa chỉ số `112 Lý Phục Man, Quận 7`.
* **Cột thông tin bên phải**: 
  * Hiển thị danh thiếp thông tin liên lạc của **AIZEN WORLD** sắc nét.
  * **Zod Validation Form**:
    * Sử dụng Zod để định nghĩa schema kiểm tra lỗi đầu vào chặt chẽ (`contactSchema`):
      * `name`: Bắt buộc điền (tối thiểu 2 ký tự).
      * `email`: Phải là định dạng email hợp lệ.
      * `phone`: Định dạng số điện thoại Việt Nam hợp lệ.
      * `message`: Nội dung tin nhắn tối thiểu 10 ký tự.
    * Tích hợp `react-hook-form` để hiển thị cảnh báo lỗi tức thì bên dưới từng ô nhập liệu màu đỏ và hiển thị màn hình chúc mừng màu xanh lá khi gửi biểu mẫu thành công.

### 3.4. Trang Dịch Vụ (`/services` - [page.tsx](file:///d:/TrangWebCongTy/exprees-cafe/frontend/app/services/page.tsx))
* **Dữ liệu**: Lấy danh sách dịch vụ bằng hook mới `useServicesQuery` (lọc các bài viết có `blogHandle === 'services'`).
* **Hiển thị**: Lưới các gói dịch vụ F&B. Khi nhấn **"XEM CHI TIẾT"**, một ngăn kéo (Drawer Overlay) sẽ trượt từ góc phải màn hình hiển thị nội dung chi tiết cùng biểu mẫu đăng ký tư vấn được xác thực tức thời.

### 3.5. Trang Chi Nhánh (`/branches` - [page.tsx](file:///d:/TrangWebCongTy/exprees-cafe/frontend/app/branches/page.tsx))
* **Lọc khu vực**: Phân loại **15 chi nhánh** từ database thành 3 tab khu vực chính xác: "Trung tâm", "Khu Đông" và "Khu vực khác" dựa trên thuộc tính `district` của đối tượng Chi nhánh.
* **Chi tiết ngăn kéo (Drawer Details)**: Nhấp vào chi nhánh sẽ mở một bảng thông tin chi tiết hiển thị ảnh thực tế, giờ mở cửa, số điện thoại, tọa độ GPS ghim hiển thị và liên kết chỉ đường dẫn đến Google Maps.

---

## 4. Các React Query Hooks Liên Quan ([useContentQueries.ts](file:///d:/TrangWebCongTy/exprees-cafe/frontend/hooks/useContentQueries.ts))
Đã đăng ký thêm các hàm xử lý mới:
1. `useArticleBySlugQuery(slug)`: Gửi yêu cầu GET tới `/content/articles/${slug}` để trả về đối tượng bài viết duy nhất.
2. `useServicesQuery()`: Tải toàn bộ bài viết và lọc các bản ghi dịch vụ hỗ tác đối tác (`blogHandle === 'services'`).

---

## 5. Hướng Dẫn Bảo Trì và Kiểm Tra Lỗi (Troubleshooting)
1. **Lỗi Trắng Trang khi Vào Chi Tiết**: Kiểm tra xem bài viết đó đã được xuất bản (status là `PUBLISHED`) trên Database chưa, và giá trị `slug` truyền trên đường dẫn có khớp 100% với giá trị lưu trong cơ sở dữ liệu NestJS không.
2. **Biên dịch thử nghiệm trước khi bàn giao**: Luôn chạy lệnh dưới đây ở thư mục `frontend` để kiểm tra lỗi kiểu dữ liệu:
   ```bash
   npm run build
   ```
