export const GITHUB_OAUTH_CONFIG = {
  clientId: "Iv23ctWkbzHS5mHAzOIg",
  redirectUri: "http://localhost:5000/auth/callback",
  scope: "read:user read:org",
  authorizeUrl: "https://github.com/login/oauth/authorize",
} as const;

export function generateState(): string {
  return crypto.randomUUID();
}

export function generateOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GITHUB_OAUTH_CONFIG.clientId,
    redirect_uri: GITHUB_OAUTH_CONFIG.redirectUri,
    scope: GITHUB_OAUTH_CONFIG.scope,
    state,
  });

  return `${GITHUB_OAUTH_CONFIG.authorizeUrl}?${params.toString()}`;
}
