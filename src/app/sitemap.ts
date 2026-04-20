import { MetadataRoute } from 'next'
import { apiServer } from '@/lib/api-server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stores, blogPosts] = await Promise.all([
    apiServer.getStores({ fields: ['slug', 'modifiedAt'] }),
    apiServer.getBlogPosts({ per_page: 100 }),
  ]);

  const storeUrls = stores.map((store) => ({
    url: `https://kuponovo.bg/magazin/${store.slug}`,
    lastModified: store.modifiedAt || new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }));

  const blogUrls = blogPosts.map((post) => ({
    url: `https://kuponovo.bg/${post.slug}`,
    lastModified: post.modifiedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...storeUrls, ...blogUrls];
}
