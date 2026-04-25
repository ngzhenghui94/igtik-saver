import Link from "next/link";
import { ArrowLeft, BookmarkPlus, Globe2, Lock, MapPin } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { toggleCollectionVisibilityAction } from "@/app/actions";
import { AppShell } from "@/components/AppShell";
import { SavedLinkCard } from "@/components/collections/SavedLinkCard";
import { SaveLinkForm } from "@/components/collections/SaveLinkForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/current-user";
import { LinkPlatform } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type CollectionPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const user = await getCurrentUser();

  const collection = await prisma.collection.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      links: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!collection) {
    notFound();
  }

  const isOwner = user?.id === collection.ownerId;

  if (!collection.isPublic && !isOwner) {
    redirect("/login");
  }

  const ownerCollections = isOwner
    ? await prisma.collection.findMany({
        where: { ownerId: collection.ownerId },
        orderBy: { updatedAt: "desc" },
        select: { id: true, name: true },
      })
    : [];

  const hasMappableLinks = collection.links.some(
    (link) => link.platform === LinkPlatform.GOOGLE_MAPS && link.latitude !== null && link.longitude !== null,
  );

  const backHref = isOwner ? "/dashboard" : "/public";
  const backLabel = isOwner ? "Dashboard" : "Public";

  return (
    <AppShell authenticated={Boolean(user)} currentPath={isOwner ? "dashboard" : "public"}>
      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden />
          {backLabel}
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <header className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <Badge className={cn(collection.isPublic ? "bg-emerald-500/10 text-emerald-300" : "bg-muted text-muted-foreground")}>
                  {collection.isPublic ? <Globe2 aria-hidden /> : <Lock aria-hidden />}
                  {collection.isPublic ? "Public" : "Private"}
                </Badge>
                <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {collection.name}
                </h1>
                {collection.description ? (
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{collection.description}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  Curated by {collection.owner.name ?? "Unknown"} · {collection.links.length} saved
                </p>
              </div>

              <div className="flex items-center gap-2">
                {hasMappableLinks ? (
                  <Link href={`/collections/${collection.id}/map`} className={buttonVariants({ variant: "outline" })}>
                    <MapPin aria-hidden />
                    Map view
                  </Link>
                ) : null}
                {isOwner ? (
                  <form action={toggleCollectionVisibilityAction}>
                    <input type="hidden" name="collectionId" value={collection.id} />
                    <input type="hidden" name="visibility" value={collection.isPublic ? "private" : "public"} />
                    <button type="submit" className={buttonVariants({ variant: "outline" })}>
                      {collection.isPublic ? <Lock aria-hidden /> : <Globe2 aria-hidden />}
                      Make {collection.isPublic ? "private" : "public"}
                    </button>
                  </form>
                ) : null}
              </div>
            </header>

            {query.error === "unsupported" ? (
              <Alert variant="destructive">
                <AlertDescription>Only Instagram, TikTok, and Google Maps links are supported.</AlertDescription>
              </Alert>
            ) : null}

            {collection.links.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {collection.links.map((link) => (
                  <SavedLinkCard
                    key={link.id}
                    id={link.id}
                    title={link.title}
                    note={link.note}
                    url={link.url}
                    platform={link.platform}
                    thumbnailUrl={link.thumbnailUrl}
                    authorHandle={link.authorHandle}
                    createdAt={link.createdAt}
                    canDelete={isOwner}
                  />
                ))}
              </div>
            ) : (
              <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 text-white shadow-lg shadow-cyan-500/30">
                  <BookmarkPlus className="size-5" aria-hidden />
                </span>
                <h2 className="text-lg font-semibold text-foreground">No links saved here</h2>
                <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                  {isOwner
                    ? "Paste an Instagram, TikTok, or Maps URL on the right to add your first save."
                    : "This collection is empty for now."}
                </p>
              </Card>
            )}
          </div>

          {isOwner ? (
            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <SaveLinkForm collections={ownerCollections} selectedCollectionId={collection.id} />
            </aside>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
