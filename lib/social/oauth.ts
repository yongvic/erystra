import crypto from "crypto";
import { cookies } from "next/headers";
import { ProviderKey, getProviderClientId, getProviderConfig } from "@/lib/social-providers";

const STATE_COOKIE_PREFIX = "oauth_state_";
const PKCE_COOKIE_PREFIX = "oauth_pkce_";

export function createRandomString(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function createPkceChallenge(verifier: string) {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

export async function createAuthorizationUrl(provider: ProviderKey) {
  const config = getProviderConfig(provider);
  const clientId = getProviderClientId(provider);

  if (!clientId) {
    throw new Error(`Missing ${provider}_CLIENT_ID`);
  }

  const state = createRandomString(24);
  const cookieStore = await cookies();
  cookieStore.set(`${STATE_COOKIE_PREFIX}${provider}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600
  });

  const url = new URL(config.authBaseUrl);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scopes.join(" "));
  url.searchParams.set("state", state);

  if (provider === "TWITTER") {
    const codeVerifier = createRandomString(64);
    const codeChallenge = createPkceChallenge(codeVerifier);
    cookieStore.set(`${PKCE_COOKIE_PREFIX}${provider}`, codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600
    });
    url.searchParams.set("code_challenge", codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
  }

  return url.toString();
}

export async function validateOAuthState(provider: ProviderKey, state: string | null) {
  const cookieStore = await cookies();
  const saved = cookieStore.get(`${STATE_COOKIE_PREFIX}${provider}`)?.value;

  if (!saved || !state || saved !== state) {
    throw new Error("Invalid OAuth state");
  }
}

export async function consumePkceVerifier(provider: ProviderKey) {
  const cookieStore = await cookies();
  const verifier = cookieStore.get(`${PKCE_COOKIE_PREFIX}${provider}`)?.value;

  if (!verifier) {
    throw new Error("Missing PKCE verifier");
  }

  cookieStore.set(`${PKCE_COOKIE_PREFIX}${provider}`, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0)
  });

  return verifier;
}
