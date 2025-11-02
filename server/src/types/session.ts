import "express-session";

declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      name: string;
      email: string;
      preferred_username: string;
      given_name?: string;
      family_name?: string;
      email_verified?: boolean;
    };
    codeVerifier?: string;
    state?: string;
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
  }
}
