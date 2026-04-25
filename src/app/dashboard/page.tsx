import { FolderPlus, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { CreateCollectionForm } from "@/components/collections/CreateCollectionForm";
import { SaveLinkForm } from "@/components/collections/SaveLinkForm";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const collections = await prisma.collection.findMany({
    where: { ownerId: user.id },
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
  });

  const totalLinks = collections.reduce((sum, c) => sum + c._count.links, 0);
  const publicCount = collections.filter((c) => c.isPublic).length;
  const firstName = user.name?.split(" ")[0] ?? "there";

  return (
    <AppShell authenticated currentPath="dashboard">
      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <Badge className="bg-primary/10 text-primary">
              <Sparkles aria-hidden />
              Your dashboard
            </Badge>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Hey, {firstName}.
            </h1>
            <p className="text-sm text-muted-foreground">
              {collections.length === 0
                ? "Spin up your first collection to start saving."
                : `${collections.length} ${collections.length === 1 ? "collection" : "collections"} · ${totalLinks} saved · ${publicCount} public`}
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            {collections.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {collections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    id={collection.id}
                    name={collection.name}
                    description={collection.description}
                    isPublic={collection.isPublic}
                    links={collection.links}
                    count={collection._count.links}
                    canDelete
                  />
                ))}
              </div>
            ) : (
              <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-fuchsia-500 text-white shadow-lg shadow-pink-500/30">
                  <FolderPlus className="size-5" aria-hidden />
                </span>
                <h2 className="text-lg font-semibold text-foreground">No collections yet</h2>
                <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                  Create a board on the right, then drop in Instagram, TikTok, or Maps URLs.
                </p>
              </Card>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <CreateCollectionForm />
            <SaveLinkForm collections={collections.map(({ id, name }) => ({ id, name }))} />
          </aside>
        </div>
      </section>
    </AppShell>
  );
}
