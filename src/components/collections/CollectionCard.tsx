import Link from "next/link";
import { ArrowUpRight, Camera, Globe2, Lock, MapPin, Music2, Sparkles, Trash2 } from "lucide-react";

import type { LinkPlatform } from "@/generated/prisma/enums";

import { deleteCollectionAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { isGenericSavedTitle, savedLinkReferenceFromUrl, titleFromSavedUrl } from "@/lib/link-utils";
import { cn } from "@/lib/utils";

type CollectionCardProps = {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  links: {
    id: string;
    title: string;
    url: string;
    platform: LinkPlatform;
    thumbnailUrl: string | null;
  }[];
  count: number;
  canDelete?: boolean;
};

export function CollectionCard({ id, name, description, isPublic, links, count, canDelete = false }: CollectionCardProps) {
  const tiles = [...links.slice(0, 4)];
  const platformGradient = gradientForPlatform(tiles[0]?.platform);

  return (
    <article className="group/card relative flex flex-col overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:ring-foreground/20">
      {canDelete ? (
        <form action={deleteCollectionAction} className="absolute right-3 top-3 z-10">
          <input type="hidden" name="collectionId" value={id} />
          <button
            type="submit"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/70 text-destructive opacity-0 backdrop-blur transition-all group-hover/card:opacity-100 hover:border-destructive/50 hover:bg-destructive/15 focus:opacity-100"
            aria-label={`Delete ${name}`}
            title="Delete"
          >
            <Trash2 className="size-3.5" aria-hidden />
          </button>
        </form>
      ) : null}

      <Link href={`/collections/${id}`} className="block" aria-label={`Open ${name}`}>
        <div className={cn("relative aspect-square overflow-hidden bg-gradient-to-br", platformGradient)}>
          {tiles.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center">
              <Sparkles className="size-8 text-foreground/40" aria-hidden />
            </div>
          ) : (
            <div className="grid h-full grid-cols-2 grid-rows-2 gap-px bg-foreground/5">
              {Array.from({ length: 4 }).map((_, index) => {
                const link = tiles[index];
                const imageUrl = getSafeImageUrl(link?.thumbnailUrl ?? null);
                const Icon = link?.platform === "INSTAGRAM" ? Camera : link?.platform === "TIKTOK" ? Music2 : MapPin;
                const displayTitle =
                  link && isGenericSavedTitle(link.title, link.platform)
                    ? titleFromSavedUrl(link.url, link.platform) ??
                      savedLinkReferenceFromUrl(link.url, link.platform) ??
                      link.title
                    : link?.title;

                return (
                  <div
                    key={link?.id ?? index}
                    className={cn(
                      "relative flex items-center justify-center overflow-hidden",
                      imageUrl ? "bg-cover bg-center" : "bg-foreground/[0.04] backdrop-blur-sm",
                    )}
                    style={
                      imageUrl
                        ? {
                            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.55)), url("${cssUrl(imageUrl)}")`,
                          }
                        : undefined
                    }
                  >
                    {link ? (
                      <>
                        <Icon className="absolute left-2.5 top-2.5 size-3 text-white/85 drop-shadow" aria-hidden />
                        <span className="line-clamp-3 px-3 text-center text-[11px] font-semibold leading-snug text-white/90 drop-shadow">
                          {displayTitle}
                        </span>
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          <Badge
            variant="secondary"
            className="absolute left-3 top-3 bg-background/65 text-[10px] uppercase tracking-wider text-foreground backdrop-blur"
          >
            {isPublic ? <Globe2 aria-hidden /> : <Lock aria-hidden />}
            {isPublic ? "Public" : "Private"}
          </Badge>
        </div>

        <div className="space-y-1.5 p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-heading text-base font-semibold text-foreground">{name}</h2>
            <ArrowUpRight
              className="size-4 shrink-0 text-muted-foreground transition group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:text-foreground"
              aria-hidden
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {count} {count === 1 ? "link" : "links"}
          </div>
          {description ? (
            <p className="line-clamp-2 pt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}

function gradientForPlatform(platform?: LinkPlatform) {
  if (platform === "INSTAGRAM") return "from-pink-500/40 via-rose-400/25 to-amber-300/20";
  if (platform === "TIKTOK") return "from-cyan-400/40 via-fuchsia-400/25 to-rose-400/20";
  if (platform === "GOOGLE_MAPS") return "from-emerald-400/40 via-teal-400/25 to-sky-300/20";
  return "from-violet-500/30 via-fuchsia-500/20 to-pink-400/20";
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
