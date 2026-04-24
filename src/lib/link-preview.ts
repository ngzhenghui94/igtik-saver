import { LinkPlatform } from "@/generated/prisma/enums";

import { platformLabel, socialHandleFromUrl, titleFromSavedUrl } from "@/lib/link-utils";

type LinkPreview = {
  title: string | null;
  thumbnailUrl: string | null;
  authorHandle: string | null;
};

const maxPreviewBytes = 512_000;
const previewTimeoutMs = 3_500;

export async function fetchLinkPreview(value: string, platform: LinkPlatform): Promise<LinkPreview> {
  const fallbackTitle = titleFromSavedUrl(value, platform);
  const fallbackHandle = socialHandleFromUrl(value, platform);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), previewTimeoutMs);

    try {
      const response = await fetch(value, {
        redirect: "follow",
        signal: controller.signal,
        headers: {
          accept: "text/html,application/xhtml+xml",
          "user-agent": "SavedCollectionsBot/1.0 (+https://localhost)",
        },
      });

      if (!response.ok) {
        return {
          title: fallbackTitle,
          thumbnailUrl: null,
          authorHandle: fallbackHandle,
        };
      }

      const finalUrl = response.url || value;
      const contentType = response.headers.get("content-type") ?? "";

      if (!contentType.toLowerCase().includes("text/html")) {
        return {
          title: fallbackTitle ?? titleFromSavedUrl(finalUrl, platform),
          thumbnailUrl: null,
          authorHandle: fallbackHandle ?? socialHandleFromUrl(finalUrl, platform),
        };
      }

      const html = await readLimitedText(response, maxPreviewBytes);
      const metadata = extractHtmlMetadata(html, finalUrl, platform);

      return {
        title: metadata.title ?? fallbackTitle ?? titleFromSavedUrl(finalUrl, platform),
        thumbnailUrl: metadata.thumbnailUrl,
        authorHandle: metadata.authorHandle ?? fallbackHandle ?? socialHandleFromUrl(finalUrl, platform),
      };
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return {
      title: fallbackTitle,
      thumbnailUrl: null,
      authorHandle: fallbackHandle,
    };
  }
}

async function readLimitedText(response: Response, maxBytes: number) {
  if (!response.body) {
    return (await response.text()).slice(0, maxBytes);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let receivedBytes = 0;
  let text = "";

  while (receivedBytes < maxBytes) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    receivedBytes += value.byteLength;
    text += decoder.decode(value, { stream: true });

    if (receivedBytes >= maxBytes) {
      await reader.cancel();
      break;
    }
  }

  return text + decoder.decode();
}

function extractHtmlMetadata(html: string, baseUrl: string, platform: LinkPlatform): LinkPreview {
  const meta = new Map<string, string>();

  for (const tag of html.matchAll(/<meta\s+[^>]*>/gi)) {
    const metaTag = tag[0];
    const key = getAttribute(metaTag, "property") ?? getAttribute(metaTag, "name") ?? getAttribute(metaTag, "itemprop");
    const content = getAttribute(metaTag, "content");

    if (key && content) {
      meta.set(key.toLowerCase(), decodeHtml(content));
    }
  }

  const rawTitle =
    firstValue(meta, ["og:title", "twitter:title", "title"]) ??
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const rawImage = firstValue(meta, ["og:image:secure_url", "og:image", "twitter:image", "twitter:image:src", "image"]);
  const rawAuthor = firstValue(meta, ["article:author", "twitter:creator", "author"]);

  return {
    title: cleanTitle(rawTitle ? decodeHtml(rawTitle) : null, platform),
    thumbnailUrl: resolveHttpUrl(rawImage, baseUrl),
    authorHandle: cleanAuthor(rawAuthor),
  };
}

function firstValue(meta: Map<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = meta.get(key);

    if (value?.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getAttribute(tag: string, name: string) {
  const pattern = new RegExp(`${name}\\s*=\\s*("[^"]*"|'[^']*'|[^\\s>]+)`, "i");
  const value = tag.match(pattern)?.[1];

  if (!value) {
    return null;
  }

  return value.replace(/^['"]|['"]$/g, "");
}

function cleanTitle(value: string | null, platform: LinkPlatform) {
  if (!value) {
    return null;
  }

  const genericTitles = new Set([platformLabel(platform).toLowerCase(), "instagram", "tiktok", "google maps"]);
  const title = value
    .replace(/\s+/g, " ")
    .replace(/\s[-|]\sGoogle Maps$/i, "")
    .replace(/\s[-|]\sTikTok$/i, "")
    .replace(/\s•\sInstagram.*$/i, "")
    .trim();

  return title && !genericTitles.has(title.toLowerCase()) ? title.slice(0, 120) : null;
}

function cleanAuthor(value: string | null) {
  if (!value) {
    return null;
  }

  const author = value.replace(/^https?:\/\/(www\.)?/, "").replace(/\s+/g, " ").trim();

  return author ? author.slice(0, 80) : null;
}

function resolveHttpUrl(value: string | null, baseUrl: string) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value, baseUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function decodeHtml(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code: string) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
