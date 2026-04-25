import { notFound, serializeCollectionDetail } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  const collection = await prisma.collection.findFirst({
    where: { id, isPublic: true },
    include: {
      owner: { select: { id: true, name: true, email: true, image: true } },
      links: { orderBy: { createdAt: "desc" } },
      _count: { select: { links: true } },
    },
  });

  if (!collection) {
    return notFound("Collection not found.");
  }

  return Response.json(serializeCollectionDetail(collection));
}
