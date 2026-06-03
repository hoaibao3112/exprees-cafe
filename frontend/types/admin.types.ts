// ===================== AUTH =====================
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// ===================== DASHBOARD =====================
export interface DashboardStats {
  totalArticles: number;
  totalBranches: number;
  activeBanners: number;
  unreadContacts: number;
  recentArticles: RecentArticle[];
  recentContacts: RecentContact[];
}

export interface RecentArticle {
  id: string;
  title: string;
  blogHandle: string;
  status: ArticleStatus;
  createdAt: string;
}

export interface RecentContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ===================== ARTICLES =====================
export type ArticleStatus = 'DRAFT' | 'PUBLISHED';
export type BlogHandle = 'news' | 'blog' | 'services';

export interface Article {
  id: string;
  title: string;
  slug: string;
  blogHandle: BlogHandle;
  imageUrl?: string;
  content: string;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleListResponse {
  items: Article[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateArticleInput {
  title: string;
  slug: string;
  blogHandle: BlogHandle;
  imageUrl?: string;
  content: string;
  status: ArticleStatus;
}

export type UpdateArticleInput = Partial<CreateArticleInput>;

// ===================== BRANCHES =====================
export type BranchStatus = 'active' | 'inactive';

export interface Branch {
  id: string;
  name: string;
  address: string;
  district: string;
  phone: string;
  openHours: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  status: BranchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BranchListResponse {
  items: Branch[];
  total: number;
}

export interface CreateBranchInput {
  name: string;
  address: string;
  district: string;
  phone: string;
  openHours: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  status: BranchStatus;
}

export type UpdateBranchInput = Partial<CreateBranchInput>;

// ===================== BANNERS =====================
export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface UpdateBannerInput {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  isActive?: boolean;
  order?: number;
}

// ===================== CONTACTS =====================
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ContactListResponse {
  items: Contact[];
  total: number;
}

// ===================== SETTINGS =====================
export interface SiteSettings {
  // General
  brandName: string;
  slogan: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  facebookUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;

  // Homepage - Hero
  heroEnabled: boolean;
  heroHeading: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroBgImage: string;

  // Homepage - Sections
  bannerSlideshowEnabled: boolean;
  blogSectionEnabled: boolean;
  blogSectionTitle: string;
  blogSectionCount: number;
  branchSectionEnabled: boolean;
  branchSectionTitle: string;
  serviceSectionEnabled: boolean;

  // Appearance
  primaryColor: string;
  secondaryColor: string;
  darkMode: boolean;

  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

// ===================== PAGINATION =====================
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  blogHandle?: string;
}

// ===================== API RESPONSE =====================
export interface ApiListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
