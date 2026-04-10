'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Loader2, Navigation } from 'lucide-react';

// Fix Leaflet default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const GREEN = '#5DB347';
const NAVY = '#1B2A4A';

// Custom green marker icon using SVG data URI
const greenIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${GREEN}"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
    </svg>
  `)}`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Default center: roughly center of Africa
const AFRICA_CENTER: [number, number] = [0, 25];

interface LocationPickerProps {
  value: string;
  onChange: (value: string) => void;
  defaultCenter?: [number, number];
}

/** Handles click events on the map to place a marker. */
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Pans/zooms the map to a new center when coordinates change. */
function RecenterMap({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom ?? map.getZoom());
  }, [center, zoom, map]);
  return null;
}

export default function LocationPicker({ value, onChange, defaultCenter }: LocationPickerProps) {
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter ?? AFRICA_CENTER);
  const [mapZoom, setMapZoom] = useState(defaultCenter ? 12 : 4);

  // Parse the current value to get marker position
  const markerPos: [number, number] | null = (() => {
    if (!value.trim()) return null;
    const parts = value.split(',').map((p) => p.trim());
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
    return null;
  })();

  const handleLocationSelect = useCallback(
    (lat: number, lng: number) => {
      const rounded = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      onChange(rounded);
      setMapCenter([lat, lng]);
    },
    [onChange]
  );

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleLocationSelect(latitude, longitude);
        setMapZoom(14);
        setLocating(false);
      },
      (err) => {
        setLocError(
          err.code === 1
            ? 'Location access denied. Please enable location permissions.'
            : 'Could not determine your location. Please try again.'
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, [handleLocationSelect]);

  // If value changes externally and we have a marker, center on it
  useEffect(() => {
    if (markerPos) {
      setMapCenter(markerPos);
      if (mapZoom < 8) setMapZoom(12);
    }
    // Only run when value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="space-y-3">
      {/* Use My Location button */}
      <button
        type="button"
        onClick={handleUseMyLocation}
        disabled={locating}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border-2 transition-colors"
        style={{
          borderColor: GREEN,
          color: locating ? '#9CA3AF' : GREEN,
          backgroundColor: 'white',
        }}
      >
        {locating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Navigation className="w-4 h-4" />
        )}
        {locating ? 'Detecting location...' : 'Use My Location'}
      </button>

      {locError && <p className="text-xs text-red-500">{locError}</p>}

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 300 }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          <RecenterMap center={mapCenter} zoom={mapZoom} />

          {markerPos && (
            <Marker
              position={markerPos}
              icon={greenIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target as L.Marker;
                  const pos = marker.getLatLng();
                  handleLocationSelect(pos.lat, pos.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Instruction text */}
      <p className="text-xs text-gray-400 flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        Tap the map to drop a pin, or drag the marker to adjust
      </p>

      {/* Coordinates display */}
      {markerPos && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
          style={{ backgroundColor: `${GREEN}15`, color: NAVY }}
        >
          <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: GREEN }} />
          <span className="font-medium">
            {markerPos[0].toFixed(6)}, {markerPos[1].toFixed(6)}
          </span>
        </div>
      )}
    </div>
  );
}
