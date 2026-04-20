/**
 * Contact Page - Server Component with ISR
 */
import { ContactPage } from '@/components/pages/ContactPage'

// Use ISR (Incremental Static Regeneration) with 24 hour revalidation
export const revalidate = 3600;

export default async function ContactPageRoute() {
  return <ContactPage />;
}

// Generate metadata for SEO
export async function generateMetadata() {
  return {
    title: 'Контакти - Kuponovo.bg',
    description: 'Свържи се с екипа на Kuponovo.bg за въпроси, предложения или партньорства. Тук сме, за да ти помогнем!',
  };
}






