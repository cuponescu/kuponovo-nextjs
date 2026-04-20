import { Store } from '@/lib/types';

interface StoreSchemaProps {
  store: Store;
}

export function StoreSchema({ store }: StoreSchemaProps) {
  const FAQ_QUESTIONS = [
    {
      question: `Как се използва промо код от ${store.name}?`,
      answer: `За да използваш промо код от ${store.name}, копирай кода от нашия сайт, добави продуктите в количката в ${store.name} и при финализиране на поръчката въведи кода в специалното поле. Отстъпката ще бъде приложена автоматично.`
    },
    {
      question: `Имат ли срок промо кодовете на ${store.name}?`,
      answer: `Да, повечето промо кодове на ${store.name} имат срок на валидност. На всеки купон в нашия сайт ясно е изписана датата на изтичане. Провери винаги датата преди да използваш кода.`
    },
    {
      question: `Мога ли да комбинирам няколко промо кода на ${store.name}?`,
      answer: `Обикновено ${store.name} позволява използване само на един промо код на поръчка. Въпреки това някои промоции могат да бъдат комбинирани с други активни оферти. Провери условията на всеки код за подробности.`
    },
    {
      question: `Какво да правя, ако промо кодът на ${store.name} не работи?`,
      answer: `Ако промо код на ${store.name} не работи, провери дали не е изтекъл, дали има изключени продукти или минимална стойност на поръчката. Ако проблемът продължава, опитай да изчистиш кеша на браузъра или се свържи с клиентската поддръжка на ${store.name}.`
    },
    {
      question: `Как да разбера за нови промо кодове на ${store.name}?`,
      answer: `В Kuponovo.bg постоянно актуализираме промо кодовете на ${store.name}. Посещавай редовно нашата страница или я запази в любими, за да бъдеш в течение на най-новите оферти и купони на ${store.name}.`
    },
    {
      question: `Има ли отстъпка за първа поръчка в ${store.name}?`,
      answer: `${store.name} често предлага специални кодове за нови клиенти. Провери нашата секция с купони за оферти за първа поръчка или се регистрирай в сайта на ${store.name} за ексклузивни отстъпки.`
    }
  ];

  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": store.name,
    "url": `https://kuponovo.bg/magazin/${store.slug}`,
    "logo": store.logo,
    "image": store.logo,
    "description": store.description || `Промо кодове и купони ${store.name}`,
    ...(store.rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": store.rating,
        "ratingCount": store.ratingCount || 0,
        "bestRating": 5,
        "worstRating": 1
      }
    })
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_QUESTIONS.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
