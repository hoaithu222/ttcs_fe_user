import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import clsx from "clsx";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

export type MapCoordinates = [number, number];

const DEFAULT_CENTER: MapCoordinates = [20.9706, 105.7968];
const DEFAULT_ZOOM = 15;
const TILE_LAYER_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface FreeMapProps {
  center?: MapCoordinates;
  zoom?: number;
  markerPosition?: MapCoordinates | null;
  onMarkerChange?: (coords: MapCoordinates) => void;
  popupContent?: ReactNode;
  className?: string;
  scrollWheelZoom?: boolean;
  testId?: string;
  disableTileAttribution?: boolean;
}

const MapInteractionHandler = ({ onMarkerChange }: { onMarkerChange?: (coords: MapCoordinates) => void }) => {
  useMapEvents({
    click(event) {
      if (onMarkerChange) {
        onMarkerChange([event.latlng.lat, event.latlng.lng]);
      }
    },
  });
  return null;
};

const FreeMap = ({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  markerPosition,
  onMarkerChange,
  popupContent,
  className,
  scrollWheelZoom = true,
  testId,
  disableTileAttribution,
}: FreeMapProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const tileAttribution = useMemo(() => (disableTileAttribution ? undefined : TILE_ATTRIBUTION), [disableTileAttribution]);
  const mapCenter: LatLngExpression = markerPosition || center;

  if (!isClient) {
    return (
      <div className={clsx("flex h-64 w-full items-center justify-center rounded-xl bg-neutral-2", className)}>
        <span className="text-sm text-neutral-6">Đang tải bản đồ...</span>
      </div>
    );
  }

  return (
    <div className={clsx("relative h-[320px] w-full overflow-hidden rounded-xl", className)} data-testid={testId}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={scrollWheelZoom}
        style={{ height: "100%", width: "100%" }}
        className="focus:outline-none"
      >
        <TileLayer attribution={tileAttribution} url={TILE_LAYER_URL} />
        <MapInteractionHandler onMarkerChange={onMarkerChange} />
        {markerPosition && (
          <Marker
            position={markerPosition}
            draggable={Boolean(onMarkerChange)}
            eventHandlers={{
              dragend(event) {
                const updated = event.target.getLatLng();
                onMarkerChange?.([updated.lat, updated.lng]);
              },
            }}
          >
            <Popup>{popupContent || "Vị trí đã chọn"}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default FreeMap;

