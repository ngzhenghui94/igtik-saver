import { getApiUser } from "@/lib/api-auth";
import { noContent, notFound, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  const user = await getApiUser(request);

  if (!user) {
    return unauthorized();
  }

  const { id } = await params;

  const result = await prisma.savedLink.deleteMany({
    where: { id, ownerId: user.id },
  });

  if (result.count === 0) {
    return notFound("Link not found.");
  }

  return noContent();
}
