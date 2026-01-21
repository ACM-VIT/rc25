import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@/lib/auth/drizzle-adapter";
import { db } from "@/db";
import { accounts, sessions, users } from "@/db/schema";

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
            authorization: 'https://accounts.google.com/o/oauth2/auth?response_type=code&hd=vitstudent.ac.in'
        }),
    ],
});
