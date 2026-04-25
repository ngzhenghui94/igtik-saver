import { AlertCircle, CheckCircle2, KeyRound, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { createAccountPasswordAction } from "@/app/actions";
import { AppShell } from "@/components/AppShell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AccountPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const user = await getCurrentUser();
  const params = (await searchParams) ?? {};

  if (!user) {
    redirect("/login");
  }

  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      passwordHash: true,
      createdAt: true,
      accounts: {
        orderBy: { provider: "asc" },
        select: {
          provider: true,
          type: true,
        },
      },
    },
  });

  if (!account) {
    redirect("/login");
  }

  const hasPassword = Boolean(account.passwordHash);
  const providers = new Set(account.accounts.map(({ provider }) => provider));
  const notice = getAccountNotice(params);

  return (
    <AppShell authenticated currentPath="account">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex max-w-2xl flex-col gap-3">
            <Badge className="bg-primary/10 text-primary">
              <Sparkles aria-hidden />
              Account
            </Badge>
            <div className="flex flex-col gap-2">
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Account management
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Manage how you sign in to Saved Collections. Google users can add an email password here and use either method later.
              </p>
            </div>
          </div>
        </div>

        {notice ? (
          <Alert variant={notice.variant}>
            {notice.variant === "destructive" ? <AlertCircle aria-hidden /> : <CheckCircle2 aria-hidden />}
            <AlertDescription>{notice.description}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your saved boards and sign-in methods are tied to this profile.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-primary-foreground">
                    {getInitials(account.name, account.email)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{account.name ?? "Saved user"}</p>
                    <p className="truncate text-sm text-muted-foreground">{account.email ?? "No email on this account"}</p>
                  </div>
                  <Badge variant={account.emailVerified ? "secondary" : "outline"}>
                    {account.emailVerified ? "Email verified" : "Email not verified"}
                  </Badge>
                </div>

                <Separator className="my-5" />

                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground">Member since</p>
                    <p className="mt-1 font-medium text-foreground">{dateFormatter.format(account.createdAt)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground">Login methods</p>
                    <p className="mt-1 font-medium text-foreground">
                      {[providers.size ? `${providers.size} OAuth` : null, hasPassword ? "Password" : null]
                        .filter(Boolean)
                        .join(" + ") || "None"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sign-in methods</CardTitle>
                <CardDescription>Connected providers that can access this account.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <SignInMethod
                  icon={<GoogleMark />}
                  title="Google"
                  description={
                    providers.has("google")
                      ? "Connected through Google OAuth."
                      : "Not connected on this account."
                  }
                  status={providers.has("google") ? "Connected" : "Not connected"}
                  connected={providers.has("google")}
                />
                <SignInMethod
                  icon={<Mail aria-hidden />}
                  title="Email and password"
                  description={
                    hasPassword
                      ? "Use your account email and password on the login page."
                      : "Create a password to enable email login for this account."
                  }
                  status={hasPassword ? "Enabled" : "Not enabled"}
                  connected={hasPassword}
                />
              </CardContent>
            </Card>
          </div>

          <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle>Create password</CardTitle>
                <CardDescription>Add email/password login without disconnecting Google.</CardDescription>
                <CardAction>
                  <KeyRound aria-hidden className="size-4 text-muted-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                {!account.email ? (
                  <Alert variant="destructive">
                    <AlertCircle aria-hidden />
                    <AlertDescription>An email address is required before password login can be enabled.</AlertDescription>
                  </Alert>
                ) : hasPassword ? (
                  <div className="flex flex-col gap-4">
                    <Alert>
                      <CheckCircle2 aria-hidden />
                      <AlertDescription>Email and password login is already enabled for {account.email}.</AlertDescription>
                    </Alert>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Keep using Google OAuth, or sign in from the login page with this email and your password.
                    </p>
                  </div>
                ) : (
                  <form action={createAccountPasswordAction} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="password">New password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        maxLength={128}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        className="h-10"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="confirmPassword">Confirm password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        minLength={8}
                        maxLength={128}
                        autoComplete="new-password"
                        placeholder="Repeat password"
                        className="h-10"
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full">
                      <KeyRound data-icon="inline-start" />
                      Create password
                    </Button>
                    <p className="text-xs leading-5 text-muted-foreground">
                      After this, the login page accepts {account.email} with either Google OAuth or this password.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security status</CardTitle>
                <CardDescription>Current protections on this account.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <StatusRow enabled={providers.has("google")} label="Google OAuth connected" />
                <StatusRow enabled={hasPassword} label="Password login enabled" />
                <StatusRow enabled={Boolean(account.email)} label="Account email present" />
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}

function SignInMethod({
  icon,
  title,
  description,
  status,
  connected,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  status: string;
  connected: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium text-foreground">{title}</p>
          <Badge variant={connected ? "secondary" : "outline"}>{status}</Badge>
        </div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function StatusRow({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {enabled ? <CheckCircle2 aria-hidden className="size-4" /> : <ShieldCheck aria-hidden className="size-4" />}
      </span>
      <span className="flex-1 text-muted-foreground">{label}</span>
      <Badge variant={enabled ? "secondary" : "outline"}>{enabled ? "On" : "Off"}</Badge>
    </div>
  );
}

function getAccountNotice(params: Record<string, string | string[] | undefined>) {
  if (params.password === "created") {
    return {
      variant: "default" as const,
      description: "Password created. You can now sign in with email and password.",
    };
  }

  if (params.error === "password") {
    return {
      variant: "destructive" as const,
      description: "Use matching passwords with at least 8 characters.",
    };
  }

  if (params.error === "email") {
    return {
      variant: "destructive" as const,
      description: "This account needs an email before password login can be enabled.",
    };
  }

  if (params.error === "password_exists") {
    return {
      variant: "destructive" as const,
      description: "Password login is already enabled for this account.",
    };
  }

  return null;
}

function getInitials(name: string | null, email: string | null) {
  const source = name || email || "Saved user";
  const initials = source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "S";
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
      <path
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.72v2.26h2.9c1.7-1.57 2.69-3.88 2.69-6.62z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.46-.81 5.95-2.18l-2.9-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.32 0 2.5.45 3.43 1.34l2.57-2.57C13.45.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
