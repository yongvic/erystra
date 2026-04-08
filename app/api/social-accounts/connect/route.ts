import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumePkceVerifier, createAuthorizationUrl, validateOAuthState } from "@/lib/social/oauth";
import { exchangeOAuthCode } from "@/lib/social/providers";
import { ProviderKey } from "@/lib/social-providers";
import { getSession } from "@/lib/auth";

function getProvider(searchParams: URLSearchParams) {
  const value = searchParams.get("provider");

  if (!value || !["FACEBOOK", "LINKEDIN", "TWITTER", "INSTAGRAM"].includes(value)) {
    throw new Error("Missing or invalid provider");
  }

  return value as ProviderKey;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const session = await getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  try {
    const provider = getProvider(url.searchParams);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code) {
      const authorizationUrl = await createAuthorizationUrl(provider);
      return NextResponse.redirect(authorizationUrl, 303);
    }

    await validateOAuthState(provider, state);
    const pkceVerifier = provider === "TWITTER" ? await consumePkceVerifier(provider) : undefined;
    const tokenResponse = await exchangeOAuthCode(provider, code, pkceVerifier);

    const account = await prisma.socialAccount.upsert({
      where: { externalAccountId: tokenResponse.profile.externalAccountId },
      update: {
        provider,
        label: tokenResponse.profile.label,
        handle: tokenResponse.profile.handle,
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken || null,
        tokenExpiresAt: tokenResponse.expiresAt || null,
        metadata: tokenResponse.profile.metadata,
        isActive: true
      },
      create: {
        provider,
        label: tokenResponse.profile.label,
        handle: tokenResponse.profile.handle,
        externalAccountId: tokenResponse.profile.externalAccountId,
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken || null,
        tokenExpiresAt: tokenResponse.expiresAt || null,
        metadata: tokenResponse.profile.metadata,
        isActive: true
      }
    });

    return NextResponse.redirect(new URL(`/accounts?connected=${account.id}`, request.url), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth connection failed";
    return NextResponse.redirect(new URL(`/accounts?error=${encodeURIComponent(message)}`, request.url), 303);
  }
}
