type LogLevel = "info" | "warn" | "error" | "tool";

function log(level: LogLevel, label: string, data?: unknown): void {
  const prefix = {
    info: "ℹ️ ",
    warn: "⚠️ ",
    error: "❌",
    tool: "🔧",
  }[level];
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${prefix} [${label}]`, data !== undefined ? data : "");
}

export const logger = {
  info: (label: string, data?: unknown) => log("info", label, data),
  warn: (label: string, data?: unknown) => log("warn", label, data),
  error: (label: string, data?: unknown) => log("error", label, data),
  tool: (name: string, input: unknown) => log("tool", name, input),
};
