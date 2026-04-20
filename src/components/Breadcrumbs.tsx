// Breadcrumbs Component

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const SITE_URL = 'https://kuponovo.bg';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void; // Legacy support
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schemaItems = items.map((item, index) => {
    const element: Record<string, unknown> = {
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
    };
    if (item.href) {
      element["item"] = `${SITE_URL}${item.href}`;
    }
    return element;
  });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": schemaItems,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-muted-foreground mb-8" style={{ fontSize: '12px' }}>
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="w-4 h-4" />}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : item.onClick ? (
              <button
                onClick={item.onClick}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span className={index === items.length - 1 ? 'text-foreground' : ''}>
                {item.label}
              </span>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}
