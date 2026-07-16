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

function parseBrazilianAddress(address) {
  const normalized = normalizeAddress(address);

  const states = 'SP|MG|PR|RJ|SC|RS|BA|PE|CE|GO|ES|PA|MA|PI|RN|PB|SE|AL|TO|AM|RO|AC|AP|MS|MT|DF';
  const stateRegex = new RegExp('\\b(' + states + ')\\b', 'i');
  const stateMatch = normalized.match(stateRegex);
  const state = stateMatch ? stateMatch[1].toUpperCase() : '';

  let withoutState = state ? normalized.replace(new RegExp(state + '\\s*$', 'i'), '').trim() : normalized;

  withoutState = withoutState.replace(/-\s*$/, '').trim();

  const parts = withoutState.split(/\s+-\s+/).map(function (p) { return p.trim(); }).filter(Boolean);

  let street = '';
  let number = '';
  let city = '';

  if (parts.length >= 3) {
    street = parts[0];
    number = (parts[0].match(/(\d+)\s*$/) || [])[1] || '';
    street = street.replace(/\d+\s*$/, '').trim();
    city = parts[parts.length - 1];
  } else if (parts.length === 2) {
    street = parts[0];
    number = (parts[0].match(/(\d+)\s*$/) || [])[1] || '';
    street = street.replace(/\d+\s*$/, '').trim();
    city = parts[1];
  } else if (parts.length === 1) {
    const numMatch = parts[0].match(/^(.+?)\s+(\d+)\s*$/);
    if (numMatch) {
      street = numMatch[1].trim();
      number = numMatch[2];
    } else {
      street = parts[0];
    }
  }

  city = city.replace(/,\s*$/, '').trim();

  return { street: street, number: number, city: city, state: state, full: normalized };
}

function buildSearchVariants(address) {
  const parsed = parseBrazilianAddress(address);
  const variants = [];

  if (parsed.street && parsed.number && parsed.city && parsed.state) {
    variants.push(parsed.street + ' ' + parsed.number + ', ' + parsed.city + ', ' + parsed.state);
  }
  if (parsed.street && parsed.number && parsed.city) {
    variants.push(parsed.street + ' ' + parsed.number + ', ' + parsed.city);
  }
  if (parsed.street && parsed.city && parsed.state) {
    variants.push(parsed.street + ', ' + parsed.city + ', ' + parsed.state);
  }
  if (parsed.street && parsed.number && parsed.state) {
    variants.push(parsed.street + ' ' + parsed.number + ', ' + parsed.state);
  }
  if (parsed.street && parsed.number) {
    variants.push(parsed.street + ' ' + parsed.number);
  }
  if (parsed.full) {
    variants.push(parsed.full);
  }

  return variants;
}

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

async function searchNominatim(query, retries) {
  retries = retries || 0;
  const url =
    'https://nominatim.openstreetmap.org/search?' +
    'q=' + encodeURIComponent(query) +
    '&format=json&limit=1&countrycodes=br';

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'RotasApp/1.0 (contato@rotasapp.com)',
    },
  });

  if (res.status === 429 && retries < 3) {
    await sleep(2000 * (retries + 1));
    return searchNominatim(query, retries + 1);
  }

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

  for (var i = 0; i < variants.length; i++) {
    if (i > 0) await sleep(1100);
    const data = await searchNominatim(variants[i]);

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
