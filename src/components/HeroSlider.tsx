// Hero Slider Component - Displays 3 slides at once
// Uses embla-carousel's native infinite loop for smooth continuous scrolling

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from './ui/carousel';
import { SliderSlide } from '../lib/types';
import { trackEvent, getBadgeText, getOutboundUrl, normalizeUrl, decodeHTMLEntities } from '../lib/utils';

interface HeroSliderProps {
  slides: SliderSlide[];
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const router = useRouter();
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);

  // Track current slide - embla handles infinite loop natively
  useEffect(() => {
    if (!api) {
      return;
    }
    
    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleSlideClick = (slide: SliderSlide, e: React.MouseEvent) => {
    // Don't prevent default if it's a middle click or ctrl/cmd click (open in new tab)
    if (e.button === 1 || e.metaKey || e.ctrlKey) {
      return;
    }
    
    e.preventDefault();
    
    trackEvent({
      event: 'slider_click',
      data: {
        slide_id: slide.id,
        link_type: slide.linkType,
      },
    });

    // If slide has coupon data, handle exactly like CouponCard
    if (slide.linkType === 'coupon' && slide.coupon) {
      const coupon = slide.coupon;
      
      if (coupon.type === 'code') {
        // Code coupon: Open store page with modal in new tab, redirect current tab to affiliate
        trackEvent({
          event: 'coupon_cta_click',
          data: {
            coupon_id: coupon.id,
            store_id: coupon.storeId,
            placement: 'slider',
            type: 'code',
          },
        });
        
        const affiliateUrl = coupon.affiliateUrl && coupon.affiliateUrl.trim() ? normalizeUrl(coupon.affiliateUrl) : '';
        const storeUrl = coupon.storeUrl && coupon.storeUrl.trim() ? normalizeUrl(coupon.storeUrl) : '';
        const targetUrl = affiliateUrl || storeUrl;
        
        if (typeof window !== 'undefined') {
          const storeSlug = coupon.storeSlug || coupon.storeId;
          const storePageUrl = `${window.location.origin}/magazin/${storeSlug}#modal-coupon-${coupon.id}`;
          
          // Open store page with modal in NEW tab
          window.open(storePageUrl, '_blank', 'noopener,noreferrer');
          
          // Redirect current tab to affiliate/store URL
          setTimeout(() => {
            if (targetUrl) {
              window.location.href = targetUrl;
            } else {
              window.location.href = storePageUrl;
            }
          }, 100);
          
          // Track click via WordPress redirect URL
          if (coupon.redirectUrl) {
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.width = '1px';
            iframe.style.height = '1px';
            iframe.style.opacity = '0';
            iframe.style.pointerEvents = 'none';
            iframe.style.border = 'none';
            iframe.src = coupon.redirectUrl;
            document.body.appendChild(iframe);
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 1000);
          }
        }
      } else {
        // Deal/Offer: Open affiliate link in new tab
        trackEvent({
          event: 'coupon_cta_click',
          data: {
            coupon_id: coupon.id,
            store_id: coupon.storeId,
            placement: 'slider',
            type: coupon.type,
          },
        });
        window.open(getOutboundUrl('coupon', coupon.id), '_blank', 'noopener,noreferrer');
      }
    } else {
      // For store/custom links, navigate normally
      router.push(slide.ctaLink || '/');
    }
  };

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 pt-4 md:pt-8">
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: 'start',
            loop: true,
          }}
        >
          <CarouselContent className="-ml-4">
            {slides.map((slide, index) => (
              <CarouselItem key={`${slide.id}-${index}`} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <a
                  href={slide.ctaLink || '#'}
                  target={slide.linkType === 'coupon' && slide.coupon?.type !== 'code' ? '_blank' : undefined}
                  rel={slide.linkType === 'coupon' && slide.coupon?.type !== 'code' ? 'noopener noreferrer' : undefined}
                  onClick={(e) => handleSlideClick(slide, e)}
                  className="block h-full cursor-pointer"
                >
                  <Card className="overflow-hidden border border-gray-200 shadow-sm h-full flex flex-col">
                    <div className="relative w-full h-48 md:h-56 lg:h-64 flex-shrink-0 bg-gray-100">
                      {slide.desktopImage ? (
                        <Image
                          src={slide.desktopImage}
                          alt={slide.title || 'Оферта'}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                          priority={index === 0}
                          onError={() => {
                            console.error(`[HeroSlider] Failed to load image for slide ${slide.id}:`, slide.desktopImage);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          Без изображение
                        </div>
                      )}
                      
                      {/* Store logo overlay - positioned at bottom left */}
                      {slide.storeLogo && (
                        <div className="absolute bottom-4 left-4 bg-white rounded-lg w-20 h-20 flex items-center justify-center overflow-hidden border border-gray-200 z-10">
                          <div className="relative w-full h-full">
                            <Image
                              src={slide.storeLogo}
                              alt={slide.coupon!.storeName}
                              fill
                              sizes="80px"
                              className="object-cover rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Card content */}
                    <div className="px-4 pb-4 pt-0 space-y-2 flex-1 flex flex-col">
                      {slide.badge && (
                        <Badge 
                          className={`text-xs ${
                            slide.badge === 'black-friday' 
                              ? 'bg-black text-white border-black hover:bg-black/90' 
                              : slide.badge === 'exclusive' || slide.badge === 'exclusiv'
                              ? 'bg-[#5bd72c]/10 text-[#5bd72c] border-[#5bd72c]/20'
                              : slide.badge === 'super-reducere'
                              ? 'bg-[#f26869]/10 text-[#f26869] border-[#f26869]/20'
                              : slide.badge === 'merge-100'
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 '
                              : slide.badge === 'verificat'
                              ? 'bg-[#5bd72c]/10 text-[#5bd72c] border-[#5bd72c]/20 '
                              : slide.badge === 'newsletter'
                              ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 '
                              : slide.badge === 'free-shipping'
                              ? 'bg-purple-500/10 text-purple-500 border-purple-500/20 '
                              : slide.badge === 'new'
                              ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 '
                              : ''
                          }`}
                        >
                          {getBadgeText(slide.badge)}
                        </Badge>
                      )}
                      {slide.title && (
                        <h3 className="font-sans text-base line-clamp-2">
                          {decodeHTMLEntities(slide.title)}
                        </h3>
                      )}
                    </div>
                  </Card>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Dots indicator */}
          {slides.length > 1 && (
            <div className="flex justify-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (api) {
                      api.scrollTo(index);
                    }
                  }}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    index === current
                      ? 'w-8 bg-[#5bd72c]' 
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Отиди на оферта ${index + 1}`}
                />
              ))}
            </div>
          )}
        </Carousel>
      </div>
    </div>
  );
}
