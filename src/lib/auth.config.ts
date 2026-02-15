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
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
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
