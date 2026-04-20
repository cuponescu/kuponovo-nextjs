// Core data types for Kuponovo.bg

export interface Store {
  id: string;
  slug: string;
  name: string;
  logo: string;
  description?: string;
  storeUrl?: string;
  affiliateUrl?: string;
  activeCoupons: number | Coupon[]; // Can be number or array depending on context
  categories: string[];
  featured?: boolean;
  blackFriday?: boolean;
  createdAt?: string;
  clicks?: number;
  expiredCoupons?: Coupon[];
  rating?: number; // Average rating (0-5)
  ratingCount?: number; // Number of ratings
  contact?: {
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    facebook?: string;
    instagram?: string;
  };
}

// Optimized store data for search (reduces HTML size)
export interface StoreSearchData {
  id: string;
  slug: string;
  name: string;
  logo: string;
  website?: string;
  clicks?: number;
  featured?: boolean;
}

export interface Coupon {
  id: string;
  slug: string;
  storeId: string;
  storeSlug?: string;
  storeName: string;
  storeLogo: string;
  image?: string; // Featured image for coupon
  title: string;
  description: string;
  discount: string; // "-20%", "40 lei", etc.
  code?: string | null; // Only for type=code
  type: 'code' | 'sale';
  status: 'active' | 'expired';
  badges: ('exclusive' | 'exclusiv' | 'black-friday' | 'new' | 'free-shipping' | 'super-reducere' | 'merge-100' | 'verificat' | 'newsletter' | 'expired')[];
  featured?: boolean; // For slider
  featuredHomepage?: boolean; // For homepage section
  expiresAt: Date | string | null;
  verifiedToday: boolean;
  clicks: number;
  order?: number;
  votes: { up: number; down: number };
  terms?: string;
  lastUpdated: Date | string;
  redirectUrl?: string; // WordPress redirect URL for click tracking
  affiliateUrl?: string; // Store affiliate URL
  storeUrl?: string; // Store URL (fallback if no affiliate)
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  stores?: Store[];
  coupons?: Coupon[];
}

export interface SliderSlide {
  id: string;
  desktopImage: string;
  mobileImage?: string;
  storeLogo?: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  ctaText: string;
  ctaLink: string;
  linkType: 'coupon' | 'store' | 'custom';
  coupon?: Coupon;
}

export type SortOption = 'category' | 'newest' | 'ending-soon' | 'highest-discount' | 'exclusive' | 'clicks';

export interface TrackingEvent {
  event: 'coupon_modal_open' | 'coupon_copy' | 'coupon_cta_click' | 'store_cta_click' | 'slider_click' | 'coupon_vote' | 'coupon_card_click';
  data: Record<string, any>;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string; // Only included when fetching single post
  featuredImage: string | null;
  publishedAt: string;
  modifiedAt: string;
}
