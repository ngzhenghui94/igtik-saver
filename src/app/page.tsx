import Link from "next/link";
import { ArrowRight, Camera, Globe2, Lock, MapPin, Music2, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/current-user";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AppShell authenticated={false}>
      <section className="mx-auto w-full max-w-7xl px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          <div className="space-y-7">
            <Badge className="bg-primary/10 text-primary">
              <Sparkles aria-hidden />
              Your private board for the internet
            </Badge>

            <h1 className="font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Save the posts you keep{" "}
              <span className="bg-gradient-to-r from-pink-300 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent">
                coming back to.
              </span>
            </h1>

            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
              Build collections of Instagram reels, TikTok finds, and Google Maps places.
              Keep them private — or publish a curated board to share.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/signup" className={buttonVariants({ size: "lg" })}>
                Create free account
                <ArrowRight aria-hidden />
              </Link>
              <Link href="/public" className={buttonVariants({ variant: "outline", size: "lg" })}>
                <Globe2 aria-hidden />
                Browse public boards
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Camera size={14} className="text-pink-400" aria-hidden />
                Instagram
              </span>
              <span className="inline-flex items-center gap-2">
                <Music2 size={14} className="text-cyan-300" aria-hidden />
                TikTok
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin size={14} className="text-emerald-300" aria-hidden />
                Google Maps
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[40px] bg-[radial-gradient(circle_at_30%_20%,rgba(236,72,153,0.25),transparent_55%),radial-gradient(circle_at_75%_85%,rgba(56,189,248,0.18),transparent_55%)] blur-2xl" />
            <div className="grid grid-cols-2 gap-4">
              {previewBoards.map((board) => (
                <PreviewBoard key={board.name} {...board} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-24 grid gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
                <feature.icon className="size-4" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.body}</p>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

const previewBoards = [
  {
    name: "Food finds",
    count: 18,
    isPublic: false,
    gradient: "from-pink-500/55 via-rose-400/30 to-amber-300/35",
    icon: Camera,
  },
  {
    name: "Vietnam trip",
    count: 24,
    isPublic: true,
    gradient: "from-emerald-400/55 via-teal-400/30 to-sky-300/35",
    icon: MapPin,
  },
  {
    name: "Dance reels",
    count: 9,
    isPublic: false,
    gradient: "from-cyan-400/55 via-fuchsia-400/30 to-violet-400/35",
    icon: Music2,
  },
  {
    name: "Sermons",
    count: 12,
    isPublic: true,
    gradient: "from-violet-500/55 via-indigo-400/30 to-sky-400/35",
    icon: Camera,
  },
] as const;

const features = [
  {
    title: "All your saves, one place",
    body: "Stop digging through DMs and screenshots. Drop a URL and it lands in the right collection.",
    icon: Sparkles,
  },
  {
    title: "Private by default",
    body: "Boards stay private until you flip them public. Share a clean URL, no account required to view.",
    icon: Lock,
  },
  {
    title: "Built for IG, TikTok, Maps",
    body: "We parse the link, detect the platform, and surface a meaningful title automatically.",
    icon: Globe2,
  },
] as const;

function PreviewBoard({
  name,
  count,
  isPublic,
  gradient,
  icon: Icon,
}: {
  name: string;
  count: number;
  isPublic: boolean;
  gradient: string;
  icon: typeof Camera;
}) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className={cn("relative aspect-square bg-gradient-to-br", gradient)}>
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px bg-white/5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/[0.04] backdrop-blur-sm" />
          ))}
        </div>
        <Icon className="absolute left-3 top-3 size-4 text-white/85" aria-hidden />
      </div>
      <div className="flex items-center justify-between p-4">
        <div>
          <div className="text-sm font-semibold text-foreground">{name}</div>
          <div className="text-xs text-muted-foreground">{count} links</div>
        </div>
        {isPublic ? (
          <Globe2 className="size-3.5 text-emerald-300" aria-hidden />
        ) : (
          <Lock className="size-3.5 text-muted-foreground" aria-hidden />
        )}
      </div>
    </Card>
  );
}
