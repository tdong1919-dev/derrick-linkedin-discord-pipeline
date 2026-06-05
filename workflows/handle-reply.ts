/**
 * handle-reply.ts
 *
 * Manual entry point for processing a lead reply.
 * Usage: npm run workflow:reply -- --lead LEAD-001 --platform linkedin_dm --reply "Thanks, I'd love to see a demo"
 *
 * Or pipe in from stdin:
 * echo '{"lead_id":"LEAD-001","platform":"linkedin_dm","reply":"Sounds interesting, tell me more"}' | npm run workflow:reply
 *
 * The reply handler agent will:
 * 1. Classify the reply (Positive Interest, Wants Call, Objection, etc.)
 * 2. Update lead temperature + status in Leads tab
 * 3. Log the conversation to the Conversations tab
 * 4. Draft a response (pending_review — never auto-sends)
 * 5. Ping Discord if high-intent (Wants Call, Demo, Pricing, Signup)
 */

import { runReplyHandler } from "../agents/outbound/reply-handler";
import { logger } from "../utils";

function parseArgs(): { lead_id: string; platform: string; reply: string } {
  const args = process.argv.slice(2);

  // Flag-style: --lead LEAD-001 --platform linkedin_dm --reply "text"
  const flagIdx = (flag: string) => args.indexOf(flag);
  const getFlag = (flag: string) => {
    const i = flagIdx(flag);
    return i !== -1 ? args[i + 1] : undefined;
  };

  const lead_id   = getFlag("--lead")     ?? getFlag("--lead_id");
  const platform  = getFlag("--platform");
  const reply     = getFlag("--reply")    ?? getFlag("--text");

  if (lead_id && platform && reply) {
    return { lead_id, platform, reply };
  }

  // JSON stdin fallback
  try {
    const stdin = require("fs").readFileSync("/dev/stdin", "utf8").trim();
    if (stdin) {
      const parsed = JSON.parse(stdin);
      if (parsed.lead_id && parsed.platform && (parsed.reply ?? parsed.reply_text)) {
        return {
          lead_id: parsed.lead_id,
          platform: parsed.platform,
          reply: parsed.reply ?? parsed.reply_text,
        };
      }
    }
  } catch {
    // no stdin
  }

  console.error(`
Usage:
  npm run workflow:reply -- --lead LEAD-001 --platform linkedin_dm --reply "Thanks, I'd love to see a demo"

Platforms: linkedin_dm | instagram_dm | email
  `);
  process.exit(1);
}

async function run(): Promise<void> {
  const { lead_id, platform, reply } = parseArgs();

  logger.info("workflow:reply", `Processing reply for ${lead_id} on ${platform}`);

  const task = `A lead replied on ${platform}.
Lead ID: ${lead_id}
Reply text: "${reply}"
Received at: ${new Date().toISOString()}

Steps:
1. Classify the reply using classifyReply.
2. Update lead temperature and status in the Leads tab.
3. Log the full conversation entry to the Conversations tab with the reply text, classification, and a draft response.
4. If high-intent (Wants Call, Wants Demo, Wants Pricing, Wants Signup): notify the founder via Discord immediately.
5. Draft a response appropriate to the classification — status must be pending_review, never send automatically.`;

  await runReplyHandler(task);
  logger.info("workflow:reply", "Done");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
