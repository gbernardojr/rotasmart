/**
 * Modulo de integracao com APIs de geocodificacao e rotas.
 * Geocodificacao: Nominatim (OpenStreetMap, gratuito).
 * Rotas: Google Routes API.
 */

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Geocodifica um endereco usando Nominatim (OpenStreetMap).
 * @param {string} address - Endereco completo
 * @returns {Promise<{lat: number, lng: number, formattedAddress: string}>}
 */
async function geocodeAddress(address) {
  const url =
    'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' +
    encodeURIComponent(address);

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'RotaSmart/1.0 (entregas-otimizacao)',
    },
  });

  const data = await res.json();

  if (!data || data.length === 0) {
    throw new Error('Endereco nao encontrado: "' + address + '"');
  }

  const result = data[0];
  return {
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
    formattedAddress: result.display_name || address,
  };
}

/**
 * Calcula o tempo de viagem entre dois pontos usando a Google Routes API.
 * @param {{lat: number, lng: number}} origin
 * @param {{lat: number, lng: number}} destination
 * @returns {Promise<{durationSec: number, distanceMeters: number, durationMin: number}>}
 */
async function computeTravelTime(origin, destination) {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('GOOGLE_MAPS_API_KEY nao configurada');
  }

  const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';

  const body = {
    origin: {
      location: {
        latLng: { latitude: origin.lat, longitude: origin.lng },
      },
    },
    destination: {
      location: {
        latLng: { latitude: destination.lat, longitude: destination.lng },
      },
    },
    travelMode: 'DRIVE',
    routingPreference: 'TRAFFIC_AWARE',
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
      'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error(
      'Compute Routes falhou: ' + JSON.stringify(data.error || data)
    );
  }

  const route = data.routes[0];
  const durationSec = parseInt(route.duration.replace('s', ''), 10);
  const distanceMeters = route.distanceMeters || 0;

  return {
    durationSec: durationSec,
    distanceMeters: distanceMeters,
    durationMin: Math.round(durationSec / 60),
  };
}

module.exports = {
  geocodeAddress: geocodeAddress,
  computeTravelTime: computeTravelTime,
};
