import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    discordId?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      authorization: { params: { scope: "identify guilds" } },
    }),
  ],
  session: { strategy: "jwt" },
  // Locale-less: the proxy's next-intl middleware rewrites this to the
  // visitor's detected locale, same as any other top-level navigation.
  //
  // Both point at the same page on purpose. Auth.js buckets thrown errors by
  // `error.kind`, not a single "error page" setting: a SignInError (the kind
  // OAuthCallbackError - e.g. Discord's own OAuth failing - actually throws)
  // is routed through `pages.signIn`, while other AuthErrors go through
  // `pages.error`. Leaving `signIn` unset falls back to next-auth's built-in,
  // unstyled /api/auth/signin page, which never messages our popup opener or
  // closes itself - the popup was landing there and just sitting stuck.
  pages: { signIn: "/auth/error", error: "/auth/error" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) token.accessToken = account.access_token;
      if (profile) token.discordId = profile.id as string;
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.discordId = token.discordId as string | undefined;
      return session;
    },
  },
});
