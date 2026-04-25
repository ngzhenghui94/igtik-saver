import Link from "next/link";
import { Globe2, MapPin, Sparkles } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicCollectionsPage() {
  const [user, collections] = await Promise.all([
    getCurrentUser(),
    prisma.collection.findMany({
      where: { isPublic: true },
      orderBy: { updatedAt: "desc" },
      include: {
        links: {
          orderBy: { createdAt: "desc" },
          take: 4,
          select: {
            id: true,
            title: true,
            url: true,
            platform: true,
            thumbnailUrl: true,
          },
        },
        _count: {
          select: { links: true },
        },
      },
    }),
  ]);

  return (
    <AppShell authenticated={Boolean(user)} currentPath="public">
      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <Badge className="bg-emerald-500/10 text-emerald-300">
              <Globe2 aria-hidden />
              Public boards
            </Badge>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Explore curated collections
            </h1>
            <p className="text-sm text-muted-foreground">
              Boards that other people made public — open one to browse the saves.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/public/map" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <MapPin aria-hidden />
              Map view
            </Link>
            <span className="text-xs text-muted-foreground">
              {collections.length} {collections.length === 1 ? "board" : "boards"}
            </span>
          </div>
        </div>

        {collections.length ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                id={collection.id}
                name={collection.name}
                description={collection.description}
                isPublic={collection.isPublic}
                links={collection.links}
                count={collection._count.links}
              />
            ))}
          </div>
        ) : (
          <Card className="mt-10 flex flex-col items-center justify-center gap-3 p-12 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <h2 className="text-lg font-semibold text-foreground">No public collections yet</h2>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Public boards will appear here once people publish them.
            </p>
          </Card>
        )}
      </section>
    </AppShell>
  );
}
