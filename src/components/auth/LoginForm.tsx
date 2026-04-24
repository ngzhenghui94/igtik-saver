"use client";

import { signIn } from "next-auth/react";
import { BadgeCheck, LogIn } from "lucide-react";
import { useState } from "react";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setLoading(false);

    if (result?.ok) {
      window.location.href = result.url ?? "/dashboard";
      return;
    }

    setError("That email and password did not match.");
  }

  return (
    <div className="w-full max-w-md border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur">
      <form action={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-zinc-200">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-2 h-11 w-full border border-white/10 bg-black/40 px-3 text-sm outline-none transition focus:border-sky-400"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-zinc-200">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="mt-2 h-11 w-full border border-white/10 bg-black/40 px-3 text-sm outline-none transition focus:border-sky-400"
            placeholder="At least 8 characters"
          />
        </div>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <LogIn size={16} aria-hidden />
          {loading ? "Signing in" : "Login"}
        </button>
      </form>

      <div className="my-5 h-px bg-white/10" />

      <button
        type="button"
        disabled={!googleEnabled}
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="inline-flex h-11 w-full items-center justify-center gap-2 border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <BadgeCheck size={16} aria-hidden />
        Continue with Google
      </button>
      {!googleEnabled ? (
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          Add Google OAuth credentials to `.env` to enable this provider.
        </p>
      ) : null}
    </div>
  );
}
