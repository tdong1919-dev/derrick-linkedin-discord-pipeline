/**
 * Timara's Blog Publishing Agent
 *
 * Reads a Google Doc written by Timara and publishes it as a blog post
 * to barebrandingsystems.com, autom8ig.io, or both — via GitHub commits
 * that trigger Netlify auto-deploys.
 *
 * Usage:
 *   npx ts-node agents/timara-blog-agent.ts --doc <DOC_ID> --site bare|autom8|both
 */

import Anthropic from "@anthropic-ai/sdk";
import { readGoogleDoc, readGoogleDocContent } from "../tools/read-google-doc";
import { postBlogTool, postBlog, Site } from "../tools/post-blog";
import { logger } from "../utils";
import * as dotenv from "dotenv";

dotenv.config();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Timara's blog publishing assistant. Your job is to:
1. Read the content from a Google Doc using the read_google_doc tool.
2. Clean up and lightly format the body as markdown if needed (preserve the author's voice — do not rewrite or add fluff).
3. Write a concise one-sentence SEO excerpt from the content.
4. Publish the post to the requested site(s) using the post_blog tool.
5. Report back with the GitHub URLs of the published files.

Rules:
- Never rewrite the author's content — light markdown formatting only (headings, bold, lists).
- Always use the exact title from the document.
- If the doc body is already in markdown, leave it as-is.
- Report clearly if publishing fails and why.`;

export async function runTimaraBlogAgent(
  docId: string,
  site: Site
): Promise<void> {
  logger.info("timara-blog-agent", `Reading doc ${docId}, publishing to: ${site}`);

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Please read Google Doc ID "${docId}" and publish it as a blog post to: ${site}. Use the tools available to you.`,
    },
  ];

  // Agentic loop
  while (true) {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      tools: [readGoogleDoc, postBlogTool],
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      for (const block of response.content) {
        if (block.type === "text") {
          logger.info("timara-blog-agent", `\n${block.text}`);
        }
      }
      break;
    }

    if (response.stop_reason !== "tool_use") break;

    // Handle tool calls
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;

      logger.info("timara-blog-agent", `Calling tool: ${block.name}`);

      let result: unknown;

      try {
        if (block.name === "read_google_doc") {
          const input = block.input as { doc_id: string };
          result = await readGoogleDocContent(input.doc_id);
        } else if (block.name === "post_blog") {
          const input = block.input as {
            title: string;
            body: string;
            excerpt: string;
            site: Site;
          };
          result = await postBlog(input);
        } else {
          result = { error: `Unknown tool: ${block.name}` };
        }
      } catch (err) {
        result = { error: (err as Error).message };
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result),
      });
    }

    messages.push({ role: "user", content: toolResults });
  }
}

// ─── CLI entrypoint ───────────────────────────────────────────────────────────
if (require.main === module) {
  const args = process.argv.slice(2);
  const docIdx = args.indexOf("--doc");
  const siteIdx = args.indexOf("--site");

  const docId = docIdx !== -1 ? args[docIdx + 1] : null;
  const site = (siteIdx !== -1 ? args[siteIdx + 1] : "both") as Site;

  if (!docId) {
    console.error("Usage: npx ts-node agents/timara-blog-agent.ts --doc <DOC_ID> --site bare|autom8|both");
    process.exit(1);
  }

  runTimaraBlogAgent(docId, site).catch((err) => {
    console.error("Agent failed:", err);
    process.exit(1);
  });
}
