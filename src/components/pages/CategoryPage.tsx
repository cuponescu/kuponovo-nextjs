// Category Page Component

'use client';

import { Suspense, useState, useMemo } from 'react';
import { Breadcrumbs } from '../Breadcrumbs';
import { CouponCard } from '../CouponCard';
import { StoreTile } from '../StoreTile';
import { PaginationControls } from '../PaginationControls';
import { Category, Coupon, Store } from '../../lib/types';
import { paginate, getTotalPages, sortCoupons } from '../../lib/utils';

interface CategoryPageProps {
  category: Category;
  coupons: Coupon[];
}

const ITEMS_PER_PAGE = 24;

export function CategoryPage({ category, coupons }: CategoryPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllStores, setShowAllStores] = useState(false);

  // Sort coupons by clicks (most popular first)
  const sortedCoupons = sortCoupons(coupons, 'clicks');
  const totalPages = getTotalPages(sortedCoupons.length, ITEMS_PER_PAGE);
  const paginatedCoupons = paginate(sortedCoupons, currentPage, ITEMS_PER_PAGE);
  
  const STORES_PER_TWO_ROWS = 12; // Approximate 2 rows across different breakpoints

  // Use stores directly from category API response and sort by total coupon clicks
  const stores = useMemo(() => {
    // Calculate total coupon clicks for each store
    const storeClicksMap = new Map<string, number>();
    
    sortedCoupons.forEach(coupon => {
      const currentClicks = storeClicksMap.get(coupon.storeId) || 0;
      storeClicksMap.set(coupon.storeId, currentClicks + (coupon.clicks || 0));
    });
    
    let storeList: Store[];
    
    if (category.stores && category.stores.length > 0) {
      storeList = category.stores;
    } else {
      // Fallback: extract stores from coupons if category.stores is not available
      const storeMap = new Map<string, Store>();
      
      sortedCoupons.forEach(coupon => {
        if (!storeMap.has(coupon.storeId)) {
          storeMap.set(coupon.storeId, {
            id: coupon.storeId,
            slug: coupon.storeSlug || '',
            name: coupon.storeName,
            logo: coupon.storeLogo,
            activeCoupons: 0,
            categories: [],
          });
        }
        
        const store = storeMap.get(coupon.storeId)!;
        store.activeCoupons = (store.activeCoupons as number) + 1;
      });
      
      storeList = Array.from(storeMap.values());
    }
    
    // Sort stores by total coupon clicks (most popular first)
    return storeList.sort((a, b) => {
      const aClicks = storeClicksMap.get(a.id) || 0;
      const bClicks = storeClicksMap.get(b.id) || 0;
      return bClicks - aClicks;
    });
  }, [category.stores, sortedCoupons]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 pt-4 pb-4">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Начало', href: '/' },
          { label: 'Категории', href: '/kategorii' },
          { label: category.name },
        ]}
      />

      {/* Header */}
      <div className="mb-4 md:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-medium mb-2 md:mb-3">Купони {category.name}</h1>
        {category.description && (
          <p className="text-sm md:text-base text-muted-foreground font-light max-w-3xl">
            {category.description}
          </p>
        )}
        <p className="text-sm md:text-base text-muted-foreground font-light mt-3">
          {sortedCoupons.length} {sortedCoupons.length === 1 ? 'наличен купон' : 'налични купона'}
        </p>
      </div>

      {/* Stores Section */}
      {stores.length > 0 && (
        <div className="mb-8 md:mb-16">
          <h2 className="text-lg md:text-xl font-medium mb-4 md:mb-6">Магазини с купони {category.name}</h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
            {(showAllStores ? stores : stores.slice(0, STORES_PER_TWO_ROWS)).map((store) => (
              <StoreTile key={store.id} store={store} logoOnly={true} />
            ))}
          </div>
          {stores.length > STORES_PER_TWO_ROWS && !showAllStores && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowAllStores(true)}
                className="px-6 py-2 bg-card border border-gray-200 rounded-lg text-sm font-medium transition-all"
              >
                Виж още ({stores.length - STORES_PER_TWO_ROWS} магазина)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Coupons Grid */}
      {paginatedCoupons.length > 0 ? (
        <>
          <h2 className="text-xl font-medium mb-4">Всички купони</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} placement="category-page" />
            ))}
          </div>

          {/* Pagination */}
          <Suspense fallback={null}>
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </Suspense>
        </>
      ) : (
        <div className="text-center py-16 space-y-4">
          <h3 className="text-xl">Няма купони в тази категория</h3>
          <p className="text-muted-foreground">
            Виж други категории за специални оферти.
          </p>
        </div>
      )}
    </div>
  );
}
