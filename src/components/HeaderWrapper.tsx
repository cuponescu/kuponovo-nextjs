// Server Component Wrapper for Header
// Fetches stores on server and passes optimized data to client component

import { Header } from './Header';
import { apiServer } from '../lib/api-server';
import { StoreSearchData } from '../lib/types';

export async function HeaderWrapper() {
  // Fetch all stores on server
  let stores: StoreSearchData[] = [];
  
  try {
    const allStores = await apiServer.getStores({ featured: true });
    
    // Transform to minimal data for search (reduces HTML size by ~70-80%)
    stores = allStores.map(s => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      logo: s.logo,
      website: s.storeUrl || s.contact?.website,
      clicks: s.clicks,
      featured: s.featured,
    }));
  } catch (error) {
    console.error('Error fetching stores for header:', error);
    // Fallback to empty array - header will still render but without search results
  }

  return <Header stores={stores} />;
}

