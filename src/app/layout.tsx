import type { Metadata } from 'next'
import { Noto_Sans, Kelly_Slab } from 'next/font/google'
import './globals.css'
import { HeaderWrapper } from '@/components/HeaderWrapper'
import { Footer } from '@/components/Footer'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { Analytics } from '@vercel/analytics/react'
import { CookieConsent } from '@/components/CookieConsent'

const notoSans = Noto_Sans({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const kellySlab = Kelly_Slab({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: '400',
  variable: '--font-corben',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Kuponovo.bg - Купони и промо кодове, обновявани всеки ден',
  description: 'Ние сме малък, но всеотдаен екип, който всеки ден търси нови купони и активни промоции в онлайн магазините в България.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bg" suppressHydrationWarning>
      <body className={`${notoSans.variable} ${kellySlab.variable} font-sans bg-[#012c3b]`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col bg-background">
            <HeaderWrapper />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <Toaster position="bottom-right" />
            <CookieConsent />
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
