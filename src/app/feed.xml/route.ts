import { apiServer } from '@/lib/api-server'

export const revalidate = 3600;

export async function GET() {
  const stores = await apiServer.getStores({ fields: ['slug', 'name', 'modifiedAt'] });

  const sorted = stores
    .filter((s) => s.modifiedAt)
    .sort((a, b) => new Date(b.modifiedAt!).getTime() - new Date(a.modifiedAt!).getTime())
    .slice(0, 100);

  const lastBuild = sorted.length > 0
    ? new Date(sorted[0].modifiedAt!).toUTCString()
    : new Date().toUTCString();

  const items = sorted.map((store) => {
    const pubDate = new Date(store.modifiedAt!).toUTCString();
    return `    <item>
      <title>${escapeXml(`Промо код ${store.name}`)}</title>
      <link>https://kuponovo.bg/magazin/${store.slug}</link>
      <pubDate>${pubDate}</pubDate>
      <guid>https://kuponovo.bg/magazin/${store.slug}</guid>
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Kuponovo.bg - Купони и промо кодове, обновявани всеки ден</title>
    <link>https://kuponovo.bg</link>
    <description>Ние сме малък, но всеотдаен екип, който всеки ден търси нови купони и активни промоции в онлайн магазините в България.</description>
    <language>bg</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="https://kuponovo.bg/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
