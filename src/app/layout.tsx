import type { Metadata, Viewport } from 'next'
import { Fraunces, Source_Sans_3 } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { SkipToContent } from '@/components/a11y/skip-to-content'
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AccessibilityAudit } from './accessibility-audit';

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['SOFT', 'opsz'],
  display: 'swap',
})

const sourceSans3 = Source_Sans_3({
  variable: '--font-source-sans-3',
  subsets: ['latin'],
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf4e8' },
    { media: '(prefers-color-scheme: dark)', color: '#16120e' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  title: {
    default: 'Traça - Sua Estante Virtual de Livros',
    template: '%s | Traça',
  },
  description:
    'Traça é sua estante virtual e rede social de leitura. Organize seus livros, acompanhe estatísticas de leitura e conecte-se com outros leitores.',
  keywords: [
    'livros',
    'leitura',
    'estante virtual',
    'rede social de leitura',
    'organizar livros',
    'resenhas',
    'bookstagram',
    'booktok',
    'literatura',
  ],
  authors: [{ name: 'Traça' }],
  creator: 'Traça',
  publisher: 'Traça',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://lertraca.com.br'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Traça',
    title: 'Traça - Sua Estante Virtual de Livros',
    description:
      'Organize seus livros, acompanhe estatísticas de leitura e conecte-se com outros leitores.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Traça - Sua Estante Virtual de Livros',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Traça - Sua Estante Virtual de Livros',
    description:
      'Organize seus livros, acompanhe estatísticas de leitura e conecte-se com outros leitores.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Traça',
  },
  category: 'books',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${fraunces.variable} ${sourceSans3.variable} bg-cream antialiased`}
      >
        <SkipToContent />
        <ThemeProvider>{children}</ThemeProvider>
        <ServiceWorkerRegister />
        <Analytics />
        <AccessibilityAudit />
      </body>
    </html>
  )
}
