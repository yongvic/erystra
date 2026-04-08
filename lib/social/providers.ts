import { Prisma, SocialAccount, SocialProvider } from "@prisma/client";
import { ProviderKey, getProviderClientId, getProviderClientSecret, getProviderConfig } from "@/lib/social-providers";

const graphVersion = process.env.FACEBOOK_GRAPH_VERSION || "v23.0";

type TokenResponse = {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  profile: {
    externalAccountId: string;
    label: string;
    handle: string;
    metadata?: Prisma.InputJsonValue;
  };
};

async function parseJson(response: Response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(JSON.stringify(data || { status: response.status }));
  }

  return data;
}

function ensureProvider(provider: SocialProvider): ProviderKey {
  return provider as ProviderKey;
}

export async function exchangeOAuthCode(provider: ProviderKey, code: string, pkceVerifier?: string) {
  switch (provider) {
    case "FACEBOOK":
    case "INSTAGRAM":
      return exchangeMetaCode(provider, code);
    case "LINKEDIN":
      return exchangeLinkedInCode(code);
    case "TWITTER":
      return exchangeXCode(code, pkceVerifier || "");
    default:
      throw new Error(`Unsupported provider ${provider}`);
  }
}

async function exchangeMetaCode(provider: ProviderKey, code: string): Promise<TokenResponse> {
  const config = getProviderConfig(provider);
  const tokenUrl = new URL(config.tokenUrl);
  tokenUrl.searchParams.set("client_id", getProviderClientId(provider));
  tokenUrl.searchParams.set("client_secret", getProviderClientSecret(provider));
  tokenUrl.searchParams.set("redirect_uri", config.redirectUri);
  tokenUrl.searchParams.set("code", code);

  const tokenData = await parseJson(await fetch(tokenUrl, { method: "GET", cache: "no-store" }));
  const accessToken = tokenData.access_token as string;
  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + Number(tokenData.expires_in) * 1000)
    : null;

  if (provider === "FACEBOOK") {
    const pagesUrl = new URL(`https://graph.facebook.com/${graphVersion}/me/accounts`);
    pagesUrl.searchParams.set("fields", "id,name,access_token");
    pagesUrl.searchParams.set("access_token", accessToken);
    const pagesData = await parseJson(await fetch(pagesUrl, { cache: "no-store" }));
    const page = pagesData.data?.[0];

    if (!page) {
      throw new Error("No Facebook pages returned. pages_manage_posts and pages_show_list are required.");
    }

    return {
      accessToken: page.access_token,
      refreshToken: null,
      expiresAt,
      profile: {
        externalAccountId: String(page.id),
        label: page.name,
        handle: page.name,
        metadata: {
          pageId: page.id,
          grantedByUserToken: true
        }
      }
    };
  }

  const accountsUrl = new URL(`https://graph.facebook.com/${graphVersion}/me/accounts`);
  accountsUrl.searchParams.set("fields", "instagram_business_account{id,username,name},access_token,name,id");
  accountsUrl.searchParams.set("access_token", accessToken);
  const pagesData = await parseJson(await fetch(accountsUrl, { cache: "no-store" }));
  const pageWithInstagram = (pagesData.data || []).find(
    (page: any) => page.instagram_business_account?.id
  );

  if (!pageWithInstagram) {
    throw new Error("No Instagram business account found on accessible pages.");
  }

  return {
    accessToken: pageWithInstagram.access_token,
    refreshToken: null,
    expiresAt,
    profile: {
      externalAccountId: String(pageWithInstagram.instagram_business_account.id),
      label: pageWithInstagram.instagram_business_account.name || pageWithInstagram.name,
      handle: pageWithInstagram.instagram_business_account.username || pageWithInstagram.name,
      metadata: {
        pageId: pageWithInstagram.id,
        instagramBusinessAccountId: pageWithInstagram.instagram_business_account.id
      }
    }
  };
}

async function exchangeLinkedInCode(code: string): Promise<TokenResponse> {
  const config = getProviderConfig("LINKEDIN");
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: getProviderClientId("LINKEDIN"),
    client_secret: getProviderClientSecret("LINKEDIN"),
    redirect_uri: config.redirectUri
  });

  const tokenData = await parseJson(
    await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store"
    })
  );

  const accessToken = tokenData.access_token as string;
  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + Number(tokenData.expires_in) * 1000)
    : null;

  const profileData = await parseJson(
    await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store"
    })
  );

  return {
    accessToken,
    refreshToken: tokenData.refresh_token || null,
    expiresAt,
    profile: {
      externalAccountId: String(profileData.sub),
      label: profileData.name || profileData.email,
      handle: profileData.email || profileData.name,
      metadata: {
        linkedInPersonUrn: `urn:li:person:${profileData.sub}`
      }
    }
  };
}

async function exchangeXCode(code: string, pkceVerifier: string): Promise<TokenResponse> {
  const config = getProviderConfig("TWITTER");
  const body = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    client_id: getProviderClientId("TWITTER"),
    redirect_uri: config.redirectUri,
    code_verifier: pkceVerifier
  });

  const basicAuth = Buffer.from(
    `${getProviderClientId("TWITTER")}:${getProviderClientSecret("TWITTER")}`
  ).toString("base64");

  const tokenData = await parseJson(
    await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`
      },
      body,
      cache: "no-store"
    })
  );

  const accessToken = tokenData.access_token as string;
  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + Number(tokenData.expires_in) * 1000)
    : null;

  const meData = await parseJson(
    await fetch("https://api.x.com/2/users/me?user.fields=username,name", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store"
    })
  );

  return {
    accessToken,
    refreshToken: tokenData.refresh_token || null,
    expiresAt,
    profile: {
      externalAccountId: String(meData.data.id),
      label: meData.data.name,
      handle: `@${meData.data.username}`,
      metadata: {
        username: meData.data.username
      }
    }
  };
}

export async function publishToProvider(account: SocialAccount, content: { text: string; mediaUrl?: string | null }) {
  switch (account.provider) {
    case "FACEBOOK":
      return publishToFacebook(account, content);
    case "INSTAGRAM":
      return publishToInstagram(account, content);
    case "LINKEDIN":
      return publishToLinkedIn(account, content);
    case "TWITTER":
      return publishToX(account, content);
    default:
      throw new Error(`Unsupported provider ${account.provider}`);
  }
}

async function publishToFacebook(account: SocialAccount, content: { text: string }) {
  const body = new URLSearchParams({ message: content.text, access_token: account.accessToken || "" });
  const response = await parseJson(
    await fetch(`https://graph.facebook.com/${graphVersion}/${account.externalAccountId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    })
  );

  return {
    providerPostId: String(response.id),
    raw: response
  };
}

async function publishToInstagram(account: SocialAccount, content: { text: string; mediaUrl?: string | null }) {
  if (!content.mediaUrl) {
    throw new Error("Instagram publishing requires a public mediaUrl.");
  }

  const createContainerBody = new URLSearchParams({
    image_url: content.mediaUrl,
    caption: content.text,
    access_token: account.accessToken || ""
  });

  const container = await parseJson(
    await fetch(`https://graph.facebook.com/${graphVersion}/${account.externalAccountId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: createContainerBody
    })
  );

  const publishBody = new URLSearchParams({
    creation_id: String(container.id),
    access_token: account.accessToken || ""
  });

  const published = await parseJson(
    await fetch(`https://graph.facebook.com/${graphVersion}/${account.externalAccountId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: publishBody
    })
  );

  return {
    providerPostId: String(published.id),
    raw: published
  };
}

async function publishToLinkedIn(account: SocialAccount, content: { text: string }) {
  const metadata = (account.metadata || {}) as Record<string, unknown>;
  const author =
    typeof metadata.linkedInOrganizationUrn === "string"
      ? metadata.linkedInOrganizationUrn
      : typeof metadata.linkedInPersonUrn === "string"
        ? metadata.linkedInPersonUrn
        : `urn:li:person:${account.externalAccountId}`;

  const response = await parseJson(
    await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202502",
        "X-Restli-Protocol-Version": "2.0.0"
      },
      body: JSON.stringify({
        author,
        commentary: content.text,
        visibility: "PUBLIC",
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: []
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false
      })
    })
  );

  const providerPostId = response.id || response?.data?.id || "linkedin-post";

  return {
    providerPostId: String(providerPostId),
    raw: response
  };
}

async function publishToX(account: SocialAccount, content: { text: string }) {
  const response = await parseJson(
    await fetch("https://api.x.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: content.text })
    })
  );

  return {
    providerPostId: String(response.data?.id),
    raw: response
  };
}

export async function syncProviderAnalytics(account: SocialAccount) {
  switch (ensureProvider(account.provider)) {
    case "FACEBOOK":
      return syncFacebookAnalytics(account);
    case "INSTAGRAM":
      return syncInstagramAnalytics(account);
    case "LINKEDIN":
      return syncLinkedInAnalytics(account);
    case "TWITTER":
      return syncXAnalytics(account);
    default:
      return null;
  }
}

async function syncFacebookAnalytics(account: SocialAccount) {
  const pageData = await parseJson(
    await fetch(
      `https://graph.facebook.com/${graphVersion}/${account.externalAccountId}?fields=followers_count,name&access_token=${encodeURIComponent(account.accessToken || "")}`,
      { cache: "no-store" }
    )
  );

  return {
    followersCount: Number(pageData.followers_count || 0),
    reach: 0,
    engagement: 0,
    impressions: 0,
    metadata: pageData
  };
}

async function syncInstagramAnalytics(account: SocialAccount) {
  const igData = await parseJson(
    await fetch(
      `https://graph.facebook.com/${graphVersion}/${account.externalAccountId}?fields=followers_count,username&access_token=${encodeURIComponent(account.accessToken || "")}`,
      { cache: "no-store" }
    )
  );

  return {
    followersCount: Number(igData.followers_count || 0),
    reach: 0,
    engagement: 0,
    impressions: 0,
    metadata: igData
  };
}

async function syncLinkedInAnalytics(account: SocialAccount) {
  const profile = await parseJson(
    await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${account.accessToken}` },
      cache: "no-store"
    })
  );

  return {
    followersCount: 0,
    reach: 0,
    engagement: 0,
    impressions: 0,
    metadata: profile
  };
}

async function syncXAnalytics(account: SocialAccount) {
  const response = await parseJson(
    await fetch(`https://api.x.com/2/users/me?user.fields=public_metrics,username,name`, {
      headers: { Authorization: `Bearer ${account.accessToken}` },
      cache: "no-store"
    })
  );

  const metrics = response.data?.public_metrics || {};

  return {
    followersCount: Number(metrics.followers_count || 0),
    reach: 0,
    engagement: Number(metrics.tweet_count || 0),
    impressions: 0,
    metadata: response.data
  };
}
