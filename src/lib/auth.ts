import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { compare } from "bcrypt";
import speakeasy from 'speakeasy';
import { Adapter } from "next-auth/adapters";
import bcrypt from 'bcryptjs';

/**
 * Authentication configuration for NextAuth.js
 * Includes support for credentials-based auth and 2FA
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            clientProfile: true,
            employeeProfile: true,
          },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          clientProfile: user.clientProfile,
          employeeProfile: user.employeeProfile,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          clientProfile: user.clientProfile,
          employeeProfile: user.employeeProfile,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          clientProfile: token.clientProfile,
          employeeProfile: token.employeeProfile,
        },
      };
    },
  },
};

/**
 * Helper function to check if user has required role
 */
export const hasRequiredRole = (user: any, requiredRoles: string[]) => {
  return user && user.role && requiredRoles.includes(user.role);
};