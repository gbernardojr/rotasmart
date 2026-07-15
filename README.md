# RotaSmart — Otimização de Entregas

Sistema de otimização de trajeto multi-parada para entregas. Usa o algoritmo guloso **shortest-duration-first** para maximizar a quantidade de entregas concluídas dentro do tempo disponível.

## Como funciona

Para cada entrega, calcula-se a duração total do ciclo:

```
duracao_total = tempo(depósito→destino) + tempo(destino→depósito) + tempo_carga_descarga
```

As entregas são ordenadas por duração crescente e alocadas até esgotar o tempo do expediente. Entregas que não couberem são listadas separadamente.

## Configuração

### 1. Chave da API do Google Maps

Acesse o [Google Cloud Console](https://console.cloud.google.com/) e habilite:

- **Geocoding API** — converter endereços em coordenadas
- **Routes API** (Compute Routes) — calcular tempo de viagem entre pontos

Crie uma chave de API e copie para o arquivo `.env.local`:

```bash
cp .env.example .env.local
# Edite .env.local e insira sua chave
```

### 2. Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `GOOGLE_MAPS_API_KEY` | Chave da API do Google Maps Platform |

## Rodar localmente

```bash
npm install
npm run dev
```

Acesse http://localhost:3000

## Deploy no Vercel

```bash
npm i -g vercel
vercel
```

Ou faça deploy via integração com GitHub:

1. Faça push do repositório para o GitHub
2. Acesse [vercel.com/new](https://vercel.com/new)
3. Importe o repositório
4. Adicione a variável de ambiente `GOOGLE_MAPS_API_KEY`
5. Deploy automático

## Estrutura do projeto

```
├── app/
│   ├── api/
│   │   ├── geocode/route.js      # Geocodificação de endereços
│   │   ├── optimize/route.js     # Execução do algoritmo
│   │   └── travel-time/route.js  # Cálculo de tempo de viagem
│   ├── globals.css                # Estilos globais
│   ├── layout.js                  # Layout raiz
│   └── page.js                    # Página principal (client)
├── components/
│   ├── DeliveryMap.js             # Mapa com Leaflet/OpenStreetMap
│   └── SequenceResult.js          # Exibição da sequência
├── lib/
│   ├── googleMaps.js              # Integração com Google Maps API
│   └── sequencer.js               # Algoritmo de sequenciamento
├── .env.example
└── README.md
```

## Testes manuais sugeridos

1. Configure um depósito e cadastre 3-5 entregas
2. Clique em "Gerar Sequência Otimizada"
3. Verifique que as entregas estão ordenadas por duração crescente
4. Adicione entregas suficientes para ultrapassar o expediente
5. Verifique que as excedentes aparecem em "Entregas não encaixadas"
6. Verifique o mapa com todos os marcadores
7. Exporte o resultado e valide o arquivo gerado
