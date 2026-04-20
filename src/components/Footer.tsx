// Footer Component

import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-[#012c3b] rounded-t-[35px] md:rounded-t-[45px] relative z-10">
      <div className="container mx-auto px-4 py-12">
        {/* First row: Logo left, Social Media icons right */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-6 pb-8 border-b border-white/20">
          {/* Logo */}
          <Link
            href="/"
            className="inline-flex items-center hover:opacity-80 transition-opacity"
          >
            <Image src="/Kuponovo_one_color.svg" alt="Kuponovo" width={180} height={40} className="h-10 w-auto" />
          </Link>

          {/* Social Media Icons - placeholders; update hrefs when social accounts exist */}
          <div className="flex items-center gap-4">
            {/* Social links will be added once Kuponovo social channels are created */}
          </div>
        </div>

        {/* Second row: columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mt-8">
          {/* Copyright */}
          <div className="space-y-4">
            <p className="text-sm text-white">© {new Date().getFullYear()} Kuponovo.bg. Всички права запазени.</p>
          </div>

          {/* Column 1: Pages */}
          <div className="space-y-4">
            <ul className="space-y-2 text-sm text-white">
              <li>
                <Link
                  href="/za-nas"
                  className="hover:text-[#5bd72c] transition-colors"
                >
                  За нас
                </Link>
              </li>
              <li>
                <Link
                  href="/kontakti"
                  className="hover:text-[#5bd72c] transition-colors"
                >
                  Контакти
                </Link>
              </li>
              <li>
                <Link
                  href="/magazini"
                  className="hover:text-[#5bd72c] transition-colors"
                >
                  Всички магазини
                </Link>
              </li>
              <li>
                <Link
                  href="/kuponi"
                  className="hover:text-[#5bd72c] transition-colors"
                >
                  Всички купони
                </Link>
              </li>
              <li>
                <Link
                  href="/kategorii"
                  className="hover:text-[#5bd72c] transition-colors"
                >
                  Всички категории
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-[#5bd72c] transition-colors"
                >
                  Блог
                </Link>
              </li>
              <li>
                <Link
                  href="/razshirenie"
                  className="hover:text-[#5bd72c] transition-colors"
                >
                  Безплатно разширение за Chrome
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Legal + Consumer protection */}
          <div className="space-y-4">
            <ul className="space-y-2 text-sm text-white">
              <li>
                <Link
                  href="/usloviya"
                  className="hover:text-[#5bd72c] transition-colors"
                >
                  Общи условия
                </Link>
              </li>
              <li>
                <Link
                  href="/poveritelnost"
                  className="hover:text-[#5bd72c] transition-colors"
                >
                  Политика за поверителност
                </Link>
              </li>
              <li>
                <Link
                  href="/biskvitki"
                  className="hover:text-[#5bd72c] transition-colors"
                >
                  Политика за бисквитки
                </Link>
              </li>
              <li>
                <a
                  href="https://kzp.bg/"
                  title="Комисия за защита на потребителите"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#5bd72c] transition-colors"
                >
                  КЗП
                </a>
              </li>
              <li>
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  title="Онлайн решаване на спорове - ЕС"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#5bd72c] transition-colors"
                >
                  Онлайн решаване на спорове
                </a>
              </li>
              <li>
                <a
                  href="https://ecc.bg/"
                  title="Европейски потребителски център България"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#5bd72c] transition-colors"
                >
                  ЕПЦ България
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Chrome CTA */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-white">
              Инсталирай безплатното ни разширение за Chrome
            </p>
            <Link
              href="/razshirenie"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white text-[#0d2245] text-sm font-semibold rounded-lg hover:bg-[#5bd72c] hover:text-[#0d2245] transition-colors"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path d="M21.17 8H12" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3.95 6.06L8.54 14" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.88 21.94L15.46 14" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Добави в Chrome
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
