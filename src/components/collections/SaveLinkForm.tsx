import { LinkIcon, Plus } from "lucide-react";

import { saveLinkAction } from "@/app/actions";

type SaveLinkFormProps = {
  collections: {
    id: string;
    name: string;
  }[];
  selectedCollectionId?: string;
};

export function SaveLinkForm({ collections, selectedCollectionId }: SaveLinkFormProps) {
  return (
    <form action={saveLinkAction} className="space-y-4 border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <LinkIcon size={16} aria-hidden />
        Save a link
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
        <input
          name="url"
          type="url"
          required
          placeholder="Instagram, TikTok, or Google Maps URL"
          className="h-11 border border-white/10 bg-black/40 px-3 text-sm outline-none transition focus:border-sky-400"
        />
        <select
          name="collectionId"
          required
          defaultValue={selectedCollectionId ?? collections[0]?.id}
          className="h-11 border border-white/10 bg-black/40 px-3 text-sm outline-none transition focus:border-sky-400"
        >
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
        <input
          name="title"
          placeholder="Optional title"
          className="h-11 border border-white/10 bg-black/40 px-3 text-sm outline-none transition focus:border-sky-400"
        />
        <input
          name="note"
          placeholder="Optional note"
          className="h-11 border border-white/10 bg-black/40 px-3 text-sm outline-none transition focus:border-sky-400"
        />
      </div>
      <button
        type="submit"
        disabled={collections.length === 0}
        className="inline-flex h-10 items-center gap-2 bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus size={15} aria-hidden />
        Save link
      </button>
    </form>
  );
}
