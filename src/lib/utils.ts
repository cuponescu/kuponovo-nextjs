// Utility functions for Kuponovo.bg

import { Coupon, Store, TrackingEvent } from './types';

/**
 * Decode HTML entities (e.g., &amp; -> &, &quot; -> ", etc.)
 * Handles both single and double-encoded entities
 */
export function decodeHTMLEntities(text: string): string {
  if (!text) return text;
  if (typeof text !== 'string') return text;
  
  let decoded = text;
  let previousDecoded = '';
  
  // Decode repeatedly to handle double/triple encoding (e.g. &amp;amp; -> &)
  for (let i = 0; i < 5; i++) {
    previousDecoded = decoded;
    
    // Decode numeric entities (e.g., &#38;)
    decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
      return String.fromCharCode(parseInt(dec, 10));
    });
    
    // Decode hex entities (e.g., &#x26;)
    decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
    
    // Decode named entities (most common first) — &amp; must become & so "&amp;" displays correctly
    decoded = decoded.replace(/&amp;/gi, '&');
    decoded = decoded.replace(/&lt;/gi, '<');
    decoded = decoded.replace(/&gt;/gi, '>');
    decoded = decoded.replace(/&quot;/gi, '"');
    decoded = decoded.replace(/&#039;/g, "'");
    decoded = decoded.replace(/&#39;/g, "'");
    decoded = decoded.replace(/&apos;/gi, "'");
    decoded = decoded.replace(/&nbsp;/gi, ' ');
    decoded = decoded.replace(/&ndash;/gi, '–');
    decoded = decoded.replace(/&mdash;/gi, '—');
    decoded = decoded.replace(/&laquo;/gi, '«');
    decoded = decoded.replace(/&raquo;/gi, '»');
    decoded = decoded.replace(/&hellip;/gi, '…');
    
    // If no change occurred, we're done
    if (decoded === previousDecoded) {
      break;
    }
  }
  
  return decoded;
}

/**
 * Format date to Bulgarian locale
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return ''; // No expiration — caller should hide the label
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return 'Невалидна дата'; // Invalid date
  const now = new Date();
  const diff = dateObj.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days < 0) {
    return 'Изтекъл';
  } else if (days === 0) {
    return 'Изтича днес';
  } else if (days === 1) {
    return 'Изтича утре';
  } else if (days <= 7) {
    return `Изтича след ${days} дни`;
  } else {
    return dateObj.toLocaleDateString('bg-BG', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }
}

/**
 * Check if coupon is ending soon (within 48h)
 */
export function isEndingSoon(expiresAt: Date | string | null): boolean {
  if (!expiresAt) return false; // No expiration = never ending soon
  const expirationDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  if (isNaN(expirationDate.getTime())) return false; // Invalid date
  const now = new Date();
  const diff = expirationDate.getTime() - now.getTime();
  const hours = diff / (1000 * 60 * 60);
  return hours > 0 && hours <= 48;
}

/**
 * Check if coupon expires in less than 3 days (0, 1, or 2 days left)
 */
export function isExpiringInLessThan3Days(expiresAt: Date | string | null): boolean {
  if (!expiresAt) return false;
  const d = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days >= 0 && days < 3;
}

/**
 * Track event (simulation)
 */
export function trackEvent(event: TrackingEvent): void {
  // In production, this would send to analytics
  console.log('📊 Track:', event.event, event.data);
  
  // Simulate dataLayer push
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: event.event,
      ...event.data,
    });
  }
}

/**
 * Get WordPress base URL
 */
export function getWordPressBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'https://wp.kuponovo.bg/wp-json/kuponovo/v1';
  return apiUrl.replace('/wp-json/kuponovo/v1', '');
}

/**
 * Normalize URL - add http:// if missing protocol
 */
export function normalizeUrl(url: string): string {
  if (!url || !url.trim()) {
    return '';
  }
  url = url.trim();
  // If URL doesn't start with http:// or https://, add http://
  if (!url.match(/^https?:\/\//i)) {
    return `http://${url}`;
  }
  return url;
}

/**
 * Generate outbound URL with tracking (WordPress redirect URL)
 */
export function getOutboundUrl(type: 'coupon' | 'store', id: string, redirectUrl?: string): string {
  if (type === 'coupon' && redirectUrl) {
    return redirectUrl; // Use the WordPress redirect URL from API
  }
  
  const wpBase = getWordPressBaseUrl();
  if (type === 'coupon') {
    return `${wpBase}/out/${id}/`;
  } else {
    return `${wpBase}/out/s/${id}/`;
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Silently fall through to fallback method
      // This is expected in some environments with restricted clipboard access
    }
  }
  
  // Fallback method for browsers without clipboard API or when blocked
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    // Position off-screen
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');
    
    document.body.appendChild(textArea);
    
    // Select the text
    textArea.select();
    textArea.setSelectionRange(0, text.length);
    
    // Try to copy
    let success = false;
    try {
      success = document.execCommand('copy');
    } catch (err) {
      success = false;
    }
    
    // Clean up
    document.body.removeChild(textArea);
    
    return success;
  } catch (error) {
    return false;
  }
}

/**
 * Get badge variant for Shadcn badge component
 */
export function getBadgeVariant(badge: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (badge) {
    case 'exclusive':
      return 'default';
    case 'black-friday':
      return 'secondary';
    case 'new':
      return 'secondary';
    case 'free-shipping':
      return 'outline';
    case 'super-reducere':
      return 'destructive';
    case 'merge-100':
      return 'default';
    case 'verificat':
      return 'default';
    case 'newsletter':
      return 'secondary';
    default:
      return 'default';
  }
}

/**
 * Get badge display text
 */
export function getBadgeText(badge: string): string {
  switch (badge) {
    case 'exclusive':
      return 'Ексклузивно';
    case 'black-friday':
      return 'Black Friday';
    case 'new':
      return 'Ново';
    case 'free-shipping':
      return 'Безплатна доставка';
    case 'super-reducere':
      return 'Супер отстъпка';
    case 'merge-100':
      return 'Работи 100%';
    case 'verificat':
      return 'Проверен';
    case 'newsletter':
      return 'Newsletter';
    case 'expired':
      return 'Изтекъл';
    default:
      return badge;
  }
}

/**
 * Sort coupons based on sort option
 */
export function sortCoupons(coupons: Coupon[], sortBy: string): Coupon[] {
  const sorted = [...coupons];
  
  switch (sortBy) {
    case 'category':
      // Sort by store name alphabetically (groups coupons by store)
      return sorted.sort((a, b) => {
        return a.storeName.localeCompare(b.storeName, 'bg-BG');
      });
    
    case 'newest':
      return sorted.sort((a, b) => {
        const aDate = new Date(a.lastUpdated);
        const bDate = new Date(b.lastUpdated);
        return bDate.getTime() - aDate.getTime();
      });
    
    case 'ending-soon':
      return sorted.sort((a, b) => {
        // Handle null expiration dates (put them at the end)
        if (!a.expiresAt && !b.expiresAt) return 0;
        if (!a.expiresAt) return 1;
        if (!b.expiresAt) return -1;
        const aDate = new Date(a.expiresAt);
        const bDate = new Date(b.expiresAt);
        return aDate.getTime() - bDate.getTime();
      });
    
    case 'highest-discount':
      // Simple heuristic: longer discount string = higher discount (not perfect but works for demo)
      return sorted.sort((a, b) => {
        const aValue = parseInt(a.discount.replace(/\D/g, '')) || 0;
        const bValue = parseInt(b.discount.replace(/\D/g, '')) || 0;
        return bValue - aValue;
      });
    
    case 'exclusive':
      return sorted.sort((a, b) => {
        const aExclusive = a.badges.includes('exclusive') ? 1 : 0;
        const bExclusive = b.badges.includes('exclusive') ? 1 : 0;
        return bExclusive - aExclusive;
      });
    
    case 'clicks':
      // Sort by number of clicks (most popular first)
      return sorted.sort((a, b) => {
        return b.clicks - a.clicks;
      });
    
    default:
      return sorted;
  }
}

/**
 * Filter coupons by category (through store categories)
 * Note: This function is deprecated - categories are now assigned to stores, not coupons.
 * Use API filtering by category instead.
 */
export function filterCouponsByCategory(coupons: Coupon[], categorySlug: string, stores?: Store[]): Coupon[] {
  if (!stores || stores.length === 0) {
    // If no stores provided, return empty array (can't filter without store data)
    return [];
  }
  
  // Get store IDs that have this category
  const storeIdsInCategory = stores
    .filter(store => store.categories?.includes(categorySlug))
    .map(store => store.id);
  
  // Filter coupons from stores in this category
  return coupons.filter(coupon => storeIdsInCategory.includes(coupon.storeId));
}

/**
 * Filter coupons by store
 */
export function filterCouponsByStore(coupons: Coupon[], storeId: string): Coupon[] {
  return coupons.filter(coupon => coupon.storeId === storeId);
}

/**
 * Search coupons
 */
export function searchCoupons(coupons: Coupon[], query: string): Coupon[] {
  const lowerQuery = query.toLowerCase();
  return coupons.filter(coupon => 
    coupon.title.toLowerCase().includes(lowerQuery) ||
    coupon.storeName.toLowerCase().includes(lowerQuery) ||
    coupon.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Paginate array
 */
export function paginate<T>(array: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return array.slice(start, end);
}

/**
 * Calculate total pages
 */
export function getTotalPages(total: number, perPage: number): number {
  return Math.ceil(total / perPage);
}

/**
 * Get type icon name
 */
export function getTypeIcon(type: string): string {
  switch (type) {
    case 'code':
      return 'ticket';
    case 'sale':
      return 'tag';
    case 'shipping':
      return 'truck';
    default:
      return 'tag';
  }
}
