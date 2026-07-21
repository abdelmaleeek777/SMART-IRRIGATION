import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [30.4278, -9.5981];
const DEFAULT_ZOOM = 8;

// Normal parcel style
const normalStyle = {
  color: '#0077B6',
  weight: 2,
  fillColor: '#00B4D8',
  fillOpacity: 0.18,
};

// Selected parcel style
const selectedStyle = {
  color: '#0077B6',
  weight: 4,
  fillColor: '#00B4D8',
  fillOpacity: 0.42,
};

/* Fly to bounds when selectedParcelId changes */
function FlyToBounds({ parcel }) {
  const map = useMap();

  useEffect(() => {
    if (!parcel?.polygon?.length) return;
    try {
      const latLngs = parcel.polygon.map(([lat, lng]) => [lat, lng]);
      const bounds = L.latLngBounds(latLngs);
      if (bounds.isValid()) {
        map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 16, duration: 1.2 });
      }
    } catch {
      // ignore invalid bounds
    }
  }, [parcel, map]);

  return null;
}

export default function ParcelsMap({ parcels, selectedParcelId, onParcelClick }) {
  const mapRef = useRef(null);

  return (
    <div className="relative z-0 isolate h-full min-h-[460px] overflow-hidden rounded-3xl border border-iceBlue shadow-[0_18px_60px_rgba(2,48,71,0.10)]">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        style={{ height: '100%', width: '100%', minHeight: 460 }}
        ref={mapRef}
      >
        {/* Satellite basemap */}
        <TileLayer
          attribution="Tiles &copy; Esri"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        {/* Labels overlay */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          detectRetina
        />

        {parcels.map((parcel) => {
          if (!parcel.polygon?.length) return null;
          const isSelected = parcel.id_parcelle === selectedParcelId;
          const positions = parcel.polygon.map(([lat, lng]) => [lat, lng]);

          return (
            <Polygon
              key={parcel.id_parcelle}
              positions={positions}
              pathOptions={isSelected ? selectedStyle : normalStyle}
              eventHandlers={{
                click: () => onParcelClick(parcel.id_parcelle),
              }}
            >
              <Tooltip sticky direction="top" offset={[0, -4]} opacity={1}>
                <span className="text-xs font-semibold text-midnight">
                  {parcel.nom}
                </span>
              </Tooltip>
            </Polygon>
          );
        })}

        {/* Auto-fly to selected parcel */}
        <FlyToBounds
          parcel={parcels.find((p) => p.id_parcelle === selectedParcelId) ?? null}
        />
      </MapContainer>

      {/* Map badge overlay */}
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl border border-white/60 bg-white/85 px-3 py-1.5 text-xs font-semibold text-oceanBlue shadow backdrop-blur-sm">
        {parcels.length} parcelle{parcels.length !== 1 ? 's' : ''} affichée{parcels.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
