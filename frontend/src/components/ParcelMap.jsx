import { useEffect, useRef } from 'react';
import { EditControl } from 'react-leaflet-draw';
import { FeatureGroup, MapContainer, TileLayer, useMap } from 'react-leaflet';
import * as turf from '@turf/turf';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

const DEFAULT_CENTER = [30.4278, -9.5981];

const DRAW_OPTIONS = {
  polyline: false,
  rectangle: false,
  circle: false,
  circlemarker: false,
  marker: false,
  polygon: {
    allowIntersection: false,
    showArea: false,
    shapeOptions: {
      color: '#0077B6',
      fillColor: '#00B4D8',
      fillOpacity: 0.28,
      weight: 3,
    },
  },
};

const EDIT_OPTIONS = {
  edit: {
    selectedPathOptions: {
      color: '#0077B6',
      fillColor: '#00B4D8',
      fillOpacity: 0.22,
      dashArray: '8, 8',
      maintainColor: true,
    },
  },
  remove: true,
};

function normalizeCoords(latlngs) {
  const coords = latlngs.map((p) => [p.lng, p.lat]);
  if (coords.length > 0) {
    const [fLng, fLat] = coords[0];
    const [lLng, lLat] = coords[coords.length - 1];
    if (fLng !== lLng || fLat !== lLat) coords.push([fLng, fLat]);
  }
  return coords;
}

function extractPolygonData(layer) {
  const latlngs = layer.getLatLngs()?.[0] ?? [];
  const coords = normalizeCoords(latlngs);
  if (coords.length < 4) return null;

  const polygon = turf.polygon([coords]);
  const areaM2 = turf.area(polygon);
  const centroid = turf.centroid(polygon).geometry.coordinates;

  return {
    polygon: coords.map(([lng, lat]) => [lat, lng]),
    superficie: (areaM2 / 10000).toFixed(2),
    latitude: centroid[1].toFixed(6),
    longitude: centroid[0].toFixed(6),
  };
}

/* Inner component — runs inside MapContainer so useMap() works */
function DrawControls({ featureGroupRef, onChange, onClear }) {
  // Ensure the map is ready (useMap throws if called outside MapContainer)
  useMap();

  const handleCreated = (e) => {
    const data = extractPolygonData(e.layer);
    if (data) onChange(data);
  };

  const handleEdited = (e) => {
    e.layers.eachLayer((layer) => {
      const data = extractPolygonData(layer);
      if (data) onChange(data);
    });
  };

  const handleDeleted = () => {
    onClear();
  };

  return (
    <FeatureGroup ref={featureGroupRef}>
      <EditControl
        position="topright"
        onCreated={handleCreated}
        onEdited={handleEdited}
        onDeleted={handleDeleted}
        draw={DRAW_OPTIONS}
        edit={EDIT_OPTIONS}
      />
    </FeatureGroup>
  );
}

export default function ParcelMap({ value, onChange, onClear }) {
  const featureGroupRef = useRef(null);
  // Track whether we already synced `value` → map so we don't overwrite user edits
  const syncedRef = useRef(false);

  useEffect(() => {
    const fg = featureGroupRef.current;
    if (!fg) return;
    if (!value?.polygon?.length) return;
    // Only sync once from the parent (e.g. if editing an existing record)
    if (syncedRef.current) return;
    syncedRef.current = true;

    const positions = value.polygon.map(([lat, lng]) => [lat, lng]);
    const layer = L.polygon(positions, {
      color: '#0077B6',
      fillColor: '#00B4D8',
      fillOpacity: 0.28,
      weight: 3,
    });
    fg.clearLayers();
    fg.addLayer(layer);
  }, [value]);

  return (
    <div className="flex flex-col rounded-[1.75rem] border border-white/80 bg-white/75 shadow-[0_18px_60px_rgba(2,48,71,0.08)] backdrop-blur-xl overflow-hidden min-h-[480px]">
      {/* Top bar */}
      {/* <div className="flex items-center justify-between border-b border-slate-100 bg-white/90 px-5 py-3 backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Selected Parcel Area</p>
          <p className="text-2xl font-black text-[#0077B6]">
            {value?.superficie ? `${value.superficie} ha` : '0.00 ha'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-500">
            {value?.latitude && value?.longitude
              ? `Lat ${value.latitude}`
              : 'Draw a polygon'}
          </p>
          <p className="text-xs font-medium text-slate-500">
            {value?.longitude ? `Lng ${value.longitude}` : 'to calculate area'}
          </p>
        </div>
      </div> */}

      {/* Map fills remaining height */}
      {/* <div className="relative flex-1" style={{ minHeight: 380 }}>
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={8}
          scrollWheelZoom
          style={{ height: '100%', width: '100%', minHeight: 380 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DrawControls
            featureGroupRef={featureGroupRef}
            onChange={onChange}
            onClear={onClear}
          />
        </MapContainer>
      </div> */}
      <div className="relative flex-1" style={{ minHeight: 380 }}>
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={8}
          scrollWheelZoom
          style={{
            height: '100%',
            width: '100%',
            minHeight: 380,
          }}
        >
          {/* Satellite map */}
          <TileLayer
            attribution="Tiles &copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />

          {/* <TileLayer
            attribution="Labels &copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          /> */}

          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            detectRetina={true}
          />

          {/* Parcel drawing tools */}
          <DrawControls
            featureGroupRef={featureGroupRef}
            onChange={onChange}
            onClear={onClear}
          />
        </MapContainer>
      </div>
    </div>
  );
}