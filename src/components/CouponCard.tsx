// Vertical Coupon Card Component

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Ticket, Tag, Clock, Flame } from 'lucide-react';
import { Coupon } from '../lib/types';
import { formatDate, isEndingSoon, isExpiringInLessThan3Days, getBadgeVariant, getBadgeText, getTypeIcon, trackEvent, getOutboundUrl, normalizeUrl, decodeHTMLEntities } from '../lib/utils';


interface CouponCardProps {
  coupon: Coupon;
  placement?: string;
}

export function CouponCard({ coupon, placement = 'grid' }: CouponCardProps) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const isExpired = coupon.status === 'expired';
  const endingSoon = !isExpired && coupon.expiresAt && isEndingSoon(coupon.expiresAt);

  // Bayesian success rate: verified/merge-100 start at 100%, others at 75%
  const isVerified = coupon.badges && (coupon.badges.includes('verificat') || coupon.badges.includes('merge-100'));
  const prior = isVerified ? 4 : 3;
  const successRate = Math.round(
    ((coupon.votes.up + prior) / (coupon.votes.up + coupon.votes.down + 4)) * 100
  );

  const handlePrimaryClick = (e: React.MouseEvent) => {
    // Don't prevent default - let the link navigate for CSS-only modal
    // Only stop propagation to prevent card click
    e.stopPropagation();

    if (coupon.type === 'code') {
      e.preventDefault();
      trackEvent({
        event: 'coupon_cta_click',
        data: {
          coupon_id: coupon.id,
          store_id: coupon.storeId,
          placement,
          type: 'code',
        },
      });
      
      // Get target URL (affiliate URL or fallback to store URL)
      const affiliateUrl = coupon.affiliateUrl && coupon.affiliateUrl.trim() ? normalizeUrl(coupon.affiliateUrl) : '';
      const storeUrl = coupon.storeUrl && coupon.storeUrl.trim() ? normalizeUrl(coupon.storeUrl) : '';
      const targetUrl = affiliateUrl || storeUrl;
      
      if (typeof window !== 'undefined') {
        const storeSlug = coupon.storeSlug || coupon.storeId;
        const storePageUrl = `${window.location.origin}/magazin/${storeSlug}#modal-coupon-${coupon.id}`;
        
        window.open(storePageUrl, '_blank', 'noopener,noreferrer');
        
        // Track click via API (keepalive ensures it completes even if page navigates)
        fetch('/api/track-click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ coupon_id: coupon.id }), keepalive: true }).catch(() => {});
        
        setTimeout(() => {
          if (targetUrl) {
            window.location.href = targetUrl;
          } else {
            window.location.href = storePageUrl;
          }
        }, 100);
      }
    } else {
      e.preventDefault();
      trackEvent({
        event: 'coupon_cta_click',
        data: {
          coupon_id: coupon.id,
          store_id: coupon.storeId,
          placement,
          type: coupon.type,
        },
      });
      // Get target URL (affiliate URL or fallback to store URL)
      // Handle empty strings as well as null/undefined
      const affiliateUrl = coupon.affiliateUrl && coupon.affiliateUrl.trim() ? normalizeUrl(coupon.affiliateUrl) : '';
      const storeUrl = coupon.storeUrl && coupon.storeUrl.trim() ? normalizeUrl(coupon.storeUrl) : '';
      const targetUrl = affiliateUrl || storeUrl;
      
      // Debug logging (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('Coupon redirect URLs:', { 
          couponId: coupon.id,
          rawAffiliateUrl: coupon.affiliateUrl, 
          rawStoreUrl: coupon.storeUrl,
          affiliateUrl,
          storeUrl,
          targetUrl 
        });
      }
      
      if (targetUrl) {
        fetch('/api/track-click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ coupon_id: coupon.id }), keepalive: true }).catch(() => {});
        
        setTimeout(() => {
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
        }, 100);
      }
    }
  };

  const handleStoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    trackEvent({
      event: 'store_cta_click',
      data: {
        store_id: coupon.storeId,
        placement: 'coupon-card',
      },
    });
    // Use WordPress redirect URL for store click tracking
    window.open(getOutboundUrl('store', coupon.storeSlug || coupon.storeId), '_blank', 'noopener,noreferrer');
  };

  const TypeIcon = coupon.type === 'code' ? Ticket : Tag;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't do anything if clicking on buttons or links
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }
    
    // Always use the same behavior as the button
    handlePrimaryClick(e);
  };

  // Check if this is a trending coupon (more than 10 clicks)
  const isTrending = coupon.clicks > 10;
  const isCarousel = placement === 'trending-carousel';

  return (
    <Card 
        onClick={handleCardClick}
        className="group relative overflow-hidden transition-all duration-200 h-full flex flex-col hover:-translate-y-1 cursor-pointer bg-white border border-gray-200 shadow-sm"
      >
        <div className="p-3 md:p-4 flex flex-col flex-1">
          {placement !== 'store-page' ? (
            <>
              {/* Two-column layout: Logo left, Content right */}
              <div className="flex gap-2 md:gap-3 mb-1 md:mb-2">
                {/* Left column: Logo */}
                <div className="relative w-20 h-20 md:w-32 md:h-32 flex-shrink-0 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-gray-100">
                  {imgError || !coupon.storeLogo ? (
                    <span className="font-semibold text-lg text-gray-600">{coupon.storeName.charAt(0)}</span>
                  ) : (
                    <Image 
                      src={coupon.storeLogo} 
                      alt={`Voucher ${coupon.storeName}`}
                      fill
                      sizes="(max-width: 768px) 80px, 128px"
                      className="object-contain rounded-lg"
                      onError={() => setImgError(true)}
                    />
                  )}
                </div>
                
                {/* Right column: Discount + Badges on one line, then Description */}
                <div className="flex-1 flex flex-col gap-1">
                  {/* One row: discount first, then badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-serif font-medium text-foreground tracking-tight" style={{ fontSize: '2rem' }}>
                      {coupon.discount}
                    </div>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {/* If expired, only show expired badge - hide all other badges */}
                      {isExpired ? (
                        <Badge className="text-xs bg-gray-500 text-white border-gray-500">
                          Expirat
                        </Badge>
                      ) : (
                        <>
                          {/* Trending fire icon badge */}
                          {isTrending && (
                            <Badge className="bg-[#f26869] text-white border-[#f26869] text-xs flex items-center justify-center p-1">
                              <Flame className="w-3 h-3" fill="currentColor" />
                            </Badge>
                          )}
                          {/* Filter out expired badge from badges array and show others */}
                          {coupon.badges
                            .filter(badge => badge !== 'expired')
                            .map((badge) => (
                              <Badge 
                                key={badge} 
                                variant={getBadgeVariant(badge)} 
                                className={`text-xs ${
                                  badge === 'black-friday' 
                                    ? 'bg-black text-white border-black hover:bg-black/90' 
                                    : badge === 'exclusive' || badge === 'exclusiv'
                                    ? 'bg-[#5bd72c]/10 text-[#5bd72c] border-[#5bd72c]/20'
                                    : badge === 'super-reducere'
                                    ? 'bg-[#f26869]/10 text-[#f26869] border-[#f26869]/20'
                                    : badge === 'merge-100'
                                    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 '
                                    : badge === 'verificat'
                                    ? 'bg-[#5bd72c]/10 text-[#5bd72c] border-[#5bd72c]/20 '
                                    : badge === 'newsletter'
                                    ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 '
                                    : badge === 'free-shipping'
                                    ? 'bg-purple-500/10 text-purple-500 border-purple-500/20 '
                                    : badge === 'new'
                                    ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 '
                                    : ''
                                }`}
                              >
                                {getBadgeText(badge)}
                              </Badge>
                            ))}
                          {endingSoon && (
                            <Badge className="text-xs bg-orange-500/10 text-orange-500 border-orange-500/20 ">
                              Изтича скоро
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div>
                    <h3 className="font-sans line-clamp-2 font-light text-foreground text-base">
                      {decodeHTMLEntities(coupon.title)}
                    </h3>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Default layout: discount left, badges center, logo right */}
              <div className="flex items-start gap-2 mb-3">
                {/* Left: Discount */}
                <div className="font-serif font-medium text-foreground tracking-tight flex-shrink-0" style={{ fontSize: '2rem' }}>
                  {coupon.discount}
                </div>

                {/* Center: Badges */}
                <div className="flex flex-wrap gap-1.5 flex-1 items-start justify-start">
                  {/* If expired, only show expired badge - hide all other badges */}
                  {isExpired ? (
                    <Badge className="text-xs bg-gray-500 text-white border-gray-500">
                      Expirat
                    </Badge>
                  ) : (
                    <>
                      {/* Trending fire icon badge */}
                      {isTrending && (
                        <Badge className="bg-[#f26869] text-white border-[#f26869] text-xs flex items-center justify-center p-1">
                          <Flame className="w-3 h-3" fill="currentColor" />
                        </Badge>
                      )}
                      {/* Filter out expired badge from badges array and show others */}
                      {coupon.badges
                        .filter(badge => badge !== 'expired')
                        .map((badge) => (
                          <Badge 
                            key={badge} 
                            variant={getBadgeVariant(badge)} 
                            className={`text-xs ${
                              badge === 'black-friday' 
                                ? 'bg-black text-white border-black hover:bg-black/90' 
                                : badge === 'exclusive' || badge === 'exclusiv'
                                ? 'bg-[#5bd72c]/10 text-[#5bd72c] border-[#5bd72c]/20'
                                : badge === 'super-reducere'
                                ? 'bg-[#f26869]/10 text-[#f26869] border-[#f26869]/20'
                                : badge === 'merge-100'
                                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 '
                                : badge === 'verificat'
                                ? 'bg-[#5bd72c]/10 text-[#5bd72c] border-[#5bd72c]/20 '
                                : badge === 'newsletter'
                                ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 '
                                : badge === 'free-shipping'
                                ? 'bg-purple-500/10 text-purple-500 border-purple-500/20 '
                                : badge === 'new'
                                ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 '
                                : ''
                            }`}
                          >
                            {getBadgeText(badge)}
                          </Badge>
                        ))}
                      {endingSoon && (
                        <Badge className="text-xs bg-orange-500/10 text-orange-500 border-orange-500/20 ">
                          Изтича скоро
                        </Badge>
                      )}
                    </>
                  )}
                </div>

                {/* Right: Store logo only */}
                <div className="relative w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200">
                  {imgError || !coupon.storeLogo ? (
                    <span className="font-semibold text-sm text-gray-600">{coupon.storeName.charAt(0)}</span>
                  ) : (
                    <Image 
                      src={coupon.storeLogo} 
                      alt={`Voucher ${coupon.storeName}`}
                      fill
                      sizes="48px"
                      className="object-cover"
                      onError={() => setImgError(true)}
                    />
                  )}
                </div>
              </div>
              
              {/* Title */}
              <div className="mb-3">
                <h3 className="font-sans line-clamp-2 font-light text-foreground text-base">
                  {decodeHTMLEntities(coupon.title)}
                </h3>
              </div>
            </>
          )}

          {/* Meta row */}
          <div className={`flex items-center gap-3 md:gap-4 text-sm text-muted-foreground mb-1.5 md:mb-2 ${placement !== 'store-page' ? 'justify-center' : ''}`}>
            <div className="flex items-center gap-1">
              <TypeIcon className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-xs">
                {coupon.type === 'code' ? 'Код' : 'Оферта'}
              </span>
            </div>
            {coupon.expiresAt && (
              <div className="flex items-center gap-1">
                <Clock className={`w-3 h-3 md:w-4 md:h-4 ${isExpiringInLessThan3Days(coupon.expiresAt) ? 'text-red-600' : ''}`} />
                <span
                  className={`text-xs ${isExpiringInLessThan3Days(coupon.expiresAt) ? 'text-red-600 font-medium' : ''}`}
                  suppressHydrationWarning
                >
                  {formatDate(coupon.expiresAt)}
                </span>
              </div>
            )}
          </div>

          {/* CTA area */}
          <div className="space-y-1.5 md:space-y-2 pt-1 md:pt-2 mt-auto pb-2 md:pb-3">
            {coupon.type === 'code' ? (
              <a
                href={`/magazin/${coupon.storeSlug || coupon.storeId}#modal-coupon-${coupon.id}`}
                onClick={(e) => {
                  handlePrimaryClick(e);
                }}
                className={`relative w-full h-9 md:h-11 font-medium text-sm flex items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer group ${
                  isExpired
                    ? 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                    : 'bg-[#5bd72c] hover:bg-[#5ecc2f]'
                }`}
              >
                <span className={`relative z-10 ${isExpired ? 'text-gray-600' : 'text-[#0d2245]'}`}>Покажи кода</span>
                {/* Folded corner using border technique - exact match from Figma */}
                <div 
                  className={`absolute right-0 bottom-0 pointer-events-none rounded-tl-lg rounded-br-lg transition-all duration-150 ease-in-out ${
                    isExpired 
                      ? 'w-[25px] h-[25px] bg-gray-500 border-b-[25px] border-b-[#E5E8F0] border-l-[25px] border-l-transparent group-hover:w-[33px] group-hover:h-[33px] group-hover:border-b-[33px] group-hover:border-l-[33px]'
                      : 'w-[25px] h-[25px] bg-[#4caf23] border-b-[25px] border-b-[#E5E8F0] border-l-[25px] border-l-transparent group-hover:w-[33px] group-hover:h-[33px] group-hover:border-b-[33px] group-hover:border-l-[33px]'
                  }`}
                />
              </a>
            ) : (
              <a
                href={
                  (coupon.affiliateUrl && coupon.affiliateUrl.trim()) || (coupon.storeUrl && coupon.storeUrl.trim())
                    ? normalizeUrl(coupon.affiliateUrl || coupon.storeUrl || '')
                    : '#'
                }
                onClick={(e) => {
                  handlePrimaryClick(e);
                }}
                className={`w-full h-9 md:h-11 font-medium text-sm flex items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer ${
                  isExpired
                    ? 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                    : 'bg-[#5bd72c] text-[#0d2245] hover:bg-[#4caf23]'
                }`}
              >
                Виж офертата
              </a>
            )}
            {/* Store link - appears on all coupon types except store page */}
            {placement !== 'store-page' && (
              <Link
                href={coupon.storeSlug ? `/magazin/${coupon.storeSlug}` : `/magazin/${coupon.storeId}`}
                onClick={(e) => {
                  e.stopPropagation();
                  trackEvent({
                    event: 'store_cta_click',
                    data: {
                      store_id: coupon.storeId,
                      placement: 'coupon-card',
                    },
                  });
                }}
                className="block text-xs text-center text-muted-foreground hover:text-foreground underline mb-2"
              >
                {coupon.type === 'code' ? `${coupon.storeName} кодове за отстъпки` : `Оферта ${coupon.storeName}`}
              </Link>
            )}
          </div>

          {/* Footer micro row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 md:pt-3">
            {coupon.type === 'code' && <span>Успеваемост: {successRate}%</span>}
            <span className={coupon.type !== 'code' ? 'ml-auto' : ''}>{coupon.clicks} използвания</span>
          </div>
        </div>
      </Card>
  );
}
