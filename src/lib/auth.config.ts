import type { NextAuthConfig } from 'next-auth'

// Auth config without database adapter (for edge compatibility)
export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnProtectedRoute =
        nextUrl.pathname.startsWith('/shelf') ||
        nextUrl.pathname.startsWith('/stats') ||
        nextUrl.pathname.startsWith('/feed') ||
        nextUrl.pathname.startsWith('/settings')

      if (isOnProtectedRoute) {
        if (isLoggedIn) return true
        return false // Redirect to login
      }

      return true
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.username = user.username
      }
      // Refresh username from DB if it's missing (e.g. OAuth user got one auto-generated)
      if (trigger === 'signIn' || trigger === 'update' || !token.username) {
        if (token.id) {
          try {
            const { db } = await import('@/lib/db')
            const dbUser = await db.user.findUnique({
              where: { id: token.id as string },
              select: { username: true },
            })
            if (dbUser?.username) {
              token.username = dbUser.username
            }
          } catch {
            // Ignore errors in edge runtime
          }
        }
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string | null
      }
      return session
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig
