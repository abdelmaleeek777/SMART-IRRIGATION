import { useEffect } from 'react';
import { MapContainer, Polygon, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [30.4278, -9.5981];

/** Fits the map bounds to the polygon once it's available */
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (!positions?.length) return;
    map.fitBounds(positions, { padding: [40, 40] });
  }, [map, positions]);
  return null;
}

/**
 * Read-only map that renders a single parcel polygon.
 * Expects parcel.polygon as [[lat, lng], …] (same format saved by ParcelMap).
 */
export default function ParcelViewMap({ parcel }) {
  // polygon is stored as [[lat, lng], …]
  const positions =
    Array.isArray(parcel?.polygon) && parcel.polygon.length >= 3
      ? parcel.polygon
      : null;

  const center =
    parcel?.latitude && parcel?.longitude
      ? [parseFloat(parcel.latitude), parseFloat(parcel.longitude)]
      : DEFAULT_CENTER;

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-iceBlue shadow-sm">
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Satellite base layer */}
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />

        {/* Labels overlay */}
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />

        {positions ? (
          <>
            <Polygon
              positions={positions}
              pathOptions={{
                color: '#0077B6',
                fillColor: '#00B4D8',
                fillOpacity: 0.3,
                weight: 3,
              }}
            />
            <FitBounds positions={positions} />
          </>
        ) : null}
      </MapContainer>
    </div>
  );
}
