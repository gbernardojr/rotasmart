# Manual do Usuario - RotaSmart

## Otimizacao de Entregas Multi-Parada

---

## Sumario

1. [Visao Geral](#1-visao-geral)
2. [Primeiros Passos](#2-primeiros-passos)
3. [Configuracoes](#3-configuracoes)
4. [Cadastro de Entregas](#4-cadastro-de-entregas)
5. [Gerar Sequencia Otimizada](#5-gerar-sequencia-otimizada)
6. [Visualizacao do Resultado](#6-visualizacao-do-result)
7. [Mapa](#7-mapa)
8. [Exportar Resultado](#8-exportar-resultado)
9. [Dados Persistidos](#9-dados-persistidos)
10. [Instalacao como PWA (Celular)](#10-instalacao-como-pwa-celular)
11. [Erros Comuns](#11-erros-comuns)
12. [Perguntas Frequentes](#12-perguntas-frequentes)

---

## 1. Visao Geral

O **RotaSmart** e um sistema de otimizacao de rotas de entrega que utiliza um algoritmo guloso (shortest-duration-first) para maximizar a quantidade de entregas realizadas dentro do tempo disponivel de expediente.

### Como funciona o algoritmo

Para cada entrega, o sistema calcula o **ciclo completo**:

```
Ciclo = Tempo (deposito -> destino) + Tempo (destino -> deposito) + Tempo de carga/descarga
```

As entregas sao ordenadas por duracao do ciclo crescente (menor primeiro) e alocadas sequencialmente ate esgotar o tempo do expediente. Entregas que nao couberem sao listadas separadamente como "nao encaixadas".

### Exemplo pratico

Se voce tem 10 entregas e 8 horas de expediente (480 minutos):

| Entrega | Ciclo (min) |
|---------|-------------|
| A       | 25          |
| B       | 30          |
| C       | 35          |
| D       | 40          |
| E       | 45          |
| F       | 50          |
| G       | 55          |
| H       | 60          |
| I       | 65          |
| J       | 70          |

O algoritmo soma: 25+30+35+40+45+50+55+60+65 = 405min (7h25) -> 8 entregas encaixadas.
Entregas I (65min) e J (70min) ficam para o proximo dia.

---

## 2. Primeiros Passos

### Acessando o sistema

1. Abra o navegador e acesse a URL do RotaSmart
2. A tela principal sera exibida com tres secoes: Configuracoes, Cadastrar Entrega e a area de resultados

### Fluxo de uso basico

1. Configure o endereco do deposito
2. Defina o tempo de expediente
3. Cadastre as entregas do dia
4. Clique em "Gerar Sequencia Otimizada"
5. Consulte o resultado e o mapa

---

## 3. Configuracoes

A secao de configuracoes permite definir os parametros gerais do sistema.

### 3.1 Endereco do Deposito

O deposito e o ponto de partida e retorno de todas as entregas.

1. Clique na area "Clique para configurar o deposito"
2. Digite o endereco completo (Rua, numero - Bairro - Cidade, UF)
3. Clique em **Salvar**

O sistema ira automaticamente converter o endereco em coordenadas geograficas (geocodificacao). Se o endereco for encontrado, aparecera a label verde "Geocodificado".

**Dica:** Use enderecos completos para melhor precisao. Exemplo:
- Correto: "Rua Maria Biruel Grosso, 61 - Vale do Sol - Araraquara, SP"
- Incorreto: "Rua 61"

### 3.2 Horas de Expediente

Define o tempo total disponivel para entregas no dia.

- **Horas de expediente:** Numero de horas (padrao: 8)
- **Minutos extras:** complemento de minutos (padrao: 0)

Exemplo: Para um expediente de 6h40min, defina 6 horas e 40 minutos extras.

### 3.3 Tempo Padrao de Carga/Descarga

Tempo estimado para carregar e descarregar mercadoria em cada parada (em minutos). Valor padrao: 10 minutos.

Esse valor sera pre-preenchido ao cadastrar novas entregas, mas pode ser alterado individualmente para cada entrega.

---

## 4. Cadastro de Entregas

### 4.1 Adicionar uma entrega

1. Preencha o **Endereco de destino** (obrigatorio)
2. Preencha o **Cliente / Referencia** (obrigatorio)
3. Opcionalmente, altere o **Tempo carga/descarga** (o valor padrao vem da configuracao)
4. Clique em **Adicionar Entrega**

A entrega sera adicionada a lista "Entregas do Dia".

### 4.2 Editar entregas

O RotaSmart nao permite editar entregas ja cadastradas. Para alterar uma entrega:

1. Clique em **Remover** na entrega que deseja alterar
2. Cadastre novamente com os dados corretos

### 4.3 Remover uma entrega

Clique no botao **Remover** ao lado da entrega na tabela.

### 4.4 Limpar todas as entregas

Clique em **Limpar Todas** para remover todas as entregas cadastradas. Uma confirmacao sera solicitada.

### 4.5 Campos do formulario

| Campo                | Obrigatorio | Descricao                                              |
|----------------------|-------------|--------------------------------------------------------|
| Endereco de destino  | Sim         | Endereco completo do ponto de entrega                  |
| Cliente / Referencia | Sim         | Nome do cliente ou referencia para identificacao       |
| Tempo carga/descarga | Nao         | Tempo em minutos (usa o valor padrao se nao informado) |

---

## 5. Gerar Sequencia Otimizada

### 5.1 Pre-requisitos

Antes de gerar a sequencia, verifique:

- [x] O endereco do deposito esta configurado e geocodificado
- [x] Ha pelo menos uma entrega cadastrada
- [x] O tempo de expediente esta definido

### 5.2 Processo

1. Clique no botao verde **Gerar Sequencia Otimizada**
2. O sistema ira:
   - Geocodificar todos os enderecos das entregas (converter para coordenadas)
   - Calcular o tempo de viagem ida e volta para cada entrega
   - Executar o algoritmo de ordenacao por duracao crescente
   - Exibir o resultado

**Atencao:** O processo de geocodificacao e calculo de rotas pode levar alguns segundos, dependendo da quantidade de entregas. Aguarde a mensagem "Geocodificando enderecos e calculando rotas..."

### 5.3 Entendendo o resultado

O resultado e dividido em tres partes:

1. **Resumo de tempo** - Barra de progresso mostrando quantas horas foram utilizadas
2. **Sequencia numerada** - Lista ordenada das entregas que couberam no dia
3. **Entregas nao encaixadas** - Entregas que ultrapassaram o tempo disponivel

---

## 6. Visualizacao do Resultado

### 6.1 Resumo de tempo

Exibe uma barra de progresso com:
- Tempo utilizado (ex: 6h40min)
- Tempo disponivel (ex: 8h00min)
- Percentual de uso (ex: 83%)

### 6.2 Sequencia numerada

Cada entrega na sequencia exibe:

| Campo     | Descricao                                         |
|-----------|---------------------------------------------------|
| Numero    | Ordem de execucao (1, 2, 3...)                    |
| Cliente   | Nome do cliente/referencia                        |
| Endereco  | Endereco de destino                               |
| Saida     | Horario estimado de saida do deposito             |
| Chegada   | Horario estimado de chegada ao destino            |
| Retorno   | Horario estimado de retorno ao deposito           |
| Ciclo     | Duracao total do ciclo (ida + volta + carga/desc) |

**Nota:** Os horarios sao calculados considerando saida as 08:00 e cada ciclo iniciando imediatamente apos o retorno da entrega anterior.

### 6.3 Entregas nao encaixadas

Entregas que nao couberam no tempo de expediente sao listadas em vermelho com o tempo do ciclo necessario. Essas entregas devem ser realizadas no proximo dia ou em horario extra.

---

## 7. Mapa

Apos gerar a sequencia, um mapa interativo e exibido mostrando:

- **Marcador do deposito** - Ponto de partida/retorno
- **Marcadores das entregas** - Numerados na ordem da sequencia
- **Marcadores das nao encaixadas** - Em cor diferente

O mapa utiliza OpenStreetMap (gratuito) e permite:
- Zoom com scroll do mouse
- Arrastar para navegar
- Clicar nos marcadores para ver detalhes

---

## 8. Exportar Resultado

Apos gerar a sequencia, clique em **Exportar Resultado** para baixar um arquivo .txt com:

- Resumo do tempo utilizado
- Lista numerada das entregas com enderecos e tempos
- Lista das entregas nao encaixadas

O arquivo sera baixado automaticamente com o nome `entregas-YYYY-MM-DD.txt`.

---

## 9. Dados Persistidos

O RotaSmart salva automaticamente no navegador:

- **Configuracoes** (deposito, expediente, tempo padrao)
- **Entregas do dia** (enderecos, clientes, tempos)

Esses dados permanecem salvos mesmo apos fechar o navegador. Para limpar os dados, remova as entregas e configure novamente o deposito.

**Importante:** Os dados sao salvos localmente no navegador. Se acessar por outro dispositivo ou navegador, sera necessario cadastrar novamente.

---

## 10. Instalacao como PWA (Celular)

O RotaSmart funciona como um Progressive Web App (PWA), podendo ser instalado no celular como um app.

### No Android (Chrome):

1. Acesse o RotaSmart pelo Chrome
2. Toque no menu (tres pontos)
3. Toque em "Instalar app" ou "Adicionar a tela inicial"
4. Confirme a instalacao

### No iPhone (Safari):

1. Acesse o RotaSmart pelo Safari
2. Toque no botao de compartilhar (quadrado com seta)
3. Toque em "Adicionar a Tela de Inicio"
4. Confirme com "Adicionar"

Apos a instalacao, o RotaSmart aparecera na tela inicial como um app comum, com icone proprio e tela cheia.

---

## 11. Erros Comuns

### "Endereco nao encontrado"

**Causa:** O endereco digitado nao foi encontrado pelo servico de geocodificacao.

**Solucao:**
- Use enderecos mais completos incluindo cidade e UF
- Verifique a ortografia
- Inclua o numero do imovel

### "Falha ao calcular rota"

**Causa:** O servico de calculo de rota (Google Routes API) nao conseguiu processar.

**Solucao:**
- Verifique se a chave da API do Google Maps esta configurada
- Confirme que a Routes API esta habilitada no Google Cloud Console
- Verifique sua conexao com a internet

### "Configure o endereco do deposito primeiro"

**Causa:** Tentou gerar a sequencia sem configurar o deposito.

**Solucao:** Volte a secao de Configuracoes e configure o endereco do deposito.

### Tela em branco apos carregar

**Causa:** Erro de JavaScript no navegador.

**Solucao:**
- Recarregue a pagina (Ctrl+F5 ou Cmd+Shift+R)
- Limpe o cache do navegador
- Verifique se o navegador esta atualizado

---

## 12. Perguntas Frequentes

### Posso cadastrar entregas de dias diferentes?

O RotaSmart trabalha com entregas do dia. Ao finalizar o dia, cadastre as novas entregas do proximo dia e gere uma nova sequencia.

### O algoritmo sempre entrega a melhor sequencia?

Sim. Para o objetivo de maximizar a **quantidade** de entregas com todas tendo o mesmo valor/prioridade, o algoritmo shortest-duration-first e comprovadamente otimo.

### Posso priorizar alguma entrega?

O algoritmo atual nao suporta priorizacao individual. Todas as entregas sao tratadas igualmente, ordenadas apenas pela duracao do ciclo.

### Funciona offline?

Apos a primeira carga, o RotaSmart funciona parcialmente offline. As funcionalidades de geocodificacao e calculo de rotas precisam de conexao com a internet.

### Quantas entregas posso cadastrar?

Nao ha limite tecnico, mas o desempenho pode ser afetado com muitas entregas (acima de 50) devido a quantidade de chamadas a API.

### Os horarios sao exatos?

Os horarios sao **estimativas** baseadas nos tempos de viagem calculados pela API. Fatores como transito, clima e tempo real de carga/descarga podem alterar os tempos reais.

---

## Informacoes Tecnicas

| Componente          | Tecnologia                          |
|---------------------|-------------------------------------|
| Frontend            | React + Next.js                     |
| Geocodificacao      | Nominatim (OpenStreetMap)           |
| Calculo de rotas    | Google Routes API                   |
| Mapa                | Leaflet + OpenStreetMap             |
| Estilos             | CSS customizado                     |
| PWA                 | Service Worker + Manifest           |
| Persistencia        | LocalStorage do navegador           |

---

*RotaSmart - Otimizacao de Entregas v1.0*
