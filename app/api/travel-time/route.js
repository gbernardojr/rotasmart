import { NextResponse } from 'next/server';
const { computeTravelTime } = require('@/lib/googleMaps');

/**
 * POST /api/travel-time
 * Body: { origin: {lat, lng}, destination: {lat, lng} }
 * Retorna: { durationSec, distanceMeters, durationMin }
 */
export async function POST(request) {
  try {
    const { origin, destination } = await request.json();

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origem e destino são obrigatórios' },
        { status: 400 }
      );
    }

    const result = await computeTravelTime(origin, destination);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[travel-time]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
