import Link from "next/link";
import type { ReactNode } from "react";
import { Bookmark, Globe2, LayoutGrid, LogIn, MapPin } from "lucide-react";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  authenticated: boolean;
  currentPath?: "dashboard" | "public" | "map" | "other";
};

export function AppShell({ children, authenticated, currentPath = "other" }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href={authenticated ? "/dashboard" : "/"} className="inline-flex items-center gap-2.5">
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 via-fuchsia-500 to-violet-500 text-white shadow-lg shadow-primary/30">
              <Bookmark className="size-4" aria-hidden strokeWidth={2.5} />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-foreground">Saved</span>
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                collections
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-1.5">
            {authenticated ? (
              <NavLink href="/dashboard" active={currentPath === "dashboard"} icon={<LayoutGrid />}>
                Dashboard
              </NavLink>
            ) : null}
            <NavLink href="/public" active={currentPath === "public"} icon={<Globe2 />}>
              Explore
            </NavLink>
            <NavLink
              href={authenticated ? "/dashboard/map" : "/public/map"}
              active={currentPath === "map"}
              icon={<MapPin />}
            >
              Map
            </NavLink>
            {authenticated ? (
              <SignOutButton />
            ) : (
              <Link href="/login" className={buttonVariants({ variant: "outline", size: "sm" })}>
                <LogIn />
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 text-xs text-muted-foreground sm:px-8">
          <span>Saved Collections — Instagram, TikTok & Maps boards</span>
          <span className="opacity-70">v0.1</span>
        </div>
      </footer>
    </div>
  );
}

function NavLink({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      <span className="[&>svg]:size-3.5">{icon}</span>
      <span className="hidden sm:inline">{children}</span>
    </Link>
  );
}
