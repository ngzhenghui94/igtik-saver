import { FolderPlus } from "lucide-react";

import { createCollectionAction } from "@/app/actions";

export function CreateCollectionForm() {
  return (
    <form action={createCollectionAction} className="space-y-4 border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <FolderPlus size={16} aria-hidden />
        New collection
      </div>
      <input
        name="name"
        required
        maxLength={80}
        placeholder="Food, Vietnam, sermons..."
        className="h-11 w-full border border-white/10 bg-black/40 px-3 text-sm outline-none transition focus:border-sky-400"
      />
      <textarea
        name="description"
        maxLength={240}
        placeholder="Optional description"
        className="min-h-24 w-full resize-y border border-white/10 bg-black/40 px-3 py-3 text-sm outline-none transition focus:border-sky-400"
      />
      <div className="grid grid-cols-2 border border-white/10">
        <label className="flex h-10 items-center justify-center gap-2 border-r border-white/10 text-sm text-zinc-300">
          <input type="radio" name="visibility" value="private" defaultChecked className="accent-sky-400" />
          Private
        </label>
        <label className="flex h-10 items-center justify-center gap-2 text-sm text-zinc-300">
          <input type="radio" name="visibility" value="public" className="accent-sky-400" />
          Public
        </label>
      </div>
      <button
        type="submit"
        className="inline-flex h-10 items-center gap-2 bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-200"
      >
        <FolderPlus size={15} aria-hidden />
        Create collection
      </button>
    </form>
  );
}
