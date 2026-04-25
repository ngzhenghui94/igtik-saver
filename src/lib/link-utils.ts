import { LinkPlatform } from "@/generated/prisma/enums";

export type ParsedSocialLink = {
  platform: LinkPlatform;
  normalizedUrl: string;
  host: string;
};

const instagramHosts = new Set(["instagram.com", "www.instagram.com", "instagr.am", "www.instagr.am"]);
const tiktokHosts = new Set(["tiktok.com", "www.tiktok.com", "m.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"]);
const googleMapsHosts = new Set([
  "google.com",
  "www.google.com",
  "maps.google.com",
  "maps.app.goo.gl",
  "goo.gl",
]);

const removableSearchParams = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "g_st"];

export function parseSocialLink(value: string): ParsedSocialLink {
  const url = new URL(value.trim());
  const host = url.hostname.toLowerCase();
  const platform = instagramHosts.has(host)
    ? LinkPlatform.INSTAGRAM
    : tiktokHosts.has(host)
      ? LinkPlatform.TIKTOK
      : isGoogleMapsUrl(url, host)
        ? LinkPlatform.GOOGLE_MAPS
        : null;

  if (!platform) {
    throw new Error("Only Instagram, TikTok, and Google Maps links are supported right now.");
  }

  url.hash = "";
  url.hostname = host.replace(/^www\./, "");

  if (platform === LinkPlatform.GOOGLE_MAPS) {
    removableSearchParams.forEach((param) => url.searchParams.delete(param));
  } else {
    url.search = "";
  }

  const normalizedUrl = url.toString().replace(/\/$/, "");

  return {
    platform,
    normalizedUrl,
    host: url.hostname,
  };
}

export function platformLabel(platform: LinkPlatform) {
  if (platform === LinkPlatform.INSTAGRAM) {
    return "Instagram";
  }

  if (platform === LinkPlatform.TIKTOK) {
    return "TikTok";
  }

  return "Google Maps";
}

export function titleFromSavedUrl(value: string, platform: LinkPlatform) {
  const url = safeUrl(value);

  if (!url) {
    return null;
  }

  if (platform === LinkPlatform.GOOGLE_MAPS) {
    return googleMapsTitleFromUrl(url);
  }

  if (platform === LinkPlatform.TIKTOK) {
    const handle = socialHandleFromUrl(value, platform);
    return handle ? `${handle} on TikTok` : "TikTok video";
  }

  const instagramKind = instagramKindFromUrl(url);
  const handle = socialHandleFromUrl(value, platform);

  if (handle && instagramKind === "Profile") {
    return handle;
  }

  return instagramKind ? `Instagram ${instagramKind.toLowerCase()}` : handle;
}

export function socialHandleFromUrl(value: string, platform: LinkPlatform) {
  const url = safeUrl(value);

  if (!url) {
    return null;
  }

  const segments = pathSegments(url);

  if (platform === LinkPlatform.TIKTOK) {
    const handle = segments.find((segment) => segment.startsWith("@"));
    return handle ?? null;
  }

  if (platform === LinkPlatform.INSTAGRAM) {
    const [first] = segments;
    const reservedSegments = new Set(["p", "reel", "reels", "tv", "stories", "explore"]);

    if (first && !reservedSegments.has(first.toLowerCase())) {
      return `@${first.replace(/^@/, "")}`;
    }
  }

  return null;
}

export function savedLinkReferenceFromUrl(value: string, platform: LinkPlatform) {
  const url = safeUrl(value);

  if (!url) {
    return null;
  }

  const segments = pathSegments(url);

  if (platform === LinkPlatform.INSTAGRAM) {
    const [first, second] = segments;
    const lowerFirst = first?.toLowerCase();

    if ((lowerFirst === "p" || lowerFirst === "reel" || lowerFirst === "reels" || lowerFirst === "tv") && second) {
      return compactReference(second);
    }

    if (lowerFirst === "stories" && second) {
      return `@${second.replace(/^@/, "")}`;
    }

    return socialHandleFromUrl(value, platform);
  }

  if (platform === LinkPlatform.TIKTOK) {
    const handle = socialHandleFromUrl(value, platform);
    const videoIndex = segments.findIndex((segment) => segment.toLowerCase() === "video");
    const videoId = videoIndex >= 0 ? segments[videoIndex + 1] : null;

    if (handle && videoId) {
      return `${handle} / ${compactReference(videoId, 8)}`;
    }

    if (handle) {
      return handle;
    }

    const shortLinkId = segments.find(Boolean);
    return shortLinkId ? compactReference(shortLinkId) : null;
  }

  return googleMapsTitleFromUrl(url);
}

export function savedLinkKindFromUrl(value: string, platform: LinkPlatform) {
  const url = safeUrl(value);

  if (!url) {
    return platformLabel(platform);
  }

  if (platform === LinkPlatform.GOOGLE_MAPS) {
    return googleMapsTitleFromUrl(url) ? "Place" : "Map";
  }

  if (platform === LinkPlatform.TIKTOK) {
    return pathSegments(url).includes("video") || pathSegments(url).length > 0 ? "Video" : "TikTok";
  }

  return instagramKindFromUrl(url) ?? "Instagram";
}

export function isGenericSavedTitle(title: string, platform: LinkPlatform) {
  return title.trim().toLowerCase() === `${platformLabel(platform)} save`.toLowerCase();
}

export type Coordinates = { latitude: number; longitude: number };

const coordinatePattern = /^-?\d{1,3}(\.\d+)?$/;

export function extractCoordinates(value: string): Coordinates | null {
  const url = safeUrl(value);

  if (!url) {
    return null;
  }

  for (const segment of pathSegments(url)) {
    const dataMatch = segment.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    if (dataMatch) {
      return toCoordinates(dataMatch[1], dataMatch[2]);
    }
  }

  const atMatch = url.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);

  if (atMatch) {
    return toCoordinates(atMatch[1], atMatch[2]);
  }

  const llParam = url.searchParams.get("ll");

  if (llParam) {
    const [lat, lng] = llParam.split(",");
    const coords = toCoordinates(lat, lng);
    if (coords) return coords;
  }

  const queryParam = url.searchParams.get("q") ?? url.searchParams.get("query");

  if (queryParam) {
    const [lat, lng] = queryParam.split(",");

    if (coordinatePattern.test(lat?.trim() ?? "") && coordinatePattern.test(lng?.trim() ?? "")) {
      const coords = toCoordinates(lat, lng);
      if (coords) return coords;
    }
  }

  const destinationParam = url.searchParams.get("destination") ?? url.searchParams.get("daddr");

  if (destinationParam) {
    const [lat, lng] = destinationParam.split(",");

    if (coordinatePattern.test(lat?.trim() ?? "") && coordinatePattern.test(lng?.trim() ?? "")) {
      const coords = toCoordinates(lat, lng);
      if (coords) return coords;
    }
  }

  return null;
}

function toCoordinates(latRaw: string | undefined, lngRaw: string | undefined): Coordinates | null {
  if (!latRaw || !lngRaw) return null;

  const latitude = Number(latRaw);
  const longitude = Number(lngRaw);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }

  return { latitude, longitude };
}

function isGoogleMapsUrl(url: URL, host: string) {
  if (!googleMapsHosts.has(host)) {
    return false;
  }

  if (host === "maps.app.goo.gl") {
    return true;
  }

  if (host === "goo.gl") {
    return url.pathname.startsWith("/maps");
  }

  return url.pathname.startsWith("/maps") || url.searchParams.has("q");
}

function googleMapsTitleFromUrl(url: URL) {
  const segments = pathSegments(url);
  const placeIndex = segments.findIndex((segment) => segment.toLowerCase() === "place");
  const searchIndex = segments.findIndex((segment) => segment.toLowerCase() === "search");
  const query =
    url.searchParams.get("q") ??
    url.searchParams.get("query") ??
    url.searchParams.get("destination") ??
    url.searchParams.get("daddr");

  if (placeIndex >= 0 && segments[placeIndex + 1]) {
    return decodeUrlLabel(segments[placeIndex + 1]);
  }

  if (searchIndex >= 0 && segments[searchIndex + 1]) {
    return decodeUrlLabel(segments[searchIndex + 1]);
  }

  return query ? decodeUrlLabel(query) : null;
}

function instagramKindFromUrl(url: URL) {
  const [first] = pathSegments(url).map((segment) => segment.toLowerCase());

  if (first === "reel" || first === "reels") {
    return "Reel";
  }

  if (first === "p") {
    return "Post";
  }

  if (first === "tv") {
    return "Video";
  }

  return first ? "Profile" : null;
}

function pathSegments(url: URL) {
  return url.pathname.split("/").filter(Boolean);
}

function safeUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function decodeUrlLabel(value: string) {
  try {
    return decodeURIComponent(value.replace(/\+/g, " ")).replace(/\s+/g, " ").trim();
  } catch {
    return value.replace(/\+/g, " ").replace(/\s+/g, " ").trim();
  }
}

function compactReference(value: string, maxLength = 12) {
  const label = decodeUrlLabel(value).replace(/^@/, "");

  if (label.length <= maxLength) {
    return label;
  }

  return `${label.slice(0, maxLength)}...`;
}
