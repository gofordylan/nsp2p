import NextAuth from "next-auth";
import { getServiceSupabase } from "./supabase";

function parseDiscordIdFromAvatarUrl(url: string | null): string | null {
  if (!url) return null;
  // Custom avatar: https://cdn.discordapp.com/avatars/{id}/{hash}.png
  const avatarMatch = url.match(/\/avatars\/(\d+)\//);
  if (avatarMatch) return avatarMatch[1];
  // Guild avatar: https://cdn.discordapp.com/guilds/{guild}/users/{id}/avatars/{hash}.png
  const guildMatch = url.match(/\/users\/(\d+)\/avatars\//);
  if (guildMatch) return guildMatch[1];
  return null;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    {
      id: "network-school",
      name: "Network School",
      type: "oidc",
      issuer: "https://api.nsauth.org",
      clientId: process.env.NS_CLIENT_ID,
      clientSecret: process.env.NS_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid profile",
        },
      },
      checks: ["pkce"],
      token: {
        url: "https://api.nsauth.org/oauth/token",
        conform: async (response: Response) => {
          return response;
        },
      },
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || profile.discord_username,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ profile }) {
      if (!profile) return false;

      const db = getServiceSupabase();
      const discordId = parseDiscordIdFromAvatarUrl(
        profile.picture as string | null
      );

      await db.from("users").upsert(
        {
          ns_sub: profile.sub as string,
          discord_username: (profile.discord_username ||
            profile.username ||
            profile.name) as string,
          discord_id: discordId,
          display_name: (profile.name || profile.discord_username) as string,
          avatar_url: profile.picture as string | null,
          email: (profile.email as string) || null,
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
