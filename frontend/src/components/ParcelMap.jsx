import { useMemo, useRef } from 'react';
import { EditControl } from 'react-leaflet-draw';
import { FeatureGroup, MapContainer, Polygon, TileLayer } from 'react-leaflet';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

const DEFAULT_CENTER = [30.4278, -9.5981];

function normalizeCoords(latlngs) {
  const coords = latlngs.map((point) => [point.lng, point.lat]);
  if (coords.length > 0) {
    const [firstLng, firstLat] = coords[0];
    const [lastLng, lastLat] = coords[coords.length - 1];
    if (firstLng !== lastLng || firstLat !== lastLat) {
      coords.push([firstLng, firstLat]);
    }
  }
  return coords;
}

function extractPolygonData(layer) {
  const latlngs = layer.getLatLngs()?.[0] ?? [];
  const coords = normalizeCoords(latlngs);
  if (coords.length < 4) {
    return null;
  }

  const polygon = turf.polygon([coords]);
  const areaSquareMeters = turf.area(polygon);
  const centroid = turf.centroid(polygon).geometry.coordinates;

  return {
    polygon: coords.map(([longitude, latitude]) => [latitude, longitude]),
    superficie: (areaSquareMeters / 10000).toFixed(2),
    latitude: centroid[1].toFixed(6),
    longitude: centroid[0].toFixed(6),
  };
}

export default function ParcelMap({ value, onChange, onClear }) {
  const featureGroupRef = useRef(null);

  const polygonPositions = useMemo(
    () => value?.polygon?.map(([latitude, longitude]) => [latitude, longitude]) ?? [],
    [value],
  );

  const syncPolygon = (layer) => {
    const data = extractPolygonData(layer);
    if (!data) return;
    onChange(data);
  };

  const handleCreated = (event) => {
    const featureGroup = featureGroupRef.current;
    if (!featureGroup) return;

    featureGroup.clearLayers();
    featureGroup.addLayer(event.layer);
    syncPolygon(event.layer);
  };

  const handleEdited = (event) => {
    event.layers.eachLayer((layer) => {
      syncPolygon(layer);
    });
  };

  const handleDeleted = () => {
    onClear();
  };

  return (
    <div className="rounded-[2rem] border border-white/80 bg-white/75 p-4 shadow-[0_18px_60px_rgba(2,48,71,0.08)] backdrop-blur-xl sm:p-5">
      

      <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[#F7FBFC]">
        <div className="pointer-events-none absolute left-4 top-4 z-[401] rounded-2xl bg-white/85 px-4 py-3 text-sm font-semibold text-[#023047] shadow-[0_10px_30px_rgba(2,48,71,0.08)] backdrop-blur">
          Selected Parcel Area
          <span className="mt-1 block text-2xl font-black text-[#0077B6]">
            {value?.superficie ? `${value.superficie} hectares` : '0.00 hectares'}
          </span>
          <span className="mt-1 block text-xs font-medium text-slate-500">
            {value?.latitude && value?.longitude
              ? `Lat ${value.latitude} · Lng ${value.longitude}`
              : 'Draw a polygon to calculate area and coordinates'}
          </span>
        </div>

        <MapContainer center={DEFAULT_CENTER} zoom={8} scrollWheelZoom className="h-[220px] w-full sm:h-[420px]">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FeatureGroup ref={featureGroupRef}>
            {polygonPositions.length > 0 ? (
              <Polygon
                positions={polygonPositions}
                pathOptions={{ color: '#0077B6', fillColor: '#00B4D8', fillOpacity: 0.28, weight: 3 }}
              />
            ) : null}
            <EditControl
              position="topright"
              onCreated={handleCreated}
              onEdited={handleEdited}
              onDeleted={handleDeleted}
              draw={{
                polyline: false,
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polygon: {
                  allowIntersection: false,
                  showArea: true,
                  shapeOptions: {
                    color: '#0077B6',
                    fillColor: '#00B4D8',
                    fillOpacity: 0.28,
                    weight: 3,
                  },
                },
              }}
              edit={{
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
              }}
            />
          </FeatureGroup>
        </MapContainer>
      </div>

      
    </div>
  );
}
