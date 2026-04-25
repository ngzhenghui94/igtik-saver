import { serializeCollection } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const collections = await prisma.collection.findMany({
    where: { isPublic: true },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: { _count: { select: { links: true } } },
  });

  return Response.json(collections.map(serializeCollection));
}
