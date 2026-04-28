// Store Page Component

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumbs } from '../Breadcrumbs';
import { CouponCard } from '../CouponCard';
import { CouponRevealModal } from '../CouponRevealModal';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ExternalLink, Star, Info, MapPin, Phone, Mail, Globe, Facebook, Instagram } from 'lucide-react';
import { Store, Coupon } from '../../lib/types';
import { trackEvent, getOutboundUrl } from '../../lib/utils';
import { toast } from 'sonner';
import { rateStore } from '../../lib/api-client';
import { StoreSchema } from '../StoreSchema';

interface StorePageProps {
  store: Store;
  activeCoupons: Coupon[];
  expiredCoupons: Coupon[];
  relatedStores?: Store[];
  categoryName?: string;
  featuredStores?: Store[];
}

// FAQ questions template (same for all stores, just replace store name)
const FAQ_QUESTIONS = [
  {
    question: "Как използвам промо код за {store_name}?",
    answer: "За да използваш промо код за {store_name}, копирай кода от нашия сайт, добави продуктите в количката на {store_name}, а на финала въведи кода в специалното поле. Отстъпката ще бъде приложена автоматично при финализиране на поръчката."
  },
  {
    question: "Колко време са валидни промо кодовете за {store_name}?",
    answer: "Всеки промо код за {store_name} има период на валидност, показан ясно на купона. На всеки купон в нашия сайт ще видиш датата на изтичане. Препоръчваме ти да провериш датата преди да използваш кода."
  },
  {
    question: "Мога ли да комбинирам няколко промо кода за {store_name}?",
    answer: "Обикновено {store_name} позволява използването само на един промо код на поръчка. Някои промоции обаче могат да се комбинират с други активни оферти. Провери условията на всеки код за подробности."
  },
  {
    question: "Как да съм сигурен, че промо кодът за {store_name} ще работи?",
    answer: "Провери датата на валидност на кода и се увери, че продуктите в количката са допустими за отстъпка. Избирай купоните с възможно най-висока успеваемост — те са потвърдени от общността като работещи. За допълнителна помощ се свържи с обслужването на клиенти на {store_name}."
  },
  {
    question: "Как научавам за новите промо кодове за {store_name}?",
    answer: "В Kuponovo.bg постоянно актуализираме промо кодовете за {store_name}. Посещавай страницата ни редовно или я запази в любими, за да си в крак с най-новите оферти и купони за {store_name}."
  },
  {
    question: "Има ли отстъпка за първа поръчка в {store_name}?",
    answer: "{store_name} често предлага специални кодове за нови клиенти. Провери секцията ни с купони за оферти, насочени към първата поръчка, или се регистрирай на сайта на {store_name} за ексклузивни отстъпки."
  }
];

// Helper component for related store logos with their own error state
function RelatedStoreLogo({ store: relatedStore }: { store: Store }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="relative w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-gray-100 flex-shrink-0">
      {imgError || !relatedStore.logo ? (
        <span className="font-semibold text-sm text-gray-600">{relatedStore.name.charAt(0)}</span>
      ) : (
        <Image 
          src={relatedStore.logo} 
          alt={relatedStore.name}
          fill
          sizes="48px"
          className="object-contain"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
}

export function StorePage({ store, activeCoupons, expiredCoupons, relatedStores = [], categoryName = '', featuredStores = [] }: StorePageProps) {
  const [activeTab, setActiveTab] = useState<'toate' | 'coduri' | 'promotii'>('toate');
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [currentRating, setCurrentRating] = useState(store.rating || 5.0);
  const [ratingCount, setRatingCount] = useState(store.ratingCount || 89);
  const [isClient, setIsClient] = useState(false);
  const [openModalId, setOpenModalId] = useState<string | null>(null);
  const [storeLogoError, setStoreLogoError] = useState(false);
  
  const sortCouponsByPriority = (coupons: Coupon[]): Coupon[] => {
    return [...coupons].sort((a, b) => {
      const aHasBadge = a.badges && (a.badges.includes('exclusive') || a.badges.includes('verificat') || a.badges.includes('merge-100'));
      const bHasBadge = b.badges && (b.badges.includes('exclusive') || b.badges.includes('verificat') || b.badges.includes('merge-100'));

      if (aHasBadge && !bHasBadge) return -1;
      if (!aHasBadge && bHasBadge) return 1;

      const orderDiff = (b.order || 0) - (a.order || 0);
      if (orderDiff !== 0) return orderDiff;

      return (b.clicks || 0) - (a.clicks || 0);
    });
  };
  
  // Sort active coupons
  const sortedActiveCoupons = sortCouponsByPriority(activeCoupons);
  
  // Generate FAQ with store name
  const faqQuestions = FAQ_QUESTIONS.map(faq => ({
    question: faq.question.replace(/{store_name}/g, store.name),
    answer: faq.answer.replace(/{store_name}/g, store.name)
  }));

  // Check if user already rated on mount
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const savedRating = localStorage.getItem(`store_rating_v2_${store.id}`);
      if (savedRating) {
        setUserRating(Number(savedRating));
      }
    }
  }, [store.id]);
  
  // Check hash for modal after coupons are loaded and client is ready
  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;
    
    // Small delay to ensure DOM is ready and avoid hydration conflicts
    const checkHash = () => {
      const hash = window.location.hash;
      // More robust: match exactly #modal-coupon- followed by coupon ID
      const match = hash.match(/^#modal-coupon-([^#]+)$/);
      if (match) {
        const couponId = match[1]; // Extract just the ID part
        // Verify coupon exists before opening modal
        const allCoupons = [...activeCoupons, ...expiredCoupons];
        // Check both string and number comparison (coupon.id might be number or string)
        const couponExists = allCoupons.some(c => 
          (String(c.id) === couponId || c.id === couponId) && c.type === 'code'
        );
        
        if (couponExists) {
          setOpenModalId(couponId);
        } else {
          // Debug: log if coupon not found (always log in development, or on live for debugging)
          console.log('Modal coupon not found:', {
            couponId,
            extractedHash: hash,
            allCouponIds: allCoupons.map(c => ({ id: c.id, type: c.type, storeName: c.storeName })),
            hash,
            activeCount: activeCoupons.length,
            expiredCount: expiredCoupons.length
          });
        }
      }
    };
    
    // Check immediately
    checkHash();
    
    // Also check after a small delay to catch any race conditions
    const timeoutId = setTimeout(checkHash, 100);
    return () => clearTimeout(timeoutId);
  }, [isClient, activeCoupons, expiredCoupons]);
  
  // Listen for hash changes
  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;
    
    const handleHashChange = () => {
      const hash = window.location.hash;
      // More robust: match exactly #modal-coupon- followed by coupon ID
      const match = hash.match(/^#modal-coupon-([^#]+)$/);
      if (match) {
        const couponId = match[1]; // Extract just the ID part
        // Verify coupon exists before opening modal
        const allCoupons = [...activeCoupons, ...expiredCoupons];
        // Check both string and number comparison (coupon.id might be number or string)
        const couponExists = allCoupons.some(c => 
          (String(c.id) === couponId || c.id === couponId) && c.type === 'code'
        );
        if (couponExists) {
          setOpenModalId(couponId);
        } else {
          setOpenModalId(null);
        }
      } else {
        setOpenModalId(null);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isClient, activeCoupons, expiredCoupons]);

  const handleVisitStore = () => {
    const affiliateUrl = store.affiliateUrl || store.storeUrl;
    if (affiliateUrl) {
      trackEvent({
        event: 'store_cta_click',
        data: {
          store_id: store.id,
          placement: 'store-header',
        },
      });
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    }
  };


  const handleStarClick = async (rating: number) => {
    // Check if user already rated this store
    if (typeof window !== 'undefined') {
      const storedRating = localStorage.getItem(`store_rating_v2_${store.id}`);
      if (storedRating) {
        return; // Already rated
      }
    }

    try {
      // Send rating to WordPress
      const response = await rateStore(store.id, rating);

      if (response.ok) {
        const data = await response.json();
        setCurrentRating(data.rating);
        setRatingCount(data.ratingCount);
        setUserRating(rating);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(`store_rating_v2_${store.id}`, rating.toString());
        }
        
        toast.success('Благодарим за оценката!');
        
        trackEvent({
          event: 'store_cta_click',
          data: {
            store_id: store.id,
            action: 'rate',
            rating,
          },
        });
      } else {
        if (response.status === 429) {
          toast.error('Твърде много заявки. Моля опитай отново след минута.');
          return;
        }
        const errorText = await response.text();
        console.error('Rating failed:', errorText);
        toast.error('Грешка при изпращане на оценката');
      }
    } catch (error) {
      console.error('Error rating store:', error);
      toast.error('Грешка при изпращане на оценката');
    }
  };

  return (
    <>
      <StoreSchema store={store} />
      <div className="container mx-auto px-4 pt-4 pb-2 flex flex-col min-h-[calc(100vh-200px)]">
        {/* Store Header */}
      <div className="rounded-lg mb-2 md:mb-8">
        <div className="flex flex-col">
          <div className="flex items-start gap-4 md:gap-6">
            {/* Store Logo + Mobile CTA */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => {
                  const affiliateUrl = store.affiliateUrl || store.storeUrl;
                  if (affiliateUrl) {
                    trackEvent({
                      event: 'store_cta_click',
                      data: {
                        store_id: store.id,
                        placement: 'store-logo',
                      },
                    });
                    window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="relative w-16 h-16 md:w-[10rem] md:h-[10rem] rounded-lg bg-white flex items-center justify-center overflow-hidden border border-gray-200 cursor-pointer"
              >
                {storeLogoError || !store.logo ? (
                  <span className="font-semibold text-2xl text-gray-600">{store.name.charAt(0)}</span>
                ) : (
                  <Image 
                    src={store.logo} 
                    alt={store.name}
                    fill
                    sizes="(max-width: 768px) 64px, 160px"
                    className="object-cover"
                    onError={() => setStoreLogoError(true)}
                  />
                )}
              </button>
              {/* Mobile "Viziteaza" icon button */}
              {(store.affiliateUrl || store.storeUrl) && (
                <button
                  onClick={() => {
                    trackEvent({
                      event: 'store_cta_click',
                      data: { store_id: store.id, placement: 'store-header-button' },
                    });
                    window.open(store.affiliateUrl || store.storeUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="md:hidden flex items-center justify-center w-16 h-7 text-foreground border border-gray-200 rounded transition-colors"
                  aria-label={`Посети ${store.name}`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Store Info */}
            <div className="flex-1 flex flex-col gap-0.5 md:gap-1.5 md:h-[10rem]">
              <h1 className="text-[1.4rem] leading-snug md:text-3xl font-medium -mt-0.5 md:mt-0">{store.name} кодове за отстъпки</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((starIndex) => {
                    const isFilled = (hoveredStar !== null ? starIndex <= hoveredStar : starIndex <= Math.round(currentRating));
                    const isUserRated = userRating !== null || (isClient && typeof window !== 'undefined' && localStorage.getItem(`store_rating_v2_${store.id}`));
                    
                    return (
                      <button
                        key={starIndex}
                        onClick={() => !isUserRated && handleStarClick(starIndex)}
                        onMouseEnter={() => !isUserRated && setHoveredStar(starIndex)}
                        onMouseLeave={() => !isUserRated && setHoveredStar(null)}
                        disabled={!!isUserRated}
                        className={`transition-all ${isUserRated ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                        aria-label={`Rate ${starIndex} stars`}
                      >
                        <Star
                          className={`w-4 h-4 md:w-5 md:h-5 ${isFilled ? 'fill-[#5bd72c] text-[#5bd72c]' : 'text-gray-300'}`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-base md:text-lg font-medium">{currentRating.toFixed(1)}</span>
                <span className="text-sm md:text-base text-muted-foreground">от {ratingCount} клиенти</span>
              </div>
              
              <h2 className="font-sans text-sm md:text-base text-foreground font-light">
                Тук намираш най-добрите промо кодове и оферти от {store.name}, проверени днес <span className="font-medium" suppressHydrationWarning>{new Date().toLocaleDateString('bg-BG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</span>.
              </h2>

              {/* Desktop "Viziteaza" button */}
              {(store.affiliateUrl || store.storeUrl) && (
                <button
                  onClick={() => {
                    trackEvent({
                      event: 'store_cta_click',
                      data: { store_id: store.id, placement: 'store-header-button' },
                    });
                    window.open(store.affiliateUrl || store.storeUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="hidden md:inline-flex md:self-start items-center gap-1.5 text-sm font-medium text-foreground hover:text-foreground border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors md:mt-auto"
                >
                  <ExternalLink className="w-4 h-4" />
                  Посети {store.name}
                </button>
              )}
            </div>
          </div>
          
        </div>
      </div>

      {/* Coupons Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => {
        const newTab = v as 'toate' | 'coduri' | 'promotii';
        setActiveTab(newTab);
      }}>
        {/* Tabs Navigation - stays on white background */}
        <div 
          className="overflow-x-auto -mx-4 px-4 [&::-webkit-scrollbar]:hidden" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <TabsList className="mb-0 !bg-transparent !p-0 !h-auto gap-6 !border-0 inline-flex w-auto">
            <TabsTrigger 
              value="toate" 
              className="!bg-transparent !shadow-none !border-0 data-[state=active]:!bg-transparent data-[state=active]:!border-t-0 data-[state=active]:!border-l-0 data-[state=active]:!border-r-0 data-[state=active]:!border-b-2 data-[state=active]:!border-[#5bd72c] data-[state=active]:!text-[#5bd72c] !rounded-none pb-2 whitespace-nowrap"
            >
              Всички ({sortedActiveCoupons.length})
            </TabsTrigger>
            <TabsTrigger 
              value="coduri"
              className="!bg-transparent !shadow-none !border-0 data-[state=active]:!bg-transparent data-[state=active]:!border-t-0 data-[state=active]:!border-l-0 data-[state=active]:!border-r-0 data-[state=active]:!border-b-2 data-[state=active]:!border-[#5bd72c] data-[state=active]:!text-[#5bd72c] !rounded-none pb-2 whitespace-nowrap"
            >
              Кодове ({sortedActiveCoupons.filter(c => c.type === 'code').length})
            </TabsTrigger>
            <TabsTrigger 
              value="promotii"
              className="!bg-transparent !shadow-none !border-0 data-[state=active]:!bg-transparent data-[state=active]:!border-t-0 data-[state=active]:!border-l-0 data-[state=active]:!border-r-0 data-[state=active]:!border-b-2 data-[state=active]:!border-[#5bd72c] data-[state=active]:!text-[#5bd72c] !rounded-none pb-2 whitespace-nowrap"
            >
              Оферти ({sortedActiveCoupons.filter(c => c.type === 'sale').length})
            </TabsTrigger>
            <button
              onClick={(e) => {
                e.preventDefault();
                // Scroll to the section without changing tabs
                const element = document.getElementById('despre-store');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="inline-flex items-center justify-center text-sm font-medium whitespace-nowrap transition-colors text-foreground hover:text-[#5bd72c] pb-2"
            >
              За {store.name}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                // Scroll to the FAQ section without changing tabs
                const element = document.getElementById('faq-store');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="inline-flex items-center justify-center text-sm font-medium whitespace-nowrap transition-colors text-foreground hover:text-[#5bd72c] pb-2"
            >
              Често задавани въпроси {store.name}
            </button>
          </TabsList>
        </div>

        {/* Full Width Background Wrapper for Content */}
        <div className="-mx-4 md:-mx-[50vw] md:ml-[calc(-50vw+50%)] md:mr-[calc(-50vw+50%)] bg-slate-50 -mt-2">
          <div className="container mx-auto px-4">
            <TabsContent value="toate" className="space-y-6 pt-8">
              {sortedActiveCoupons.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedActiveCoupons.map((coupon) => (
                    <CouponCard key={coupon.id} coupon={coupon} placement="store-page" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl">В момента няма активни купони</h3>
                    <p className="text-muted-foreground">
                      Провери по-късно или посети директно магазина за оферти.
                    </p>
                  </div>
                  {expiredCoupons.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Виж изтеклите купони или посети магазина:
                      </p>
                      <Button 
                        onClick={handleVisitStore}
                        size="lg"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Посети {store.name}
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Show expired coupons section */}
              {expiredCoupons.length > 0 && (
                <div className="mt-12 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Изтекли купони ({expiredCoupons.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {expiredCoupons.map((coupon) => (
                      <CouponCard key={coupon.id} coupon={coupon} placement="store-page" />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="coduri" className="space-y-6 pt-8">
              {sortedActiveCoupons.filter(c => c.type === 'code').length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedActiveCoupons.filter(c => c.type === 'code').map((coupon) => (
                    <CouponCard key={coupon.id} coupon={coupon} placement="store-page" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 space-y-2">
                  <h3 className="text-xl">В момента няма активни промо кодове</h3>
                  <p className="text-muted-foreground">
                    Провери другите категории за налични оферти.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="promotii" className="space-y-6 pt-8">
              {sortedActiveCoupons.filter(c => c.type === 'sale').length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedActiveCoupons.filter(c => c.type === 'sale').map((coupon) => (
                    <CouponCard key={coupon.id} coupon={coupon} placement="store-page" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 space-y-2">
                  <h3 className="text-xl">В момента няма активни оферти</h3>
                  <p className="text-muted-foreground">
                    Провери другите категории за налични оферти.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Affiliate Disclosure */}
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-6 pb-8">
              <Info className="w-3 h-3 flex-shrink-0" />
              <span>
                {store.affiliateUrl ? (
                  'Можем да получим комисиона, когато използваш тези връзки.'
                ) : (
                  'Не получаваме комисиона, когато използваш тези връзки.'
                )}
              </span>
            </p>
          </div>
        </div>
      </Tabs>
      
      {/* About Store Section - Always shown (for FAQ) */}
      <div id="despre-store" className="scroll-mt-20">
        <h2 className="text-2xl font-medium mb-6 mt-8">За {store.name}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Contact Information - 1 column */}
            {store.contact && Object.values(store.contact).some(v => v) && (
              <div className="bg-slate-50 rounded-lg p-6 h-fit">
                <h3 className="text-lg font-medium mb-4 ">Контакти {store.name}</h3>
                <div className="space-y-3 text-sm font-light">
                  {store.contact.address && (
                    <div className="flex gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="whitespace-pre-line">{store.contact.address}</div>
                    </div>
                  )}
                  {store.contact.phone && (
                    <div className="flex gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <a href={`tel:${store.contact.phone}`} className="hover:text-[#5bd72c] break-all overflow-hidden">
                        {store.contact.phone}
                      </a>
                    </div>
                  )}
                  {store.contact.email && (
                    <div className="flex gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <a href={`mailto:${store.contact.email}`} className="hover:text-[#5bd72c] break-all overflow-hidden">
                        {store.contact.email}
                      </a>
                    </div>
                  )}
                  {store.contact.website && (
                    <div className="flex gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <a 
                        href={store.contact.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-[#5bd72c] break-all overflow-hidden"
                      >
                        {store.contact.website}
                      </a>
                    </div>
                  )}
                  {store.contact.facebook && (
                    <div className="flex gap-3">
                      <Facebook className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <a 
                        href={store.contact.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-[#5bd72c] break-all overflow-hidden"
                      >
                        {store.contact.facebook}
                      </a>
                    </div>
                  )}
                  {store.contact.instagram && (
                    <div className="flex gap-3">
                      <Instagram className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <a 
                        href={store.contact.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-[#5bd72c] break-all overflow-hidden"
                      >
                        {store.contact.instagram}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Description and FAQ - 3 columns */}
            <div className={store.contact && Object.values(store.contact).some(v => v) ? "lg:col-span-3" : "lg:col-span-4"}>
              {store.description && (
                <div 
                  className="prose prose-sm max-w-none font-light"
                  dangerouslySetInnerHTML={{ __html: store.description }}
                />
              )}
              
              {/* FAQ Section - always shown */}
              <div id="faq-store" className={store.description ? "mt-8" : ""}>
                <h3 className="text-xl font-medium mb-4 ">Често задавани въпроси {store.name}</h3>
                <div className="space-y-4">
                  {faqQuestions.map((faq, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-base mb-2 ">{faq.question}</h4>
                      <p className="text-sm font-light text-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
      </div>

      {/* About Kuponovo Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-medium mb-6">За нас</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 text-sm font-light text-foreground leading-relaxed">
          {/* Row 1, Column 1 */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-foreground">Как проверяваме купоните за {store.name}?</h3>
            <p>
              Качеството и валидността на промо кодовете за {store.name} са наш основен приоритет. Всеки купон
              се проверява ръчно от нашия екип преди да бъде публикуван на сайта. Освен това общността ни
              от потребители играе важна роля: след като използваш код, можеш да гласуваш дали е работил,
              а тази обратна връзка се отразява директно в успеваемостта, показана на всеки купон.
            </p>
            <p>
              Успеваемостта е индикатор, видим на всеки промо код за {store.name}, изчисляван в реално време
              въз основа на гласовете на потребителите. Купоните с висока успеваемост са потвърдени от
              общността като работещи, докато тези с ниска успеваемост може да са изтекли или условни.
              Можеш също да оцениш партньорските магазини и така да помогнеш на другите потребители да
              вземат информирани решения.
            </p>
            <p>
              Нашата система за проверка съчетава експертизата на екипа с приноса на общността, за да ти
              осигури винаги достъп до най-добрите промо кодове за {store.name}. Датите на изтичане са ясно
              показани на всеки купон, а изтеклите кодове се маркират автоматично, за да улесним
              пазаруването ти.
            </p>
          </div>

          {/* Row 1, Column 2 */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-foreground">Как изчисляваме успеваемостта на купоните за {store.name}?</h3>
            <p>
              В Kuponovo.bg всеки промо код за {store.name} има успеваемост, показана директно на купона,
              изчислена въз основа на реалната обратна връзка от потребителите, използвали кода. Този
              индикатор ти помага да избереш най-надеждните купони за {store.name}, преди да финализираш
              поръчката си.
            </p>
            <p>
              Успеваемостта на промо кодовете за {store.name} започва от стойност по подразбиране 75% за
              новодобавените купони на платформата. С потвърждения от потребителите тя нараства, а
              купоните, валидирани от общността, могат да достигнат 95–100%. Успеваемостта се обновява в
              реално време, така че най-надеждните купони винаги остават видими за теб.
            </p>
            <p>
              Нашият алгоритъм използва балансирана претеглена средна стойност, а успеваемостта се
              коригира едва след повече потвърждения от общността. Така осигуряваме справедлива оценка за
              всеки промо код за {store.name}, достъпен на сайта.
            </p>
            <p>
              Препоръчваме ти винаги да избираш купоните с възможно най-висока успеваемост за най-добри
              резултати. Не забравяй да гласуваш, след като използваш код — твоят принос помага на цялата
              общност на Kuponovo да спестява повече при покупките от {store.name}.
            </p>
          </div>

          {/* Row 2, Column 1 */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-foreground">Защо да използваш купони и промо кодове?</h3>
            <p>
              <strong>1.</strong> Получаваш допълнителни <strong>ОТСТЪПКИ</strong>, които повечето купувачи не
              получават. Имаме директно договорени сделки с онлайн магазини, които предлагат ЕКСКЛУЗИВНИ
              кодове за нашата общност от 5%, 10% и дори 15% или 20% в някои случаи.
            </p>
            <p>
              <strong>2.</strong> Оптимизираш <strong>БЮДЖЕТА</strong> си, като получаваш възможно най-ниската
              цена за своите онлайн покупки. Независимо дали са от сферата на модата, електрониката,
              козметиката, домашните уреди или играчките — повечето онлайн магазини предлагат промо кодове
              и ДОПЪЛНИТЕЛНИ предимства като безплатна доставка или подарък при определени покупки.
            </p>
            <p>
              <strong>3.</strong> <strong>БЕЗПЛАТНО</strong> е: ползваш тази услуга без нужда от абонамент
              или регистрация в клуб.
            </p>
            <p>
              <strong>4.</strong> <strong>ЛЕСНО</strong> е за използване: отнема ти най-много 30 секунди да
              приложиш промо код при онлайн покупките си. Винаги проверявай дали има наличен промо код,
              преди да финализираш онлайн поръчка.
            </p>
          </div>

          {/* Row 2, Column 2 */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-foreground">Kuponovo: купони, проверени от екип и общност</h3>
            <p>
              Kuponovo.bg е независима платформа за купони и промо кодове, посветена на онлайн купувачите
              в България. Ние сме малък, но всеотдаен екип, който проверява ръчно всеки промо код преди
              публикуване. Публикуваме само тествани купони и реални оферти, а прозрачността и качеството
              са нашите основни ценности.
            </p>
            <p>
              Всеки купон на нашия сайт минава през процес на проверка и се оценява непрекъснато от
              общността ни чрез системата за гласуване и успеваемост. Когато успеваемостта на даден купон
              намалее, екипът ни се намесва, за да актуализира или премахне изтеклите купони.
            </p>
            <p>
              Полагаме постоянни усилия да поддържаме всяка страница с най-новите купони. Финансираме се
              чрез партньорски комисиони: когато използваш връзка от нашия сайт и направиш покупка, можем
              да получим малка комисиона, без допълнителна цена за теб.
            </p>
            <p>
              Научи повече за нашия екип и мисия на страницата{' '}
              <Link href="/za-nas" className="text-[#5bd72c] hover:underline font-medium">За нас</Link>.
            </p>
          </div>
        </div>
      </div>

      {/* Related Stores Section */}
      {relatedStores && relatedStores.length > 0 && categoryName && (
        <div className="mt-12">
          <h2 className="text-2xl font-medium mb-6">Други магазини {categoryName}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {relatedStores.map((relatedStore) => (
              <Link
                key={relatedStore.id}
                href={`/magazin/${relatedStore.slug}`}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
              >
                <RelatedStoreLogo store={relatedStore} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-clamp-1">{relatedStore.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {typeof relatedStore.activeCoupons === 'number' 
                      ? `${relatedStore.activeCoupons} ${relatedStore.activeCoupons === 1 ? 'купон' : 'купона'}`
                      : '0 купона'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Popular Stores Section - Titles Only */}
      {featuredStores && featuredStores.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-medium mb-6">Популярни магазини</h2>
          <div className="flex flex-wrap gap-3">
            {featuredStores.map((featuredStore) => (
              <Link
                key={featuredStore.id}
                href={`/magazin/${featuredStore.slug}`}
                className="px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-slate-50 transition-all text-sm font-medium text-foreground"
              >
                {featuredStore.name}
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Modals for all code coupons (active + expired) */}
      {[...activeCoupons, ...expiredCoupons]
        .filter(c => c.type === 'code')
        .map((coupon) => (
          <CouponRevealModal
            key={coupon.id}
            coupon={coupon}
            open={openModalId === String(coupon.id)}
            onOpenChange={(open) => {
              if (!open) {
                setOpenModalId(null);
                // Hash removal is handled by CouponRevealModal.handleClose
                // Don't duplicate it here to avoid conflicts
              } else {
                setOpenModalId(coupon.id);
              }
            }}
          />
        ))}
      
      {/* Breadcrumbs - Always at bottom above footer */}
      <div className="mt-auto pt-12 -mb-4">
        <Breadcrumbs
          items={[
            { label: 'Начало', href: '/' },
            { label: 'Магазини', href: '/magazini' },
            { label: store.name },
          ]}
        />
      </div>
    </div>
    </>
  );
}
