/**
 * All Coupons Page - Server Component with SSR
 */
import { AllCouponsPage } from '@/components/pages/AllCouponsPage'
import { apiServer } from '@/lib/api-server'
import { Coupon, Category } from '@/lib/types'

// Use ISR (Incremental Static Regeneration) with 24 hour revalidation
export const revalidate = 3600;

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function AllCouponsPageRoute({ searchParams }: PageProps) {
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const category = typeof searchParams.category === 'string' ? searchParams.category : 'all';
  // Fetch all coupons and categories on server (SSR)
  let coupons: Coupon[] = [];
  let categories: Category[] = [];
  
  try {
    // Fetch coupons with specific badges OR featured status
    // We need to make 2 separate API calls and merge results since API doesn't support OR between different filters
    const [badgedCoupons, featuredCoupons, fetchedCategories] = await Promise.all([
      // Fetch coupons with verificat or merge-100 badges
      apiServer.getCoupons({ active: true, badge: ['verificat', 'merge-100'], per_page: 200 }),
      // Fetch featured coupons
      apiServer.getCoupons({ active: true, featured_homepage: true, per_page: 200 }),
      apiServer.getCategories(),
    ]);
    
    // Merge and deduplicate coupons by ID
    const couponMap = new Map<string, Coupon>();
    [...badgedCoupons, ...featuredCoupons].forEach(coupon => {
      couponMap.set(coupon.id, coupon);
    });
    
    coupons = Array.from(couponMap.values());
    categories = fetchedCategories;
  } catch (error) {
    console.error('Error fetching data:', error);
    // Fallback to empty arrays - page will still render
  }

  // No need to filter anymore - API returns pre-filtered results
  const filteredCoupons = coupons;
  
  return (
    <AllCouponsPage 
      coupons={filteredCoupons} 
      categories={categories}
      initialPage={page}
      initialCategory={category}
    />
  );
}

export const metadata = {
  title: 'Най-добрите купони - Kuponovo.bg',
  description: 'Открий най-добрите проверени купони и промо кодове',
}
