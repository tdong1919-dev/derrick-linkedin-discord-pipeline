import { z } from "zod";

/**
 * Validates output against a Zod schema and returns a strict JSON string.
 * Throws a ZodError if the shape is invalid — surfaces immediately during dev.
 */
export function strictRespond<T extends z.ZodTypeAny>(schema: T, data: z.infer<T>): string {
  const parsed = schema.parse(data);
  return JSON.stringify(parsed);
}
