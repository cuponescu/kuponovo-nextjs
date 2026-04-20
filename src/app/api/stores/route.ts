import { NextResponse } from 'next/server';
import { apiServer } from '@/lib/api-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  if (!search) {
    return NextResponse.json([]);
  }

  try {
    const stores = await apiServer.getStores({ search });
    
    // Return minimal data for search results
    const minimalStores = stores.map(s => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      logo: s.logo,
      website: s.storeUrl || s.contact?.website,
    }));

    return NextResponse.json(minimalStores);
  } catch (error) {
    console.error('Error searching stores:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}









