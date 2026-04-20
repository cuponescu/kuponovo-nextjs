// Terms and Conditions Page Component

'use client';

import { Breadcrumbs } from '../Breadcrumbs';

export function TermsPage() {
  return (
    <div className="container mx-auto px-4 pt-4 pb-4">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Начало', href: '/' },
          { label: 'Общи условия' },
        ]}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-medium mb-6">Общи условия</h1>
        <p className="text-sm text-muted-foreground">Последна актуализация: Април 2026</p>
      </div>

      {/* Content */}
      <div className="max-w-4xl space-y-8 text-base text-foreground leading-relaxed font-light">
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-foreground">1. Приемане на условията</h2>
          <p>
            С достъпа и използването на сайта Kuponovo.bg се съгласяваш с общите условия, представени
            по-долу. Ако не си съгласен с тези условия, моля не използвай този сайт.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium text-foreground">2. Описание на услугата</h2>
          <p>
            Kuponovo.bg е безплатна платформа, която предоставя на потребителите достъп до промо
            кодове, купони и специални оферти от различни онлайн магазини. Не продаваме продукти
            директно и не носим отговорност за сделките, извършени на сайтовете на партньорските
            магазини.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium text-foreground">3. Използване на промо кодовете</h2>
          <p>
            Промо кодовете и купоните, публикувани на сайта, се предоставят от партньорските
            магазини и могат да имат специфични условия за използване. Проверката на валидността и
            приложимостта на всеки код е отговорност на потребителя. Не гарантираме, че всички
            кодове ще работят, но се стараем да поддържаме информацията актуална.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium text-foreground">4. Комисиони от партньорства</h2>
          <p>
            Kuponovo.bg може да получава комисиони от определени партньорски магазини, когато
            потребителите извършват покупки през връзките на сайта. Тези комисиони не влияят върху
            цената, която плащаш за продуктите. Магазините, от които получаваме комисиона, са
            маркирани прозрачно на сайта.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium text-foreground">5. Интелектуална собственост</h2>
          <p>
            Съдържанието на сайта Kuponovo.bg, включително текстовете, изображенията, логата и
            дизайна, е защитено от законите за авторско право. Възпроизвеждането, разпространението
            или неоторизираното използване на съдържанието е забранено.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium text-foreground">6. Ограничаване на отговорността</h2>
          <p>
            Kuponovo.bg не поема отговорност за евентуални загуби или щети, произтичащи от
            използването на информацията от сайта. Не гарантираме непрекъснатата наличност на сайта
            и си запазваме правото да променяме или прекратяваме услугите без предизвестие.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium text-foreground">7. Промени в условията</h2>
          <p>
            Запазваме си правото да променяме тези общи условия по всяко време. Промените влизат в
            сила веднага след публикуването им на сайта. Продължаващото използване на сайта след
            промените представлява приемане на новите условия.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium text-foreground">8. Контакти</h2>
          <p>
            За въпроси относно тези общи условия можеш да се свържеш с нас на:{' '}
            <a href="mailto:hello@kuponovo.bg" className="text-[#5bd72c] hover:underline">
              hello@kuponovo.bg
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
