# ĐẶC TẢ GIAO DIỆN ADMIN PANEL (PROMPT FOR AI / SWITCH.GG)

Tài liệu này cung cấp toàn bộ đặc tả chi tiết về **Tech Stack**, **Database Schema thực tế từ Backend** và **Cấu trúc Giao diện** của dự án **Express Cafe**. Bạn có thể copy toàn bộ nội dung file này làm prompt cho AI (như switch.gg hoặc v0.dev) để sinh ra giao diện Admin Panel khớp 100% với hệ thống thực tế.

---

## 1. TECH STACK & DESIGN SYSTEM
- **Frontend**: Next.js 16 (App Router) + React 19 + Tailwind CSS v4.
- **Backend**: NestJS + TypeORM + PostgreSQL (đã có sẵn).
- **Màu sắc chủ đạo**: Nền tối sang trọng (`#0d0d1a` / `#13131f`), màu nhấn (Primary) là màu cam ấm áp cà phê (`#f97316` / `orange-500`), border mờ (`border-white/6`).
- **Icons**: `lucide-react`.
- **Yêu cầu UI**: Không dùng thư viện UI nặng, tự build component bằng class Tailwind thuần. Thiết kế Responsive (Mobile, Tablet, Desktop).

---

## 2. CHI TIẾT THỰC THỂ DATABASE (BACKEND ENTITIES)
AI cần phải thiết kế các Form Input khớp chính xác với các thuộc tính của các Entity dưới đây:

### 2.1 Thực thể Bài viết (Article Entity)
- **Tên bảng**: `articles`
- **Các thuộc tính**:
  - `id`: UUID (Primary Key)
  - `blogHandle`: string (`'news'` | `'blog'` | `'services'`) — *Danh mục bài viết*
  - `title`: string — *Tiêu đề*
  - `slug`: string (unique) — *Đường dẫn tĩnh*
  - `contentHtml`: string (kiểu dữ liệu `text` trong DB) — *Nội dung bài viết (Chứa HTML)*
  - `imageUrl`: string (nullable) — *Link ảnh đại diện*
  - `status`: string (mặc định `'PUBLISHED'` hoặc `'DRAFT'`) — *Trạng thái phát hành*
  - `authorId`: string (nullable) — *ID của Admin viết bài*
  - `publishedAt`: Date (timestamp, nullable)
  - `createdAt` & `updatedAt`: Date (timestamp)

### 2.2 Thực thể Chi nhánh (Branch Entity)
- **Tên bảng**: `branches`
- **Các thuộc tính**:
  - `id`: UUID (Primary Key)
  - `name`: string — *Tên chi nhánh*
  - `address`: string — *Địa chỉ cửa hàng*
  - `lat`: double precision (number) — *Vĩ độ địa lý GPS*
  - `lng`: double precision (number) — *Kinh độ địa lý GPS*
  - `phone`: string (nullable) — *Số điện thoại chi nhánh*
  - `openingHours`: JSONB (object dạng `{ "open": "07:00", "close": "22:00" }`) — *Khung giờ hoạt động*
  - `status`: string (mặc định `'ACTIVE'`, có `'INACTIVE'` hoặc `'BUSY'`) — *Trạng thái hoạt động*
  - `isFlagship`: boolean (mặc định `false`) — *Có phải cửa hàng lớn tiêu chuẩn hay không*
  - `imageUrl`: string (nullable) — *Link hình ảnh cửa hàng*
  - `createdAt` & `updatedAt`: Date (timestamp)

### 2.3 Thực thể Banner (Banner Entity)
- **Tên bảng**: `banners`
- **Các thuộc tính**:
  - `id`: UUID (Primary Key)
  - `title`: string — *Tiêu đề banner*
  - `imageUrl`: string — *Đường dẫn ảnh slide*
  - `linkUrl`: string (nullable) — *Đường dẫn khi click banner (Ví dụ: /promotions)*
  - `position`: string (mặc định `'HOME_HERO'`) — *Vị trí hiển thị*
  - `sortOrder`: number (mặc định `0`) — *Thứ tự sắp xếp*
  - `isActive`: boolean (mặc định `true`) — *Trạng thái hiển thị*
  - `startsAt` & `endsAt`: Date (timestamp, nullable) — *Thời gian chạy sự kiện*
  - `createdAt`: Date (timestamp)

---

## 3. DANH SÁCH TRANG & CẤU TRÚC GIAO DIỆN (UI FLOW)

### 3.1 Trang Đăng nhập (Login - /admin/login)
- **Giao diện**: Nền tối, Form nằm chính giữa màn hình (Không chứa Sidebar/Header quản trị).
- **Các trường**: Email + Password.
- **Validation**: Email đúng định dạng, mật khẩu >= 6 ký tự.
- **Gọi API**: `POST /api/v1/auth/admin/login` (Lưu token vào cookie `admin_token` khi thành công).

### 3.2 Dashboard Tổng quan (/admin)
- **4 Thẻ thống kê (Stat Cards)**:
  - Tổng bài viết (Articles count)
  - Tổng chi nhánh (Branches count)
  - Banner đang hoạt động (Active banners count)
  - Lời nhắn liên hệ chưa xử lý (Unread contacts count)
- **2 Danh sách rút gọn**:
  - 5 bài viết mới nhất (Recent Articles).
  - 5 liên hệ mới gửi (Recent Contacts).

### 3.3 Quản lý Bài viết (/admin/articles)
- **Articles List**: Dạng bảng hiển thị Tiêu đề, Danh mục, Trạng thái (Published/Draft), Ngày tạo. Có ô tìm kiếm tiêu đề, bộ lọc danh mục và bộ lọc trạng thái. Nút chuyển đổi nhanh Publish/Unpublish, nút Xóa kèm Dialog Xác nhận.
- **Form Tạo/Sửa bài viết**:
  - Input Tiêu đề.
  - Input Slug (tự động tạo từ tiêu đề bằng slugify nhưng cho phép sửa tay).
  - Dropdown chọn Danh mục (`news` | `blog` | `services`).
  - Input Link ảnh đại diện + Khung hiển thị trước ảnh (Live Image Preview).
  - Textarea lớn soạn thảo mã HTML nội dung (`contentHtml`) kèm Tab xem trước kết quả trực quan (Live HTML Preview).
  - Toggle chọn trạng thái `PUBLISHED` / `DRAFT`.

### 3.4 Quản lý Chi nhánh (/admin/branches)
- **Branches List**: Bảng hiển thị Tên, Địa chỉ, Số điện thoại, Giờ mở/đóng cửa, Flagship Badge, Nút bật/tắt hoạt động nhanh.
- **Form Thêm/Sửa chi nhánh**:
  - Tên chi nhánh, Địa chỉ.
  - Số điện thoại.
  - Giờ mở cửa & Giờ đóng cửa (được chuyển đổi thành object `{open, close}` khi lưu).
  - Tọa độ GPS: Vĩ độ (lat), Kinh độ (lng).
  - Toggle chuyển đổi Flagship (isFlagship: true/false).
  - Input Link ảnh chi nhánh + Image Preview.

### 3.5 Quản lý Banner (/admin/banners)
- **Giao diện**: Dạng lưới thẻ (Grid Cards) trực quan hiển thị hình ảnh banner, kèm nút mũi tên Lên/Xuống để thay đổi thứ tự sắp xếp (`sortOrder`), nút Toggle ẩn/hiện (`isActive`).
- **Inline Editing**: Khi bấm Chỉnh sửa, hiển thị form chỉnh sửa trực tiếp Tiêu đề, Link URL, Ảnh URL ngay trên thẻ mà không cần chuyển trang.

### 3.6 Quản lý Liên hệ (/admin/contacts)
- **Giao diện**: Bảng lời nhắn khách hàng phân thành các Tab (Tất cả / Chưa đọc / Đã đọc).
- **Xem chi tiết (Modal)**: Khi click vào dòng liên hệ, mở Modal popup hiển thị toàn bộ nội dung tin nhắn, số điện thoại, ngày gửi và tự động đánh dấu Đã xử lý (gọi API markRead).

### 3.7 Cài đặt hệ thống (/admin/settings)
- **Giao diện**: Chia thành 3 Tab cấu hình chính:
  1. **General**: Tên thương hiệu, Slogan, Logo URL, Favicon URL, Email/SĐT hotline, Địa chỉ trụ sở, Các link mạng xã hội (Facebook, Youtube, Tiktok).
  2. **Homepage**: Bật/tắt Hero Section (kèm chỉnh sửa Heading, Subtitle, CTA Text, CTA Link, Ảnh nền Hero), Bật/tắt slideshow, Bật/tắt Section Blog (kèm tiêu đề & chọn số lượng 3/6/9 bài), Bật/tắt Section Chi nhánh & Dịch vụ.
  3. **Appearance**: Chọn màu sắc chủ đạo (Primary color - Color picker), Màu phụ (Secondary color - Color picker), Bật/tắt Dark Mode mặc định.
- **Gọi API**: `GET /admin/settings` và `PUT /admin/settings`.
