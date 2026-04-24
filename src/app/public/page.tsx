import Link from "next/link";
import { ArrowLeft, Globe2 } from "lucide-react";

import { CollectionCard } from "@/components/collections/CollectionCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicCollectionsPage() {
  const collections = await prisma.collection.findMany({
    where: { isPublic: true },
    orderBy: { updatedAt: "desc" },
    include: {
      links: {
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          title: true,
          platform: true,
        },
      },
      _count: {
        select: { links: true },
      },
    },
  });

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition hover:text-white">
          <ArrowLeft size={15} aria-hidden />
          Dashboard
        </Link>
        <div className="mt-8">
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            <Globe2 size={14} aria-hidden />
            Public boards
          </div>
          <h1 className="mt-4 text-4xl font-semibold">Browse public collections</h1>
        </div>

        {collections.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          <div className="mt-8 border border-dashed border-white/15 bg-white/[0.03] p-8 text-zinc-400">
            <h2 className="text-lg font-semibold text-white">No public collections yet</h2>
            <p className="mt-2 max-w-lg text-sm leading-6">Public boards will appear here once users publish them.</p>
          </div>
        )}
      </section>
    </main>
  );
}
