import { UserPlus } from "lucide-react";

import { signupAction } from "@/app/actions";

export function SignupForm() {
  return (
    <form action={signupAction} className="w-full max-w-md space-y-4 border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur">
      <div>
        <label htmlFor="name" className="text-sm font-medium text-zinc-200">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          className="mt-2 h-11 w-full border border-white/10 bg-black/40 px-3 text-sm outline-none transition focus:border-sky-400"
          placeholder="Daniel"
        />
      </div>
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
      <button
        type="submit"
        className="inline-flex h-11 w-full items-center justify-center gap-2 bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-200"
      >
        <UserPlus size={16} aria-hidden />
        Create account
      </button>
    </form>
  );
}
