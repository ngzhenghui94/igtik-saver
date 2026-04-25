"use client";

import { useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";

import { MapView, type MapPin as MapPinType } from "@/components/map/MapView";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MapExplorerProps = {
  pins: MapPinType[];
  withCollectionLabel?: boolean;
};

export function MapExplorer({ pins, withCollectionLabel = false }: MapExplorerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  if (pins.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
          <MapPin className="size-5" aria-hidden />
        </span>
        <h2 className="text-lg font-semibold text-foreground">Nothing to map yet</h2>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          Save Google Maps URLs that include coordinates (most place links do) and they&apos;ll show
          up here as pins.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="max-h-[70vh] overflow-y-auto p-3">
        <div className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {pins.length} {pins.length === 1 ? "place" : "places"}
        </div>
        <ul className="space-y-1">
          {pins.map((pin) => {
            const isActive = pin.id === activeId;
            return (
              <li key={pin.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(pin.id)}
                  className={cn(
                    "group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition",
                    isActive
                      ? "bg-pink-500/15 ring-1 ring-pink-400/40"
                      : "hover:bg-white/5",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                      isActive
                        ? "bg-gradient-to-br from-pink-400 to-fuchsia-500 text-white"
                        : "bg-muted text-muted-foreground group-hover:bg-muted/80",
                    )}
                  >
                    <MapPin className="size-3.5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    {withCollectionLabel ? (
                      <div className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {pin.collectionName}
                      </div>
                    ) : null}
                    <div className="truncate text-sm font-semibold text-foreground">{pin.title}</div>
                    {pin.note ? (
                      <div className="line-clamp-2 text-xs leading-5 text-muted-foreground">{pin.note}</div>
                    ) : null}
                  </div>
                  <a
                    href={pin.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="mt-1 text-muted-foreground transition hover:text-foreground"
                    aria-label={`Open ${pin.title} in Google Maps`}
                  >
                    <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      <MapView pins={pins} activePinId={activeId} height="70vh" />
    </div>
  );
}
