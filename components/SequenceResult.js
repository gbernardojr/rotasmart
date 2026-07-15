'use client';

function timeToMinutes(timeStr) {
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return hh + ':' + mm;
}

function formatTimeLabel(hours, minutes) {
  if (minutes > 0) {
    return hours + 'h' + minutes + 'min';
  }
  return hours + 'h';
}

export default function SequenceResult({ sequenced, overflow, totalUsedMinutes, availableMinutes, depotDepartureTime }) {
  const usedH = Math.floor(totalUsedMinutes / 60);
  const usedM = totalUsedMinutes % 60;
  const availH = Math.floor(availableMinutes / 60);
  const availM = availableMinutes % 60;
  const pct = Math.min(100, Math.round((totalUsedMinutes / availableMinutes) * 100));

  const usedTimeLabel = formatTimeLabel(usedH, usedM);
  const availTimeLabel = formatTimeLabel(availH, availM);

  let currentTime = depotDepartureTime ? timeToMinutes(depotDepartureTime) : 0;
  const sequenceWithTimes = sequenced.map(function (d) {
    const departureMin = currentTime;
    const arrivalMin = departureMin + d.travelTimeToMin;
    const returnMin = arrivalMin + d.loadUnloadMin + d.travelTimeFromMin;

    const item = {
      id: d.id,
      client: d.client,
      address: d.address,
      cycleDurationMin: d.cycleDurationMin,
      travelTimeToMin: d.travelTimeToMin,
      travelTimeFromMin: d.travelTimeFromMin,
      loadUnloadMin: d.loadUnloadMin,
      lat: d.lat,
      lng: d.lng,
      departureTime: minutesToTime(departureMin),
      arrivalTime: minutesToTime(arrivalMin),
      returnTime: minutesToTime(returnMin),
    };

    currentTime = returnMin;
    return item;
  });

  return (
    <div className="card">
      <h2>Sequencia Otimizada</h2>

      <div className="time-summary">
        <div>
          <div className="label">Tempo utilizado</div>
          <div className="value">{usedTimeLabel} de {availTimeLabel}</div>
        </div>
        <div className="progress-bar">
          <div className="fill" style={{ width: pct + '%' }} />
        </div>
        <div style={{ fontSize: 13, color: '#555' }}>{pct}%</div>
      </div>

      {sequenceWithTimes.length === 0 ? (
        <p style={{ color: '#888', fontSize: 14, padding: '12px 0' }}>
          Nenhuma entrega pôde ser encaixada no expediente.
        </p>
      ) : (
        sequenceWithTimes.map(function (d, i) {
          return (
            <div className="sequence-item" key={d.id}>
              <div className="sequence-number">{i + 1}</div>
              <div className="sequence-info">
                <div className="client">{d.client}</div>
                <div className="address">{d.address}</div>
                <div className="details">
                  <span>Saida: {d.departureTime}</span>
                  <span>Chegada: {d.arrivalTime}</span>
                  <span>Retorno: {d.returnTime}</span>
                  <span>Ciclo: {d.cycleDurationMin}min</span>
                </div>
              </div>
            </div>
          );
        })
      )}

      {overflow.length > 0 && (
        <div>
          <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 16, color: '#ef4444' }}>
            Entregas nao encaixadas ({overflow.length})
          </h3>
          {overflow.map(function (d) {
            return (
              <div className="overflow-item" key={d.id}>
                <div>
                  <div className="client">{d.client}</div>
                  <div className="address">{d.address}</div>
                </div>
                <div className="cycle">Ciclo: {d.cycleDurationMin}min</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
