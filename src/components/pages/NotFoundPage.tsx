// 404 Not Found Page

import Link from 'next/link';
import { Button } from '../ui/button';
import { StoreTile } from '../StoreTile';
import { Store } from '../../lib/types';

interface NotFoundPageProps {
  topStores: Store[];
}

export function NotFoundPage({ topStores }: NotFoundPageProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* 404 Message */}
        <div className="space-y-4">
          <h1 className="text-4xl">Страницата не е намерена</h1>
          <p className="text-muted-foreground text-lg">
            Съжаляваме, страницата, която търсиш, не съществува или е преместена.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            size="lg"
          >
            <Link href="/">Обратно към началната страница</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
          >
            <Link href="/kuponi">Виж всички купони</Link>
          </Button>
        </div>
      </div>

      {/* Top Stores */}
      {topStores.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl mb-8">Популярни магазини</h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-0 gap-y-6 md:justify-items-start">
            {topStores.map((store) => (
              <StoreTile 
                key={store.id} 
                store={store}
                logoOnly={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
