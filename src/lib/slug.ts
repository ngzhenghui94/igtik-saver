export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function uniqueSlug(base: string) {
  const slug = slugify(base) || "collection";
  return `${slug}-${Math.random().toString(36).slice(2, 7)}`;
}
