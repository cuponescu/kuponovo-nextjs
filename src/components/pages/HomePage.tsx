// Homepage Component

import Link from 'next/link';
import { HeroSlider } from '../HeroSlider';
import { CouponCard } from '../CouponCard';
import { StoreTile } from '../StoreTile';
import { Coupon, Store, SliderSlide } from '../../lib/types';

interface HomePageProps {
  slides: SliderSlide[];
  trendingCoupons: Coupon[];
  featuredCoupons: Coupon[];
  topStores: Store[];
}

export function HomePage({ 
  slides,
  trendingCoupons,
  featuredCoupons,
  topStores
}: HomePageProps) {
  return (
    <div>
      {/* Hero Slider */}
      <section className="-mt-6 md:-mt-4">
        <HeroSlider slides={slides} />
      </section>

      {/* Top Stores */}
      {topStores.length > 0 && (
        <section className="container mx-auto px-4 mt-4 md:mt-8">
          <div className="mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl mb-1 md:mb-2">Популярни магазини</h2>
            <p className="text-sm md:text-base text-muted-foreground font-light">Най-големите отстъпки от любимите ти марки</p>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8 [&>*:nth-child(3n+1)]:justify-self-start [&>*:nth-child(3n+2)]:justify-self-center [&>*:nth-child(3n)]:justify-self-end md:[&>*:nth-child(3n+1)]:justify-self-center md:[&>*:nth-child(3n+2)]:justify-self-center md:[&>*:nth-child(3n)]:justify-self-center md:[&>*:nth-child(4n+1)]:justify-self-start md:[&>*:nth-child(4n+2)]:justify-self-center md:[&>*:nth-child(4n+3)]:justify-self-center md:[&>*:nth-child(4n)]:justify-self-end lg:[&>*:nth-child(4n+1)]:justify-self-center lg:[&>*:nth-child(4n+2)]:justify-self-center lg:[&>*:nth-child(4n+3)]:justify-self-center lg:[&>*:nth-child(4n)]:justify-self-center lg:[&>*:nth-child(6n+1)]:justify-self-start lg:[&>*:nth-child(6n+2)]:justify-self-center lg:[&>*:nth-child(6n+3)]:justify-self-center lg:[&>*:nth-child(6n+4)]:justify-self-center lg:[&>*:nth-child(6n+5)]:justify-self-center lg:[&>*:nth-child(6n)]:justify-self-end">
            {topStores.map((store) => (
              <StoreTile 
                key={store.id} 
                store={store}
                logoOnly={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Featured Coupons */}
      {featuredCoupons.length > 0 && (
        <section className="container mx-auto px-4 mt-8 md:mt-16">
          <div className="mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl mb-1 md:mb-2">Препоръчани купони</h2>
            <p className="text-sm md:text-base text-muted-foreground font-light">Най-добрите оферти, избрани за теб</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} placement="homepage-grid" />
            ))}
          </div>
        </section>
      )}

      {/* Why Choose Kuponovo.bg - SEO Block */}
      <section className="container mx-auto px-4 mt-8 md:mt-16 mb-6 md:mb-8">
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-xl md:text-2xl font-medium text-card-foreground">Защо да избереш Kuponovo.bg?</h2>
          <div className="prose prose-sm max-w-none text-base text-card-foreground">
            <p className="leading-relaxed">
              Ние сме малък, но всеотдаен екип, който всеки ден търси нови купони и активни промоции в онлайн магазините в България.
              Публикуваме десетки промоции и купони всеки ден, за да дадем на нашите посетители достъп до най-новите оферти
              от популярни марки на най-добрите цени на пазара.
            </p>
            <p className="leading-relaxed">
              Открий проверени промо кодове от магазини и започни да спестяваш още днес. Разгледай всички{' '}
              <Link href="/magazini" className="underline hover:text-[#5bd72c]">магазини</Link>,{' '}
              <Link href="/kuponi" className="underline hover:text-[#5bd72c]">купони</Link>{' '}
              и <Link href="/kategorii" className="underline hover:text-[#5bd72c]">категории</Link>.
              Приятно пазаруване!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
