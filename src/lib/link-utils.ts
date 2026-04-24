import { LinkPlatform } from "@/generated/prisma/enums";

export type ParsedSocialLink = {
  platform: LinkPlatform;
  normalizedUrl: string;
  host: string;
};

const instagramHosts = new Set(["instagram.com", "www.instagram.com", "instagr.am", "www.instagr.am"]);
const tiktokHosts = new Set(["tiktok.com", "www.tiktok.com", "m.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"]);

export function parseSocialLink(value: string): ParsedSocialLink {
  const url = new URL(value.trim());
  const host = url.hostname.toLowerCase();
  const platform = instagramHosts.has(host)
    ? LinkPlatform.INSTAGRAM
    : tiktokHosts.has(host)
      ? LinkPlatform.TIKTOK
      : null;

  if (!platform) {
    throw new Error("Only Instagram and TikTok links are supported right now.");
  }

  url.hash = "";
  url.search = "";
  url.hostname = host.replace(/^www\./, "");
  const normalizedUrl = url.toString().replace(/\/$/, "");

  return {
    platform,
    normalizedUrl,
    host: url.hostname,
  };
}

export function platformLabel(platform: LinkPlatform) {
  return platform === LinkPlatform.INSTAGRAM ? "Instagram" : "TikTok";
}
