# 📥 Express Cafe Scraped Data & Assets

This directory contains the complete structured data and downloaded images scraped from `https://expresscafe.com.vn` for the corporate news, blogs, and branch locator pages.

---

## 📂 Directory Structure

```directory
scraped_data/
├── news_articles.json       # 6 articles crawled from /blogs/news
├── blog_articles.json       # 6 articles crawled from /blogs/blog
├── branches.json            # 20 branches crawled from /collections/cac-chi-nhanh-cua-chung-toi
├── parse_and_download.js    # Node.js crawler & image-download utility script
└── images/                  # Complete downloaded assets
    ├── news/                # 6 high-res news feature images
    ├── blog/                # 6 high-res blog feature images
    └── branches/            # 20 high-res branch storefront images
```

---

## 📋 Summary of Scraped Resources

### 📰 1. News Articles (`news_articles.json`)
We successfully extracted **6 corporate news articles** along with their titles, publish dates, summaries, links, and high-res feature images:

| # | Date | Title | Image Path | Original CDN Link |
|---|------|-------|------------|-------------------|
| 1 | 03-02-2026 | GIẢI PHÁP TỐI ƯU CHO CHỦ QUÁN - GIÁ THUÊ MÁY CAFE CHỈ BẰNG 1 LY CÀ PHÊ/NGÀY | `/scraped_data/images/news/giai-phap-toi-uu-cho-chu-quan-gia-thue-may-cafe-chi-bang-1-ly-ca-phe-ngay.png` | [Link](https://cdn.hstatic.net/files/200000915205/article/to_roi_a5_mat_2_a4910e7acc9a40abacc5e01faf4437bf_grande.png) |
| 2 | 29-01-2026 | CHÚC MỪNG CHỊ NHI CHÍNH THỨC KHAI TRƯƠNG XE CÀ PHÊ TAKE AWAY EXPRESS CAFE TẠI CONIC GARDEN – BÌNH CHÁNH | `/scraped_data/images/news/chuc-mung-chi-nhi-chinh-thuc-khai-truong-xe-ca-phe-take-away-express-cafe-tai-conic-garden-binh-chanh.png` | [Link](https://cdn.hstatic.net/files/200000915205/article/1_c57b2a2b0eda4ac1ad0a22e70d77bc1f_grande.png) |
| 3 | 19-01-2026 | ĐỪNG ĐỂ MÁY PHA CAFE LỖI NGAY MÙA TẾT CAO ĐIỂM! | `/scraped_data/images/news/dung-de-may-pha-cafe-loi-ngay-mua-tet-cao-diem.png` | [Link](https://cdn.hstatic.net/files/200000915205/article/cover_bai_viet_dfa42437c7d643b1b901b4ff08d0e398_grande.png) |
| 4 | 01-01-2026 | DỊCH VỤ SỬA MÁY CÀ PHÊ CHUYÊN NGHIỆP TẠI EXPRESS CAFE | `/scraped_data/images/news/dich-vu-sua-may-ca-phe-chuyen-nghiep-tai-express-cafe.png` | [Link](https://cdn.hstatic.net/files/200000915205/article/fanpage_ky_thuat_7dbd112e9c2741dd815ebaeb55509cb0_grande.png) |
| 5 | 31-12-2025 | "VÒNG QUAY PHÁT TÀI - 100% QUAY LÀ TRÚNG" CHÍNH THỨC CẬP BẾN EXPRESS CAFE | `/scraped_data/images/news/vong-quay-phat-tai-100-quay-la-trung-chinh-thuc-cap-ben-express-cafe.png` | [Link](https://cdn.hstatic.net/files/200000915205/article/bia_tin_tuc_website_6d8a19e7f9de486e86b8c7e8662c6cd1_grande.png) |
| 6 | 10-12-2025 | 🎄 VÒNG QUAY GIÁNG SINH EXPRESS CAFE – 100% QUAY LÀ TRÚNG! 🎉 | `/scraped_data/images/news/vong-quay-giang-sinh-express-cafe-100-quay-la-trung.png` | [Link](https://cdn.hstatic.net/files/200000915205/article/anh_cover_tin_tuc_website_e1bdadf47a094e32b97b765d94013a90_grande.png) |

---

### ✍️ 2. Blog Posts (`blog_articles.json`)
We successfully extracted **6 rich blog posts** along with their titles, publish dates, summaries, links, and high-res feature images:

| # | Date | Title | Image Path | Original CDN Link |
|---|------|-------|------------|-------------------|
| 1 | 30-03-2026 | Cà Phê Caffeto: Khởi Nghiệp Từ Di Sản Gia Đình Tại Cornelius, Bắc Carolina | `/scraped_data/images/blog/ca-phe-caffeto-khoi-nghiep-tu-di-san-gia-dinh-tai-cornelius-bac-carolina.png` | [Link](https://cdn.hstatic.net/files/200000915205/article/anh_chup_man_hinh_2026-03-11_luc_15.18.18_fee554d3248e4d78aa1f02d465d2dfe3_grande.png) |
| 2 | 27-03-2026 | Probat Ra Mắt Dòng Máy Xay Cà Phê GT Series | `/scraped_data/images/blog/probat-ra-mat-dong-may-xay-ca-phe-gt-series.png` | [Link](https://cdn.hstatic.net/files/200000915205/article/anh_chup_man_hinh_2026-03-11_luc_15.16.27_f80f1c06b6f946658e912b619b3f3dca_grande.png) |
| 3 | 25-03-2026 | Gregorys Coffee Khởi Động Phát Triển Nhượng Quyền Thương Hiệu | `/scraped_data/images/blog/gregorys-coffee-khoi-dong-phat-trien-nhuong-quyen-thuong-hieu.png` | [Link](https://cdn.hstatic.net/files/200000915205/article/anh_chup_man_hinh_2026-03-11_luc_15.13.42_ff2ab492b6ce45b0ac4fe326ce34c91a_grande.png) |
| 4 | 23-03-2026 | Tác động của Biến Khí Hậu Đến Ngành Cà Phê | `/scraped_data/images/blog/tac-dong-cua-bien-khi-hau-den-nganh-ca-phe.png` | [Link](https://cdn.hstatic.net/files/200000915205/article/anh_chup_man_hinh_2026-03-11_luc_15.11.44_89ed1fe508634794996a622dedc86088_grande.png) |
| 5 | 20-03-2026 | Khai tài Concept Coffee: Nơi hội tụ của cà phê chất lượng và ẩm thực sáng tạo | `/scraped_data/images/blog/khai-tai-concept-coffee-noi-hoi-tu-cua-ca-phe-chat-luong-va-am-thuc-sang-tao.png` | [Link](https://cdn.hstatic.net/files/200000915205/article/anh_chup_man_hinh_2026-03-11_luc_15.10.22_04abb1bb19724e4c8d220806cf5c7aae_grande.png) |
| 6 | 18-03-2026 | Bộ Nông nghiệp Hoa Kỳ công bố hỗ trợ 1 tỷ USD cho nông dân trồng cây đặc sản | `/scraped_data/images/blog/bo-nong-nghiep-hoa-ky-cong-bo-ho-tro-1-ty-usd-cho-nong-dan-trong-cay-dac-san.png` | [Link](https://cdn.hstatic.net/files/200000915205/article/anh_chup_man_hinh_2026-03-11_luc_15.08.53_456a2a28955d4c3bb131fc5ea7064550_grande.png) |

---

### 🏪 3. Branch Locators (`branches.json`)
We successfully extracted **20 storefront locations** along with their cleaned titles (excluding the corporate prefix), product details URLs, and storefront images:

| # | Branch Location | Local Image Path | Original CDN Link |
|---|-----------------|------------------|-------------------|
| 1 | KHU DÂN CƯ CONIC GARDEN - BÌNH CHÁNH | `/scraped_data/images/branches/khu-dan-cu-conic-garden-binh-chanh.png` | [Link](https://cdn.hstatic.net/products/200000915205/9_1ef7a058d1454946b42d43ddc0cd0c9e_large.png) |
| 2 | BỆNH VIỆN ĐẠI HỌC Y DƯỢC THÀNH PHỐ HỒ CHÍ MINH (LẦU 3) | `/scraped_data/images/branches/benh-vien-dai-hoc-y-duoc-thanh-pho-ho-chi-minh-lau-3.png` | [Link](https://cdn.hstatic.net/products/200000915205/_nh_b_a_0bb5c2fcf1ef40c389e87ae1314cb6c3_large.png) |
| 3 | BỆNH VIỆN ĐẠI HỌC Y DƯỢC THÀNH PHỐ HỒ CHÍ MINH (SẢNH KHU KHÁM BỆNH) | `/scraped_data/images/branches/benh-vien-dai-hoc-y-duoc-thanh-pho-ho-chi-minh-sanh-khu-kham-benh.png` | [Link](https://cdn.hstatic.net/products/200000915205/_nh_b_a_2727126b545d495db00abd8599d10056_large.png) |
| 4 | CẦN THƠ | `/scraped_data/images/branches/can-tho.jpg` | [Link](https://cdn.hstatic.net/products/200000915205/_nh_b_a_78c1a16a72af481d97496d4488db1809_large.jpg) |
| 5 | BẾN VÂN ĐỒN, QUẬN 4 | `/scraped_data/images/branches/ben-van-don-quan-4.jpg` | [Link](https://product.hstatic.net/200000915205/product/bvdweb_d38b0f5555b649aaa06ddd8a5ec4c78f_large.jpg) |
| 6 | BỆNH VIỆN ĐẠI HỌC Y DƯỢC CẦN THƠ | `/scraped_data/images/branches/benh-vien-dai-hoc-y-duoc-can-tho.png` | [Link](https://cdn.hstatic.net/products/200000915205/_nh_b_a_b3363657acdb4da0b61a7a4234321ce1_large.png) |
| 7 | LONG AN | `/scraped_data/images/branches/long-an.png` | [Link](https://cdn.hstatic.net/products/200000915205/_nh_b_a_f0a232b466f646b5949b1bd6cba45b0f_large.png) |
| 8 | NGUYỄN THÁI HỌC, QUẬN 1 | `/scraped_data/images/branches/nguyen-thai-hoc-quan-1.png` | [Link](https://product.hstatic.net/200000915205/product/anh_man_hinh_2024-12-09_luc_21.03.26_5547f5cd90d64ac38458a767b74c0666_large.png) |
| 9 | NGUYỄN TRI PHƯƠNG - QUẬN 10 | `/scraped_data/images/branches/nguyen-tri-phuong-quan-10.jpg` | [Link](https://product.hstatic.net/200000915205/product/ntt1_fae0684014c1421ab91382559e005765_large.jpg) |
| 10 | HOÀNG HOA THÁM, QUẬN TÂN BÌNH | `/scraped_data/images/branches/hoang-hoa-tham-quan-tan-binh.jpg` | [Link](https://product.hstatic.net/200000915205/product/cmt8.1_a1c9bb391d434d679bfee4c1b142e509_large.jpg) |
| 11 | CƯ XÁ VĨNH HỘI, QUẬN 4 | `/scraped_data/images/branches/cu-xa-vinh-hoi-quan-4.jpg` | [Link](https://product.hstatic.net/200000915205/product/vh_a2d39653f5024301b87e26dcfe3451b6_large.jpg) |
| 12 | LẠC LONG QUÂN, QUẬN 11 | `/scraped_data/images/branches/lac-long-quan-quan-11.png` | [Link](https://product.hstatic.net/200000915205/product/anh_man_hinh_2024-12-09_luc_21.03.22_7fcdae826d0a4dc18dc0ccc036e8a9d7_large.png) |
| 13 | NGUYỄN TRƯỜNG TỘ, QUẬN 4 | `/scraped_data/images/branches/nguyen-truong-to-quan-4.png` | [Link](https://product.hstatic.net/200000915205/product/chua_co_ten__1000_x_1000_px___10__bd178ec35cd749e08bbe4b584d724e04_large.png) |
| 14 | CMT8, QUẬN 3 | `/scraped_data/images/branches/cmt8-quan-3.png` | [Link](https://product.hstatic.net/200000915205/product/chua_co_ten__1000_x_1000_px___11__54cf1c3ab0684115ad5ff6802cd279dd_large.png) |
| 15 | LÂM VĂN BỀN, QUẬN 7 | `/scraped_data/images/branches/lam-van-ben-quan-7.jpg` | [Link](https://product.hstatic.net/200000915205/product/lvb_c10b1a6634864b84b4c22ff25b58c952_large.jpg) |
| 16 | KHU ĐÔ THỊ SALA, QUẬN 2 | `/scraped_data/images/branches/khu-do-thi-sala-quan-2.png` | [Link](https://product.hstatic.net/200000915205/product/chua_co_ten__1000_x_1000_px___6__185428f997844849838988414ed67fbb_large.png) |
| 17 | BẾN TRE | `/scraped_data/images/branches/ben-tre.jpg` | [Link](https://product.hstatic.net/200000915205/product/bt3.3_d84de0d670b64ed7a723b6140a9b8b29_large.jpg) |
| 18 | LÝ THƯỜNG KIỆT, QUẬN 10 | `/scraped_data/images/branches/ly-thuong-kiet-quan-10.png` | [Link](https://product.hstatic.net/200000915205/product/chua_co_ten__1000_x_1000_px___3__50d3287a3a43425e9a8a621b58cfff64_large.png) |
| 19 | ÚT TỊCH, QUẬN TÂN BÌNH | `/scraped_data/images/branches/ut-tich-quan-tan-binh.png` | [Link](https://product.hstatic.net/200000915205/product/anh_man_hinh_2024-12-09_luc_21.03.30_b492569af15244e28acfa556c42c2b4b_large.png) |
| 20 | BÀU CÁT, QUẬN TÂN BÌNH | `/scraped_data/images/branches/bau-cat-quan-tan-binh.jpg` | [Link](https://product.hstatic.net/200000915205/product/bc1_8e9391fbf8ba4af28370ee1031a0f42d_large.jpg) |

---

## 🛠️ Re-Running the Parser

If the HTML dump files in the system generated directory are ever updated, you can re-run the crawler utility at any time from the project root:

```powershell
node scraped_data/parse_and_download.js
```
