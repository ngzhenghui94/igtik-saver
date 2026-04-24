import Link from "next/link";
import { Bookmark, Globe2 } from "lucide-react";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { CreateCollectionForm } from "@/components/collections/CreateCollectionForm";
import { SaveLinkForm } from "@/components/collections/SaveLinkForm";
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
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold">
            <Bookmark size={17} aria-hidden />
            Saved Collections
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/public" className="inline-flex h-9 items-center gap-2 border border-white/10 px-3 text-sm font-semibold text-zinc-300 transition hover:border-white/30">
              <Globe2 size={14} aria-hidden />
              Public
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-zinc-500">Only you can see private collections</p>
            <h1 className="mt-2 text-3xl font-semibold">Your saved collections</h1>
          </div>
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
                />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-white/15 bg-white/[0.03] p-8 text-zinc-400">
              <h2 className="text-lg font-semibold text-white">No collections yet</h2>
              <p className="mt-2 max-w-lg text-sm leading-6">Create a collection first, then save Instagram or TikTok links into it.</p>
            </div>
          )}
        </div>
        <aside className="space-y-4">
          <CreateCollectionForm />
          <SaveLinkForm collections={collections.map(({ id, name }) => ({ id, name }))} />
        </aside>
      </section>
    </main>
  );
}
