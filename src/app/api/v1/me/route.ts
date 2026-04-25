import { getApiUser } from "@/lib/api-auth";
import { serializeUser, unauthorized } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getApiUser(request);

  if (!user) {
    return unauthorized();
  }

  return Response.json(serializeUser(user));
}
