/**
 * Privacy Policy Page - Server Component with ISR
 */
import { PrivacyPage } from '@/components/pages/PrivacyPage'

// Use ISR (Incremental Static Regeneration) with 24 hour revalidation
export const revalidate = 3600;

export default async function PrivacyPageRoute() {
  return <PrivacyPage />;
}

// Generate metadata for SEO
export async function generateMetadata() {
  return {
    title: 'Политика за поверителност - Kuponovo.bg',
    description: 'Политика за поверителност на Kuponovo.bg. Научи как събираме, използваме и защитаваме твоите лични данни.',
  };
}






