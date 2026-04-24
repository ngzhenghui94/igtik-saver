import Link from "next/link";
import { Bookmark, Globe2, Lock, Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-6 py-10 md:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-300">
            <Bookmark size={15} aria-hidden />
            Saved Collections
          </div>
          <div className="space-y-5">
            <h1 className="max-w-2xl text-5xl font-semibold leading-tight text-white md:text-7xl">
              Save the posts you keep coming back to.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-zinc-400">
              Create Instagram-style collections for Instagram, TikTok, and Google Maps links, keep them private, or publish a curated board.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className="inline-flex h-11 items-center gap-2 bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-200">
              <Plus size={16} aria-hidden />
              Create account
            </Link>
            <Link href="/login" className="inline-flex h-11 items-center border border-white/10 px-4 text-sm font-semibold text-zinc-200 transition hover:border-white/30">
              Login
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {["Food finds", "Sermons", "Vietnam", "Workouts"].map((name, index) => (
            <div key={name} className="overflow-hidden border border-white/10 bg-white/[0.04]">
              <div className="grid aspect-square grid-cols-2 grid-rows-2 gap-px bg-white/10">
                {Array.from({ length: 4 }).map((_, tile) => (
                  <div
                    key={tile}
                    className="flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.35),transparent_26%),linear-gradient(135deg,rgba(244,63,94,0.55),rgba(20,184,166,0.28),rgba(24,24,27,0.9))]"
                  >
                    <span className="px-3 text-center text-xs font-bold uppercase tracking-wide text-white/80">
                      {tile % 2 === 0 ? "Reel" : "Save"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <h2 className="font-semibold text-white">{name}</h2>
                  <p className="mt-1 text-sm text-zinc-500">{index + 3} links</p>
                </div>
                {index % 2 === 0 ? <Lock size={17} className="text-zinc-400" aria-hidden /> : <Globe2 size={17} className="text-teal-300" aria-hidden />}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
