/**
 * Store Page - Server Component with SSR
 */
import { StorePage } from '@/components/pages/StorePage'
import { apiServer } from '@/lib/api-server'
import { filterCouponsByStore } from '@/lib/utils'
import { Coupon, Store } from '@/lib/types'
import { notFound } from 'next/navigation'

// Use ISR (Incremental Static Regeneration) with 24 hour revalidation
export const revalidate = 3600;

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function StorePageRoute({ params }: PageProps) {
  // Fetch store data on server (SSR)
  const store = await apiServer.getStore(params.slug);

  if (!store) {
    notFound();
  }

  // Get coupons for this store
  // Use expiredCoupons from store object if available, otherwise fetch and filter
  let activeStoreCoupons: Coupon[] = [];
  let expiredStoreCoupons: Coupon[] = [];
  
  if (Array.isArray(store.activeCoupons)) {
    // Store object already has coupons
    activeStoreCoupons = store.activeCoupons.filter(c => c.status === 'active');
    expiredStoreCoupons = store.expiredCoupons || [];
  } else {
    // Fallback: fetch only coupons for this store
    const storeCoupons = await apiServer.getCoupons({ store_id: store.id });
    activeStoreCoupons = storeCoupons.filter(c => c.status === 'active');
    expiredStoreCoupons = storeCoupons.filter(c => c.status === 'expired');
  }

  // Fetch stores from the same category as the current store
  let relatedStores: Store[] = [];
  let categoryName = '';
  
  if (store.categories && store.categories.length > 0) {
    try {
      // Get the first category
      const firstCategorySlug = store.categories[0];
      const category = await apiServer.getCategory(firstCategorySlug, {
        fields: ['id', 'name', 'slug', 'logo', 'featured', 'activeCoupons']
      });
      
      if (category) {
        categoryName = category.name;
        
        // Fetch coupons for this category to calculate click-based sorting
        // Use the same logic as CategoryPage: only active coupons
        const categoryCoupons = category.coupons 
          ? category.coupons.filter(c => c.status === 'active')
          : [];
        
        // Calculate total coupon clicks for each store (only from active coupons)
        const storeClicksMap = new Map<string, number>();
        categoryCoupons.forEach(coupon => {
          const currentClicks = storeClicksMap.get(coupon.storeId) || 0;
          storeClicksMap.set(coupon.storeId, currentClicks + (coupon.clicks || 0));
        });
        
        // Sort stores by total coupon clicks, exclude current store, limit to 12
        if (category.stores && category.stores.length > 0) {
          relatedStores = category.stores
            .sort((a, b) => {
              const aClicks = storeClicksMap.get(a.id) || 0;
              const bClicks = storeClicksMap.get(b.id) || 0;
              return bClicks - aClicks; // Most clicks first
            })
            .filter(s => s.id !== store.id)
            .slice(0, 12);
        }
      }
    } catch (error) {
      console.error('Error fetching related stores:', error);
    }
  }

  // Fetch featured stores for popular stores section
  let featuredStores: Store[] = [];
  try {
    featuredStores = await apiServer.getStores({ featured: true });
    // Exclude current store from the list
    featuredStores = featuredStores.filter(s => s.id !== store.id);
  } catch (error) {
    console.error('Error fetching featured stores:', error);
  }

  return (
    <StorePage
      store={store}
      activeCoupons={activeStoreCoupons}
      expiredCoupons={expiredStoreCoupons}
      relatedStores={relatedStores}
      categoryName={categoryName}
      featuredStores={featuredStores}
    />
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const store = await apiServer.getStore(params.slug);
  
  if (!store) {
    return {
      title: 'Store Not Found',
    };
  }

  const currentDate = new Date().toLocaleDateString('bg-BG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const now = new Date();
  const monthNamesShort = [
    'Ян', 'Фев', 'Мар', 'Апр', 'Май', 'Юни',
    'Юли', 'Авг', 'Сеп', 'Окт', 'Ное', 'Дек'
  ];
  const monthNamesFull = [
    'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
    'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
  ];
  const currentMonthShort = monthNamesShort[now.getMonth()];
  const currentMonthFull = monthNamesFull[now.getMonth()];
  const currentYear = now.getFullYear();

  // Get active coupons to calculate discount range
  let activeStoreCoupons: Coupon[] = [];
  if (Array.isArray(store.activeCoupons)) {
    activeStoreCoupons = store.activeCoupons.filter(c => c.status === 'active');
  } else {
    // Optimized: fetch only coupons for this store
    const storeCoupons = await apiServer.getCoupons({ store_id: store.id });
    activeStoreCoupons = storeCoupons.filter(c => c.status === 'active');
  }

  // Extract all discounts with their types
  const allDiscounts: { value: number; type: 'percent' | 'lei' }[] = [];
  
  activeStoreCoupons.forEach(coupon => {
    if (coupon.discount) {
      // Try to extract percentage value (e.g., "10%", "10 %", "până la 50%")
      const percentMatch = coupon.discount.match(/(\d+)\s*%/);
      if (percentMatch) {
        allDiscounts.push({ value: parseInt(percentMatch[1], 10), type: 'percent' });
      }
      
      // Try to extract BGN value (e.g., "50 лв", "100 лв.", "50 bgn", "100 BGN")
      const bgnMatch = coupon.discount.match(/(\d+)\s*(?:лв\.?|лева|bgn|BGN)/i);
      if (bgnMatch) {
        allDiscounts.push({ value: parseInt(bgnMatch[1], 10), type: 'lei' });
      }
    }
  });

  // Build title: Промо код {Store} -{highest}% (+още N купона) | {Month} {Year}
  let title = `Промо код ${store.name}`;
  const couponCount = activeStoreCoupons.length;
  const othersCount = couponCount - 1;

  let discountStr = '';
  if (allDiscounts.length > 0) {
    allDiscounts.sort((a, b) => a.value - b.value);
    const highest = allDiscounts[allDiscounts.length - 1];
    discountStr = highest.type === 'percent' ? `-${highest.value}%` : `-${highest.value} лв`;
  }

  let othersStr = '';
  if (othersCount > 1) {
    othersStr = ` ( + още ${othersCount} купона)`;
  } else if (othersCount === 1) {
    othersStr = ` ( + още 1 купон)`;
  }

  if (discountStr) {
    title = `Промо код ${store.name} ${discountStr}${othersStr} | ${currentMonthShort} ${currentYear}`;
  } else {
    title = `Промо код ${store.name}${othersStr} | ${currentMonthShort} ${currentYear}`;
  }

  const numberOfCoupons = activeStoreCoupons.length;
  const highestValueStr = allDiscounts.length > 0
    ? (allDiscounts[allDiscounts.length - 1].type === 'percent'
      ? `${allDiscounts[allDiscounts.length - 1].value}%`
      : `${allDiscounts[allDiscounts.length - 1].value} лв`)
    : '';

  let description = `${numberOfCoupons} промо кода за ${store.name} те очакват тук!`;
  if (highestValueStr) {
    description += ` Спести ${highestValueStr} при следващата си поръчка с купон от ${store.name}.`;
  }
  description += ` Валидни кодове през ${currentMonthFull} ${currentYear}.`;

  const pageUrl = `https://kuponovo.bg/magazin/${params.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Kuponovo.bg',
      images: [
        {
          url: store.logo || 'https://kuponovo.bg/Kuponovo.svg',
          width: 400,
          height: 400,
          alt: `Logo ${store.name}`,
        },
      ],
      locale: 'bg_BG',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [store.logo || 'https://kuponovo.bg/Kuponovo.svg'],
    },
  };
}

// Generate static params for all stores to enable ISR/SSG
export async function generateStaticParams() {
  try {
    const stores = await apiServer.getStores({ fields: ['slug'] });
    return stores.map((store) => ({
      slug: store.slug,
    }));
  } catch {
    return [];
  }
}
