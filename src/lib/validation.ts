import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8),
});

export const signupSchema = credentialsSchema.extend({
  name: z.string().min(2).max(80).trim(),
});

export const accountPasswordSchema = z
  .object({
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const collectionSchema = z.object({
  name: z.string().min(1).max(80).trim(),
  description: z.string().max(240).trim().optional(),
  visibility: z.enum(["private", "public"]),
});

export const collectionRenameSchema = z.object({
  collectionId: z.string().min(1),
  name: z.string().min(1).max(80).trim(),
});

export const savedLinkSchema = z.object({
  collectionId: z.string().min(1),
  url: z.url().trim(),
  title: z.string().max(120).trim().optional(),
  note: z.string().max(300).trim().optional(),
});

export const apiCollectionCreateSchema = z.object({
  name: z.string().min(1).max(80).trim(),
  description: z.string().max(240).trim().optional().nullable(),
  isPublic: z.boolean().optional().default(false),
});

export const apiCollectionPatchSchema = z.object({
  name: z.string().min(1).max(80).trim().optional(),
  description: z.string().max(240).trim().optional().nullable(),
  isPublic: z.boolean().optional(),
});

export const apiSavedLinkSchema = z.object({
  url: z.url().trim(),
  note: z.string().max(300).trim().optional().nullable(),
});
