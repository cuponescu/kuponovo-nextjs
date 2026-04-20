/**
 * Dynamic Blog Post Page - Server Component with SSR
 * Handles root-level blog post URLs like /blog-post-title
 */
import { BlogPostPage } from '@/components/pages/BlogPostPage';
import { apiServer } from '@/lib/api-server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// Use ISR (Incremental Static Regeneration) with 24 hour revalidation
export const revalidate = 3600;

const SITE_URL = 'https://kuponovo.bg';
const SITE_NAME = 'Kuponovo.bg';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await apiServer.getBlogPost(slug);
  
  if (!post) {
    return {
      title: 'Статията не е намерена - Kuponovo.bg',
    };
  }
  
  const ogImage = post.featuredImage || DEFAULT_OG_IMAGE;
  const postUrl = `${SITE_URL}/${post.slug}`;
  
  return {
    title: `${post.title} - ${SITE_NAME}`,
    description: post.excerpt,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: postUrl,
      siteName: SITE_NAME,
      locale: 'bg_BG',
      publishedTime: post.publishedAt,
      modifiedTime: post.modifiedAt,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

// Generate JSON-LD Schema for Article
function generateArticleSchema(post: {
  title: string;
  excerpt: string;
  slug: string;
  featuredImage: string | null;
  publishedAt: string;
  modifiedAt: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage || DEFAULT_OG_IMAGE,
    datePublished: post.publishedAt,
    dateModified: post.modifiedAt,
    url: `${SITE_URL}/${post.slug}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/${post.slug}`,
    },
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}

export async function generateStaticParams() {
  try {
    const posts = await apiServer.getBlogPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export default async function BlogPostRoute({ params }: PageProps) {
  const { slug } = await params;
  
  // Try to fetch blog post
  const post = await apiServer.getBlogPost(slug);
  
  // If not a blog post, show 404
  if (!post) {
    notFound();
  }
  
  // Fetch other blog posts for sidebar (exclude current post)
  const otherPosts = await apiServer.getBlogPosts({ 
    exclude: post.id,
    per_page: 5,
  });
  
  // Generate JSON-LD schema
  const articleSchema = generateArticleSchema(post);
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BlogPostPage post={post} otherPosts={otherPosts} />
    </>
  );
}


