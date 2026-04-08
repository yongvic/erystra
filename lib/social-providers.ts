export type ProviderKey = "FACEBOOK" | "LINKEDIN" | "TWITTER" | "INSTAGRAM";

export type ProviderConfig = {
  key: ProviderKey;
  label: string;
  authBaseUrl: string;
  tokenUrl: string;
  scopes: string[];
  placeholderHandle: string;
  redirectUri: string;
};

const appUrl = process.env.APP_URL || "http://localhost:3000";

export const providerConfigs: ProviderConfig[] = [
  {
    key: "FACEBOOK",
    label: "Facebook",
    authBaseUrl: `https://www.facebook.com/${process.env.FACEBOOK_GRAPH_VERSION || "v23.0"}/dialog/oauth`,
    tokenUrl: `https://graph.facebook.com/${process.env.FACEBOOK_GRAPH_VERSION || "v23.0"}/oauth/access_token`,
    scopes: ["pages_show_list", "pages_read_engagement", "pages_manage_posts"],
    placeholderHandle: "erystra-group",
    redirectUri: process.env.FACEBOOK_REDIRECT_URI || `${appUrl}/api/social-accounts/connect?provider=FACEBOOK`
  },
  {
    key: "LINKEDIN",
    label: "LinkedIn",
    authBaseUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scopes: ["openid", "profile", "email", "w_member_social"],
    placeholderHandle: "erystra-group",
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || `${appUrl}/api/social-accounts/connect?provider=LINKEDIN`
  },
  {
    key: "TWITTER",
    label: "X",
    authBaseUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.x.com/2/oauth2/token",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    placeholderHandle: "ErystraGroup",
    redirectUri: process.env.TWITTER_REDIRECT_URI || `${appUrl}/api/social-accounts/connect?provider=TWITTER`
  },
  {
    key: "INSTAGRAM",
    label: "Instagram",
    authBaseUrl: `https://www.facebook.com/${process.env.FACEBOOK_GRAPH_VERSION || "v23.0"}/dialog/oauth`,
    tokenUrl: `https://graph.facebook.com/${process.env.FACEBOOK_GRAPH_VERSION || "v23.0"}/oauth/access_token`,
    scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list"],
    placeholderHandle: "erystra.group",
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI || `${appUrl}/api/social-accounts/connect?provider=INSTAGRAM`
  }
];

export function getProviderConfig(provider: ProviderKey) {
  const config = providerConfigs.find((item) => item.key === provider);

  if (!config) {
    throw new Error(`Unsupported provider ${provider}`);
  }

  return config;
}

export function getProviderClientId(provider: ProviderKey) {
  return process.env[`${provider}_CLIENT_ID`] || "";
}

export function getProviderClientSecret(provider: ProviderKey) {
  return process.env[`${provider}_CLIENT_SECRET`] || "";
}
