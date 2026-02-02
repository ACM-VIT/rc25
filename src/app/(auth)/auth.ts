import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@/lib/auth/drizzle-adapter";
import { db } from "@/db";
import { accounts, sessions, users } from "@/db/schema";

const bypassEmails = process.env.BYPASS_EMAILS?.split(',').map(e => e.trim()) || [];

export const {handlers, auth, signIn, signOut} = NextAuth({
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
    }),
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Allow bypass emails regardless of domain
            if (user.email && bypassEmails.includes(user.email)) {
                return true;
            }
            
            // For Google OAuth, check if email is from vitstudent.ac.in domain
            if (account?.provider === "google") {
                return user.email?.endsWith('@vitstudent.ac.in') ?? false;
            }
            
            return true;
        },
    },
});