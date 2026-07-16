const ORS_BASE = 'https://api.openrouteservice.org';

function getApiKey() {
  const key = process.env.OPENROUTESERVICE_API_KEY;
  if (!key) {
    throw new Error('OPENROUTESERVICE_API_KEY nao configurada');
  }
  return key;
}

/**
 * Geocodifica um endereco usando a API do OpenRouteService.
 * @param {string} address
 * @returns {Promise<{lat: number, lng: number, formattedAddress: string}>}
 */
async function geocodeAddress(address) {
  const ORS_API_KEY = getApiKey();

  const url =
    ORS_BASE + '/geocode/search?api_key=' + ORS_API_KEY +
    '&text=' + encodeURIComponent(address) +
    '&size=1&boundary.country=BR&lang=pt';

  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    throw new Error('Erro na geocodificacao ORS (HTTP ' + res.status + '): ' + text);
  }

  const data = await res.json();

  if (!data.features || data.features.length === 0) {
    throw new Error(
      'Endereco nao encontrado: "' + address + '". ' +
      'Verifique se o endereco esta correto. ' +
      'Dica: tente informar Rua, Numero - Bairro - Cidade/UF'
    );
  }

  const feature = data.features[0];
  const [lng, lat] = feature.geometry.coordinates;
  const label = feature.properties.label || feature.properties.name || address;

  if (typeof lat !== 'number' || typeof lng !== 'number' ||
      !isFinite(lat) || !isFinite(lng)) {
    throw new Error('Coordenadas invalidas para o endereco: "' + address + '"');
  }

  return {
    lat: lat,
    lng: lng,
    formattedAddress: label,
  };
}

/**
 * Calcula o tempo de viagem entre dois pontos usando a API de Directions do ORS.
 * @param {{lat: number, lng: number}} origin
 * @param {{lat: number, lng: number}} destination
 * @returns {Promise<{durationSec: number, distanceMeters: number, durationMin: number}>}
 */
async function computeTravelTime(origin, destination) {
  const ORS_API_KEY = getApiKey();

  const url = ORS_BASE + '/v2/directions/driving-car';

  const body = {
    coordinates: [
      [origin.lng, origin.lat],
      [destination.lng, destination.lat],
    ],
    instructions: false,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': ORS_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error('Erro no Directions ORS (HTTP ' + res.status + '): ' + text);
  }

  const data = await res.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error('Rota nao encontrada entre os pontos informados');
  }

  const summary = data.routes[0].summary;

  return {
    durationSec: Math.round(summary.duration),
    distanceMeters: Math.round(summary.distance),
    durationMin: Math.round(summary.duration / 60),
  };
}

module.exports = {
  geocodeAddress: geocodeAddress,
  computeTravelTime: computeTravelTime,
};
