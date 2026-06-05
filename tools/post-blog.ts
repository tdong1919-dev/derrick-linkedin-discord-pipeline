import Anthropic from "@anthropic-ai/sdk";

export type Site = "bare" | "autom8" | "both";

interface SiteConfig {
  owner: string;
  repo: string;
  branch: string;
  postsDir: string; // e.g. "content/blog" or "posts"
}

const SITE_CONFIGS: Record<Exclude<Site, "both">, SiteConfig> = {
  bare: {
    owner: process.env.BARE_GITHUB_OWNER || "",
    repo: process.env.BARE_GITHUB_REPO || "",
    branch: process.env.BARE_GITHUB_BRANCH || "main",
    postsDir: process.env.BARE_POSTS_DIR || "content/blog",
  },
  autom8: {
    owner: process.env.AUTOM8_GITHUB_OWNER || "",
    repo: process.env.AUTOM8_GITHUB_REPO || "",
    branch: process.env.AUTOM8_GITHUB_BRANCH || "main",
    postsDir: process.env.AUTOM8_POSTS_DIR || "content/blog",
  },
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function buildFrontmatter(title: string, excerpt: string, date: string): string {
  return `---
title: "${title.replace(/"/g, '\\"')}"
date: "${date}"
excerpt: "${excerpt.replace(/"/g, '\\"')}"
draft: false
---

`;
}

async function commitToGitHub(
  config: SiteConfig,
  slug: string,
  content: string,
  title: string
): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN env var is missing");

  const path = `${config.postsDir}/${slug}.md`;
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;

  // Check if file exists (to get SHA for updates)
  let sha: string | undefined;
  const existing = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (existing.ok) {
    const data = (await existing.json()) as { sha: string };
    sha = data.sha;
  }

  const body: Record<string, string> = {
    message: `blog: publish "${title}"`,
    content: Buffer.from(content).toString("base64"),
    branch: config.branch,
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${err}`);
  }

  return `https://github.com/${config.owner}/${config.repo}/blob/${config.branch}/${path}`;
}

export const postBlogTool: Anthropic.Tool = {
  name: "post_blog",
  description:
    "Publishes a blog post to one or both Netlify sites by committing a markdown file to the site's GitHub repo. Netlify auto-deploys on push.",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { type: "string", description: "Blog post title" },
      body: {
        type: "string",
        description: "Full blog post body in markdown format",
      },
      excerpt: {
        type: "string",
        description: "One-sentence summary for SEO/meta description",
      },
      site: {
        type: "string",
        enum: ["bare", "autom8", "both"],
        description:
          '"bare" = barebrandingsystems.com, "autom8" = autom8ig.io, "both" = publish to both',
      },
    },
    required: ["title", "body", "excerpt", "site"],
  },
};

export async function postBlog(params: {
  title: string;
  body: string;
  excerpt: string;
  site: Site;
}): Promise<{ success: boolean; urls: string[]; errors: string[] }> {
  const { title, body, excerpt, site } = params;
  const date = new Date().toISOString().split("T")[0];
  const slug = slugify(title);
  const frontmatter = buildFrontmatter(title, excerpt, date);
  const fullContent = frontmatter + body;

  const sites: Exclude<Site, "both">[] =
    site === "both" ? ["bare", "autom8"] : [site];

  const urls: string[] = [];
  const errors: string[] = [];

  for (const s of sites) {
    const config = SITE_CONFIGS[s];
    if (!config.owner || !config.repo) {
      errors.push(
        `Site "${s}" is not configured — set ${s.toUpperCase()}_GITHUB_OWNER and ${s.toUpperCase()}_GITHUB_REPO env vars`
      );
      continue;
    }
    try {
      const url = await commitToGitHub(config, slug, fullContent, title);
      urls.push(url);
    } catch (err) {
      errors.push(`${s}: ${(err as Error).message}`);
    }
  }

  return { success: errors.length === 0, urls, errors };
}
