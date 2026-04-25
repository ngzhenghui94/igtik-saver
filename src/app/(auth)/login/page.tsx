import Link from "next/link";
import { Bookmark } from "lucide-react";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
    <main className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">
      <section className="w-full max-w-md space-y-7">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 via-fuchsia-500 to-violet-500 text-white shadow-lg shadow-primary/30">
            <Bookmark className="size-4" aria-hidden strokeWidth={2.5} />
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground">Saved Collections</span>
        </Link>

        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">Welcome back</h1>
          <p className="text-sm leading-6 text-muted-foreground">Sign in with email or continue with Google.</p>
        </div>

        {params.created ? (
          <Alert>
            <AlertDescription>Account created. You can sign in now.</AlertDescription>
          </Alert>
        ) : null}

        <LoginForm googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)} />

        <p className="text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/signup" className="font-semibold text-foreground hover:underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
}
