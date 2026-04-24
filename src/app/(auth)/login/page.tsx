import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
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
          <h1 className="mt-6 text-3xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Login with email and password, or continue with Google OAuth.</p>
        </div>
        {params.created ? <p className="border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">Account created. You can login now.</p> : null}
        <LoginForm googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)} />
        <p className="text-sm text-zinc-400">
          No account?{" "}
          <Link href="/signup" className="font-semibold text-white hover:underline">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
}
