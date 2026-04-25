import Link from "next/link";
import { ArrowLeft, Globe2, LayoutGrid, Lock, MapPin } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { MapExplorer } from "@/components/map/MapExplorer";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/current-user";
import { LinkPlatform } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type CollectionMapPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CollectionMapPage({ params }: CollectionMapPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  const collection = await prisma.collection.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true } },
      links: {
        where: {
          platform: LinkPlatform.GOOGLE_MAPS,
          latitude: { not: null },
          longitude: { not: null },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!collection) {
    notFound();
  }

  const isOwner = user?.id === collection.ownerId;

  if (!collection.isPublic && !isOwner) {
    redirect("/login");
  }

  const totalMapsLinks = await prisma.savedLink.count({
    where: { collectionId: collection.id, platform: LinkPlatform.GOOGLE_MAPS },
  });

  const pins = collection.links
    .filter((l): l is typeof l & { latitude: number; longitude: number } =>
      l.latitude !== null && l.longitude !== null
    )
    .map((link) => ({
      id: link.id,
      latitude: link.latitude,
      longitude: link.longitude,
      title: link.title,
      collectionName: collection.name,
      collectionId: collection.id,
      url: link.url,
      note: link.note,
    }));

  const unmapped = totalMapsLinks - pins.length;

  return (
    <AppShell authenticated={Boolean(user)} currentPath={isOwner ? "dashboard" : "public"}>
      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <Link
          href={`/collections/${collection.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to {collection.name}
        </Link>

        <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <Badge className={cn(collection.isPublic ? "bg-emerald-500/10 text-emerald-300" : "bg-muted text-muted-foreground")}>
              {collection.isPublic ? <Globe2 aria-hidden /> : <Lock aria-hidden />}
              {collection.isPublic ? "Public" : "Private"}
            </Badge>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              <span className="inline-flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
                  <MapPin className="size-4" aria-hidden />
                </span>
                {collection.name} — Map
              </span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {pins.length === 0
                ? "No pinned places yet."
                : `${pins.length} of ${totalMapsLinks} Maps ${totalMapsLinks === 1 ? "save" : "saves"} mapped.`}
              {unmapped > 0
                ? ` ${unmapped} couldn't be located — short links and place-only URLs may not include coordinates.`
                : ""}
            </p>
          </div>

          <Link href={`/collections/${collection.id}`} className={buttonVariants({ variant: "outline" })}>
            <LayoutGrid aria-hidden />
            Grid view
          </Link>
        </header>

        <div className="mt-8">
          <MapExplorer pins={pins} />
        </div>
      </section>
    </AppShell>
  );
}
