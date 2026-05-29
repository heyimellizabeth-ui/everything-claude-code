import Anthropic from "@anthropic-ai/sdk";

const PROMPT = `Look at this receipt image. Extract:
- date (if present)
- vendor/store name (if present)
- total amount (if present)

Reply with JSON only: {"date": "...", "vendor": "...", "total": "..."}
Use null for any field you cannot read clearly. If the image is blurry or unreadable, set "unreadable": true.`;

export interface VisionResult {
  date: string | null;
  vendor: string | null;
  total: string | null;
  unreadable?: boolean;
  warning?: string;
}

export async function checkReceipt(
  file: File,
  apiKey: string
): Promise<VisionResult> {
  const base64 = await fileToBase64(file);
  const mediaType = (file.type || "image/jpeg") as
    | "image/jpeg"
    | "image/png"
    | "image/webp"
    | "image/gif";

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
          { type: "text", text: PROMPT },
        ],
      },
    ],
  });

  const raw = msg.content[0].type === "text" ? msg.content[0].text : "{}";
  try {
    const parsed = JSON.parse(raw) as VisionResult;
    if (parsed.unreadable || !parsed.total) {
      parsed.warning = parsed.unreadable
        ? "Afbeelding onleesbaar — controleer handmatig"
        : "Totaalbedrag niet gevonden";
    }
    return parsed;
  } catch {
    return { date: null, vendor: null, total: null, warning: "OCR mislukt" };
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
