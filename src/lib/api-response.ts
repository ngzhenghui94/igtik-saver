import type { LinkPlatform } from "@/generated/prisma/enums";

export function jsonError(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

export function unauthorized(message: string = "Authentication required.") {
  return jsonError(401, message);
}

export function notFound(message: string = "Not found.") {
  return jsonError(404, message);
}

export function badRequest(message: string = "Invalid request.") {
  return jsonError(400, message);
}

export function noContent() {
  return new Response(null, { status: 204 });
}

type UserShape = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

type CollectionShape = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isPublic: boolean;
  coverImageUrl: string | null;
  ownerId: string;
  updatedAt: Date;
  _count?: { links: number };
};

type SavedLinkShape = {
  id: string;
  url: string;
  normalizedUrl: string;
  platform: LinkPlatform;
  title: string;
  note: string | null;
  thumbnailUrl: string | null;
  authorHandle: string | null;
  latitude: number | null;
  longitude: number | null;
  collectionId: string;
  createdAt: Date;
};

export function serializeUser(user: UserShape) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
  };
}

export function serializeCollection(collection: CollectionShape) {
  return {
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    description: collection.description,
    isPublic: collection.isPublic,
    coverImageUrl: collection.coverImageUrl,
    ownerId: collection.ownerId,
    updatedAt: collection.updatedAt.toISOString(),
    linkCount: collection._count?.links ?? null,
  };
}

export function serializeSavedLink(link: SavedLinkShape) {
  return {
    id: link.id,
    url: link.url,
    normalizedUrl: link.normalizedUrl,
    platform: link.platform,
    title: link.title,
    note: link.note,
    thumbnailUrl: link.thumbnailUrl,
    authorHandle: link.authorHandle,
    latitude: link.latitude,
    longitude: link.longitude,
    collectionId: link.collectionId,
    createdAt: link.createdAt.toISOString(),
  };
}

export function serializeCollectionDetail(
  collection: CollectionShape & {
    owner?: UserShape | null;
    links: SavedLinkShape[];
  }
) {
  return {
    ...serializeCollection(collection),
    owner: collection.owner ? serializeUser(collection.owner) : null,
    links: collection.links.map(serializeSavedLink),
  };
}
