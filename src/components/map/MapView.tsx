"use client";

import { useEffect, useState } from "react";
import type { LatLngBoundsLiteral, LatLngTuple, Map as LeafletMap } from "leaflet";
import { useMap } from "react-leaflet";
import { ExternalLink, MapPin as MapPinIcon } from "lucide-react";

import {
  Map,
  MapLocateControl,
  MapMarker,
  MapPopup,
  MapSearchControl,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map";
import type { PlaceFeature } from "@/components/ui/place-autocomplete";

export type MapPin = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  collectionName: string;
  collectionId: string;
  url: string;
  note?: string | null;
  color?: string;
};

export type MapCollectionLayer = {
  id: string;
  name: string;
  count: number;
  color: string;
};

type MapViewProps = {
  pins: MapPin[];
  height?: string;
  activePinId?: string | null;
};

export function MapView({ pins, height = "70vh", activePinId = null }: MapViewProps) {
  const center: LatLngTuple =
    pins.length > 0 ? [pins[0].latitude, pins[0].longitude] : [20, 0];
  const initialZoom = pins.length === 1 ? 14 : pins.length === 0 ? 2 : 4;

  return (
    <div
      className="map-view-container w-full overflow-hidden rounded-2xl border"
      style={{ height }}
      aria-label="Map of saved places"
    >
      <Map center={center} zoom={initialZoom} className="rounded-2xl">
        <MapTileLayer />
        <MapZoomControl />
        <MapSearchControlWithMarker />
        <MapLocateControl />
        <FitToPins pins={pins} />
        <FlyToActive pins={pins} activePinId={activePinId} />

        {pins.map((pin) => {
          const color = pin.color ?? "var(--primary)";

          return (
            <MapMarker
              key={pin.id}
              position={[pin.latitude, pin.longitude]}
              iconAnchor={[16, 32]}
              popupAnchor={[0, -28]}
              icon={
                <MapPinIcon
                  className="size-8 fill-current stroke-background drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]"
                  strokeWidth={1.5}
                  style={{ color }}
                />
              }
            >
              <MapPopup>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: color }}
                      aria-hidden
                    />
                    {pin.collectionName}
                  </div>
                  <div className="text-sm font-semibold leading-snug text-popover-foreground">
                    {pin.title}
                  </div>
                  {pin.note ? (
                    <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">
                      {pin.note}
                    </p>
                  ) : null}
                  <div className="flex items-center gap-3 border-t pt-2">
                    <a
                      href={pin.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-primary"
                    >
                      Open in Maps
                      <ExternalLink className="size-3" aria-hidden />
                    </a>
                    <a
                      href={`/collections/${pin.collectionId}`}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      View collection
                    </a>
                  </div>
                </div>
              </MapPopup>
            </MapMarker>
          );
        })}
      </Map>
    </div>
  );
}

function MapSearchControlWithMarker() {
  const map = useMap();
  const [selectedPosition, setSelectedPosition] = useState<LatLngTuple | null>(null);

  function handlePlaceSelect(feature: PlaceFeature) {
    const [longitude, latitude] = feature.geometry.coordinates;
    const position: LatLngTuple = [latitude, longitude];

    setSelectedPosition(position);
    map.flyTo(position, Math.max(map.getZoom(), 14), { duration: 0.6 });
  }

  return (
    <>
      <MapSearchControl
        position="top-1 left-11"
        className="w-72 max-w-[calc(100vw-7rem)] sm:w-80"
        limit={8}
        onPlaceSelect={handlePlaceSelect}
      />
      {selectedPosition ? (
        <MapMarker
          position={selectedPosition}
          iconAnchor={[16, 32]}
          icon={
            <MapPinIcon
              className="size-8 fill-current stroke-background drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]"
              strokeWidth={1.5}
              style={{ color: "var(--foreground)" }}
            />
          }
        />
      ) : null}
    </>
  );
}

function FitToPins({ pins }: { pins: MapPin[] }) {
  const map = useMap();

  useEffect(() => {
    if (pins.length === 0) {
      map.setView([20, 0], 2);
      return;
    }

    if (pins.length === 1) {
      map.setView([pins[0].latitude, pins[0].longitude], 14);
      return;
    }

    const bounds: LatLngBoundsLiteral = pins.map(
      (p) => [p.latitude, p.longitude] as [number, number],
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [pins, map]);

  return null;
}

function FlyToActive({
  pins,
  activePinId,
}: {
  pins: MapPin[];
  activePinId: string | null;
}) {
  const map: LeafletMap = useMap();

  useEffect(() => {
    if (!activePinId) return;
    const pin = pins.find((p) => p.id === activePinId);
    if (!pin) return;
    map.flyTo([pin.latitude, pin.longitude], Math.max(map.getZoom(), 14), {
      duration: 0.6,
    });
  }, [activePinId, pins, map]);

  return null;
}
