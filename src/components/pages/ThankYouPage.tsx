'use client';

import Link from 'next/link';
import { CheckCircle2, Pin, ShoppingBag } from 'lucide-react';

export function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5bd72c]/5 to-white">
      {/* Hero */}
      <section className="container mx-auto px-4 pt-12 md:pt-20 pb-8 md:pb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#5bd72c]/10 mb-6">
          <CheckCircle2 className="w-8 h-8 text-[#5bd72c]" />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-[#0d2245] leading-tight mb-4">
          Благодарим за инсталацията!
        </h1>
        <p className="text-base md:text-lg text-muted-foreground font-light max-w-2xl mx-auto">
          Разширението Kuponovo вече е инсталирано. Следват две лесни стъпки, за да започнеш да
          спестяваш при всяка онлайн покупка.
        </p>
      </section>

      {/* Step 1: text left, video right */}
      <section className="container mx-auto px-4 py-8 md:py-14">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="w-10 h-10 rounded-full bg-[#5bd72c] text-[#0d2245] font-bold text-lg flex items-center justify-center mx-auto md:mx-0 mb-3">
              1
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#0d2245] flex items-center justify-center md:justify-start gap-2 mb-2">
              <Pin className="w-5 h-5 text-[#5bd72c] flex-shrink-0" />
              Закрепи разширението в Chrome
            </h2>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Натисни иконата с пъзел в лентата на Chrome и закрепи Kuponovo за бърз достъп.
            </p>
          </div>
          <div className="flex-shrink-0 w-[22rem]">
            <div className="relative rounded-2xl border border-border bg-white overflow-hidden shadow-2xl">
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
                src="/primul-pas.mp4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Step 2: video left, text right */}
      <section className="container mx-auto px-4 py-8 md:py-14">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-shrink-0 w-[22rem] order-2 md:order-1">
            <div className="relative rounded-2xl border border-border bg-white overflow-hidden shadow-2xl">
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
                src="/al-doilea-pas.mp4"
              />
            </div>
          </div>
          <div className="flex-1 order-1 md:order-2 text-center md:text-left">
            <div className="w-10 h-10 rounded-full bg-[#5bd72c] text-[#0d2245] font-bold text-lg flex items-center justify-center mx-auto md:mx-0 mb-3">
              2
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#0d2245] flex items-center justify-center md:justify-start gap-2 mb-2">
              <ShoppingBag className="w-5 h-5 text-[#5bd72c] flex-shrink-0" />
              Посети магазин и спести
            </h2>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Навигирай в който и да е партньорски магазин и купоните се показват автоматично.
              Копирай кода с един клик.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-8 md:py-14">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-muted-foreground font-light mb-6">
            Това е всичко! Сега можеш да затвориш тази страница и да започнеш да спестяваш.
          </p>
          <Link
            href="/magazini"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#5bd72c] text-[#0d2245] font-semibold rounded-xl hover:bg-[#4ec225] transition-colors text-base"
          >
            Открий магазините &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
