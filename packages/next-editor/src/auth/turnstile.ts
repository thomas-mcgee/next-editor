const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";
const TURNSTILE_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

export type TurnstileConfig = {
  enabled: boolean;
  siteKey: string;
  secretKey: string;
};

export function getTurnstileConfig(env = process.env): TurnstileConfig {
  const rawEnabled = env.NEXT_EDITOR_TURNSTILE_ENABLED?.trim().toLowerCase();
  const enabled = !["0", "false", "off", "no"].includes(rawEnabled ?? "");

  return {
    enabled,
    siteKey: env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || TURNSTILE_TEST_SITE_KEY,
    secretKey: env.TURNSTILE_SECRET_KEY?.trim() || TURNSTILE_TEST_SECRET_KEY,
  };
}

export async function verifyTurnstileToken(input: {
  token: string;
  remoteIp?: string | null;
  env?: NodeJS.ProcessEnv;
}) {
  const config = getTurnstileConfig(input.env);
  if (!config.enabled) return true;
  if (!input.token) return false;

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: config.secretKey,
        response: input.token,
        ...(input.remoteIp ? { remoteip: input.remoteIp } : {}),
      }),
      cache: "no-store",
    });

    if (!response.ok) return false;

    const payload = (await response.json()) as { success?: boolean };
    return payload.success === true;
  } catch {
    return false;
  }
}
