// All Coupons Archive Page

'use client';

import { Suspense, useState, useMemo } from 'react';
import { Breadcrumbs } from '../Breadcrumbs';
import { CouponCard } from '../CouponCard';
import { PaginationControls } from '../PaginationControls';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Coupon, SortOption, Category } from '../../lib/types';
import { sortCoupons, paginate, getTotalPages } from '../../lib/utils';

interface AllCouponsPageProps {
  coupons: Coupon[];
  categories: Category[];
  initialPage?: number;
  initialCategory?: string;
}

const ITEMS_PER_PAGE = 24;

export function AllCouponsPage({ coupons, categories, initialPage = 1, initialCategory = 'all' }: AllCouponsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // Get unique store IDs from coupons
  const storeIds = useMemo(() => {
    return Array.from(new Set(coupons.map(c => c.storeId)));
  }, [coupons]);
  
  // Map store IDs to their categories (based on store names and categories)
  const storeCategoryMap = useMemo(() => {
    const map = new Map<string, string[]>();
    // For now, we'll filter by checking if the category has stores with coupons
    // This is a simplified approach - in production you'd fetch store data
    categories.forEach(category => {
      if (category.stores) {
        category.stores.forEach(store => {
          if (storeIds.includes(store.id)) {
            const existing = map.get(store.id) || [];
            map.set(store.id, [...existing, category.slug]);
          }
        });
      }
    });
    return map;
  }, [categories, storeIds]);
  
  // Filter coupons by selected category
  const categoryFilteredCoupons = useMemo(() => {
    if (selectedCategory === 'all') {
      return coupons;
    }
    return coupons.filter(coupon => {
      const storeCategories = storeCategoryMap.get(coupon.storeId) || [];
      return storeCategories.includes(selectedCategory);
    });
  }, [coupons, selectedCategory, storeCategoryMap]);

  // Sort coupons by clicks (most popular first)
  const sortedCoupons = sortCoupons(categoryFilteredCoupons, 'clicks');
  const totalPages = getTotalPages(sortedCoupons.length, ITEMS_PER_PAGE);
  const paginatedCoupons = paginate(sortedCoupons, currentPage, ITEMS_PER_PAGE);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1); // Reset to page 1 when category changes
  };

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
          { label: 'Всички купони' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-medium mb-1 md:mb-2">Най-добрите купони, валидни днес</h1>
          <p className="text-sm md:text-base text-muted-foreground font-light" suppressHydrationWarning>
            {new Date().toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Категория:</span>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички категории</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.slug} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Coupons Grid */}
      {paginatedCoupons.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} placement="all-coupons" />
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
          <h3 className="text-xl">Няма налични купони</h3>
          <p className="text-muted-foreground">
            Провери по-късно за нови оферти.
          </p>
        </div>
      )}
    </div>
  );
}
