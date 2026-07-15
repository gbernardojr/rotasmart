'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para ícones do Leaflet no Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const depotIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'depot-marker',
});

function FitBounds({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [positions, map]);

  return null;
}

export default function DeliveryMap({ depot, sequenced, overflow }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e5e7eb' }}>
        <span style={{ color: '#888', fontSize: 14 }}>Carregando mapa...</span>
      </div>
    );
  }

  const positions = [];

  if (depot && depot.lat && depot.lng) {
    positions.push({ lat: depot.lat, lng: depot.lng, type: 'depot' });
  }

  sequenced.forEach((d, i) => {
    if (d.lat && d.lng) {
      positions.push({ lat: d.lat, lng: d.lng, type: 'delivery', index: i + 1 });
    }
  });

  overflow.forEach((d) => {
    if (d.lat && d.lng) {
      positions.push({ lat: d.lat, lng: d.lng, type: 'overflow' });
    }
  });

  if (positions.length === 0) {
    return (
      <div className="map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e5e7eb' }}>
        <span style={{ color: '#888', fontSize: 14 }}>Adicione entregas com coordenadas para ver o mapa</span>
      </div>
    );
  }

  const center = positions[0]
    ? [positions[0].lat, positions[0].lng]
    : [-23.55, -46.63];

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {positions.length > 1 && <FitBounds positions={positions} />}

        {positions.map((pos, i) => (
          <Marker
            key={i}
            position={[pos.lat, pos.lng]}
            icon={defaultIcon}
          >
            <Popup>
              {pos.type === 'depot' && <strong>Depósito</strong>}
              {pos.type === 'delivery' && (
                <>
                  <strong>#{pos.index}</strong> — {sequenced[pos.index - 1]?.client}
                  <br />
                  {sequenced[pos.index - 1]?.address}
                </>
              )}
              {pos.type === 'overflow' && (
                <>
                  <strong style={{ color: '#ef4444' }}>Não encaixada</strong>
                  <br />
                  {overflow.find((o) => o.lat === pos.lat && o.lng === pos.lng)?.client}
                </>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
