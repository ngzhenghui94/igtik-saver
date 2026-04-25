import Link from "next/link";
import { LayoutGrid, MapPin, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { MapExplorer } from "@/components/map/MapExplorer";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { LinkPlatform } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/lib/current-user";
import { buildCollectionMapData } from "@/lib/map-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardMapPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const collections = await prisma.collection.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      links: {
        where: { platform: LinkPlatform.GOOGLE_MAPS },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const { layers, pins, totalMapsLinks, unmapped } = buildCollectionMapData(collections);

  return (
    <AppShell authenticated currentPath="map">
      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <Badge className="bg-primary/10 text-primary">
              <Sparkles aria-hidden />
              Your places
            </Badge>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              <span className="inline-flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-fuchsia-500 text-white shadow-lg shadow-primary/30">
                  <MapPin className="size-4" aria-hidden />
                </span>
                Unified map
              </span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {pins.length === 0
                ? "No pinned places yet."
                : `${pins.length} of ${totalMapsLinks} Maps ${totalMapsLinks === 1 ? "save" : "saves"} mapped across ${layers.length} ${layers.length === 1 ? "collection" : "collections"}.`}
              {unmapped > 0
                ? ` ${unmapped} couldn't be located from the saved URL.`
                : ""}
            </p>
          </div>

          <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
            <LayoutGrid aria-hidden />
            Dashboard
          </Link>
        </header>

        <div className="mt-8">
          <MapExplorer pins={pins} layers={layers} withCollectionLabel />
        </div>
      </section>
    </AppShell>
  );
}
