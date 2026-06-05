import { z } from "zod";

// Load .env file in development — install dotenv: npm install dotenv
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv").config();
} catch {
  // dotenv not installed — env vars must be set externally (CI, n8n, etc.)
}

const EnvSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
  GOOGLE_SHEETS_ID: z.string().min(1, "GOOGLE_SHEETS_ID is required"),
  GOOGLE_SERVICE_ACCOUNT_JSON: z.string().min(1, "GOOGLE_SERVICE_ACCOUNT_JSON is required"),
  DISCORD_WEBHOOK_URL: z.string().optional(),
  WEBHOOK_SECRET: z.string().optional(),
  WEBHOOK_PORT: z.string().default("3000"),
  CALENDLY_URL: z.string().default("https://calendly.com/autom8/strategy"),
  AUTOM8_URL: z.string().default("https://autom8ig.io"),
});

function parseEnv() {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("\n");
    throw new Error(`Environment validation failed:\n${missing}`);
  }
  return result.data;
}

export const env = parseEnv();

export type Env = z.infer<typeof EnvSchema>;
