import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import { signInSchema } from "./lib/zod";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Github,
        Credentials({
            credentials: {
                email: { label: "Email", type: "email", placeholder: "Email" },
                password: { label: "Password", type: "password", placeholder: "Password" }
            },
            async authorize(credentials) {
                let user = null;

                // Validate credentials
                const parsedCredentials = signInSchema.safeParse(credentials);
                if (!parsedCredentials.success) {
                    console.error("Invalid credentials:", parsedCredentials.error.errors);
                    return null;
                }
                
                // Simulate a user for now
                user = {
                    id: '1',
                    name: 'Asma Khan',
                    email: 'asmayaseen9960@gmail.com',
                    role: "admin"  // Make sure to set the role here
                };

                if (!user) {
                    console.log("Invalid credentials");
                    return null;
                }

                return user;
            }
        })
    ],
    callbacks: {
        async authorized({ request: { nextUrl }, auth }) {
            // Ensure auth object is defined before accessing user
            const isLoggedIn = auth?.user ? true : false;  // Ensure auth.user is checked properly
            const { pathname } = nextUrl;
            const role = auth?.user?.role || 'user'; // Make sure role is accessed from a defined user

            // Redirect logic based on role and login status
            if (pathname.startsWith('/auth/signin') && isLoggedIn) {
                return Response.redirect(new URL('/', nextUrl));
            }

            if (pathname.startsWith("/page2") && role !== "admin") {
                return Response.redirect(new URL('/', nextUrl));
            }

            return isLoggedIn;  // Make sure to return whether the user is logged in
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id as string;
                token.role = user.role as string;
            }

            if (trigger === "update" && session) {
                token = { ...token, ...session };  // Merge session data into token if updating
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role || 'user';  // Ensure role is always available
            }
            return session;
        }
    },
    pages: {
        signIn: "/auth/signin"  // Redirect to your custom signin page
    },
    secret: process.env.NEXTAUTH_SECRET,  // Ensure to define the secret here in .env.local
});
