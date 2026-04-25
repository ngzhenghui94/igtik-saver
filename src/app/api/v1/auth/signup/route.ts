import bcrypt from "bcryptjs";

import { signApiToken } from "@/lib/api-token";
import { badRequest, jsonError, serializeUser } from "@/lib/api-response";
import { signupSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return badRequest("Expected a JSON body.");
  }

  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Name, a valid email, and a password (min 8 chars) are required.");
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existing) {
    return jsonError(409, "An account with that email already exists.");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
    },
    select: { id: true, name: true, email: true, image: true },
  });

  let token: string;

  try {
    token = await signApiToken(user.id);
  } catch (error) {
    return jsonError(500, error instanceof Error ? error.message : "Could not sign token.");
  }

  return Response.json({ token, user: serializeUser(user) }, { status: 201 });
}
