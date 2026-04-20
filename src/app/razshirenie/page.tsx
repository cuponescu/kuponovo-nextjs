import { ExtensionPage } from '@/components/pages/ExtensionPage'

export const revalidate = 3600;

const extensionSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Kuponovo - Купони и промо кодове",
  "applicationCategory": "BrowserApplication",
  "operatingSystem": "Chrome",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "BGN"
  },
  "description": "Инсталирай разширението Kuponovo за Chrome и получавай автоматично най-добрите промо кодове, когато посещаваш любимите си онлайн магазини.",
  "publisher": {
    "@type": "Organization",
    "name": "Kuponovo",
    "url": "https://kuponovo.bg"
  }
};

export default function ExtensionPageRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(extensionSchema) }}
      />
      <ExtensionPage />
    </>
  );
}

export async function generateMetadata() {
  return {
    title: 'Chrome разширение - Kuponovo.bg',
    description: 'Инсталирай разширението Kuponovo за Chrome и получавай автоматично най-добрите промо кодове, когато посещаваш любимите си онлайн магазини.',
  };
}
