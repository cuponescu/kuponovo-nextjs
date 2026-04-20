// Stores List Page

'use client';

import { Breadcrumbs } from '../Breadcrumbs';
import { StoreTile } from '../StoreTile';
import { Store } from '../../lib/types';

interface StoresListPageProps {
  stores: Store[];
}

export function StoresListPage({ stores }: StoresListPageProps) {
  // Separate featured and non-featured stores
  const featuredStores = stores.filter(store => store.featured === true);
  const nonFeaturedStores = stores.filter(store => store.featured !== true);
  
  // Group stores by first letter
  const groupedStores: { [key: string]: Store[] } = {};
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0-9'];
  
  // Initialize all letters
  alphabet.forEach(letter => {
    groupedStores[letter] = [];
  });
  
  // Group stores (only non-featured stores in alphabetical sections)
  nonFeaturedStores.forEach(store => {
    const firstChar = store.name.charAt(0).toUpperCase();
    if (/[0-9]/.test(firstChar)) {
      groupedStores['0-9'].push(store);
    } else if (/[A-Z]/.test(firstChar)) {
      groupedStores[firstChar].push(store);
    }
  });

  // Get the 18 most recently added stores (sorted by creation date, newest first)
  const newStores = [...stores]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 18);

  return (
    <div className="container mx-auto px-4 pt-4 pb-4">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Начало', href: '/' },
          { label: 'Магазини' },
        ]}
      />

      {/* Header */}
      <div className="mb-4 md:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-medium mb-2 md:mb-3">Всички магазини</h1>
        <p className="text-sm md:text-base text-muted-foreground font-light">
          Открий купони от най-популярните онлайн магазини в България.
        </p>
        <p className="text-sm md:text-base text-muted-foreground font-light mt-2">
          {stores.length} {stores.length === 1 ? 'наличен магазин' : 'налични магазина'}
        </p>
      </div>

      {/* Featured Stores Section */}
      {featuredStores.length > 0 && (
        <div id="stores-recomandate" className="mb-8 md:mb-12">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-medium mb-4 md:mb-6">Препоръчани магазини</h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8 [&>*:nth-child(3n+1)]:justify-self-start [&>*:nth-child(3n+2)]:justify-self-center [&>*:nth-child(3n)]:justify-self-end md:[&>*:nth-child(3n+1)]:justify-self-center md:[&>*:nth-child(3n+2)]:justify-self-center md:[&>*:nth-child(3n)]:justify-self-center md:[&>*:nth-child(4n+1)]:justify-self-start md:[&>*:nth-child(4n+2)]:justify-self-center md:[&>*:nth-child(4n+3)]:justify-self-center md:[&>*:nth-child(4n)]:justify-self-end lg:[&>*:nth-child(4n+1)]:justify-self-center lg:[&>*:nth-child(4n+2)]:justify-self-center lg:[&>*:nth-child(4n+3)]:justify-self-center lg:[&>*:nth-child(4n)]:justify-self-center lg:[&>*:nth-child(6n+1)]:justify-self-start lg:[&>*:nth-child(6n+2)]:justify-self-center lg:[&>*:nth-child(6n+3)]:justify-self-center lg:[&>*:nth-child(6n+4)]:justify-self-center lg:[&>*:nth-child(6n+5)]:justify-self-center lg:[&>*:nth-child(6n)]:justify-self-end">
            {featuredStores.map((store) => (
              <StoreTile 
                key={store.id} 
                store={store}
                logoOnly={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Alphabetical Navigation */}
      <div className="mb-4 md:mb-8">
        <div className="flex flex-wrap gap-1.5">
          {newStores.length > 0 && (
            <a
              href="#stores-nou-adaugate"
              className="px-3.5 py-2 text-sm font-medium hover:text-[#5bd72c] transition-colors bg-card border border-border rounded-lg whitespace-nowrap inline-block"
            >
              Нови
            </a>
          )}
          {alphabet.map(letter => (
            <a
              key={letter}
              href={groupedStores[letter].length > 0 ? `#stores-${letter}` : undefined}
              className={`px-3 py-2 text-sm font-medium transition-colors rounded-lg whitespace-nowrap inline-block bg-card border border-border ${
                groupedStores[letter].length > 0 
                  ? 'hover:text-[#5bd72c] text-foreground' 
                  : 'text-muted-foreground cursor-not-allowed pointer-events-none opacity-50'
              }`}
            >
              {letter}
            </a>
          ))}
        </div>
      </div>

      {/* New Stores Section - text only */}
      {newStores.length > 0 && (
        <div id="stores-nou-adaugate" className="mb-8 md:mb-12">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-medium mb-4 md:mb-6">Нови магазини</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-2">
            {newStores.map((store) => (
              <a
                key={store.id}
                href={`/magazin/${store.slug}`}
                className="text-sm hover:text-[#5bd72c] transition-colors truncate"
              >
                {store.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Alphabetical Sections - text only */}
      {alphabet.map(letter => {
        if (groupedStores[letter].length === 0) return null;
        
        return (
          <div key={letter} id={`stores-${letter}`} className="mb-8 md:mb-12">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-medium mb-4 md:mb-6">{letter}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-2">
              {groupedStores[letter].map((store) => (
                <a
                  key={store.id}
                  href={`/magazin/${store.slug}`}
                  className="text-sm hover:text-[#5bd72c] transition-colors truncate"
                >
                  {store.name}
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
