import { LinkPlatform } from "@/generated/prisma/enums";

import { getApiUser } from "@/lib/api-auth";
import {
  badRequest,
  jsonError,
  notFound,
  serializeSavedLink,
  unauthorized,
} from "@/lib/api-response";
import { apiSavedLinkSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { extractCoordinates, parseSocialLink, platformLabel } from "@/lib/link-utils";
import { fetchLinkPreview } from "@/lib/link-preview";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const user = await getApiUser(request);

  if (!user) {
    return unauthorized();
  }

  const { id: collectionId } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return badRequest("Expected a JSON body.");
  }

  const parsed = apiSavedLinkSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Provide a valid URL.");
  }

  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, ownerId: user.id },
    select: { id: true },
  });

  if (!collection) {
    return notFound("Collection not found.");
  }

  let socialLink;

  try {
    socialLink = parseSocialLink(parsed.data.url);
  } catch (error) {
    return jsonError(
      422,
      error instanceof Error ? error.message : "Unsupported link."
    );
  }

  const preview = await fetchLinkPreview(parsed.data.url, socialLink.platform);
  const title = preview.title || `${platformLabel(socialLink.platform)} save`;

  const coordinates =
    socialLink.platform === LinkPlatform.GOOGLE_MAPS
      ? extractCoordinates(parsed.data.url) ??
        (preview.resolvedUrl ? extractCoordinates(preview.resolvedUrl) : null)
      : null;

  const note = parsed.data.note ?? null;

  const saved = await prisma.savedLink.upsert({
    where: {
      collectionId_normalizedUrl: {
        collectionId: collection.id,
        normalizedUrl: socialLink.normalizedUrl,
      },
    },
    create: {
      collectionId: collection.id,
      ownerId: user.id,
      platform: socialLink.platform,
      normalizedUrl: socialLink.normalizedUrl,
      url: parsed.data.url,
      title,
      note,
      thumbnailUrl: preview.thumbnailUrl,
      authorHandle: preview.authorHandle,
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
    },
    update: {
      title,
      note,
      url: parsed.data.url,
      thumbnailUrl: preview.thumbnailUrl ?? undefined,
      authorHandle: preview.authorHandle ?? undefined,
      latitude: coordinates?.latitude ?? undefined,
      longitude: coordinates?.longitude ?? undefined,
    },
  });

  return Response.json(serializeSavedLink(saved), { status: 201 });
}
