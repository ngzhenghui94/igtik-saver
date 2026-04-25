import { LinkIcon, Plus } from "lucide-react";

import { saveLinkAction } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type SaveLinkFormProps = {
  collections: {
    id: string;
    name: string;
  }[];
  selectedCollectionId?: string;
};

export function SaveLinkForm({ collections, selectedCollectionId }: SaveLinkFormProps) {
  const empty = collections.length === 0;

  return (
    <Card>
      <CardContent>
        <form action={saveLinkAction} className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-sky-500 text-white">
              <LinkIcon className="size-3.5" aria-hidden />
            </span>
            Save a link
          </div>

          {empty ? (
            <Alert variant="destructive">
              <AlertDescription>Create a collection first to save links into it.</AlertDescription>
            </Alert>
          ) : null}

          <Input
            name="url"
            type="url"
            required
            disabled={empty}
            placeholder="Paste an Instagram, TikTok, or Maps URL"
            aria-label="Link URL"
            className="h-10"
          />

          <select
            name="collectionId"
            required
            disabled={empty}
            defaultValue={selectedCollectionId ?? collections[0]?.id}
            aria-label="Collection"
            className="flex h-10 w-full appearance-none rounded-lg border border-input bg-input/30 px-2.5 pr-8 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23a7a7b0'><path d='M5.5 7.5l4.5 5 4.5-5z'/></svg>\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.625rem center",
            }}
          >
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id} className="bg-background text-foreground">
                {collection.name}
              </option>
            ))}
          </select>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="title" disabled={empty} placeholder="Optional title" aria-label="Title" className="h-10" />
            <Input name="note" disabled={empty} placeholder="Optional note" aria-label="Note" className="h-10" />
          </div>

          <Button type="submit" disabled={empty} size="lg" className="w-full">
            <Plus />
            Save link
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
