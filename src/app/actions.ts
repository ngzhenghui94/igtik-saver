"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseSocialLink, platformLabel } from "@/lib/link-utils";
import { fetchLinkPreview } from "@/lib/link-preview";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { collectionSchema, savedLinkSchema, signupSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/current-user";

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry : "";
}

export async function signupAction(formData: FormData) {
  const parsed = signupSchema.safeParse({
    name: value(formData, "name"),
    email: value(formData, "email"),
    password: value(formData, "password"),
  });

  if (!parsed.success) {
    redirect("/signup?error=invalid");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existingUser) {
    redirect("/signup?error=exists");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
    },
  });

  redirect("/login?created=1");
}

export async function createCollectionAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = collectionSchema.safeParse({
    name: value(formData, "name"),
    description: value(formData, "description") || undefined,
    visibility: value(formData, "visibility") === "public" ? "public" : "private",
  });

  if (!parsed.success) {
    redirect("/dashboard?error=collection");
  }

  await prisma.collection.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      slug: uniqueSlug(parsed.data.name),
      isPublic: parsed.data.visibility === "public",
      ownerId: user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/public");
}

export async function saveLinkAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = savedLinkSchema.safeParse({
    collectionId: value(formData, "collectionId"),
    url: value(formData, "url"),
    title: value(formData, "title") || undefined,
    note: value(formData, "note") || undefined,
  });

  if (!parsed.success) {
    redirect("/dashboard?error=link");
  }

  const collection = await prisma.collection.findFirst({
    where: {
      id: parsed.data.collectionId,
      ownerId: user.id,
    },
  });

  if (!collection) {
    redirect("/dashboard?error=collection_missing");
  }

  let socialLink;

  try {
    socialLink = parseSocialLink(parsed.data.url);
  } catch {
    redirect(`/collections/${collection.id}?error=unsupported`);
  }

  const preview = await fetchLinkPreview(parsed.data.url, socialLink.platform);
  const title = parsed.data.title || preview.title || `${platformLabel(socialLink.platform)} save`;

  await prisma.savedLink.upsert({
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
      note: parsed.data.note,
      thumbnailUrl: preview.thumbnailUrl,
      authorHandle: preview.authorHandle,
    },
    update: {
      title,
      note: parsed.data.note,
      url: parsed.data.url,
      thumbnailUrl: preview.thumbnailUrl ?? undefined,
      authorHandle: preview.authorHandle ?? undefined,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/collections/${collection.id}`);
  revalidatePath("/public");
}

export async function toggleCollectionVisibilityAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const id = value(formData, "collectionId");
  const visibility = value(formData, "visibility") === "public";

  await prisma.collection.updateMany({
    where: {
      id,
      ownerId: user.id,
    },
    data: {
      isPublic: visibility,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/collections/${id}`);
  revalidatePath("/public");
}
