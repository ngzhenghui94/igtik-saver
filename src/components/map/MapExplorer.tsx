"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Layers, MapPin } from "lucide-react";

import {
  MapView,
  type MapCollectionLayer,
  type MapPin as MapPinType,
} from "@/components/map/MapView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type MapExplorerProps = {
  pins: MapPinType[];
  layers?: MapCollectionLayer[];
  withCollectionLabel?: boolean;
};

export function MapExplorer({
  pins,
  layers,
  withCollectionLabel = false,
}: MapExplorerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const collectionLayers = useMemo(
    () => layers ?? layersFromPins(pins),
    [layers, pins],
  );
  const layerIds = useMemo(
    () => collectionLayers.map((layer) => layer.id),
    [collectionLayers],
  );
  const [hiddenLayerIds, setHiddenLayerIds] = useState<string[]>([]);
  const hiddenLayerSet = useMemo(
    () => new Set(hiddenLayerIds),
    [hiddenLayerIds],
  );
  const selectedLayerIds = useMemo(
    () => layerIds.filter((layerId) => !hiddenLayerSet.has(layerId)),
    [hiddenLayerSet, layerIds],
  );
  const selectedLayerSet = useMemo(
    () => new Set(selectedLayerIds),
    [selectedLayerIds],
  );
  const visiblePins = useMemo(
    () => pins.filter((pin) => selectedLayerSet.has(pin.collectionId)),
    [pins, selectedLayerSet],
  );
  const showLayerControl = collectionLayers.length > 1;
  const effectiveActiveId =
    activeId && visiblePins.some((pin) => pin.id === activeId) ? activeId : null;

  function setSelectedLayerIds(nextSelectedLayerIds: string[]) {
    const nextSelectedLayerSet = new Set(nextSelectedLayerIds);
    setHiddenLayerIds(
      layerIds.filter((layerId) => !nextSelectedLayerSet.has(layerId)),
    );
  }

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
    <div className="flex flex-col gap-4">
      {showLayerControl ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {visiblePins.length} of {pins.length} visible
            </Badge>
            {collectionLayers.map((layer) => (
              <span
                key={layer.id}
                className={cn(
                  "inline-flex h-6 items-center gap-1.5 rounded-full border px-2 text-xs font-medium text-muted-foreground",
                  selectedLayerSet.has(layer.id) ? "opacity-100" : "opacity-45",
                )}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: layer.color }}
                  aria-hidden
                />
                {layer.name}
              </span>
            ))}
          </div>

          <CollectionLayersControl
            layers={collectionLayers}
            selectedLayerIds={selectedLayerIds}
            onChange={setSelectedLayerIds}
          />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="max-h-[70vh] overflow-y-auto p-3">
          <div className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {visiblePins.length} {visiblePins.length === 1 ? "place" : "places"}
          </div>
          {visiblePins.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {visiblePins.map((pin) => {
                const isActive = pin.id === effectiveActiveId;
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
                            ? "text-white"
                            : "bg-muted text-muted-foreground group-hover:bg-muted/80",
                        )}
                        style={
                          isActive
                            ? { backgroundColor: pin.color ?? "var(--primary)" }
                            : undefined
                        }
                      >
                        <MapPin className="size-3.5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        {withCollectionLabel ? (
                          <div className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {pin.collectionName}
                          </div>
                        ) : null}
                        <div className="truncate text-sm font-semibold text-foreground">
                          {pin.title}
                        </div>
                        {pin.note ? (
                          <div className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                            {pin.note}
                          </div>
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
          ) : (
            <CardContent className="flex flex-col gap-2 px-2 py-6 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">No visible places</span>
              <span>Select at least one collection layer.</span>
            </CardContent>
          )}
        </Card>

        <MapView pins={visiblePins} activePinId={effectiveActiveId} height="70vh" />
      </div>
    </div>
  );
}

function CollectionLayersControl({
  layers,
  selectedLayerIds,
  onChange,
}: {
  layers: MapCollectionLayer[];
  selectedLayerIds: string[];
  onChange: (layerIds: string[]) => void;
}) {
  const selectedLayerSet = new Set(selectedLayerIds);

  function toggleLayer(layerId: string, checked: boolean) {
    onChange(
      checked
        ? Array.from(new Set([...selectedLayerIds, layerId]))
        : selectedLayerIds.filter((id) => id !== layerId),
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button type="button" variant="outline" size="sm">
            <Layers data-icon="inline-start" aria-hidden />
            Layers
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Collections</DropdownMenuLabel>
          {layers.map((layer) => (
            <DropdownMenuCheckboxItem
              key={layer.id}
              checked={selectedLayerSet.has(layer.id)}
              onCheckedChange={(checked) => toggleLayer(layer.id, Boolean(checked))}
              className="gap-2 pr-10"
            >
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: layer.color }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate">{layer.name}</span>
              <span className="text-xs text-muted-foreground">{layer.count}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onChange(layers.map((layer) => layer.id))}>
          Show all
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange([])}>Hide all</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function layersFromPins(pins: MapPinType[]) {
  const layers = new Map<string, MapCollectionLayer>();

  pins.forEach((pin) => {
    const existing = layers.get(pin.collectionId);

    if (existing) {
      existing.count += 1;
      return;
    }

    layers.set(pin.collectionId, {
      id: pin.collectionId,
      name: pin.collectionName,
      count: 1,
      color: pin.color ?? "var(--primary)",
    });
  });

  return Array.from(layers.values());
}
