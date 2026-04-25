import type { MapCollectionLayer, MapPin } from "@/components/map/MapView";
import { extractCoordinates } from "@/lib/link-utils";

const layerColors = [
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#38bdf8",
  "#a855f7",
  "#f97316",
  "#14b8a6",
  "#eab308",
  "#ef4444",
  "#6366f1",
];

type SavedMapLinkInput = {
  id: string;
  title: string;
  url: string;
  note: string | null;
  latitude: number | null;
  longitude: number | null;
};

type SavedMapCollectionInput = {
  id: string;
  name: string;
  links: SavedMapLinkInput[];
};

export function buildCollectionMapData(collections: SavedMapCollectionInput[]) {
  const pins: MapPin[] = [];
  const layers: MapCollectionLayer[] = [];
  let totalMapsLinks = 0;

  collections.forEach((collection, index) => {
    const color = layerColors[index % layerColors.length];
    const collectionPins: MapPin[] = [];

    totalMapsLinks += collection.links.length;

    collection.links.forEach((link) => {
      const coordinates = coordinatesForSavedMapLink(link);

      if (!coordinates) {
        return;
      }

      collectionPins.push({
        id: link.id,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        title: link.title,
        collectionName: collection.name,
        collectionId: collection.id,
        url: link.url,
        note: link.note,
        color,
      });
    });

    if (collectionPins.length > 0) {
      layers.push({
        id: collection.id,
        name: collection.name,
        count: collectionPins.length,
        color,
      });
      pins.push(...collectionPins);
    }
  });

  return {
    layers,
    pins,
    totalMapsLinks,
    unmapped: totalMapsLinks - pins.length,
  };
}

function coordinatesForSavedMapLink(link: SavedMapLinkInput) {
  const urlCoordinates = extractCoordinates(link.url);

  if (urlCoordinates) {
    return urlCoordinates;
  }

  if (link.latitude === null || link.longitude === null) {
    return null;
  }

  return {
    latitude: link.latitude,
    longitude: link.longitude,
  };
}
