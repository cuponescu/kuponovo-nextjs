import { ThankYouPage } from '@/components/pages/ThankYouPage'

export const revalidate = 3600;

export default function ThankYouPageRoute() {
  return <ThankYouPage />;
}

export async function generateMetadata() {
  return {
    title: 'Благодарим за инсталацията! - Kuponovo.bg',
    description: 'Поздравления! Инсталира разширението Kuponovo за Chrome. Следват две лесни стъпки, за да започнеш да спестяваш.',
  };
}
