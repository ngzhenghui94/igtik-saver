import Link from "next/link";
import { ArrowLeft, Globe2, Lock } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { toggleCollectionVisibilityAction } from "@/app/actions";
import { SavedLinkCard } from "@/components/collections/SavedLinkCard";
import { SaveLinkForm } from "@/components/collections/SaveLinkForm";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

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
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
      links: {
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

  const ownerCollections = isOwner
    ? await prisma.collection.findMany({
        where: { ownerId: collection.ownerId },
        orderBy: { updatedAt: "desc" },
        select: { id: true, name: true },
      })
    : [];

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <Link href={isOwner ? "/dashboard" : "/public"} className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition hover:text-white">
          <ArrowLeft size={15} aria-hidden />
          {isOwner ? "Dashboard" : "Public collections"}
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  {collection.isPublic ? <Globe2 size={14} aria-hidden /> : <Lock size={14} aria-hidden />}
                  {collection.isPublic ? "Public" : "Private"}
                </div>
                <h1 className="text-4xl font-semibold">{collection.name}</h1>
                {collection.description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{collection.description}</p> : null}
                <p className="mt-3 text-sm text-zinc-500">Curated by {collection.owner.name ?? "Untitled user"}</p>
              </div>

              {isOwner ? (
                <form action={toggleCollectionVisibilityAction}>
                  <input type="hidden" name="collectionId" value={collection.id} />
                  <input type="hidden" name="visibility" value={collection.isPublic ? "private" : "public"} />
                  <button type="submit" className="inline-flex h-10 items-center gap-2 border border-white/10 px-4 text-sm font-semibold text-zinc-200 transition hover:border-white/30">
                    {collection.isPublic ? <Lock size={15} aria-hidden /> : <Globe2 size={15} aria-hidden />}
                    Make {collection.isPublic ? "private" : "public"}
                  </button>
                </form>
              ) : null}
            </div>

            {query.error === "unsupported" ? (
              <p className="border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">Only Instagram, TikTok, and Google Maps links are supported.</p>
            ) : null}

            {collection.links.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {collection.links.map((link) => (
                  <SavedLinkCard
                    key={link.id}
                    title={link.title}
                    note={link.note}
                    url={link.url}
                    platform={link.platform}
                    thumbnailUrl={link.thumbnailUrl}
                    authorHandle={link.authorHandle}
                    createdAt={link.createdAt}
                  />
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-white/15 bg-white/[0.03] p-8 text-zinc-400">
                <h2 className="text-lg font-semibold text-white">No links saved here</h2>
                <p className="mt-2 max-w-lg text-sm leading-6">Save an Instagram, TikTok, or Google Maps URL to start filling this collection.</p>
              </div>
            )}
          </div>

          {isOwner ? <SaveLinkForm collections={ownerCollections} selectedCollectionId={collection.id} /> : null}
        </div>
      </section>
    </main>
  );
}
