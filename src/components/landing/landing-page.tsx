import { TracaMark } from '@/components/brand/traca-logo'
import Header from './header'
import HeroSection from './hero'
import { Features } from './features'

export function LandingPage() {
  return (
    <div className="bg-cream min-h-screen overflow-x-hidden">
      <Header />
      <main id="main-content">
        <HeroSection />
        <Features />
      </main>
      <footer className="border-line text-text-muted border-t">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-8 text-sm">
          <TracaMark className="text-green-deep h-5 w-5" />
          © {new Date().getFullYear()} Traça
        </div>
      </footer>
    </div>
  )
}
