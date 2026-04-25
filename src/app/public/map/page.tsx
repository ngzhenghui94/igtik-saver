import Link from "next/link";
import { Globe2, LayoutGrid, MapPin } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { MapExplorer } from "@/components/map/MapExplorer";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { LinkPlatform } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicMapPage() {
  const [user, links] = await Promise.all([
    getCurrentUser(),
    prisma.savedLink.findMany({
      where: {
        platform: LinkPlatform.GOOGLE_MAPS,
        latitude: { not: null },
        longitude: { not: null },
        collection: { isPublic: true },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
      include: {
        collection: { select: { id: true, name: true } },
      },
    }),
  ]);

  const pins = links
    .filter((l): l is typeof l & { latitude: number; longitude: number } =>
      l.latitude !== null && l.longitude !== null
    )
    .map((link) => ({
      id: link.id,
      latitude: link.latitude,
      longitude: link.longitude,
      title: link.title,
      collectionName: link.collection.name,
      collectionId: link.collection.id,
      url: link.url,
      note: link.note,
    }));

  return (
    <AppShell authenticated={Boolean(user)} currentPath="map">
      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <Badge className="bg-emerald-500/10 text-emerald-300">
              <Globe2 aria-hidden />
              Public map
            </Badge>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              <span className="inline-flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
                  <MapPin className="size-4" aria-hidden />
                </span>
                Places from public boards
              </span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {pins.length === 0
                ? "No places have been pinned to public boards yet."
                : `${pins.length} ${pins.length === 1 ? "place" : "places"} pinned across the community.`}
            </p>
          </div>

          <Link href="/public" className={buttonVariants({ variant: "outline" })}>
            <LayoutGrid aria-hidden />
            Boards view
          </Link>
        </header>

        <div className="mt-8">
          <MapExplorer pins={pins} withCollectionLabel />
        </div>
      </section>
    </AppShell>
  );
}
