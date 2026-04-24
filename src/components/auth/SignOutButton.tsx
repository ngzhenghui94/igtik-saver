"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex h-9 items-center gap-2 border border-white/10 px-3 text-sm font-semibold text-zinc-300 transition hover:border-white/30"
    >
      <LogOut size={14} aria-hidden />
      Logout
    </button>
  );
}
