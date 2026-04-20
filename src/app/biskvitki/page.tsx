import { CookiePolicyPage } from '@/components/pages/CookiePolicyPage'

export const revalidate = 3600;

export default function CookiePolicyPageRoute() {
  return <CookiePolicyPage />;
}

export async function generateMetadata() {
  return {
    title: 'Политика за бисквитки - Kuponovo.bg',
    description: 'Информация за бисквитките, използвани в Kuponovo.bg, тяхната цел и как можеш да ги контролираш.',
  };
}
