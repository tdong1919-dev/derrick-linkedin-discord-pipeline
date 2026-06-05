import { env } from "../config/env";
import { logger } from "../utils";

export type DiscordPriority = "high" | "normal";

// Discord hard limits
const EMBED_DESCRIPTION_LIMIT = 4000; // actual is 4096 — leave buffer
const CONTENT_LIMIT = 1900;           // actual is 2000 — leave buffer

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + "...";
}

export async function sendDiscordNotification(opts: {
  subject: string;
  body: string;
  priority: DiscordPriority;
  leadId?: string;
  actionUrl?: string;
}): Promise<boolean> {
  if (!env.DISCORD_WEBHOOK_URL) {
    logger.warn("discord", "DISCORD_WEBHOOK_URL not set — skipping notification");
    return false;
  }

  const emoji = opts.priority === "high" ? "🔥" : "📬";
  const color = opts.priority === "high" ? 0xff4444 : 0x5865f2;

  const descParts = [
    opts.body,
    opts.leadId  ? `Lead: \`${opts.leadId}\`` : null,
    opts.actionUrl ? `[Open in CRM](${opts.actionUrl})` : null,
  ].filter(Boolean).join("\n");

  const description = truncate(descParts, EMBED_DESCRIPTION_LIMIT);

  const payload = {
    embeds: [
      {
        title: truncate(`${emoji} ${opts.subject}`, 256),
        description,
        color,
      },
    ],
  };

  return post(payload, opts.subject);
}

/**
 * Send a compact plain-text message — used when the body is a simple list
 * that doesn't need embed formatting (e.g. draft review summaries).
 */
export async function sendDiscordMessage(opts: {
  content: string;
  username?: string;
}): Promise<boolean> {
  if (!env.DISCORD_WEBHOOK_URL) {
    logger.warn("discord", "DISCORD_WEBHOOK_URL not set — skipping notification");
    return false;
  }

  const payload = {
    content: truncate(opts.content, CONTENT_LIMIT),
    username: opts.username ?? "Autom8",
  };

  return post(payload, "plain message");
}

async function post(payload: object, label: string): Promise<boolean> {
  try {
    const response = await fetch(env.DISCORD_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      logger.error("discord", `Webhook failed: ${response.status} ${response.statusText} — ${detail}`);
      return false;
    }

    logger.info("discord", `Notification sent: ${label}`);
    return true;
  } catch (err) {
    logger.error("discord", `Webhook threw: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}
