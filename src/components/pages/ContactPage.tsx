// Contact Page Component

'use client';

import { Breadcrumbs } from '../Breadcrumbs';

export function ContactPage() {
  return (
    <div className="container mx-auto px-4 pt-4 pb-4">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Начало', href: '/' },
          { label: 'Контакти' },
        ]}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-medium mb-6">Контакти</h1>
      </div>

      {/* Content */}
      <div className="max-w-4xl space-y-8 text-base text-foreground leading-relaxed font-light">
        <div className="space-y-4">
          <p>
            Винаги се стремим да подобряваме услугите си и да предлагаме най-доброто преживяване на
            нашите потребители. Ако имаш въпроси, предложения или искаш да съобщиш за проблем, не
            се колебай да се свържеш с нас.
          </p>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-medium text-foreground mb-3">Имейл</h2>
            <p>
              За всякакви въпроси или запитвания можеш да се свържеш с нас на:{' '}
              <a href="mailto:hello@kuponovo.bg" className="text-[#5bd72c] hover:underline">
                hello@kuponovo.bg
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-foreground mb-3">Време за отговор</h2>
            <p>
              Стараем се да отговаряме на всички съобщения в рамките на 48 часа в работни дни.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-foreground mb-3">Партньорства</h2>
            <p>
              Ако си онлайн магазин и искаш да си партнираме, за да предложиш ексклузивни промо
              кодове на нашата общност, моля свържи се с нас на посочения по-горе имейл.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-foreground mb-3">Съобщи за проблем</h2>
            <p>
              Ако си открил промо код, който не работи, или имаш други предложения за подобряване
              на услугите ни, моля уведоми ни. Обратната ти връзка ни помага да поддържаме високото
              качество на купоните, публикувани в нашата платформа.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
