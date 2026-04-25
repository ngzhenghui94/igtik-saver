import bcrypt from "bcryptjs";

import { signApiToken } from "@/lib/api-token";
import { badRequest, jsonError, serializeUser, unauthorized } from "@/lib/api-response";
import { credentialsSchema } from "@/lib/validation";
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

  const parsed = credentialsSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Email and password are required.");
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user?.passwordHash) {
    return unauthorized("Invalid email or password.");
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);

  if (!valid) {
    return unauthorized("Invalid email or password.");
  }

  let token: string;

  try {
    token = await signApiToken(user.id);
  } catch (error) {
    return jsonError(500, error instanceof Error ? error.message : "Could not sign token.");
  }

  return Response.json({ token, user: serializeUser(user) });
}
