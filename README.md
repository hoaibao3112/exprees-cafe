# ☕ Express Cafe — Corporate Portal & Admin Panel

> Dự án cổng thông tin doanh nghiệp, nhượng quyền và hệ thống quản trị chuỗi cửa hàng **Express Cafe**, được phát triển và vận hành bởi **Aizen World**.

Hệ thống được thiết kế theo kiến trúc hiện đại, phân tách hoàn toàn Frontend và Backend (Decoupled), tích hợp trang Client sang trọng và phân hệ Admin Panel tối ưu, phục vụ cho mục đích quảng bá thương hiệu, giới thiệu dịch vụ và nhượng quyền kinh doanh 0đ.

---

## 🚀 Công Nghệ & Kiến Trúc (Tech Stack)

Hệ thống sử dụng các công nghệ tiên tiến nhất nhằm tối ưu hóa hiệu năng, độ bảo mật và khả năng mở rộng:

### 💻 Frontend (Client & Admin)
* **Framework**: Next.js 16 (App Router) & React 19.
* **Styling**: Tailwind CSS v4 với cấu trúc định nghĩa màu sắc và token trong `@theme` (tối ưu hóa CSS dung lượng nhẹ).
* **State & Data Caching**: React Query (`@tanstack/react-query`) tối ưu bộ nhớ đệm và tự động đồng bộ trạng thái.
* **Form & Validation**: React Hook Form kết hợp với **Zod** để kiểm tra tính hợp lệ của dữ liệu đầu vào phía Client.
* **Icons**: `lucide-react` cho giao diện quản trị và bộ mã SVG nội tuyến (inline SVG) cho các liên kết mạng xã hội nhằm tăng tốc độ tải trang.

### ⚙️ Backend
* **Framework**: NestJS (kiến trúc Module, Dependency Injection chuẩn chỉnh).
* **Database & ORM**: PostgreSQL kết hợp với **TypeORM** để quản lý thực thể và di trú dữ liệu.
* **API Documentation**: Swagger UI tự động tạo tài liệu kiểm thử cho các endpoint tại `/docs`.
* **Security & Auth**: Xác thực Admin bằng cơ chế JWT kết hợp với Custom Guards (`@Public()` decorator dùng để chỉ định các route công khai).

---

## 🎨 Các Phân Hệ & Tính Năng Chính

### 1. 🌐 Cổng thông tin khách hàng (Client Portal)
* **Trang chủ (Homepage)**: Banner trượt (slideshow) động chất lượng cao, giới thiệu mô hình nhượng quyền 0đ cùng các chỉ số doanh nghiệp.
* **Trang Blog & Tin tức (`/blog`)**: Thiết kế lưới 2 cột hiện đại, hỗ trợ phân trang Client mượt mà, bộ lọc danh mục động (Tin tức F&B, kinh nghiệm, blog) và form đăng ký Newsletter.
* **Chi tiết bài viết (`/blog/[slug]`)**: Trang chuẩn SEO, tự động kết xuất mã HTML phong phú (Rich Text HTML) từ cơ sở dữ liệu.
* **Trang Dịch vụ (`/services`)**: Hiển thị các gói dịch vụ F&B. Tích hợp Drawer (Ngăn kéo) trượt từ góc phải màn hình cho phép xem chi tiết và đăng ký tư vấn trực tiếp.
* **Trang Nhượng quyền (`/franchise`)**: Giới thiệu các gói nhượng quyền 0đ linh hoạt (Express, Kiosk, Premium), biểu mẫu đăng ký hợp tác.
* **Trang Chi nhánh (`/branches`)**: Lọc 15 chi nhánh tự động theo khu vực (Trung tâm, Khu Đông, Khác). Xem chi tiết chi nhánh qua Drawer kèm giờ mở cửa, số điện thoại, định vị GPS và chỉ đường qua Google Maps.
* **Trang Liên hệ (`/contact`)**: Bản đồ Google Maps ghim chính xác địa chỉ văn phòng, form liên hệ xác thực Zod chặt chẽ.

### 2. 🔐 Hệ thống Quản trị (Admin Panel - `/admin`)
* **Dashboard Tổng quan**: Hiển thị các thẻ thống kê tổng quan (bài viết, chi nhánh, banners, liên hệ chưa đọc) cùng các danh sách rút gọn thao tác nhanh.
* **Quản lý Bài viết**: Tạo/Sửa/Xóa bài viết với cơ chế tự sinh Slug chuẩn SEO, Live HTML Preview trực quan khi soạn thảo.
* **Quản lý Chi nhánh**: Quản lý thông tin cửa hàng, số điện thoại, giờ hoạt động, trạng thái Flagship, tọa độ GPS bản đồ địa lý và ảnh storefront.
* **Quản lý Banner**: Giao diện dạng lưới thẻ (Grid) trực quan, cho phép thay đổi thứ tự hiển thị (`sortOrder`) bằng nút mũi tên, bật tắt nhanh `isActive`.
* **Quản lý Liên hệ**: Danh sách thư nhắn khách hàng chia tab (Chưa đọc / Đã đọc), xem chi tiết lời nhắn qua Modal và đánh dấu đã xử lý.
* **Cài đặt Hệ thống**: Cấu hình thông tin doanh nghiệp (hotline, mạng xã hội, trụ sở), tùy biến bố cục hiển thị các section trên trang chủ, thay đổi bảng màu chủ đạo (Color Picker).

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
exprees-cafe/
├── backend/                  # Mã nguồn NestJS API
│   ├── src/
│   │   ├── config/           # Cấu hình môi trường, DB
│   │   ├── modules/          # Các module (auth, content, branches, settings...)
│   │   └── main.ts           # Điểm khởi chạy ứng dụng
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # Mã nguồn Next.js Portal & Admin
│   ├── app/                  # Next.js App Router (pages & layouts)
│   ├── components/           # Các component dùng chung (layout, admin, ui)
│   ├── hooks/                # Custom React hooks & React Query hooks
│   ├── lib/                  # Tiện ích API, Axios client, helper utils
│   ├── store/                # Quản lý trạng thái client (Zustand...)
│   ├── tailwind.config.js    # Cấu hình phong cách
│   └── package.json
├── scraped_data/             # Thư mục chứa ảnh/dữ liệu mẫu cào từ thực tế
├── backend_documentation.md  # Tài liệu kỹ thuật chi tiết phía Backend
├── frontend_documentation.md # Tài liệu kỹ thuật chi tiết phía Frontend
└── admin_specification.md    # Đặc tả chi tiết các phân hệ của trang quản trị
```

---

## 🔧 Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu cầu hệ thống
* Node.js phiên bản 18 trở lên.
* PostgreSQL Database đang chạy cục bộ hoặc trên máy chủ đám mây.

---

### 1. Cấu hình & Chạy Backend (NestJS)

1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Cài đặt các gói thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Tạo tệp `.env` tại thư mục `/backend` và cấu hình các thông số kết nối:
   ```env
   PORT=3000
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=express_cafe
   JWT_SECRET=super_secret_key_aizen_world
   ```
4. Khởi chạy máy chủ ở chế độ phát triển (Development Mode):
   ```bash
   npm run start:dev
   ```
   > 💡 **Lưu ý**: Khi khởi chạy lần đầu, cơ chế Auto-Seeding sẽ tự động khởi tạo dữ liệu mẫu trong Postgres (15 chi nhánh, 2 banners, 12 bài viết chi tiết). Bạn có thể truy cập `http://localhost:3000/docs` để xem tài liệu Swagger API.

---

### 2. Cấu hình & Chạy Frontend (Next.js)

1. Di chuyển vào thư mục frontend:
   ```bash
   cd ../frontend
   ```
2. Cài đặt các gói thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Tạo tệp `.env.local` tại thư mục `/frontend` và khai báo API endpoint:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
   ```
4. Khởi chạy dự án ở chế độ phát triển:
   ```bash
   npm run dev
   ```
5. Mở trình duyệt và truy cập:
   * **Trang Portal khách hàng**: `http://localhost:3000` (hoặc cổng được hiển thị trên console).
   * **Trang Quản trị Admin**: `http://localhost:3000/admin` (Đăng nhập bằng tài khoản quản trị).

---

## ⚙️ Cơ Chế Đồng Bộ URL Ảnh khi Triển Khai (Deployment Cautions)
* Hệ thống lưu trữ các hình ảnh tĩnh trong thư mục upload của Backend.
* Hàm helper `resolveUploadUrl(path)` được sử dụng xuyên suốt ở Frontend để tự động chuẩn hóa URL ảnh từ dạng tương đối (`uploads/...`) hoặc tuyệt đối cục bộ (`http://localhost:3000/uploads/...`) thành URL chạy thực tế dựa trên biến môi trường `NEXT_PUBLIC_BACKEND_URL`. 
* Điều này giúp ứng dụng hoạt động trơn tru không bị lỗi CORS/Private Network Access khi triển khai trên Vercel/Netlify.

---

## 📝 Bản Quyền & Phát Triển
Dự án được bảo hộ bản quyền và phát triển bởi **AIZEN WORLD**. Mọi thông tin đóng góp hoặc phản hồi vui lòng gửi về hòm thư `info@aizenworld.com`. dev: Hoaibaodeptrai hẹ hẹ
