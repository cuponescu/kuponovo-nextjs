/**
 * Terms and Conditions Page - Server Component with ISR
 */
import { TermsPage } from '@/components/pages/TermsPage'

// Use ISR (Incremental Static Regeneration) with 24 hour revalidation
export const revalidate = 3600;

export default async function TermsPageRoute() {
  return <TermsPage />;
}

// Generate metadata for SEO
export async function generateMetadata() {
  return {
    title: 'Общи условия - Kuponovo.bg',
    description: 'Общи условия за използване на услугите на Kuponovo.bg. Прочети условията, преди да използваш платформата ни.',
  };
}






