import { Breadcrumbs } from '../Breadcrumbs';

export function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 pt-4 pb-4">
      <Breadcrumbs
        items={[
          { label: 'Начало', href: '/' },
          { label: 'Политика за бисквитки' },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-medium mb-6">Политика за бисквитки</h1>
        <p className="text-sm text-muted-foreground">Последна актуализация: Април 2026</p>
      </div>

      <div className="max-w-4xl space-y-8 text-base text-foreground leading-relaxed font-light">
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-foreground">1. Какво са бисквитките?</h2>
          <p>
            Бисквитките са малки текстови файлове, които се запазват на твоето устройство
            (компютър, телефон, таблет), когато посещаваш даден уеб сайт. Те позволяват на сайта да
            разпознае устройството ти и да запомни определена информация за твоите предпочитания или
            предишни действия.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium text-foreground">2. Какви бисквитки използваме?</h2>
          <p>
            В Kuponovo.bg използваме следните категории бисквитки:
          </p>

          <div className="space-y-4 pl-2">
            <div>
              <h3 className="font-medium text-foreground mb-1">а) Строго необходими бисквитки</h3>
              <p>
                Тези бисквитки са съществени за функционирането на сайта. Без тях сайтът не би могъл
                да работи правилно. Включват бисквитки за предпочитание за тема (светла/тъмна) и
                сесията за навигация.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-1">б) Аналитични бисквитки</h3>
              <p>
                Използваме <strong>Vercel Analytics</strong>, за да разберем как посетителите
                взаимодействат с нашия сайт. Тези услуги събират информация анонимно — посетени
                страници, продължителност на посещението и евентуални грешки. Данните ни помагат да
                подобряваме производителността и потребителското изживяване.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium text-foreground">3. Бисквитки от трети страни</h2>
          <p>
            Някои бисквитки се поставят от услуги на трети страни, които интегрираме в сайта. Тези
            услуги имат свои собствени политики за поверителност:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Vercel Analytics</strong> —{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#5bd72c] hover:underline">
                Политика за поверителност на Vercel
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium text-foreground">4. Как можеш да контролираш бисквитките?</h2>
          <p>
            Можеш да контролираш и изтриваш бисквитките чрез настройките на твоя браузър.
            Повечето браузъри ти позволяват да:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Преглеждаш запазените бисквитки и да ги изтриваш поотделно</li>
            <li>Блокираш бисквитки от трети страни</li>
            <li>Блокираш бисквитки от определени сайтове</li>
            <li>Блокираш всички бисквитки</li>
            <li>Изтриваш всички бисквитки при затваряне на браузъра</li>
          </ul>
          <p>
            Имай предвид, че блокирането на бисквитки може да повлияе върху правилното функциониране
            на сайта и определени функционалности.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium text-foreground">5. Срок на съхранение</h2>
          <p>
            Сесийните бисквитки се изтриват автоматично при затваряне на браузъра. Постоянните
            бисквитки остават на твоето устройство за определен период (обикновено между 30 дни и 2
            години, в зависимост от целта им) или докато не ги изтриеш ръчно.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium text-foreground">6. Промени в политиката</h2>
          <p>
            Запазваме си правото да променяме тази политика за бисквитки по всяко време. Промените
            ще бъдат публикувани на тази страница с датата на последната актуализация.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium text-foreground">7. Контакти</h2>
          <p>
            За въпроси относно тази политика за бисквитки можеш да се свържеш с нас на:{' '}
            <a href="mailto:hello@kuponovo.bg" className="text-[#5bd72c] hover:underline">
              hello@kuponovo.bg
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
