import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

// NOTE: The JWT/session embeds `role` and `sellerVerified`, but these are
// CONVENIENCE fields for UI rendering only. Every server-side mutation that
// requires seller-verified status MUST re-check the database directly
// (see lib/authz.ts) rather than trusting the token. Tokens can be stale
// (issued before a verification/rejection) or, in a misconfigured deployment,
// tampered with — the DB is the single source of truth for authorization.

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }

      // Refresh role + seller verification status on every request so the
      // session reflects the latest DB state (e.g. after an admin verifies
      // or a user's role changes). This keeps UI-facing flags reasonably
      // fresh, but is NOT what authorizes writes — see lib/authz.ts.
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { sellerProfile: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.sellerVerified = dbUser.sellerProfile?.verificationStatus === "VERIFIED";
          token.sellerVerificationStatus = dbUser.sellerProfile?.verificationStatus ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).sellerVerified = token.sellerVerified;
        (session.user as any).sellerVerificationStatus = token.sellerVerificationStatus;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
