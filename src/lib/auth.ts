import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

import { db } from '@/lib/db'
import { authConfig } from '@/lib/auth.config'

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  events: {
    async createUser({ user }) {
      // Auto-generate username for OAuth users (e.g. Google)
      if (!user.id) return

      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: { username: true, name: true, email: true },
      })

      if (dbUser?.username) return

      // Generate base from name or email
      const base = (dbUser?.name || dbUser?.email?.split('@')[0] || 'user')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .slice(0, 20)

      // Find a unique username
      let username = base
      let suffix = 1
      while (await db.user.findUnique({ where: { username } })) {
        username = `${base.slice(0, 17)}_${suffix}`
        suffix++
      }

      await db.user.update({
        where: { id: user.id },
        data: { username },
      })
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)

        if (!parsed.success) {
          return null
        }

        const { email, password } = parsed.data

        const user = await db.user.findUnique({
          where: { email },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash)

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          image: user.avatarUrl,
        }
      },
    }),
  ],
})
