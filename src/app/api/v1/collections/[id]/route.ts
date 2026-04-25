import { getApiUser } from "@/lib/api-auth";
import {
  badRequest,
  noContent,
  notFound,
  serializeCollection,
  serializeCollectionDetail,
  unauthorized,
} from "@/lib/api-response";
import { apiCollectionPatchSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const user = await getApiUser(request);

  if (!user) {
    return unauthorized();
  }

  const { id } = await params;

  const collection = await prisma.collection.findFirst({
    where: { id, ownerId: user.id },
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

export async function PATCH(request: Request, { params }: Params) {
  const user = await getApiUser(request);

  if (!user) {
    return unauthorized();
  }

  const { id } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return badRequest("Expected a JSON body.");
  }

  const parsed = apiCollectionPatchSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Invalid update payload.");
  }

  const existing = await prisma.collection.findFirst({
    where: { id, ownerId: user.id },
    select: { id: true },
  });

  if (!existing) {
    return notFound("Collection not found.");
  }

  const updated = await prisma.collection.update({
    where: { id },
    data: {
      name: parsed.data.name ?? undefined,
      description: parsed.data.description === undefined ? undefined : parsed.data.description,
      isPublic: parsed.data.isPublic ?? undefined,
    },
    include: { _count: { select: { links: true } } },
  });

  return Response.json(serializeCollection(updated));
}

export async function DELETE(request: Request, { params }: Params) {
  const user = await getApiUser(request);

  if (!user) {
    return unauthorized();
  }

  const { id } = await params;

  const result = await prisma.collection.deleteMany({
    where: { id, ownerId: user.id },
  });

  if (result.count === 0) {
    return notFound("Collection not found.");
  }

  return noContent();
}
