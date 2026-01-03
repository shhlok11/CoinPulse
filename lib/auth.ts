import { betterAuth } from 'better-auth';
import { genericOAuth } from 'better-auth/plugins';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/prisma';

const vercelCanonical = 'https://coin-pulse-gilt.vercel.app';

const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

const trustedOrigins = [
  vercelCanonical,
  'http://localhost:3000',
  ...(baseURL ? [baseURL] : []),
];

const uniqueTrustedOrigins = Array.from(new Set(trustedOrigins));

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: 'github',
          authorizationUrl: 'https://github.com/login/oauth/authorize',
          tokenUrl: 'https://github.com/login/oauth/access_token?accept=json',
          clientId: process.env.GITHUB_CLIENT_ID || '',
          clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
          scopes: ['read:user', 'user:email'],
          pkce: false,
          async getUserInfo(tokens) {
            const accessToken =
              tokens.accessToken ||
              (tokens as { access_token?: string }).access_token ||
              (tokens as { token?: string }).token;
            if (!accessToken) {
              console.error('[auth] Missing GitHub access token', tokens);
              return null;
            }
            const headers = {
              Authorization: `Bearer ${accessToken}`,
              'User-Agent': 'coinpulse',
              Accept: 'application/vnd.github+json',
            };

            const userResponse = await fetch('https://api.github.com/user', {
              headers,
            });
            if (!userResponse.ok) return null;
            const userData = (await userResponse.json()) as {
              id: number;
              login?: string;
              name?: string | null;
              email?: string | null;
              avatar_url?: string | null;
            };

            let email = userData.email ?? undefined;
            let emailVerified = false;

            if (!email) {
              const emailsResponse = await fetch('https://api.github.com/user/emails', {
                headers,
              });
              if (emailsResponse.ok) {
                const emails = (await emailsResponse.json()) as Array<{
                  email: string;
                  primary?: boolean;
                  verified?: boolean;
                }>;
                const primary = emails.find((entry) => entry.primary) ?? emails[0];
                if (primary?.email) {
                  email = primary.email;
                  emailVerified = Boolean(primary.verified);
                }
              }
            } else {
              emailVerified = true;
            }

            const login = userData.login ?? 'github-user';
            const name = userData.name ?? login;
            const safeEmail = email ?? `${login}@users.noreply.github.com`;

            return {
              id: String(userData.id),
              name,
              email: safeEmail,
              emailVerified,
              image: userData.avatar_url ?? undefined,
            };
          },
        },
      ],
    }),
  ],
  trustedOrigins: uniqueTrustedOrigins,
});
