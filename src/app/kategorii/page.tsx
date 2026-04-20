/**
 * Categories List Page - Server Component with SSR
 */
import { CategoriesListPage } from '@/components/pages/CategoriesListPage'
import { apiServer } from '@/lib/api-server'
import { Category } from '@/lib/types'

// Use ISR (Incremental Static Regeneration) with 24 hour revalidation
export const revalidate = 3600;

export default async function CategoriesListPageRoute() {
  // Fetch all categories on server (SSR)
  let categories: Category[] = [];
  try {
    categories = await apiServer.getCategories();
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Fallback to empty array - page will still render
  }

  return (
    <CategoriesListPage categories={categories} />
  );
}

export const metadata = {
  title: 'Категории - Kuponovo.bg',
  description: 'Разгледай купони и промо кодове по категории',
}
