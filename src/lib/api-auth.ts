import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyApiToken } from "@/lib/api-token";

export type ApiUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export async function getApiUser(request: Request | NextRequest): Promise<ApiUser | null> {
  const userId = await resolveUserId(request);

  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true },
  });
}

async function resolveUserId(request: Request | NextRequest): Promise<string | null> {
  const header = request.headers.get("authorization") ?? request.headers.get("Authorization");

  if (header?.toLowerCase().startsWith("bearer ")) {
    const token = header.slice(7).trim();

    if (token) {
      const userId = await verifyApiToken(token);
      if (userId) return userId;
    }
  }

  const session = await auth();
  return session?.user?.id ?? null;
}
