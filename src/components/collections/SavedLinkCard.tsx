import { Camera, ExternalLink, Music2 } from "lucide-react";

import { platformLabel } from "@/lib/link-utils";

type SavedLinkCardProps = {
  title: string;
  note: string | null;
  url: string;
  platform: "INSTAGRAM" | "TIKTOK";
  createdAt: Date;
};

export function SavedLinkCard({ title, note, url, platform, createdAt }: SavedLinkCardProps) {
  const Icon = platform === "INSTAGRAM" ? Camera : Music2;

  return (
    <article className="overflow-hidden border border-white/10 bg-white/[0.04]">
      <div className="flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_70%_20%,rgba(34,197,94,0.28),transparent_24%),linear-gradient(135deg,rgba(14,165,233,0.55),rgba(244,63,94,0.38),rgba(24,24,27,0.94))]">
        <Icon size={46} className="text-white drop-shadow" aria-hidden />
      </div>
      <div className="space-y-4 p-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <Icon size={13} aria-hidden />
            {platformLabel(platform)}
          </div>
          <h3 className="mt-2 text-base font-semibold text-white">{title}</h3>
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
