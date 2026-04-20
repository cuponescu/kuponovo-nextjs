'use client';

import Link from 'next/link';
import { Breadcrumbs } from '../Breadcrumbs';
import { Zap, RefreshCw, ClipboardCopy, ShieldCheck, Store, Gift } from 'lucide-react';

// TODO: Replace with real Chrome Web Store URL once Kuponovo extension is published.
const CHROME_STORE_URL = 'https://chromewebstore.google.com/';

const steps = [
  {
    num: '1',
    title: 'Инсталирай разширението',
    desc: 'Добави разширението Kuponovo в твоя Chrome браузър. Безплатно е и се инсталира за секунди.',
  },
  {
    num: '2',
    title: 'Посети онлайн магазин',
    desc: 'Отвори сайта на кой да е партньорски онлайн магазин. Разширението автоматично го разпознава.',
  },
  {
    num: '3',
    title: 'Копирай кода и спести',
    desc: 'Купоните се показват автоматично. Един клик и кодът е копиран — готов за използване.',
  },
];

const features = [
  {
    icon: Zap,
    title: 'Автоматично разпознаване',
    desc: 'Разширението автоматично разпознава магазина, който посещаваш, и показва наличните купони.',
  },
  {
    icon: RefreshCw,
    title: 'Ежедневна актуализация',
    desc: 'Промо кодовете се проверяват и обновяват всеки ден, за да гарантираме, че работят.',
  },
  {
    icon: ClipboardCopy,
    title: 'Копиране с един клик',
    desc: 'Натисни бутона „Копирай кода“ и кодът автоматично се копира в клипборда, готов за използване.',
  },
  {
    icon: ShieldCheck,
    title: 'Сигурно и поверително',
    desc: 'Не събираме лични данни. Разширението работи локално и комуникира само със сървърите на Kuponovo.',
  },
  {
    icon: Store,
    title: 'Много магазини',
    desc: 'Промо кодове за онлайн магазини в България — от мода до електроника и козметика.',
  },
  {
    icon: Gift,
    title: '100% безплатно',
    desc: 'Разширението Kuponovo е и винаги ще бъде напълно безплатно. Без абонаменти и скрити такси.',
  },
];

export function ExtensionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5bd72c]/5 to-white">
      <div className="container mx-auto px-4 pt-4">
        <Breadcrumbs
          items={[
            { label: 'Начало', href: '/' },
            { label: 'Chrome разширение' },
          ]}
        />
      </div>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-4 pb-8 md:pt-6 md:pb-14">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5bd72c]/10 text-[#5bd72c] text-sm font-medium mb-6">
            <span>Скоро достъпно за Chrome</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-[#0d2245] leading-tight mb-4">
            Промо кодове автоматично,<br className="hidden md:block" /> във всеки онлайн магазин
          </h1>
          <p className="text-base md:text-lg text-muted-foreground font-light max-w-2xl mx-auto mb-8">
            Инсталирай разширението Kuponovo и получавай автоматично най-добрите промо кодове,
            когато посещаваш любимите си онлайн магазини. Без търсене, без губене на време.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={CHROME_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#5bd72c] text-[#0d2245] font-semibold rounded-xl hover:bg-[#4ec225] transition-colors text-base"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path d="M21.17 8H12" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3.95 6.06L8.54 14" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.88 21.94L15.46 14" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Добави в Chrome — Безплатно
            </a>
            <Link
              href="/magazini"
              className="text-sm text-muted-foreground hover:text-[#0d2245] transition-colors font-medium"
            >
              Виж магазините &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Video demo */}
      <section className="container mx-auto px-4 pb-12 md:pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl border border-border bg-white overflow-hidden shadow-2xl">
            {/* Browser chrome — traffic lights only */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#f5f5f5] border-b border-border">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full block"
              src="/razshirenie-demo.mp4"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0d2245] mb-3">Как работи?</h2>
            <p className="text-muted-foreground font-light">Три лесни стъпки, за да спестяваш при всяка покупка</p>
          </div>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#5bd72c] text-[#0d2245] font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="text-base font-semibold text-[#0d2245] mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0d2245] mb-3">Защо Kuponovo?</h2>
          <p className="text-muted-foreground font-light">Всичко, от което имаш нужда, за да спестяваш — в едно разширение</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-[#5bd72c]/10 text-[#5bd72c] flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#0d2245] mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#5bd72c] relative">
        <div className="absolute left-0 right-0 bottom-0 translate-y-full h-[35px] md:h-[45px] bg-[#5bd72c]" />
        <div className="container mx-auto px-4 py-12 md:py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0d2245] mb-3">
            Започни да спестяваш сега
          </h2>
          <p className="text-[#0d2245]/70 font-light mb-8 max-w-lg mx-auto">
            Стотици магазини, хиляди промо кодове, проверявани всеки ден. Инсталирай разширението
            и забрави за търсенето на купони.
          </p>
          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#0d2245] text-white font-semibold rounded-xl hover:bg-[#0d2245]/90 transition-colors text-base"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M21.17 8H12" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3.95 6.06L8.54 14" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.88 21.94L15.46 14" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Добави в Chrome — Безплатно
          </a>
        </div>
      </section>
    </div>
  );
}
