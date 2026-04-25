import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Globe2,
  Link2,
  Lock,
  MapPin,
  Music2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/current-user";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PreviewPlatform = "INSTAGRAM" | "TIKTOK" | "GOOGLE_MAPS";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AppShell authenticated={false}>
      <section className="mx-auto w-full max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
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
              Paste a link from Instagram, TikTok, or Google Maps. We detect the platform,
              pull a clean title, and drop it into the board you choose — private by default,
              public when you want to share.
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

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-sm text-muted-foreground">
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
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <Badge className="bg-muted text-foreground">
              <Wand2 aria-hidden />
              How it works
            </Badge>
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Paste, save, revisit.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Three steps from &ldquo;I&rsquo;ll watch this later&rdquo; to actually finding it again next month.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="gap-3 p-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 via-fuchsia-500 to-violet-500 text-white shadow-lg shadow-primary/30">
                  <step.icon className="size-4" aria-hidden />
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Step {index + 1}
                </span>
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{step.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-24 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
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

        <Card className="relative mt-12 overflow-hidden p-8 sm:p-10">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(236,72,153,0.18),transparent_55%),radial-gradient(circle_at_85%_80%,rgba(56,189,248,0.16),transparent_55%)]" />
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl space-y-2">
              <h3 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Start your first board in 30 seconds.
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Free for personal use. No card, no quotas to worry about today.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className={buttonVariants({ size: "lg" })}>
                Create free account
                <ArrowRight aria-hidden />
              </Link>
              <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg" })}>
                I already have one
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}

const previewBoards = [
  {
    name: "Food finds",
    count: 18,
    isPublic: false,
    gradient: "from-pink-500/45 via-rose-400/25 to-amber-300/25",
    tiles: [
      { title: "Hidden ramen in Shibuya", platform: "INSTAGRAM" },
      { title: "$3 banh mi tour", platform: "TIKTOK" },
      { title: "Sunday dim sum spot", platform: "GOOGLE_MAPS" },
      { title: "Best laksa in KL", platform: "INSTAGRAM" },
    ],
  },
  {
    name: "Vietnam trip",
    count: 24,
    isPublic: true,
    gradient: "from-emerald-400/45 via-teal-400/25 to-sky-300/25",
    tiles: [
      { title: "Hà Giang loop guide", platform: "TIKTOK" },
      { title: "Ninh Bình homestay", platform: "GOOGLE_MAPS" },
      { title: "Hội An tailor pick", platform: "INSTAGRAM" },
      { title: "Da Lat cafe map", platform: "GOOGLE_MAPS" },
    ],
  },
  {
    name: "Dance reels",
    count: 9,
    isPublic: false,
    gradient: "from-cyan-400/45 via-fuchsia-400/25 to-rose-400/25",
    tiles: [
      { title: "Locking basics", platform: "TIKTOK" },
      { title: "Choreo breakdown", platform: "INSTAGRAM" },
      { title: "Popping isolation", platform: "TIKTOK" },
      { title: "Footwork drills", platform: "TIKTOK" },
    ],
  },
  {
    name: "Sermons",
    count: 12,
    isPublic: true,
    gradient: "from-violet-500/40 via-indigo-400/25 to-sky-400/25",
    tiles: [
      { title: "On waiting well", platform: "INSTAGRAM" },
      { title: "Psalm 23 series", platform: "INSTAGRAM" },
      { title: "Sunday clip", platform: "TIKTOK" },
      { title: "Easter homily", platform: "INSTAGRAM" },
    ],
  },
] as const satisfies readonly {
  name: string;
  count: number;
  isPublic: boolean;
  gradient: string;
  tiles: readonly { title: string; platform: PreviewPlatform }[];
}[];

const steps = [
  {
    title: "Drop a link",
    body: "Paste any Instagram reel, TikTok video, or Google Maps place URL. That's the whole input.",
    icon: Link2,
  },
  {
    title: "We enrich it",
    body: "We detect the platform and pull a meaningful title so you don't end up with cryptic URLs.",
    icon: Wand2,
  },
  {
    title: "Pick a board",
    body: "Drop it into a private collection — or flip a board public to share a clean, read-only URL.",
    icon: Sparkles,
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
  tiles,
}: {
  name: string;
  count: number;
  isPublic: boolean;
  gradient: string;
  tiles: readonly { title: string; platform: PreviewPlatform }[];
}) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className={cn("relative aspect-square bg-gradient-to-br", gradient)}>
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px bg-foreground/5">
          {tiles.slice(0, 4).map((tile, index) => {
            const Icon =
              tile.platform === "INSTAGRAM"
                ? Camera
                : tile.platform === "TIKTOK"
                  ? Music2
                  : MapPin;
            return (
              <div
                key={index}
                className="relative flex items-center justify-center bg-foreground/[0.06] p-2 text-center backdrop-blur-sm"
              >
                <Icon
                  className="absolute left-1.5 top-1.5 size-3 text-white/85 drop-shadow"
                  aria-hidden
                />
                <span className="line-clamp-3 text-[10px] font-semibold leading-tight text-white/90 drop-shadow">
                  {tile.title}
                </span>
              </div>
            );
          })}
        </div>
        <Badge
          variant="secondary"
          className="absolute right-3 top-3 bg-background/70 text-[10px] uppercase tracking-wider text-foreground backdrop-blur"
        >
          {isPublic ? <Globe2 aria-hidden /> : <Lock aria-hidden />}
          {isPublic ? "Public" : "Private"}
        </Badge>
      </div>
      <div className="flex items-center justify-between p-4">
        <div>
          <div className="text-sm font-semibold text-foreground">{name}</div>
          <div className="text-xs text-muted-foreground">{count} links</div>
        </div>
      </div>
    </Card>
  );
}
