type BrevoConfig = {
  apiKey: string;
  senderEmail: string;
  senderName: string;
};

export function getBrevoConfig(env = process.env): BrevoConfig | null {
  const apiKey = env.BREVO_API_KEY?.trim();
  const senderEmail = env.BREVO_SENDER_EMAIL?.trim();

  if (!apiKey || !senderEmail) return null;

  return {
    apiKey,
    senderEmail,
    senderName: env.BREVO_SENDER_NAME?.trim() || "NextEditor",
  };
}

export async function sendBrevoEmail(input: {
  toEmail: string;
  toName?: string | null;
  subject: string;
  htmlContent: string;
  textContent?: string;
  env?: NodeJS.ProcessEnv;
}) {
  const config = getBrevoConfig(input.env);
  if (!config) {
    throw new Error("[next-editor] BREVO_API_KEY and BREVO_SENDER_EMAIL are required for password reset emails.");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": config.apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: config.senderEmail,
        name: config.senderName,
      },
      to: [
        {
          email: input.toEmail,
          ...(input.toName ? { name: input.toName } : {}),
        },
      ],
      subject: input.subject,
      htmlContent: input.htmlContent,
      ...(input.textContent ? { textContent: input.textContent } : {}),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`[next-editor] Brevo email send failed with status ${response.status}.`);
  }
}
