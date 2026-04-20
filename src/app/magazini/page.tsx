/**
 * Stores List Page - Server Component with SSR
 */
import { StoresListPage } from '@/components/pages/StoresListPage'
import { apiServer } from '@/lib/api-server'
import { Store } from '@/lib/types'

// Use ISR (Incremental Static Regeneration) with 24 hour revalidation
export const revalidate = 3600;

export default async function StoresListPageRoute() {
  // Fetch all stores on server (SSR)
  let stores: Store[] = [];
  try {
    // Optimize: Fetch only necessary fields for the list
    // This drastically reduces payload size and processing time on WordPress
    stores = await apiServer.getStores({
      fields: ['id', 'name', 'slug', 'logo', 'featured', 'createdAt']
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    // Fallback to empty array - page will still render
  }

  return (
    <StoresListPage stores={stores} />
  );
}

export const metadata = {
  title: 'Всички магазини - Kuponovo.bg',
  description: 'Открий всички партньорски магазини с налични промо кодове',
}
