# Backend Integration Guide — Express Cafe Frontend

> **Dành cho team xây dựng backend NestJS mới.**  
> Tài liệu này liệt kê tất cả API endpoint mà frontend đang gọi, kèm contract chi tiết.

---

## Quick Start

1. Copy `frontend/.env.example` → `frontend/.env.local`
2. Điền `NEXT_PUBLIC_API_URL` = URL backend mới
3. Điền `JWT_SECRET` = khớp với JWT_SECRET trong backend
4. Chạy `npm run dev` trong `frontend/`

---

## Conventions

| Convention | Giá trị |
|---|---|
| Base path | `/api/v1` |
| Response format | `{ success: true, data: <payload> }` (NestJS TransformInterceptor) |
| Error format | `{ statusCode: number, message: string, error: string }` |
| Auth (admin) | Cookie `admin_token` (JWT, httpOnly optional) |
| Auth (customer) | Bearer token trong `Authorization` header |
| CORS | Cần allow origin của frontend |
| Content-Type | `application/json` (trừ upload: `multipart/form-data`) |

---

## Environment Variables cần set ở Backend

```env
JWT_SECRET=<khớp với frontend JWT_SECRET>
ALLOWED_ORIGINS=http://localhost:3001,https://expresscafe.vn
PORT=3000
```

---

## API Endpoints

### 🔐 Auth

| Method | Path | Body | Response | Ghi chú |
|---|---|---|---|---|
| `POST` | `/auth/login` | `{ email, password }` | `{ accessToken, user: { id, email, name, role } }` | Admin login |
| `POST` | `/auth/refresh` | — | `{ accessToken }` | Cookie refresh_token |
| `POST` | `/auth/logout` | — | 204 | Xóa cookie |

---

### 📊 Admin Dashboard

| Method | Path | Auth | Response |
|---|---|---|---|
| `GET` | `/admin/dashboard/stats` | admin_token | `{ totalArticles, totalBranches, activeBanners, unreadContacts, recentArticles[], recentContacts[] }` |

---

### 📝 Articles (Blog)

| Method | Path | Auth | Body / Params | Response |
|---|---|---|---|---|
| `GET` | `/admin/articles` | admin_token | `?page&limit&search` | `{ items: Article[], total, page, limit }` |
| `GET` | `/admin/articles/:id` | admin_token | — | `Article` |
| `POST` | `/admin/articles` | admin_token | `Partial<Article>` | `Article` |
| `PUT` | `/admin/articles/:id` | admin_token | `Partial<Article>` | `Article` |
| `DELETE` | `/admin/articles/:id` | admin_token | — | 204 |
| `PATCH` | `/admin/articles/:id/toggle-status` | admin_token | — | `Article` |

**Article schema:**
```typescript
interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;       // HTML hoặc markdown
  excerpt?: string;
  thumbnail?: string;    // URL asset
  isPublished: boolean;
  createdAt: string;     // ISO 8601
  updatedAt: string;
}
```

---

### 🏪 Branches (Chi nhánh)

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `GET` | `/admin/branches` | admin_token | — | `{ items: Branch[], total }` |
| `GET` | `/admin/branches/:id` | admin_token | — | `Branch` |
| `POST` | `/admin/branches` | admin_token | `Partial<Branch>` | `Branch` |
| `PUT` | `/admin/branches/:id` | admin_token | `Partial<Branch>` | `Branch` |
| `DELETE` | `/admin/branches/:id` | admin_token | — | 204 |
| `PATCH` | `/admin/branches/:id/toggle-status` | admin_token | — | `Branch` |

**Branch schema:**
```typescript
interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  isActive: boolean;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}
```

---

### 🖼️ Banners

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `GET` | `/admin/banners` | admin_token | — | `Banner[]` |
| `PATCH` | `/admin/banners/:id` | admin_token | `Partial<Banner>` | `Banner` |
| `PATCH` | `/admin/banners/reorder` | admin_token | `{ items: [{ id, order }] }` | 204 |

**Banner schema:**
```typescript
interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  order: number;
  isActive: boolean;
}
```

---

### 📬 Contacts

| Method | Path | Auth | Params | Response |
|---|---|---|---|---|
| `GET` | `/admin/contacts` | admin_token | `?page&limit` | `{ items: Contact[], total }` |
| `PATCH` | `/admin/contacts/:id/read` | admin_token | — | `Contact` |

**Contact schema:**
```typescript
interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
```

---

### ⚙️ Settings

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `GET` | `/admin/settings` | admin_token | — | `Record<string, string>` |
| `PUT` | `/admin/settings` | admin_token | `Record<string, string \| boolean \| number>` | 204 |

---

### 📁 Media / Upload

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `POST` | `/media/upload` | admin_token | `FormData` (field: `file`) | `{ id: string, cdnUrl: string }` |

> `cdnUrl` là URL đầy đủ trỏ đến file upload (có thể là CDN hoặc `/uploads/...` relative).

---

### 🛎️ Services

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `GET` | `/services` | public | — | `Service[]` |
| `GET` | `/services/:id` | public | — | `Service` |
| `POST` | `/services` | admin_token | `Partial<Service>` | `Service` |
| `PATCH` | `/services/:id` | admin_token | `Partial<Service>` | `Service` |
| `DELETE` | `/services/:id` | admin_token | — | 204 |

---

### 🤝 Franchise Packages

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `GET` | `/franchise/packages` | public | — | `FranchisePackage[]` |
| `GET` | `/franchise/packages/:id` | public | — | `FranchisePackage` |
| `POST` | `/franchise/admin/packages` | admin_token | `Partial<FranchisePackage>` | `FranchisePackage` |
| `PATCH` | `/franchise/admin/packages/:id` | admin_token | `Partial<FranchisePackage>` | `FranchisePackage` |
| `DELETE` | `/franchise/admin/packages/:id` | admin_token | — | 204 |

---

### 🎥 Homepage Videos

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `GET` | `/content/videos` | public | — | `ContentVideo[]` |
| `POST` | `/content/admin/videos` | admin_token | `Partial<ContentVideo>` | `ContentVideo` |
| `PATCH` | `/content/admin/videos/:id` | admin_token | `Partial<ContentVideo>` | `ContentVideo` |
| `DELETE` | `/content/admin/videos/:id` | admin_token | — | 204 |

---

## Checklist cho Backend mới

- [ ] Implement NestJS `TransformInterceptor` trả `{ success: true, data: ... }`
- [ ] Implement `AllExceptionsFilter` trả `{ statusCode, message, error }`
- [ ] `JWT_SECRET` khớp với frontend
- [ ] CORS allow origin frontend
- [ ] Cookie `admin_token` set với `httpOnly: false` (hoặc `true` nếu đổi auth flow)
- [ ] `/media/upload` trả `{ id, cdnUrl }`
- [ ] Tất cả endpoints trong tài liệu này

---

## Kết nối với Backend mới

Khi backend mới deploy, chỉ cần:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=https://api-new.expresscafe.vn/api/v1
NEXT_PUBLIC_BACKEND_URL=https://api-new.expresscafe.vn
JWT_SECRET=<secret-mới-khớp-backend>
```

**Không cần sửa code frontend.**
