# 🚀 Hướng Dẫn Deploy Express Cafe lên VPS

## Yêu cầu
- VPS Ubuntu 20.04+
- Docker & Docker Compose đã cài

## Cài Docker (nếu chưa có)
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

## Các bước deploy

### 1. Clone code
```bash
git clone https://github.com/hoaibao3112/exprees-cafe.git
cd exprees-cafe
```

### 2. Tạo file .env
```bash
cp .env.example .env
nano .env
```
> Điền đầy đủ các giá trị thực vào file `.env` (JWT_SECRET, POS_API_KEY, POS_ADMIN_PASSWORD...)

### 3. (Tuỳ chọn) Copy database hiện tại
Nếu muốn giữ dữ liệu cũ, copy file `db.sqlite` vào thư mục backend:
```bash
# Chạy trên máy local
scp backend/db.sqlite user@VPS_IP:/path/to/exprees-cafe/backend/db.sqlite
```

### 4. Chạy ứng dụng
```bash
docker compose up -d --build
```

### 5. Kiểm tra
```bash
docker compose ps        # Xem trạng thái containers
docker compose logs -f   # Xem logs realtime
```

## Truy cập
- **Website:** `http://VPS_IP:3000`
- **Admin Panel:** `http://VPS_IP:3000/admin`
- **API Docs (Swagger):** Backend chạy nội bộ, không expose ra ngoài

## Cập nhật code mới
```bash
git pull
docker compose up -d --build
```

## Lệnh hay dùng
```bash
docker compose restart frontend   # Restart riêng frontend
docker compose restart backend    # Restart riêng backend
docker compose down               # Dừng tất cả
docker compose down && docker compose up -d --build  # Rebuild hoàn toàn
```
