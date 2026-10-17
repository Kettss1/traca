'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  MagnifyingGlass,
  ChartBar,
  User,
  SignOut,
  Gear,
  UsersThree,
  Trophy,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { TracaLogo } from '@/components/brand/traca-logo'
import { ThemeToggle } from './theme-toggle'

const navItems = [
  { href: '/shelf', label: 'Estante', icon: BookOpen },
  { href: '/feed', label: 'Feed', icon: UsersThree },
  { href: '/search', label: 'Buscar', icon: MagnifyingGlass },
  { href: '/stats', label: 'Stats', icon: ChartBar },
  { href: '/achievements', label: 'Conquistas', icon: Trophy },
]

interface MainNavProps {
  username?: string | null
}

export function MainNav({ username }: MainNavProps) {
  const pathname = usePathname()

  return (
    <>
      <header className="border-line bg-cream sticky top-0 z-50 border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/shelf" aria-label="Traça — minha estante">
            <TracaLogo />
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-green-light/20 text-green-deep'
                      : 'text-text-muted hover:bg-cream-dark hover:text-text-dark'
                  )}
                >
                  <Icon className="h-5 w-5" weight={isActive ? 'fill' : 'regular'} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User menu */}
          <div className="flex items-center gap-1">
            {username && (
              <Link
                href={`/profile/${username}`}
                className="text-text-muted hover:bg-cream-dark hover:text-text-dark flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">{username}</span>
              </Link>
            )}
            <ThemeToggle />
            <Link
              href="/settings"
              className="text-text-muted hover:bg-cream-dark hover:text-text-dark rounded-lg p-2"
              title="Configurações"
            >
              <Gear className="h-5 w-5" />
            </Link>
            <Link
              href="/api/auth/signout"
              className="text-text-muted hover:bg-cream-dark hover:text-text-dark rounded-lg p-2"
              title="Sair"
            >
              <SignOut className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Navegação mobile: barra inferior, ao alcance do polegar */}
      <nav
        aria-label="Navegação principal"
        className="border-line bg-cream/95 fixed inset-x-0 bottom-0 z-50 flex justify-around border-t pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden"
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex min-w-14 flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors',
                isActive ? 'text-green-deep' : 'text-text-muted'
              )}
            >
              <Icon className="h-6 w-6" weight={isActive ? 'fill' : 'regular'} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
