import { NotFoundPage } from '@/components/pages/NotFoundPage'
import { apiServer } from '@/lib/api-server'
import { Store } from '@/lib/types'

export const dynamic = 'force-dynamic'; // Make this page dynamic to avoid build-time fetch

export default async function NotFound() {
  // Fetch stores for the not found page (with error handling)
  let stores: Store[] = [];
  try {
    stores = await apiServer.getStores({ featured: true });
  } catch (error) {
    console.error('Error fetching stores for 404 page:', error);
    // Continue with empty stores array
  }

  return (
    <NotFoundPage
      topStores={stores}
    />
  );
}
