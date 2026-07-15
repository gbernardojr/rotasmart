/**
 * Modulo de integracao com APIs de geocodificacao e rotas.
 * Geocodificacao: Google Geocoding API.
 * Rotas: Google Routes API.
 */

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Geocodifica um endereco usando a Google Geocoding API.
 * @param {string} address - Endereco completo
 * @returns {Promise<{lat: number, lng: number, formattedAddress: string}>}
 */
async function geocodeAddress(address) {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('GOOGLE_MAPS_API_KEY nao configurada');
  }

  const url =
    'https://maps.googleapis.com/maps/api/geocode/json?address=' +
    encodeURIComponent(address) +
    '&region=br&language=pt-BR';

  const res = await fetch(url);
  const data = await res.json();

  if (data.status === 'ZERO_RESULTS') {
    throw new Error(
      'Endereco nao encontrado: "' + address + '". ' +
      'Verifique se o endereco esta correto. ' +
      'Dica: tente informar Rua, Numero - Bairro - Cidade/UF'
    );
  }

  if (data.status !== 'OK') {
    throw new Error(
      'Erro na geocodificacao: ' + (data.error_message || data.status)
    );
  }

  const result = data.results[0];
  const lat = result.geometry.location.lat;
  const lng = result.geometry.location.lng;

  if (typeof lat !== 'number' || typeof lng !== 'number' ||
      !isFinite(lat) || !isFinite(lng)) {
    throw new Error('Coordenadas invalidas para o endereco: "' + address + '"');
  }

  return {
    lat: lat,
    lng: lng,
    formattedAddress: result.formatted_address || address,
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
