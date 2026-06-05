import { google } from "googleapis";
import Anthropic from "@anthropic-ai/sdk";

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
  scopes: ["https://www.googleapis.com/auth/documents.readonly"],
});

export const readGoogleDoc: Anthropic.Tool = {
  name: "read_google_doc",
  description:
    "Reads the full text content of a Google Doc by its document ID. Returns the title and body text.",
  input_schema: {
    type: "object" as const,
    properties: {
      doc_id: {
        type: "string",
        description:
          "The Google Doc document ID (found in the URL: docs.google.com/document/d/<DOC_ID>/)",
      },
    },
    required: ["doc_id"],
  },
};

export async function readGoogleDocContent(
  docId: string
): Promise<{ title: string; body: string }> {
  const authClient = await auth.getClient();
  const docs = google.docs({ version: "v1", auth: authClient as any });

  const res = await docs.documents.get({ documentId: docId });
  const doc = res.data;

  const title = doc.title || "Untitled";

  // Extract plain text from the document body
  const body = (doc.body?.content || [])
    .flatMap((el) => {
      if (!el.paragraph) return [];
      return el.paragraph.elements?.map((e) => e.textRun?.content || "") ?? [];
    })
    .join("")
    .trim();

  return { title, body };
}
