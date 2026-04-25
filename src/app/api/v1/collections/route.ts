import { getApiUser } from "@/lib/api-auth";
import {
  badRequest,
  serializeCollection,
  unauthorized,
} from "@/lib/api-response";
import { apiCollectionCreateSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getApiUser(request);

  if (!user) {
    return unauthorized();
  }

  const collections = await prisma.collection.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { links: true } } },
  });

  return Response.json(collections.map(serializeCollection));
}

export async function POST(request: Request) {
  const user = await getApiUser(request);

  if (!user) {
    return unauthorized();
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return badRequest("Expected a JSON body.");
  }

  const parsed = apiCollectionCreateSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Provide a non-empty name (max 80 chars).");
  }

  const created = await prisma.collection.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      slug: uniqueSlug(parsed.data.name),
      isPublic: parsed.data.isPublic ?? false,
      ownerId: user.id,
    },
    include: { _count: { select: { links: true } } },
  });

  return Response.json(serializeCollection(created), { status: 201 });
}
