'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'rotas-deliveries';
const SETTINGS_KEY = 'rotas-settings';

const defaultSettings = {
  depotAddress: '',
  depotLat: null,
  depotLng: null,
  availableHours: 8,
  availableMinutesExtra: 0,
  defaultLoadUnload: 10,
};

function formatTimeLabel(hours, minutes) {
  if (minutes > 0) {
    return hours + 'h' + String(minutes).padStart(2, '0') + 'min';
  }
  return hours + 'h';
}

function minutesToTime(minutes) {
  var h = Math.floor(minutes / 60);
  var m = minutes % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

function timeToMinutes(timeStr) {
  var parts = timeStr.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

export default function Home() {
  var [mounted, setMounted] = useState(false);
  var [settings, setSettings] = useState(defaultSettings);
  var [editingDepot, setEditingDepot] = useState(false);
  var [depotInput, setDepotInput] = useState('');
  var [deliveries, setDeliveries] = useState([]);
  var [form, setForm] = useState({ address: '', client: '', loadUnload: '' });
  var [result, setResult] = useState(null);
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState('');
  var [MapComponent, setMapComponent] = useState(null);

  useEffect(function () {
    setMounted(true);
  }, []);

  useEffect(function () {
    if (!mounted) return;
    try {
      var savedDeliveries = localStorage.getItem(STORAGE_KEY);
      if (savedDeliveries) setDeliveries(JSON.parse(savedDeliveries));
      var savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        var s = JSON.parse(savedSettings);
        setSettings(function (prev) { return Object.assign({}, prev, s); });
        setDepotInput(s.depotAddress || '');
      }
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    }
  }, [mounted]);

  useEffect(function () {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deliveries));
  }, [deliveries, mounted]);

  useEffect(function () {
    if (!mounted) return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, mounted]);

  useEffect(function () {
    if (!mounted || !result || !result.sequenced || result.sequenced.length === 0) return;
    import('@/components/DeliveryMap').then(function (mod) {
      setMapComponent(function () { return mod.default; });
    });
  }, [mounted, result]);

  function handleSaveDepot() {
    setError('');
    if (!depotInput.trim()) {
      setError('Informe o endereco do deposito');
      return;
    }
    setLoading(true);
    fetch('/api/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: depotInput.trim() }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.error) {
          setError(data.error);
        } else {
          setSettings(function (prev) {
            return Object.assign({}, prev, {
              depotAddress: data.formattedAddress || depotInput.trim(),
              depotLat: data.lat,
              depotLng: data.lng,
            });
          });
          setDepotInput(data.formattedAddress || depotInput.trim());
          setEditingDepot(false);
        }
      })
      .catch(function (e) { setError('Erro ao geocodificar deposito: ' + e.message); })
      .finally(function () { setLoading(false); });
  }

  function handleSettingsChange(field, value) {
    setSettings(function (prev) { return Object.assign({}, prev, { [field]: value }); });
  }

  function handleAddDelivery() {
    setError('');
    if (!form.address.trim()) {
      setError('Endereco e obrigatorio');
      return;
    }
    if (!form.client.trim()) {
      setError('Nome do cliente/referencia e obrigatorio');
      return;
    }
    var loadUnload = parseInt(form.loadUnload || String(settings.defaultLoadUnload), 10);
    var newDelivery = {
      id: Date.now(),
      address: form.address.trim(),
      client: form.client.trim(),
      loadUnloadMin: loadUnload,
      lat: null,
      lng: null,
      travelTimeToMin: 0,
      travelTimeFromMin: 0,
    };
    setDeliveries(function (prev) { return prev.concat([newDelivery]); });
    setForm({ address: '', client: '', loadUnload: '' });
  }

  function handleRemoveDelivery(id) {
    setDeliveries(function (prev) { return prev.filter(function (d) { return d.id !== id; }); });
    setResult(null);
  }

  function handleClearAll() {
    if (deliveries.length === 0) return;
    if (!confirm('Remover todas as entregas?')) return;
    setDeliveries([]);
    setResult(null);
  }

  async function handleOptimize() {
    setError('');
    if (!settings.depotLat || !settings.depotLng) {
      setError('Configure o endereco do deposito primeiro');
      return;
    }
    if (deliveries.length === 0) {
      setError('Adicione pelo menos uma entrega');
      return;
    }
    setLoading(true);
    try {
      var updatedDeliveries = [];
      for (var idx = 0; idx < deliveries.length; idx++) {
        var delivery = deliveries[idx];
        var lat = delivery.lat;
        var lng = delivery.lng;
        var travelTimeToMin = delivery.travelTimeToMin;
        var travelTimeFromMin = delivery.travelTimeFromMin;

        if (!lat || !lng || travelTimeToMin === 0) {
          var geoRes = await fetch('/api/geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: delivery.address }),
          });
          var geoData = await geoRes.json();
          if (geoData.error) {
            throw new Error('Falha ao geocodificar "' + delivery.address + '": ' + geoData.error);
          }
          lat = geoData.lat;
          lng = geoData.lng;

          var travelRes = await fetch('/api/travel-time', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origin: { lat: settings.depotLat, lng: settings.depotLng },
              destination: { lat: lat, lng: lng },
            }),
          });
          var travelData = await travelRes.json();
          if (travelData.error) {
            throw new Error('Falha ao calcular rota para "' + delivery.address + '": ' + travelData.error);
          }
          travelTimeToMin = travelData.durationMin;

          var travelBackRes = await fetch('/api/travel-time', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origin: { lat: lat, lng: lng },
              destination: { lat: settings.depotLat, lng: settings.depotLng },
            }),
          });
          var travelBackData = await travelBackRes.json();
          if (travelBackData.error) {
            throw new Error('Falha ao calcular rota de volta para "' + delivery.address + '": ' + travelBackData.error);
          }
          travelTimeFromMin = travelBackData.durationMin;
        }

        updatedDeliveries.push(Object.assign({}, delivery, {
          lat: lat,
          lng: lng,
          travelTimeToMin: travelTimeToMin,
          travelTimeFromMin: travelTimeFromMin,
        }));
      }

      setDeliveries(updatedDeliveries);

      var totalAvailableMin = settings.availableHours * 60 + settings.availableMinutesExtra;
      var optRes = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveries: updatedDeliveries,
          availableMinutes: totalAvailableMin,
        }),
      });
      var optData = await optRes.json();
      if (optData.error) {
        throw new Error(optData.error);
      }
      setResult(optData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleExportResult() {
    if (!result) return;
    var lines = [];
    lines.push('SEQUENCIA DE ENTREGAS');
    lines.push('====================');
    lines.push('Tempo utilizado: ' + result.totalUsedMinutes + 'min de ' + result.availableMinutes + 'min');
    lines.push('');
    result.sequenced.forEach(function (d, i) {
      lines.push((i + 1) + '. ' + d.client);
      lines.push('   Endereco: ' + d.address);
      lines.push('   Ciclo: ' + d.cycleDurationMin + 'min (ida: ' + d.travelTimeToMin + 'min, volta: ' + d.travelTimeFromMin + 'min, carga: ' + d.loadUnloadMin + 'min)');
      lines.push('');
    });
    if (result.overflow.length > 0) {
      lines.push('ENTREGAS NAO ENCAIXADAS');
      lines.push('=======================');
      result.overflow.forEach(function (d) {
        lines.push('- ' + d.client + ': ' + d.address + ' (' + d.cycleDurationMin + 'min)');
      });
    }
    var blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'entregas-' + new Date().toISOString().split('T')[0] + '.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  var totalAvailableMin = settings.availableHours * 60 + settings.availableMinutesExtra;

  if (!mounted) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px' }}>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <img src="/logo.png" alt="RotaSmart" style={{ height: 40, width: 40, borderRadius: 8 }} />
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>
            RotaSmart
          </h1>
        </div>
        <p style={{ fontSize: 14, color: '#777', marginTop: 4 }}>
          Cadastre entregas, configure o deposito e gere a sequencia otimizada
        </p>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        <h2>Configuracoes</h2>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label>Endereco do Deposito</label>
          {editingDepot ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={depotInput}
                onChange={function (e) { setDepotInput(e.target.value); }}
                placeholder="Ex: Rua Exemplo, 123 - Sao Paulo, SP"
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary btn-sm" onClick={handleSaveDepot} disabled={loading}>
                Salvar
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={function () {
                  setEditingDepot(false);
                  setDepotInput(settings.depotAddress);
                }}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                border: '1.5px solid #ddd',
                borderRadius: 8,
                cursor: 'pointer',
              }}
              onClick={function () { setEditingDepot(true); }}
            >
              <span style={{ flex: 1, fontSize: 14, color: settings.depotAddress ? '#1a1a2e' : '#aaa' }}>
                {settings.depotAddress || 'Clique para configurar o deposito'}
              </span>
              {settings.depotLat && settings.depotLng && (
                <span style={{ fontSize: 11, color: '#10b981' }}>Geocodificado</span>
              )}
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Horas de expediente</label>
            <input
              type="number"
              min="1"
              max="24"
              value={settings.availableHours}
              onChange={function (e) { handleSettingsChange('availableHours', parseInt(e.target.value) || 8); }}
            />
          </div>
          <div className="form-group">
            <label>Minutos extras</label>
            <input
              type="number"
              min="0"
              max="59"
              value={settings.availableMinutesExtra}
              onChange={function (e) { handleSettingsChange('availableMinutesExtra', parseInt(e.target.value) || 0); }}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Tempo padrao carga/descarga (min)</label>
            <input
              type="number"
              min="1"
              value={settings.defaultLoadUnload}
              onChange={function (e) { handleSettingsChange('defaultLoadUnload', parseInt(e.target.value) || 10); }}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Cadastrar Entrega</h2>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label>Endereco de destino</label>
          <input
            type="text"
            value={form.address}
            onChange={function (e) { setForm(function (prev) { return Object.assign({}, prev, { address: e.target.value }); }); }}
            placeholder="Rua, numero - Bairro - Cidade, UF"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Cliente / Referencia</label>
            <input
              type="text"
              value={form.client}
              onChange={function (e) { setForm(function (prev) { return Object.assign({}, prev, { client: e.target.value }); }); }}
              placeholder="Nome do cliente"
            />
          </div>
          <div className="form-group">
            <label>Tempo carga/descarga (min)</label>
            <input
              type="number"
              min="1"
              value={form.loadUnload}
              onChange={function (e) { setForm(function (prev) { return Object.assign({}, prev, { loadUnload: e.target.value }); }); }}
              placeholder={'Padrao: ' + settings.defaultLoadUnload}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="btn btn-primary" onClick={handleAddDelivery}>
            Adicionar Entrega
          </button>
          {deliveries.length > 0 && (
            <button className="btn btn-outline" onClick={handleClearAll}>
              Limpar Todas
            </button>
          )}
        </div>
      </div>

      {deliveries.length > 0 && (
        <div className="card">
          <h2>Entregas do Dia ({deliveries.length})</h2>

          <div style={{ overflowX: 'auto' }}>
            <table className="delivery-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Endereco</th>
                  <th>Carga/Desc.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map(function (d, i) {
                  return (
                    <tr key={d.id}>
                      <td>{i + 1}</td>
                      <td>{d.client}</td>
                      <td style={{ maxWidth: 300 }}>{d.address}</td>
                      <td>{d.loadUnloadMin}min</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={function () { handleRemoveDelivery(d.id); }}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              className="btn btn-success"
              onClick={handleOptimize}
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Gerar Sequencia Otimizada'}
            </button>
            {result && (
              <button className="btn btn-outline" onClick={handleExportResult}>
                Exportar Resultado
              </button>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="card">
          <div className="loading-overlay">
            <div className="spinner" />
            <span>Geocodificando enderecos e calculando rotas...</span>
          </div>
        </div>
      )}

      {result && result.sequenced.length > 0 && MapComponent && (
        <div className="card">
          <h2>Mapa</h2>
          <MapComponent
            depot={{ lat: settings.depotLat, lng: settings.depotLng }}
            sequenced={result.sequenced}
            overflow={result.overflow}
          />
        </div>
      )}

      {result && (
        <div className="card">
          <h2>Sequencia Otimizada</h2>

          <div className="time-summary">
            <div>
              <div className="label">Tempo utilizado</div>
              <div className="value">
                {formatTimeLabel(Math.floor(result.totalUsedMinutes / 60), result.totalUsedMinutes % 60)}
                {' de '}
                {formatTimeLabel(Math.floor(result.availableMinutes / 60), result.availableMinutes % 60)}
              </div>
            </div>
            <div className="progress-bar">
              <div
                className="fill"
                style={{ width: Math.min(100, Math.round((result.totalUsedMinutes / result.availableMinutes) * 100)) + '%' }}
              />
            </div>
            <div style={{ fontSize: 13, color: '#555' }}>
              {Math.min(100, Math.round((result.totalUsedMinutes / result.availableMinutes) * 100))}%
            </div>
          </div>

          {renderSequence(result.sequenced)}

          {result.overflow.length > 0 && (
            <div>
              <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 16, color: '#ef4444' }}>
                Entregas nao encaixadas ({result.overflow.length})
              </h3>
              {result.overflow.map(function (d) {
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
      )}

      <div style={{ textAlign: 'center', padding: '24px 0', color: '#aaa', fontSize: 12 }}>
        RotaSmart - Otimizacao de Entregas
      </div>
    </div>
  );
}

function renderSequence(sequenced) {
  if (sequenced.length === 0) {
    return (
      <p style={{ color: '#888', fontSize: 14, padding: '12px 0' }}>
        Nenhuma entrega pôde ser encaixada no expediente.
      </p>
    );
  }

  var currentTime = 8 * 60;

  return sequenced.map(function (d, i) {
    var departureMin = currentTime;
    var arrivalMin = departureMin + d.travelTimeToMin;
    var returnMin = arrivalMin + d.loadUnloadMin + d.travelTimeFromMin;
    currentTime = returnMin;

    return (
      <div className="sequence-item" key={d.id}>
        <div className="sequence-number">{i + 1}</div>
        <div className="sequence-info">
          <div className="client">{d.client}</div>
          <div className="address">{d.address}</div>
          <div className="details">
            <span>Saida: {minutesToTime(departureMin)}</span>
            <span>Chegada: {minutesToTime(arrivalMin)}</span>
            <span>Retorno: {minutesToTime(returnMin)}</span>
            <span>Ciclo: {d.cycleDurationMin}min</span>
          </div>
        </div>
      </div>
    );
  });
}
