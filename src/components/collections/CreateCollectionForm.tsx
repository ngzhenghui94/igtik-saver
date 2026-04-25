import { FolderPlus, Globe2, Lock } from "lucide-react";

import { createCollectionAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateCollectionForm() {
  return (
    <Card>
      <CardContent>
        <form action={createCollectionAction} className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-pink-400 to-fuchsia-500 text-white">
              <FolderPlus className="size-3.5" aria-hidden />
            </span>
            New collection
          </div>

          <div className="space-y-3">
            <Input
              name="name"
              required
              maxLength={80}
              placeholder="Cafes, Food Places, Trips"
              aria-label="Collection name"
              className="h-10"
            />
            <Textarea
              name="description"
              maxLength={240}
              placeholder="Optional description"
              aria-label="Collection description"
              className="min-h-24"
            />
          </div>

          <fieldset className="grid grid-cols-2 gap-2" aria-label="Visibility">
            <label className="relative flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border bg-input/30 text-sm text-muted-foreground transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-foreground">
              <input type="radio" name="visibility" value="private" defaultChecked className="sr-only" />
              <Lock className="size-3.5" aria-hidden />
              Private
            </label>
            <label className="relative flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border bg-input/30 text-sm text-muted-foreground transition-colors has-[:checked]:border-emerald-400/60 has-[:checked]:bg-emerald-500/10 has-[:checked]:text-foreground">
              <input type="radio" name="visibility" value="public" className="sr-only" />
              <Globe2 className="size-3.5" aria-hidden />
              Public
            </label>
          </fieldset>

          <Button type="submit" size="lg" className="w-full">
            <FolderPlus />
            Create collection
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
