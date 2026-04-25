import { AtSign, Camera, ExternalLink, MapPin, Music2, Play, Route, Star, Trash2 } from "lucide-react";

import type { LinkPlatform } from "@/generated/prisma/enums";

import { deleteSavedLinkAction } from "@/app/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  isGenericSavedTitle,
  platformLabel,
  savedLinkKindFromUrl,
  savedLinkReferenceFromUrl,
  titleFromSavedUrl,
} from "@/lib/link-utils";
import { cn } from "@/lib/utils";

type SavedLinkCardProps = {
  id?: string;
  title: string;
  note: string | null;
  url: string;
  platform: LinkPlatform;
  thumbnailUrl: string | null;
  authorHandle: string | null;
  createdAt: Date;
  canDelete?: boolean;
};

export function SavedLinkCard({
  id,
  title,
  note,
  url,
  platform,
  thumbnailUrl,
  authorHandle,
  createdAt,
  canDelete = false,
}: SavedLinkCardProps) {
  const Icon = platform === "INSTAGRAM" ? Camera : platform === "TIKTOK" ? Music2 : MapPin;
  const reference = savedLinkReferenceFromUrl(url, platform);
  const displayTitle = isGenericSavedTitle(title, platform)
    ? titleFromSavedUrl(url, platform) ?? reference ?? title
    : title;
  const kind = savedLinkKindFromUrl(url, platform);
  const safeImageUrl = getSafeImageUrl(thumbnailUrl);
  const detail = firstDistinctText([authorHandle, reference, kind === platformLabel(platform) ? null : kind], displayTitle);
  const accent = accentForPlatform(platform);

  return (
    <article className="group/link flex flex-col overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10 transition-all hover:ring-foreground/20">
      <SavedLinkVisual title={displayTitle} platform={platform} imageUrl={safeImageUrl} detail={detail} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <div className={cn("flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider", accent.text)}>
            <Icon className="size-3" aria-hidden />
            {platformLabel(platform)}
          </div>
          <h3 className="mt-2 line-clamp-2 font-heading text-base font-semibold leading-snug text-foreground">{displayTitle}</h3>
          {note ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{note}</p> : null}
        </div>
        <div className="flex items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
          <span>{createdAt.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span>
          <div className="flex items-center gap-1.5">
            {canDelete && id ? (
              <form action={deleteSavedLinkAction}>
                <input type="hidden" name="savedLinkId" value={id} />
                <Button type="submit" variant="destructive" size="sm" aria-label={`Delete ${displayTitle}`} title="Delete">
                  <Trash2 />
                </Button>
              </form>
            ) : null}
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Open
              <ExternalLink />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function SavedLinkVisual({
  title,
  platform,
  imageUrl,
  detail,
}: {
  title: string;
  platform: LinkPlatform;
  imageUrl: string | null;
  detail: string | null;
}) {
  const Icon = platform === "INSTAGRAM" ? Camera : platform === "TIKTOK" ? Music2 : MapPin;

  if (imageUrl) {
    return (
      <div
        className="relative flex aspect-[4/3] items-end overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.85)), url("${cssUrl(imageUrl)}")`,
        }}
      >
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/65 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground backdrop-blur">
          <Icon className="size-3" aria-hidden />
          {detail ?? platformLabel(platform)}
        </div>
        <div className="relative p-4">
          <p className="line-clamp-2 text-base font-semibold leading-snug text-white drop-shadow">{title}</p>
        </div>
      </div>
    );
  }

  if (platform === "GOOGLE_MAPS") {
    return (
      <div className="relative flex aspect-[4/3] overflow-hidden bg-[oklch(0.22_0.04_180)]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,184,166,0.16)_1px,transparent_1px),linear-gradient(0deg,rgba(20,184,166,0.16)_1px,transparent_1px)] bg-[length:34px_34px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_28%,rgba(20,184,166,0.3),transparent_30%),radial-gradient(circle_at_78%_66%,rgba(244,63,94,0.18),transparent_30%)]" />
        <div className="relative m-auto flex max-w-[82%] flex-col items-center text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-300 text-emerald-950 shadow-2xl">
            <MapPin className="size-5" aria-hidden />
          </span>
          <span className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-white">{title}</span>
          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-100/70">
            <Route className="size-3" aria-hidden />
            Google Maps place
          </span>
        </div>
      </div>
    );
  }

  if (platform === "TIKTOK") {
    return (
      <div className="relative flex aspect-[4/3] overflow-hidden bg-[oklch(0.16_0.012_280)]">
        <div className="absolute inset-y-0 left-6 w-20 rotate-12 bg-cyan-400/25 blur-2xl" />
        <div className="absolute inset-y-0 right-6 w-20 -rotate-12 bg-rose-500/25 blur-2xl" />
        <div className="relative m-auto flex max-w-[82%] flex-col items-center text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-[6px_6px_0_rgba(34,211,238,0.55),-6px_-6px_0_rgba(244,63,94,0.5)]">
            <Play className="size-5" fill="currentColor" aria-hidden />
          </span>
          <span className="mt-4 line-clamp-2 text-base font-semibold leading-snug text-white">{title}</span>
          {detail ? (
            <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              <AtSign className="size-3" aria-hidden />
              {detail.replace(/^@/, "")}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(244,63,94,0.45),transparent_30%),radial-gradient(circle_at_75%_72%,rgba(250,204,21,0.25),transparent_24%),linear-gradient(135deg,rgba(124,58,237,0.45),rgba(14,165,233,0.2),oklch(0.18_0.012_280))]">
      <div className="absolute inset-x-5 top-5 flex justify-between text-white/30">
        <Star className="size-4" aria-hidden />
        <Camera className="size-4" aria-hidden />
      </div>
      <div className="relative m-auto flex max-w-[82%] flex-col items-center text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur">
          <Camera className="size-5" aria-hidden />
        </span>
        <span className="mt-4 line-clamp-2 text-base font-semibold leading-snug text-white">{title}</span>
        {detail ? <span className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-white/60">{detail}</span> : null}
      </div>
    </div>
  );
}

function accentForPlatform(platform: LinkPlatform) {
  if (platform === "INSTAGRAM") return { text: "text-pink-300" };
  if (platform === "TIKTOK") return { text: "text-cyan-300" };
  return { text: "text-emerald-300" };
}

function getSafeImageUrl(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function cssUrl(value: string) {
  return value.replace(/["\\]/g, "\\$&").replace(/\n|\r|\f/g, "");
}

function firstDistinctText(values: (string | null)[], title: string) {
  const normalizedTitle = title.trim().toLowerCase();

  for (const value of values) {
    const normalizedValue = value?.trim();

    if (normalizedValue && normalizedValue.toLowerCase() !== normalizedTitle) {
      return normalizedValue;
    }
  }

  return null;
}
