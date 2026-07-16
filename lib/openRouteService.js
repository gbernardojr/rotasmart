const ORS_BASE = 'https://api.openrouteservice.org';

function getApiKey() {
  const key = process.env.OPENROUTESERVICE_API_KEY;
  if (!key) {
    throw new Error('OPENROUTESERVICE_API_KEY nao configurada');
  }
  return key;
}

function normalizeAddress(address) {
  let normalized = address
    .replace(/\bR\.\s*/gi, 'Rua ')
    .replace(/\bRua\s+R\.\s*/gi, 'Rua ')
    .replace(/\bAv\.\s*/gi, 'Avenida ')
    .replace(/\bAl\.\s*/gi, 'Alameda ')
    .replace(/\bTrav\.\s*/gi, 'Travessa ')
    .replace(/\bPc\.\s*/gi, 'Praca ')
    .replace(/\bRod\.\s*/gi, 'Rodovia ');

  normalized = normalized
    .replace(/[,;.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized;
}

function buildSearchVariants(address) {
  const normalized = normalizeAddress(address);

  const cityMatch = normalized.match(
    /([\w\s]+?)\s*[-–]\s*(SP|MG|PR|RJ|SC|RS|BA|PE|CE|GO|ES|PA|MA|PI|RN|PB|SE|AL|TO|AM|RO|AC|AP|MS|MT|DF)\b/i
  );

  let streetAndNumber = normalized;
  let cityState = '';

  if (cityMatch) {
    cityState = cityMatch[0].trim();
    streetAndNumber = normalized.replace(cityState, '').trim();
  }

  const numberMatch = streetAndNumber.match(/(\d+)/);
  const streetName = streetAndNumber.replace(/\d+/g, '').replace(/\s+/g, ' ').trim();
  const number = numberMatch ? numberMatch[1] : '';

  const variants = [];

  if (number && cityState) {
    variants.push(streetName + ' ' + number + ' ' + cityState);
  }
  if (cityState) {
    variants.push(streetName + ' ' + cityState);
  }
  if (number) {
    variants.push(streetName + ' ' + number);
  }
  variants.push(streetName);

  return variants;
}

async function searchNominatim(query) {
  const url =
    'https://nominatim.openstreetmap.org/search?' +
    'q=' + encodeURIComponent(query) +
    '&format=json&limit=1&countrycodes=br';

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'RotasApp/1.0 (contato@rotasapp.com)',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error('Erro na geocodificacao Nominatim (HTTP ' + res.status + '): ' + text);
  }

  return await res.json();
}

/**
 * Geocodifica um endereco usando o Nominatim (OpenStreetMap) - gratuito, sem chave.
 * @param {string} address
 * @returns {Promise<{lat: number, lng: number, formattedAddress: string}>}
 */
async function geocodeAddress(address) {
  const variants = buildSearchVariants(address);

  for (const variant of variants) {
    const data = await searchNominatim(variant);

    if (data && data.length > 0) {
      const result = data[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      const label = result.display_name || address;

      if (typeof lat !== 'number' || typeof lng !== 'number' ||
          !isFinite(lat) || !isFinite(lng)) {
        continue;
      }

      return {
        lat: lat,
        lng: lng,
        formattedAddress: label,
      };
    }
  }

  throw new Error(
    'Endereco nao encontrado: "' + address + '". ' +
    'Tente: Rua, Numero - Cidade/UF'
  );
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
