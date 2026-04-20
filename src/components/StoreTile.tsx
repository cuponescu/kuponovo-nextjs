// Store Tile Component (Rounded square logo)

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Store } from '../lib/types';

interface StoreTileProps {
  store: Store;
  logoOnly?: boolean; // If true, hide name and coupon count
}

export function StoreTile({ store, logoOnly = false }: StoreTileProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link 
      href={`/magazin/${store.slug}`}
      className="group flex flex-col items-center gap-2 transition-all duration-200 cursor-pointer hover:-translate-y-1 w-full"
    >
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
        {imgError || !store.logo ? (
          <span className="font-semibold text-lg text-gray-600">{store.name.charAt(0)}</span>
        ) : (
          <Image 
            src={store.logo} 
            alt={`Виж всички кодове и отстъпки ${store.name}`}
            fill
            sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, (max-width: 1024px) 144px, 160px"
            className="object-cover rounded-lg"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      {!logoOnly && (
        <div className="text-center space-y-1">
          <div className="text-sm md:text-base">
            {store.name}
          </div>
          <div className="text-xs text-muted-foreground">
            {typeof store.activeCoupons === 'number'
              ? store.activeCoupons
              : Array.isArray(store.activeCoupons)
                ? store.activeCoupons.length
                : 0} {typeof store.activeCoupons === 'number'
                  ? (store.activeCoupons === 1 ? 'купон' : 'купона')
                  : (Array.isArray(store.activeCoupons) && store.activeCoupons.length === 1 ? 'купон' : 'купона')}
          </div>
        </div>
      )}
    </Link>
  );
}
