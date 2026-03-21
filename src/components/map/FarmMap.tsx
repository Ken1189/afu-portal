'use client';

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';
import MapPopup from './MapPopup';

// Fix Leaflet default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Center of Africa
const AFRICA_CENTER: [number, number] = [0, 25];
const DEFAULT_ZOOM = 4;

export interface MapDataPoint {
  id: string;
  type: 'farm' | 'equipment' | 'cooperative';
  latitude: number;
  longitude: number;
  // Farm fields
  farmerName?: string;
  farmName?: string;
  crop?: string;
  healthScore?: number;
  farmSize?: number;
  stage?: string;
  country?: string;
  region?: string;
  slug?: string;
  // Finance
  loanAmount?: number;
  loanStatus?: string;
  repaidPercent?: number;
  // Equipment
  equipmentName?: string;
  equipmentType?: string;
  dailyRate?: number;
  equipmentStatus?: string;
  // Cooperative
  cooperativeName?: string;
  memberCount?: number;
}

interface FarmMapProps {
  data: MapDataPoint[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (point: MapDataPoint) => void;
}

/** Auto-fits the map to show all data points. */
function FitBounds({ data }: { data: MapDataPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (data.length > 0) {
      const bounds = L.latLngBounds(data.map((d) => [d.latitude, d.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [data, map]);
  return null;
}

/** Returns a color string based on point type and health score. */
function getMarkerColor(point: MapDataPoint): string {
  if (point.type === 'equipment') return '#3B82F6'; // blue
  if (point.type === 'cooperative') return '#8B5CF6'; // purple

  // Farm — color by health score
  const score = point.healthScore ?? 50;
  if (score > 70) return '#5DB347'; // green
  if (score >= 40) return '#F59E0B'; // yellow / amber
  return '#EF4444'; // red
}

/** Returns circle radius based on entity type. */
function getMarkerRadius(point: MapDataPoint): number {
  if (point.type === 'cooperative') return 10;
  if (point.type === 'farm') return 8;
  return 6; // equipment
}

export default function FarmMap({
  data,
  center = AFRICA_CENTER,
  zoom = DEFAULT_ZOOM,
  height = '600px',
  onMarkerClick,
}: FarmMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%', borderRadius: '12px' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds data={data} />

      {data.map((point) => {
        const color = getMarkerColor(point);
        const radius = getMarkerRadius(point);

        return (
          <CircleMarker
            key={`${point.type}-${point.id}`}
            center={[point.latitude, point.longitude]}
            radius={radius}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.7,
              weight: 2,
              opacity: 0.9,
            }}
            eventHandlers={{
              click: () => onMarkerClick?.(point),
            }}
          >
            <Popup maxWidth={320} minWidth={260}>
              <MapPopup point={point} />
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
