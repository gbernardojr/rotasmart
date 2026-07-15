import { NextResponse } from 'next/server';
const { geocodeAddress } = require('@/lib/googleMaps');

/**
 * POST /api/geocode
 * Body: { address: string }
 * Retorna: { lat, lng, formattedAddress }
 */
export async function POST(request) {
  try {
    const { address } = await request.json();

    if (!address || !address.trim()) {
      return NextResponse.json(
        { error: 'Endereço é obrigatório' },
        { status: 400 }
      );
    }

    const result = await geocodeAddress(address.trim());
    return NextResponse.json(result);
  } catch (err) {
    console.error('[geocode]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
