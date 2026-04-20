/**
 * About Page - Server Component with ISR
 */
import { AboutPage } from '@/components/pages/AboutPage'

// Use ISR (Incremental Static Regeneration) with 24 hour revalidation
export const revalidate = 3600;

export default async function AboutPageRoute() {
  return <AboutPage />;
}

// Generate metadata for SEO
export async function generateMetadata() {
  return {
    title: 'За нас - Kuponovo.bg',
    description: 'Научи повече за мисията на Kuponovo.bg и как ти осигуряваме достъп до най-добрите промо кодове и оферти в България.',
  };
}






