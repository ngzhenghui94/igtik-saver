import { AtSign, Camera, ExternalLink, MapPin, Music2, Play, Route, Star } from "lucide-react";

import type { LinkPlatform } from "@/generated/prisma/enums";

import { isGenericSavedTitle, platformLabel, savedLinkKindFromUrl, titleFromSavedUrl } from "@/lib/link-utils";

type SavedLinkCardProps = {
  title: string;
  note: string | null;
  url: string;
  platform: LinkPlatform;
  thumbnailUrl: string | null;
  authorHandle: string | null;
  createdAt: Date;
};

export function SavedLinkCard({ title, note, url, platform, thumbnailUrl, authorHandle, createdAt }: SavedLinkCardProps) {
  const Icon = platform === "INSTAGRAM" ? Camera : platform === "TIKTOK" ? Music2 : MapPin;
  const displayTitle = isGenericSavedTitle(title, platform) ? titleFromSavedUrl(url, platform) ?? title : title;
  const kind = savedLinkKindFromUrl(url, platform);
  const safeImageUrl = getSafeImageUrl(thumbnailUrl);
  const detail = authorHandle ?? (kind === platformLabel(platform) ? null : kind);

  return (
    <article className="overflow-hidden border border-white/10 bg-white/[0.04]">
      <SavedLinkVisual
        title={displayTitle}
        platform={platform}
        imageUrl={safeImageUrl}
        detail={detail}
      />
      <div className="space-y-4 p-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <Icon size={13} aria-hidden />
            {platformLabel(platform)}
          </div>
          <h3 className="mt-2 text-base font-semibold text-white">{displayTitle}</h3>
          {note ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">{note}</p> : null}
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
          <span>{createdAt.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-2 border border-white/10 px-3 font-semibold text-zinc-200 transition hover:border-white/30"
          >
            Open
            <ExternalLink size={13} aria-hidden />
          </a>
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
        style={{ backgroundImage: `linear-gradient(180deg, rgba(7, 9, 13, 0.05), rgba(7, 9, 13, 0.86)), url("${cssUrl(imageUrl)}")` }}
      >
        <div className="absolute left-3 top-3 inline-flex items-center gap-2 bg-black/55 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur">
          <Icon size={13} aria-hidden />
          {detail ?? platformLabel(platform)}
        </div>
        <div className="relative p-4">
          <p className="line-clamp-2 text-lg font-semibold leading-6 text-white drop-shadow">{title}</p>
        </div>
      </div>
    );
  }

  if (platform === "GOOGLE_MAPS") {
    return (
      <div className="relative flex aspect-[4/3] overflow-hidden bg-[#10201d]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,184,166,0.16)_1px,transparent_1px),linear-gradient(0deg,rgba(20,184,166,0.16)_1px,transparent_1px)] bg-[length:34px_34px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_28%,rgba(20,184,166,0.35),transparent_24%),radial-gradient(circle_at_78%_66%,rgba(244,63,94,0.24),transparent_26%)]" />
        <div className="absolute left-8 top-8 h-16 w-24 rotate-[-18deg] border-y border-teal-200/25" />
        <div className="absolute bottom-8 right-8 h-20 w-20 rounded-full border border-teal-200/25" />
        <div className="relative m-auto flex max-w-[82%] flex-col items-center text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-teal-300 text-[#07110f] shadow-2xl shadow-teal-950/40">
            <MapPin size={27} aria-hidden />
          </span>
          <span className="mt-4 line-clamp-2 text-lg font-semibold leading-6 text-white">{title}</span>
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-teal-100/70">
            <Route size={13} aria-hidden />
            Google Maps place
          </span>
        </div>
      </div>
    );
  }

  if (platform === "TIKTOK") {
    return (
      <div className="relative flex aspect-[4/3] overflow-hidden bg-[#08080b]">
        <div className="absolute inset-y-0 left-8 w-24 rotate-12 bg-cyan-400/25 blur-2xl" />
        <div className="absolute inset-y-0 right-8 w-24 -rotate-12 bg-rose-500/25 blur-2xl" />
        <div className="relative m-auto flex max-w-[82%] flex-col items-center text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-[8px_8px_0_rgba(34,211,238,0.55),-8px_-8px_0_rgba(244,63,94,0.5)]">
            <Play size={26} fill="currentColor" aria-hidden />
          </span>
          <span className="mt-5 line-clamp-2 text-lg font-semibold leading-6 text-white">{title}</span>
          {detail ? (
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              <AtSign size={13} aria-hidden />
              {detail.replace(/^@/, "")}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(244,63,94,0.5),transparent_30%),radial-gradient(circle_at_75%_72%,rgba(250,204,21,0.28),transparent_24%),linear-gradient(135deg,rgba(124,58,237,0.5),rgba(14,165,233,0.22),rgba(24,24,27,0.98))]">
      <div className="absolute inset-x-6 top-6 flex justify-between text-white/35">
        <Star size={18} aria-hidden />
        <Camera size={20} aria-hidden />
      </div>
      <div className="relative m-auto flex max-w-[82%] flex-col items-center text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur">
          <Camera size={27} aria-hidden />
        </span>
        <span className="mt-5 line-clamp-2 text-lg font-semibold leading-6 text-white">{title}</span>
        {detail ? <span className="mt-2 text-xs font-semibold uppercase tracking-wide text-white/60">{detail}</span> : null}
      </div>
    </div>
  );
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
