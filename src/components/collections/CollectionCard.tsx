import Link from "next/link";
import { Bookmark, Globe2, Lock } from "lucide-react";

type CollectionCardProps = {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  links: {
    id: string;
    title: string;
    platform: "INSTAGRAM" | "TIKTOK";
  }[];
  count: number;
};

export function CollectionCard({ id, name, description, isPublic, links, count }: CollectionCardProps) {
  const tiles = [...links.slice(0, 4)];

  return (
    <Link
      href={`/collections/${id}`}
      className="group block overflow-hidden border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-white/25"
    >
      <div className="grid aspect-square grid-cols-2 grid-rows-2 gap-px bg-white/10">
        {Array.from({ length: 4 }).map((_, index) => {
          const link = tiles[index];

          return (
            <div
              key={link?.id ?? index}
              className="relative flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.35),transparent_26%),linear-gradient(135deg,rgba(244,63,94,0.55),rgba(20,184,166,0.28),rgba(24,24,27,0.9))]"
            >
              {link ? (
                <span className="line-clamp-3 px-4 text-center text-xs font-semibold uppercase tracking-wide text-white drop-shadow">
                  {link.title}
                </span>
              ) : (
                <Bookmark className="text-white/35" size={26} aria-hidden />
              )}
              <div className="absolute inset-0 bg-black/20" />
            </div>
          );
        })}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">{name}</h2>
            <p className="mt-1 text-sm text-zinc-400">{count} saved links</p>
          </div>
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-white/10 bg-black/30 text-zinc-300">
            {isPublic ? <Globe2 size={16} aria-label="Public" /> : <Lock size={16} aria-label="Private" />}
          </span>
        </div>
        {description ? <p className="line-clamp-2 text-sm leading-6 text-zinc-400">{description}</p> : null}
      </div>
    </Link>
  );
}
