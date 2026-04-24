import Link from "next/link";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/SignupForm";
import { getCurrentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

type SignupPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const user = await getCurrentUser();
  const params = (await searchParams) ?? {};

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07090d] px-6 py-12 text-white">
      <section className="w-full max-w-md space-y-6">
        <div>
          <Link href="/" className="text-sm font-semibold text-zinc-500 transition hover:text-white">
            Saved Collections
          </Link>
          <h1 className="mt-6 text-3xl font-semibold">Create your account</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Start collecting Instagram and TikTok links into private or public boards.</p>
        </div>
        {params.error === "exists" ? <p className="border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">That email already has an account.</p> : null}
        {params.error === "invalid" ? <p className="border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">Check your name, email, and password.</p> : null}
        <SignupForm />
        <p className="text-sm text-zinc-400">
          Already signed up?{" "}
          <Link href="/login" className="font-semibold text-white hover:underline">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
