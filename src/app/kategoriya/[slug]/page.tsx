/**
 * Category Page - Server Component with SSR
 */
import { CategoryPage } from '@/components/pages/CategoryPage'
import { apiServer } from '@/lib/api-server'
import { notFound } from 'next/navigation'

// Use ISR (Incremental Static Regeneration) with 24 hour revalidation
export const revalidate = 3600;

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function CategoryPageRoute({ params }: PageProps) {
  // Fetch category data on server (SSR)
  const category = await apiServer.getCategory(params.slug);

  if (!category) {
    notFound();
  }

  // Get active coupons for this category (exclude expired)
  const categoryCoupons = category.coupons 
    ? category.coupons.filter(c => c.status === 'active') // Only active coupons
    : []; // Category API now always returns coupons from stores in that category

  return (
    <CategoryPage
      category={category}
      coupons={categoryCoupons}
    />
  );
}

export async function generateStaticParams() {
  try {
    const categories = await apiServer.getCategories();
    return categories.map((cat) => ({ slug: cat.slug }));
  } catch {
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const category = await apiServer.getCategory(params.slug);
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} - Купони и промо кодове | Kuponovo.bg`,
    description: category.description || `Най-добрите промо кодове в категория ${category.name}`,
  };
}
