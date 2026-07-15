/**
 * Módulo de sequenciamento de entregas (algoritmo guloso shortest-duration-first).
 *
 * Para cada entrega, calcula:
 *   duração_total = tempo(depósito→destino) + tempo(destino→depósito) + tempo_carga_descarga
 *
 * Ordena por duração_total crescente e vai alocando até esgotar o tempo disponível.
 * Entregas que excedem o expediente ficam na lista "overflow".
 */

/**
 * Calcula a duração total do ciclo de uma entrega (ida + volta + carga/descarga).
 * @param {number} travelTimeToMin   - Tempo de viagem depósito→destino (minutos)
 * @param {number} travelTimeFromMin - Tempo de viagem destino→depósito (minutos)
 * @param {number} loadUnloadMin     - Tempo de carga/descarga (minutos)
 * @returns {number} Duração total do ciclo em minutos
 */
function cycleDuration(travelTimeToMin, travelTimeFromMin, loadUnloadMin) {
  return travelTimeToMin + travelTimeFromMin + loadUnloadMin;
}

/**
 * Executa o algoritmo de sequenciamento guloso.
 *
 * @param {Array<Object>} deliveries - Lista de entregas, cada uma com:
 *   - id              {string|number}
 *   - address         {string}
 *   - client          {string}
 *   - loadUnloadMin   {number}   Tempo de carga/descarga em minutos
 *   - travelTimeToMin {number}   Tempo depósito→destino em minutos
 *   - travelTimeFromMin {number} Tempo destino→depósito em minutos
 *   - lat             {number}   Latitude do destino
 *   - lng             {number}   Longitude do destino
 *
 * @param {number} availableMinutes - Tempo disponível do expediente em minutos
 * @returns {Object} { sequenced: [...], overflow: [...], totalUsedMinutes, availableMinutes }
 */
function optimizeSequence(deliveries, availableMinutes) {
  const items = deliveries.map((d) => ({
    ...d,
    cycleDurationMin: cycleDuration(
      d.travelTimeToMin,
      d.travelTimeFromMin,
      d.loadUnloadMin
    ),
  }));

  // Ordena por duração do ciclo crescente (menor primeiro)
  items.sort((a, b) => a.cycleDurationMin - b.cycleDurationMin);

  const sequenced = [];
  const overflow = [];
  let remaining = availableMinutes;

  for (const item of items) {
    if (item.cycleDurationMin <= remaining) {
      remaining -= item.cycleDurationMin;
      sequenced.push(item);
    } else {
      overflow.push(item);
    }
  }

  const totalUsedMinutes = availableMinutes - remaining;

  return {
    sequenced,
    overflow,
    totalUsedMinutes,
    availableMinutes,
  };
}

module.exports = { cycleDuration, optimizeSequence };
