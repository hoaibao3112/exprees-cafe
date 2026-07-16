# Tài Liệu Kỹ Thuật Backend - Express Cafe

Tài liệu này được biên soạn chi tiết dành cho các lập trình viên hoặc AI tiếp quản dự án Express Cafe để hiểu rõ kiến trúc, mô hình dữ liệu (Database Schema), luồng API và cơ chế Seeding tự động ở phía Backend (NestJS + TypeORM + PostgreSQL).

---

## 1. Công Nghệ & Thư Viện Sử Dụng (Tech Stack)
* **Framework**: NestJS phiên bản production-complete.
* **ORM**: TypeORM kết hợp với cơ sở dữ liệu **PostgreSQL**.
* **API Documentation**: `@nestjs/swagger` để tự động hóa tài liệu các endpoints.
* **Authentication**: JWT kết hợp với Custom Guards (`@Public()` decorator dùng để chỉ định các route công khai không cần token).

---

## 2. Thay Đổi Trong Mô Hình Thực Thể (Database Entities)

### 2.1. Thực Thể Chi Nhánh (Branch Entity - [branch.entity.ts](file:///d:/TrangWebCongTy/exprees-cafe/backend/src/modules/branches/entities/branch.entity.ts))
* **Bổ sung cột**: Thêm cột `imageUrl` kiểu `varchar(255)` để lưu trữ đường dẫn ảnh thực tế hoặc ảnh Unsplash của cửa hàng.
```typescript
@Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
imageUrl: string;
```

### 2.2. Thực Thể Bài Viết (Article Entity - [article.entity.ts](file:///d:/TrangWebCongTy/exprees-cafe/backend/src/modules/content/entities/article.entity.ts))
* **Bổ sung cột**: Thêm cột `imageUrl` kiểu `varchar(255)` để lưu ảnh đại diện (Featured Thumbnail Image) của bài viết/tin tức/dịch vụ.
```typescript
@Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
imageUrl: string;
```

---

## 3. Hệ Thống Dữ Liệu Tự Động (Auto-Seeding System)
Cơ chế tự động khởi tạo dữ liệu mẫu chạy khi ứng dụng NestJS được khởi động lần đầu thông qua hook `OnApplicationBootstrap`.

### 3.1. Seeding Chi Nhánh ([branches.service.ts](file:///d:/TrangWebCongTy/exprees-cafe/backend/src/modules/branches/branches.service.ts))
* **Cơ chế**: Kiểm tra số lượng bản ghi trong bảng `branches`. Nếu bằng 0, tiến hành chèn **15 chi nhánh** mẫu.
* **Thông tin chi nhánh**:
  * Các khu vực: Quận 1, Quận 3, Quận 4, Quận 7, Quận 10, Quận 12, Bình Thạnh, Gò Vấp, Thủ Đức.
  * Mỗi chi nhánh được gắn tọa độ vĩ độ/kinh độ chính xác, số điện thoại liên lạc, giờ mở cửa và đường dẫn hình ảnh thực tế chất lượng cao.

### 3.2. Seeding Nội Dung ([content.service.ts](file:///d:/TrangWebCongTy/exprees-cafe/backend/src/modules/content/content.service.ts))
* **Cơ chế**: Kiểm tra và tự động khởi tạo:
  * **2 Banners trang chủ** (Signature Cold Brew, Khởi đầu ngày mới).
  * **12 Bài viết chất lượng cao**:
    * **7 Bài viết Tin Tức F&B / Kinh Nghiệm (`news`/`blog`)**: Chứa tiêu đề chi tiết, các đoạn văn bản dài, các ảnh minh họa nội dung chất lượng cao.
    * **5 Dịch vụ đặc thù đối tác (`services`)**:
      1. *Cung cấp cà phê hạt sỉ chất lượng cao* (`cung-cap-ca-phe-hat-si-chat-luong-cao`).
      2. *Dịch vụ cho thuê máy pha cà phê* (`dich-vu-cho-thue-may-pha-ca-phe-cho-van-phong`).
      3. *Đào tạo pha chế và chuyển giao công thức* (`dao-tao-pha-che-va-chuyen-giao-cong-thuc`).
      4. *Tư vấn thiết kế và setup quán cà phê* (`tu-van-thiet-ke-va-setup-quan-ca-phe`).
      5. *Dịch vụ nhượng quyền xe cà phê take away* (`nhuong-quyen-xe-ca-phe-take-away-0-dong`).

---

## 4. Danh Sách API Endpoints (API Routes)

Tất cả các tuyến đường API đều nằm dưới tiền tố cấu hình `/api/v1/content`.

### 4.1. Lấy tất cả bài viết
* **Endpoint**: `GET /api/v1/content/articles`
* **Quyền truy cập**: Public (Công khai)
* **Chức năng**: Trả về danh sách toàn bộ các bài viết (bao gồm tin tức, blogs và dịch vụ) có trạng thái `PUBLISHED`.

### 4.2. Lấy chi tiết bài viết theo Slug
* **Endpoint**: `GET /api/v1/content/articles/:slug`
* **Quyền truy cập**: Public (Công khai)
* **Chức năng**: Nhận giá trị `slug` từ Client, tìm kiếm trong Postgres và trả về chi tiết toàn bộ nội dung HTML bài viết. Nếu không tìm thấy, ném ra lỗi `404 NotFoundException`.

### 4.3. Lấy Slideshow Banners trang chủ
* **Endpoint**: `GET /api/v1/content/banners`
* **Quyền truy cập**: Public (Công khai)
* **Chức năng**: Trả về danh sách các biểu ngữ quảng cáo đang kích hoạt (`isActive = true`) được sắp xếp theo thứ tự hiển thị `sortOrder`.

---

## 5. Hướng Dẫn Vận Hành và Phát Triển (For Developers)

1. **Khởi chạy máy chủ ở chế độ phát hiện thay đổi (Watch Mode)**:
   ```bash
   cd backend
   npm run start:dev
   ```
2. **Kiểm tra Swagger Docs**:
   * Khi server NestJS khởi động, bạn có thể truy cập `http://localhost:3000/docs` trên trình duyệt để kiểm tra trực tiếp danh sách API, định dạng dữ liệu đầu vào/đầu ra và chạy thử các yêu cầu tương tác.
3. **Reset/Cập nhật dữ liệu mẫu (Seeding)**:
   * Nếu muốn chạy lại Seeding từ đầu, hãy xóa hoặc truncate các bảng `articles`, `banners`, `branches` trong PostgreSQL rồi khởi động lại server NestJS.
