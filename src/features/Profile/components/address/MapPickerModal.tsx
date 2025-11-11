import { useEffect, useRef } from "react";
import { Card } from "@/foundation/components/info/Card";
import Button from "@/foundation/components/buttons/Button";
// If your project doesn't have maplibre-gl installed yet, please install:
// pnpm add maplibre-gl  OR  npm i maplibre-gl  OR  yarn add maplibre-gl
// @ts-ignore
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapPickerModalProps {
  open: boolean;
  initialCoords?: { lat: number; lng: number } | null;
  onCancel: () => void;
  onSelect: (data: { lat: number; lng: number }) => void;
  height?: string | number;
}

const MapPickerModal = ({
  open,
  initialCoords,
  onCancel,
  onSelect,
  height = 420,
}: MapPickerModalProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const pickedRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    if (!mapContainer.current) return;

    // init map once per open
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: initialCoords ? [initialCoords.lng, initialCoords.lat] : [105.8342, 21.0278],
      zoom: initialCoords ? 13 : 10,
      attributionControl: false,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    mapRef.current.on("load", () => {
      // place initial marker
      const lngLat = initialCoords
        ? [initialCoords.lng, initialCoords.lat]
        : (mapRef.current?.getCenter().toArray() as [number, number]);
      const marker = new maplibregl.Marker({ color: "#ef4444", draggable: true })
        .setLngLat(lngLat)
        .addTo(mapRef.current!);
      marker.on("dragend", () => {
        const pos = marker.getLngLat();
        pickedRef.current = { lat: pos.lat, lng: pos.lng };
      });
      markerRef.current = marker;
      pickedRef.current = {
        lat: (lngLat as [number, number])[1],
        lng: (lngLat as [number, number])[0],
      };

      // click to move marker
      mapRef.current?.on("click", (e: any) => {
        const { lng, lat } = e.lngLat;
        if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat]);
        } else {
          const mk = new maplibregl.Marker({ color: "#ef4444", draggable: true })
            .setLngLat([lng, lat])
            .addTo(mapRef.current!);
          mk.on("dragend", () => {
            const pos = mk.getLngLat();
            pickedRef.current = { lat: pos.lat, lng: pos.lng };
          });
          markerRef.current = mk;
        }
        pickedRef.current = { lat, lng };
      });
    });

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [open, initialCoords]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-[95%] max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Chọn vị trí trên bản đồ</div>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Đóng
          </Button>
        </div>
        <div ref={mapContainer} className="w-full rounded-lg overflow-hidden" style={{ height }} />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Hủy
          </Button>
          <Button
            onClick={() => {
              if (pickedRef.current) onSelect(pickedRef.current);
            }}
          >
            Xác nhận vị trí
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MapPickerModal;
