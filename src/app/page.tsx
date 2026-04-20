/**
 * Home Page - Server Component with SSR
 */
import { HomePage } from '@/components/pages/HomePage'
import { apiServer } from '@/lib/api-server'
import { Store, Coupon, Category, SliderSlide } from '@/lib/types';
import { Metadata } from 'next'

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Kuponovo.bg - Купони и промо кодове, обновявани всеки ден',
  description: 'Ние сме малък, но всеотдаен екип, който всеки ден търси нови купони и активни промоции в онлайн магазините в България.',
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default async function Home() {
  let stores: Store[] = [];
  let coupons: Coupon[] = [];
  let featuredCoupons: Coupon[] = [];
  let categories: Category[] = [];
  let slides: SliderSlide[] = [];

  try {
    const results = await Promise.allSettled([
      apiServer.getStores({ featured: true }),
      Promise.resolve([]),
      apiServer.getCoupons({ featured_homepage: true, active: true }),
      apiServer.getCategories(),
      apiServer.getSliderSlides(),
    ]);

    stores = results[0].status === 'fulfilled' ? results[0].value : [];
    featuredCoupons = results[2].status === 'fulfilled' ? results[2].value : [];
    categories = results[3].status === 'fulfilled' ? results[3].value : [];
    slides = results[4].status === 'fulfilled' ? results[4].value : [];

    slides = shuffleArray(slides);

    console.log('Homepage data fetched:', {
      storesCount: stores.length,
      couponsCount: coupons.length,
      featuredCouponsCount: featuredCoupons.length,
      categoriesCount: categories.length,
      slidesCount: slides.length,
      apiBase: process.env.WP_API_URL || 'not set',
    });

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`API call ${index} failed:`, result.reason);
      }
    });
  } catch (error) {
    console.error('Error fetching home page data:', error);
  }

  const trendingCoupons: Coupon[] = [];

  const topStores = [...stores]
    .sort((a, b) => {
      const aCount = typeof a.activeCoupons === 'number' ? a.activeCoupons : Array.isArray(a.activeCoupons) ? a.activeCoupons.length : 0;
      const bCount = typeof b.activeCoupons === 'number' ? b.activeCoupons : Array.isArray(b.activeCoupons) ? b.activeCoupons.length : 0;
      return bCount - aCount;
    })
    .slice(0, 18);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Kuponovo",
    "url": "https://kuponovo.bg",
    "logo": "https://kuponovo.bg/Kuponovo.png",
    "description": "Ние сме малък, но всеотдаен екип, който всеки ден търси нови купони и активни промоции в онлайн магазините в България.",
    "availableLanguage": "Bulgarian",
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Kuponovo",
    "url": "https://kuponovo.bg",
    "publisher": {
      "@type": "Organization",
      "name": "Kuponovo",
      "url": "https://kuponovo.bg"
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <HomePage
        slides={slides}
        trendingCoupons={trendingCoupons}
        featuredCoupons={featuredCoupons}
        topStores={topStores}
      />
    </>
  );
}
