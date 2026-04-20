// Categories List Page

import Link from 'next/link';
import { Breadcrumbs } from '../Breadcrumbs';
import { Category } from '../../lib/types';

interface CategoriesListPageProps {
  categories: Category[];
}

export function CategoriesListPage({ categories }: CategoriesListPageProps) {
  return (
    <div className="container mx-auto px-4 pt-4 pb-4">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Начало', href: '/' },
          { label: 'Категории' },
        ]}
      />

      {/* Header */}
      <div className="mb-4 md:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-medium mb-2 md:mb-3">Всички категории</h1>
        <p className="text-sm md:text-base text-muted-foreground font-light">
          Разгледай купоните, подредени по категории, за да откриеш най-добрите оферти.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/kategoriya/${category.slug}`}
            className="group p-6 bg-card rounded-lg text-left border border-gray-200 shadow-sm hover:-translate-y-1 transition-all duration-200 block"
          >
            <h3 className="text-xl mb-2">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
