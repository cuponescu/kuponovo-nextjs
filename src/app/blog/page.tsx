import { apiServer } from '@/lib/api-server';
import { BlogPost } from '@/lib/types';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Calendar } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Блог - Kuponovo.bg',
  description: 'Статии и ръководства за онлайн пазаруване, промо кодове и най-добрите магазини в България.',
  alternates: {
    canonical: 'https://kuponovo.bg/blog',
  },
  openGraph: {
    title: 'Блог - Kuponovo.bg',
    description: 'Статии и ръководства за онлайн пазаруване, промо кодове и най-добрите магазини в България.',
    url: 'https://kuponovo.bg/blog',
    siteName: 'Kuponovo.bg',
    locale: 'bg_BG',
    type: 'website',
  },
};

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  try {
    posts = await apiServer.getBlogPosts({ per_page: 50 });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
  }

  return (
    <div className="container mx-auto px-4 pt-4 pb-8">
      <Breadcrumbs
        items={[
          { label: 'Начало', href: '/' },
          { label: 'Блог' },
        ]}
      />

      <h1 className="text-2xl md:text-3xl font-medium mb-8">Блог</h1>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">В момента няма статии.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const formattedDate = new Date(post.publishedAt).toLocaleDateString('bg-BG', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            return (
              <Link
                key={post.id}
                href={`/${post.slug}`}
                className="group block rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {post.featuredImage ? (
                  <div className="relative w-full aspect-video">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-video bg-slate-100 flex items-center justify-center">
                    <span className="text-4xl text-slate-300">📝</span>
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-sans text-lg font-medium text-foreground group-hover:text-[#5bd72c] transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{post.excerpt}</p>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
