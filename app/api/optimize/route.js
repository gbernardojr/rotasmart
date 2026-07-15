import { NextResponse } from 'next/server';
const { optimizeSequence } = require('@/lib/sequencer');

/**
 * POST /api/optimize
 * Body: {
 *   deliveries: Array<{
 *     id, address, client, loadUnloadMin,
 *     travelTimeToMin, travelTimeFromMin, lat, lng
 *   }>,
 *   availableMinutes: number
 * }
 *
 * Retorna: { sequenced, overflow, totalUsedMinutes, availableMinutes }
 */
export async function POST(request) {
  try {
    const { deliveries, availableMinutes } = await request.json();

    if (!deliveries || !Array.isArray(deliveries) || deliveries.length === 0) {
      return NextResponse.json(
        { error: 'Lista de entregas é obrigatória' },
        { status: 400 }
      );
    }

    if (!availableMinutes || availableMinutes <= 0) {
      return NextResponse.json(
        { error: 'Tempo disponível deve ser maior que zero' },
        { status: 400 }
      );
    }

    const result = optimizeSequence(deliveries, availableMinutes);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[optimize]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
