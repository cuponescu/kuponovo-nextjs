/**
 * Server-side API client for WordPress
 * This runs on the server (Next.js SSR) and can access WordPress directly
 */

import { decodeHTMLEntities } from './utils';

const API_BASE = process.env.WP_API_URL || 'https://wp.kuponovo.bg/wp-json/kuponovo/v1';
const API_TOKEN = process.env.API_TOKEN || process.env.NEXT_PUBLIC_API_TOKEN || '';

export interface Store {
  id: string;
  slug: string;
  name: string;
  logo: string;
  description?: string;
  storeUrl: string;
  affiliateUrl: string;
  activeCoupons: number | Coupon[];
  categories: string[];
  featured: boolean;
  blackFriday: boolean;
  createdAt?: string;
  modifiedAt?: string;
  clicks: number;
  expiredCoupons?: Coupon[];
  contact?: {
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    facebook?: string;
    instagram?: string;
  };
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
  discount: string;
  code?: string | null;
  type: 'code' | 'sale';
  status: 'active' | 'expired';
  badges: ('exclusive' | 'exclusiv' | 'black-friday' | 'new' | 'free-shipping' | 'super-reducere' | 'merge-100' | 'verificat' | 'newsletter' | 'expired')[];
  featured?: boolean;
  expiresAt: string | null;
  verifiedToday: boolean;
  clicks: number;
  order?: number;
  votes: { up: number; down: number };
  terms?: string;
  lastUpdated: string;
  redirectUrl: string;
  affiliateUrl?: string;
  storeUrl?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  coupons?: Coupon[];
  stores?: Store[];
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
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  featuredImage: string | null;
  publishedAt: string;
  modifiedAt: string;
}

class KuponovoAPIServer {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE;
  }

  async fetchJSON<T>(url: string, retries = 3): Promise<T> {
    try {
      const response = await fetch(url, {
        next: { revalidate: 3600 }, // ISR - revalidate every 1 hour
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Kuponovo-NextJS/1.0',
          ...(API_TOKEN && { 'X-API-Key': API_TOKEN }),
        },
        // Increase timeout and add retry logic
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`API request failed: ${response.status} ${response.statusText}`, {
          url,
          errorText,
        });
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText.substring(0, 200)}`);
      }

      return response.json();
    } catch (error) {
      // Retry logic for network errors
      const errorCode = (error as any)?.code;
      const isNetworkError = error instanceof TypeError || 
                            errorCode === 'ENOTFOUND' || 
                            errorCode === 'UND_ERR_CONNECT_TIMEOUT' ||
                            errorCode === 'ECONNREFUSED';
      
      if (retries > 0 && isNetworkError) {
        console.warn(`Retrying fetch (${retries} attempts left):`, url);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        return this.fetchJSON<T>(url, retries - 1);
      }
      
      // Re-throw with more context
      if (error instanceof Error) {
        console.error('Fetch error:', error.message, { url, code: errorCode });
        throw error;
      }
      throw new Error(`Network error fetching ${url}`);
    }
  }

  private normalizeImageUrl(url: string | null | undefined): string {
    if (!url || !url.trim()) {
      return '';
    }
    url = url.trim();
    
    // If already absolute URL with protocol
    if (url.match(/^https?:\/\//i)) {
      // Only replace local domain with production domain if we're in production
      // Check if we're running in production (Vercel) vs local development
      const isProduction = process.env.NODE_ENV === 'production' || 
                          process.env.VERCEL === '1' ||
                          this.baseUrl.includes('wp.kuponovo.bg');
      
      if (isProduction && (url.includes('kuponovo-test.local') || url.includes('kuponovo-test.local'))) {
        return url.replace(/http:\/\/(?:kuponovo-test\.local|kuponovo-test\.local)/g, 'https://wp.kuponovo.bg');
      }
      // In local development, keep local URLs as is
      return url;
    }
    
    // If relative URL (starts with /), prepend WordPress base URL
    if (url.startsWith('/')) {
      const wpBaseUrl = this.baseUrl.replace('/wp-json/kuponovo/v1', '');
      return `${wpBaseUrl}${url}`;
    }
    
    return url;
  }

  async getStores(params?: { featured?: boolean; search?: string; fields?: string[] }): Promise<Store[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.featured) queryParams.append('featured', 'true');
      if (params?.search) queryParams.append('search', params.search);
      if (params?.fields && params.fields.length > 0) queryParams.append('fields', params.fields.join(','));
      
      const query = queryParams.toString();
      const url = `${this.baseUrl}/stores${query ? '?' + query : ''}`;
      const stores = await this.fetchJSON<Store[]>(url);
      
      // Normalize image URLs
      return stores.map(store => ({
        ...store,
        name: decodeHTMLEntities(store.name),
        // Don't decode description - it contains HTML and will be rendered with dangerouslySetInnerHTML
        logo: this.normalizeImageUrl(store.logo),
        contact: store.contact ? {
          address: store.contact.address ? decodeHTMLEntities(store.contact.address) : store.contact.address,
          phone: store.contact.phone ? decodeHTMLEntities(store.contact.phone) : store.contact.phone,
          email: store.contact.email ? decodeHTMLEntities(store.contact.email) : store.contact.email,
          website: store.contact.website ? decodeHTMLEntities(store.contact.website) : store.contact.website,
          facebook: store.contact.facebook ? decodeHTMLEntities(store.contact.facebook) : store.contact.facebook,
          instagram: store.contact.instagram ? decodeHTMLEntities(store.contact.instagram) : store.contact.instagram,
        } : store.contact,
      }));
    } catch (error) {
      console.error('Error fetching stores:', error);
      return [];
    }
  }

  async getStore(slug: string): Promise<Store | null> {
    try {
      const url = `${this.baseUrl}/stores/${slug}`;
      const store = await this.fetchJSON<Store>(url);
      
      // Normalize image URLs and decode HTML entities
      return {
        ...store,
        name: decodeHTMLEntities(store.name),
        // Don't decode description - it contains HTML and will be rendered with dangerouslySetInnerHTML
        logo: this.normalizeImageUrl(store.logo),
        contact: store.contact ? {
          address: store.contact.address ? decodeHTMLEntities(store.contact.address) : store.contact.address,
          phone: store.contact.phone ? decodeHTMLEntities(store.contact.phone) : store.contact.phone,
          email: store.contact.email ? decodeHTMLEntities(store.contact.email) : store.contact.email,
          website: store.contact.website ? decodeHTMLEntities(store.contact.website) : store.contact.website,
          facebook: store.contact.facebook ? decodeHTMLEntities(store.contact.facebook) : store.contact.facebook,
          instagram: store.contact.instagram ? decodeHTMLEntities(store.contact.instagram) : store.contact.instagram,
        } : store.contact,
      };
    } catch (error) {
      // If it's a 404, return null (Page Not Found)
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      // For other errors (timeout, 500), rethrow so Next.js renders an error page instead of caching 404
      console.error(`Error fetching store ${slug}:`, error);
      throw error;
    }
  }

  async getCoupons(params?: {
    store_id?: string;
    category?: string;
    active?: boolean;
    slides?: boolean; // For slider
    featured_homepage?: boolean; // For homepage section
    badge?: string | string[]; // Filter by badge(s)
    per_page?: number; // For pagination, -1 for all
  }): Promise<Coupon[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.store_id) queryParams.append('store_id', params.store_id);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.active) queryParams.append('active', 'true');
      if (params?.slides) queryParams.append('slides', 'true');
      if (params?.featured_homepage) queryParams.append('featured_homepage', 'true');
      if (params?.badge) {
        const badgeValue = Array.isArray(params.badge) ? params.badge.join(',') : params.badge;
        queryParams.append('badge', badgeValue);
      }
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      
      const query = queryParams.toString();
      const url = `${this.baseUrl}/coupons${query ? '?' + query : ''}`;
      const coupons = await this.fetchJSON<Coupon[]>(url);
      
      // Normalize image URLs, decode HTML entities, and add expired badge if status is expired
      return coupons.map(coupon => ({
        ...coupon,
        title: decodeHTMLEntities(coupon.title),
        description: coupon.description ? decodeHTMLEntities(coupon.description) : coupon.description,
        discount: decodeHTMLEntities(coupon.discount),
        code: coupon.code ? decodeHTMLEntities(coupon.code) : coupon.code,
        storeName: decodeHTMLEntities(coupon.storeName),
        terms: coupon.terms ? decodeHTMLEntities(coupon.terms) : coupon.terms,
        storeLogo: this.normalizeImageUrl(coupon.storeLogo),
        image: coupon.image ? this.normalizeImageUrl(coupon.image) : undefined,
        // Add expired badge if coupon is expired and not already in badges
        badges: coupon.status === 'expired' && !coupon.badges.includes('expired')
          ? [...coupon.badges, 'expired']
          : coupon.badges,
      }));
    } catch (error) {
      console.error('Error fetching coupons:', error);
      return [];
    }
  }

  async getCoupon(slug: string): Promise<Coupon | null> {
    try {
      const url = `${this.baseUrl}/coupons/${slug}`;
      const coupon = await this.fetchJSON<Coupon>(url);
      
      // Normalize image URLs, decode HTML entities, and add expired badge if status is expired
      return {
        ...coupon,
        title: decodeHTMLEntities(coupon.title),
        description: coupon.description ? decodeHTMLEntities(coupon.description) : coupon.description,
        discount: decodeHTMLEntities(coupon.discount),
        code: coupon.code ? decodeHTMLEntities(coupon.code) : coupon.code,
        storeName: decodeHTMLEntities(coupon.storeName),
        terms: coupon.terms ? decodeHTMLEntities(coupon.terms) : coupon.terms,
        storeLogo: this.normalizeImageUrl(coupon.storeLogo),
        image: coupon.image ? this.normalizeImageUrl(coupon.image) : undefined,
        // Add expired badge if coupon is expired and not already in badges
        badges: coupon.status === 'expired' && !coupon.badges.includes('expired')
          ? [...coupon.badges, 'expired']
          : coupon.badges,
      };
    } catch (error) {
      // If it's a 404, return null (Page Not Found)
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      // For other errors, rethrow
      console.error(`Error fetching coupon ${slug}:`, error);
      throw error;
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const url = `${this.baseUrl}/categories`;
      const categories = await this.fetchJSON<Category[]>(url);
      return categories.map(category => ({
        ...category,
        name: decodeHTMLEntities(category.name),
        description: category.description ? decodeHTMLEntities(category.description) : category.description,
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getCategory(slug: string, params?: { fields?: string[] }): Promise<Category | null> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.fields && params.fields.length > 0) queryParams.append('fields', params.fields.join(','));
      
      const query = queryParams.toString();
      const url = `${this.baseUrl}/categories/${slug}${query ? '?' + query : ''}`;
      const category = await this.fetchJSON<Category>(url);
      
      // Normalize stores if they exist
      const normalizedStores = category.stores ? category.stores.map(store => ({
        ...store,
        name: decodeHTMLEntities(store.name),
        logo: store.logo ? this.normalizeImageUrl(store.logo) : store.logo, // Only normalize if it exists
        contact: store.contact ? {
          address: store.contact.address ? decodeHTMLEntities(store.contact.address) : store.contact.address,
          phone: store.contact.phone ? decodeHTMLEntities(store.contact.phone) : store.contact.phone,
          email: store.contact.email ? decodeHTMLEntities(store.contact.email) : store.contact.email,
          website: store.contact.website ? decodeHTMLEntities(store.contact.website) : store.contact.website,
          facebook: store.contact.facebook ? decodeHTMLEntities(store.contact.facebook) : store.contact.facebook,
          instagram: store.contact.instagram ? decodeHTMLEntities(store.contact.instagram) : store.contact.instagram,
        } : store.contact,
      })) : undefined;
      
      return {
        ...category,
        name: decodeHTMLEntities(category.name),
        description: category.description ? decodeHTMLEntities(category.description) : category.description,
        stores: normalizedStores,
      };
    } catch (error) {
      // If it's a 404, return null (Page Not Found)
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      // For other errors, rethrow
      console.error(`Error fetching category ${slug}:`, error);
      throw error;
    }
  }

  async search(query: string): Promise<Coupon[]> {
    try {
      const url = `${this.baseUrl}/search?q=${encodeURIComponent(query)}`;
      const coupons = await this.fetchJSON<Coupon[]>(url);
      
      // Normalize image URLs and decode HTML entities
      return coupons.map(coupon => ({
        ...coupon,
        title: decodeHTMLEntities(coupon.title),
        description: coupon.description ? decodeHTMLEntities(coupon.description) : coupon.description,
        discount: decodeHTMLEntities(coupon.discount),
        code: coupon.code ? decodeHTMLEntities(coupon.code) : coupon.code,
        storeName: decodeHTMLEntities(coupon.storeName),
        terms: coupon.terms ? decodeHTMLEntities(coupon.terms) : coupon.terms,
        storeLogo: this.normalizeImageUrl(coupon.storeLogo),
        image: coupon.image ? this.normalizeImageUrl(coupon.image) : undefined,
      }));
    } catch (error) {
      console.error('Error searching:', error);
      return [];
    }
  }

  async getSliderSlides(): Promise<SliderSlide[]> {
    try {
      // Fetch only featured coupons directly from WordPress API for better performance
      const featuredUrl = `${this.baseUrl}/coupons?slides=true`;
      
      // First fetch the coupons for the slider
      const featuredCouponsRaw = await this.fetchJSON<Coupon[]>(featuredUrl);
      
      const featuredCoupons = featuredCouponsRaw.map(coupon => ({
        ...coupon,
        title: decodeHTMLEntities(coupon.title),
        description: coupon.description ? decodeHTMLEntities(coupon.description) : coupon.description,
        discount: decodeHTMLEntities(coupon.discount),
        code: coupon.code ? decodeHTMLEntities(coupon.code) : coupon.code,
        storeName: decodeHTMLEntities(coupon.storeName),
        terms: coupon.terms ? decodeHTMLEntities(coupon.terms) : coupon.terms,
        storeLogo: this.normalizeImageUrl(coupon.storeLogo),
        image: coupon.image ? this.normalizeImageUrl(coupon.image) : undefined,
      }));

      const sliderCoupons = featuredCoupons.slice(0, 10);
      
      // Debug: Log all featured coupons
      console.log(`[Slider] Found ${featuredCoupons.length} featured coupons:`, 
        featuredCoupons.map(c => ({
          id: c.id,
          title: c.title,
          storeName: c.storeName,
          storeId: c.storeId,
          storeSlug: c.storeSlug, // Log storeSlug to verify
          featured: c.featured,
          status: c.status
        }))
      );
      
      const slides = sliderCoupons
        .map((coupon) => {
          // Use storeSlug directly from coupon data
          const storeSlug = coupon.storeSlug || '';
          
          // Debug: Log if store slug is missing
          if (!storeSlug) {
            console.warn(`[Slider] Store slug not found for coupon ${coupon.id} (store ID: ${coupon.storeId}, store name: ${coupon.storeName})`);
          }
          
          // Use coupon's featured image if available, otherwise use store logo as fallback
          const featuredImage = (coupon.image && typeof coupon.image === 'string' && coupon.image.trim() !== '') 
            ? coupon.image 
            : (coupon.storeLogo && typeof coupon.storeLogo === 'string' && coupon.storeLogo.trim() !== '') 
              ? coupon.storeLogo 
              : '';
          
          // Get the most important badge to display (priority order)
          let displayBadge: string | undefined = undefined;
          if (coupon.badges && Array.isArray(coupon.badges) && coupon.badges.length > 0) {
            const badgePriority = [
              'black-friday',
              'super-reducere', 
              'merge-100',
              'verificat',
              'exclusive',
              'exclusiv',
              'newsletter',
              'free-shipping',
              'new'
            ] as const;
            
            for (const priority of badgePriority) {
              if (coupon.badges.includes(priority)) {
                displayBadge = priority;
                break;
              }
            }
          }
          
          // Determine CTA link and type based on coupon type
          // Code coupons: link to store page with modal hash
          // Sale coupons: link to redirect endpoint (which goes to affiliate)
          const ctaLink = coupon.type === 'code' && storeSlug
            ? `/magazin/${storeSlug}#modal-coupon-${coupon.id}`
            : `/out/${coupon.id}/`;
          
          return {
            id: `slide-${coupon.id}`,
            desktopImage: this.normalizeImageUrl(featuredImage),
            storeLogo: this.normalizeImageUrl(coupon.storeLogo),
            badge: displayBadge,
            title: coupon.title,
            subtitle: `${coupon.discount} ${coupon.storeName}`,
            ctaText: coupon.type === 'code' ? 'Покажи кода' : 'Вземи офертата',
            ctaLink: ctaLink,
            linkType: 'coupon' as const,
            coupon: coupon, // Pass full coupon object
          };
        });

      return slides;
    } catch (error) {
      console.error('Error generating slides:', error);
      return [];
    }
  }
  
  /**
   * Get all blog posts
   */
  async getBlogPosts(params?: { exclude?: string; per_page?: number }): Promise<BlogPost[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.exclude) queryParams.append('exclude', params.exclude);
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      
      const url = `${this.baseUrl}/blog${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const posts = await this.fetchJSON<BlogPost[]>(url);
      
      return posts.map(post => ({
        ...post,
        title: decodeHTMLEntities(post.title),
        excerpt: decodeHTMLEntities(post.excerpt),
      }));
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }
  }
  
  /**
   * Get single blog post by slug
   */
  async getBlogPost(slug: string): Promise<BlogPost | null> {
    try {
      const url = `${this.baseUrl}/blog/${slug}`;
      const post = await this.fetchJSON<BlogPost>(url);
      
      return {
        ...post,
        title: decodeHTMLEntities(post.title),
        excerpt: decodeHTMLEntities(post.excerpt),
        content: post.content, // Keep HTML content as-is
      };
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return null;
    }
  }
}

export const apiServer = new KuponovoAPIServer();
