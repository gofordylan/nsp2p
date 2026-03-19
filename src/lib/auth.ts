import NextAuth from "next-auth";
import { getServiceSupabase } from "./supabase";

function parseDiscordIdFromAvatarUrl(url: string | null): string | null {
  if (!url) return null;
  // Avatar URL format: https://cdn.discordapp.com/avatars/{discord_id}/{hash}.png
  const match = url.match(/\/avatars\/(\d+)\//);
  return match ? match[1] : null;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    {
      id: "network-school",
      name: "Network School",
      type: "oauth",
      authorization: {
        url: "https://api.nsauth.org/oauth/authorize",
        params: {
          scope: "openid profile email",
          response_type: "code",
        },
      },
      token: "https://api.nsauth.org/oauth/token",
      userinfo: "https://api.nsauth.org/oauth/userinfo",
      clientId: process.env.NS_CLIENT_ID,
      clientSecret: process.env.NS_CLIENT_SECRET,
      checks: ["pkce"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],
  callbacks: {
    async signIn({ user, profile }) {
      if (!profile) return false;

      const db = getServiceSupabase();
      const discordId = parseDiscordIdFromAvatarUrl(
        profile.picture as string | null
      );

      // Upsert user in our database
      await db.from("users").upsert(
        {
          ns_sub: profile.sub as string,
          discord_username: (profile.discord_username ||
            profile.username ||
            profile.name) as string,
          discord_id: discordId,
          display_name: profile.name as string,
          avatar_url: profile.picture as string | null,
          email: profile.email as string | null,
        },
        { onConflict: "ns_sub" }
      );

      return true;
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.ns_sub = profile.sub;
        token.discord_username =
          profile.discord_username || profile.username || profile.name;
        token.discord_id = parseDiscordIdFromAvatarUrl(
          profile.picture as string | null
        );
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.ns_sub as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).discord_username =
          token.discord_username as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).discord_id = token.discord_id as string | null;
      }
      return session;
    },
  },
});
