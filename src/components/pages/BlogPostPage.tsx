// Blog Post Page Component

import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumbs } from '../Breadcrumbs';
import { BlogPost } from '../../lib/types';

interface BlogPostPageProps {
  post: BlogPost;
  otherPosts: BlogPost[];
}

// Process HTML content to open external links in new tab
function processExternalLinks(html: string): string {
  if (!html) return '';

  return html.replace(
    /<a\s+([^>]*href=["'])(https?:\/\/(?!(?:www\.)?kuponovo\.bg)[^"']+)(["'][^>]*)>/gi,
    (match, before, url, after) => {
      if (match.includes('target=')) return match;
      return `<a ${before}${url}${after} target="_blank" rel="noopener noreferrer">`;
    }
  );
}

export function BlogPostPage({ post, otherPosts }: BlogPostPageProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('bg-BG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  
  // Process content to open external links in new tab
  const processedContent = processExternalLinks(post.content || '');

  return (
    <div className="container mx-auto px-4 pt-4 pb-4">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Начало', href: '/' },
          { label: 'Блог', href: '/blog' },
          { label: post.title },
        ]}
      />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Blog content (2/3 width on desktop) */}
        <article className="lg:col-span-2">
          {/* Header */}
          <div className="mb-4 md:mb-8">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-medium mb-2 md:mb-4">{post.title}</h1>
            <p className="text-sm text-muted-foreground">
              Публикувано на {formattedDate}
            </p>
          </div>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative w-full aspect-video mb-6 md:mb-8 rounded-lg overflow-hidden">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-slate max-w-none
              prose-headings:font-semibold prose-headings:text-slate-900
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-2
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2
              prose-p:text-slate-700 prose-p:leading-7 prose-p:mb-4
              prose-a:text-[#5bd72c] prose-a:font-medium prose-a:no-underline hover:prose-a:underline
              prose-strong:text-slate-900 prose-strong:font-semibold
              prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
              prose-li:text-slate-700 prose-li:my-2 prose-li:leading-7
              prose-blockquote:border-l-4 prose-blockquote:border-[#5bd72c] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600
              prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
              prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-lg
              prose-img:rounded-lg prose-img:shadow-md
              prose-hr:border-slate-200 prose-hr:my-8"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        </article>

        {/* Right: Sidebar (1/3 width on desktop) */}
        <aside className="lg:col-span-1">
          <div>
            <h3 className="text-lg font-medium mb-4">Други статии</h3>
            
            {otherPosts.length > 0 ? (
              <div className="space-y-4">
                {otherPosts.map((otherPost) => (
                  <Link
                    key={otherPost.id}
                    href={`/${otherPost.slug}`}
                    className="block group"
                  >
                    <div className="flex gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      {otherPost.featuredImage && (
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={otherPost.featuredImage}
                            alt={otherPost.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex items-center">
                        <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-[#5bd72c] transition-colors">
                          {otherPost.title}
                        </h4>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                В момента няма други статии.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}


