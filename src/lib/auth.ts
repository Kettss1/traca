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
