# Manual do Usuario - RotaSmart

## Gerenciamento de Veiculos e Otimizacao de Entregas

---

## Sumario

1. [Visao Geral](#1-visao-geral)
2. [Primeiros Passos](#2-primeiros-passos)
3. [Configuracoes](#3-configuracoes)
4. [Gerenciamento de Veiculos](#4-gerenciamento-de-veiculos)
5. [Cadastro de Entregas](#5-cadastro-de-entregas)
6. [Gerar Sequencia Otimizada](#6-gerar-sequencia-otimizada)
7. [Visualizacao do Resultado](#7-visualizacao-do-resultado)
8. [Mapa](#8-mapa)
9. [Exportar Resultado](#9-exportar-resultado)
10. [Dados Persistidos](#10-dados-persistidos)
11. [Instalacao como PWA (Celular)](#11-instalacao-como-pwa-celular)
12. [Erros Comuns](#12-erros-comuns)
13. [Perguntas Frequentes](#13-perguntas-frequentes)

---

## 1. Visao Geral

O **RotaSmart** e um sistema de gerenciamento de veiculos e otimizacao de rotas de entrega. Suporta multiplos veiculos simultaneamente, onde cada um recebe sua propria lista de entregas e sequencia otimizada.

### Como funciona

1. Cadastre seus veiculos (placa, apelido, etc.)
2. Configure o endereco do deposito e o tempo de expediente
3. Selecione um veiculo e cadastre as entregas dele
4. Gere a sequencia otimizada para cada veiculo
5. Repita para os demais veiculos

### Algoritmo de otimizacao

Para cada entrega, o sistema calcula o **ciclo completo**:

```
Ciclo = Tempo (deposito -> destino) + Tempo (destino -> deposito) + Tempo de carga/descarga
```

As entregas sao ordenadas por duracao do ciclo crescente (menor primeiro) e alocadas sequencialmente ate esgotar o tempo do expediente. Entregas que nao couberem sao listadas separadamente como "nao encaixadas".

### Exemplo pratico

Imagine 3 veiculos no dia:

| Veiculo | Entregas | Encaixadas | Nao encaixadas |
|---------|----------|------------|----------------|
| ABC-1234 | 8 | 7 | 1 |
| XYZ-5678 | 6 | 6 | 0 |
| FUR-9012 | 10 | 8 | 2 |

Cada veiculo tem sua propria sequencia otimizada independentemente.

---

## 2. Primeiros Passos

### Acessando o sistema

1. Abra o navegador e acesse a URL do RotaSmart
2. A tela principal sera exibida com: Configuracoes, Veiculos, Cadastrar Entrega e area de resultados

### Fluxo de uso basico

1. Configure o endereco do deposito
2. Defina o tempo de expediente
3. Cadastre um veiculo
4. Selecione o veiculo
5. Cadastre as entregas dele
6. Clique em "Gerar Sequencia Otimizada"
7. Consulte o resultado e o mapa
8. Repita os passos 3-7 para outros veiculos

---

## 3. Configuracoes

A secao de configuracoes permite definir os parametros gerais do sistema. As configuracoes sao compartilhadas entre todos os veiculos.

### 3.1 Endereco do Deposito

O deposito e o ponto de partida e retorno de todas as entregas (compartilhado entre veiculos).

1. Clique na area "Clique para configurar o deposito"
2. Digite o endereco completo (Rua, numero - Bairro - Cidade, UF)
3. Clique em **Salvar**

O sistema ira automaticamente converter o endereco em coordenadas geograficas (geocodificacao). Se o endereco for encontrado, aparecera a label verde "Geocodificado".

**Dica:** Use enderecos completos para melhor precisao. Exemplo:
- Correto: "Rua Maria Biruel Grosso, 61 - Vale do Sol - Araraquara, SP"
- Incorreto: "Rua 61"

### 3.2 Horas de Expediente

Define o tempo total disponivel para entregas no dia. Esse tempo e aplicado a **cada veiculo individualmente**.

- **Horas de expediente:** Numero de horas (padrao: 8)
- **Minutos extras:** complemento de minutos (padrao: 0)

Exemplo: Para um expediente de 6h40min, defina 6 horas e 40 minutos extras. Cada veiculo tera 6h40min disponiveis.

### 3.3 Tempo Padrao de Carga/Descarga

Tempo estimado para carregar e descarregar mercadoria em cada parada (em minutos). Valor padrao: 10 minutos.

Esse valor sera pre-preenchido ao cadastrar novas entregas, mas pode ser alterado individualmente para cada entrega.

---

## 4. Gerenciamento de Veiculos

O RotaSmart permite cadastrar e gerenciar multiplos veiculos. Cada veiculo e identificado por um nome, que pode ser a placa, apelido ou qualquer outra caracteristica.

### 4.1 Adicionar um veiculo

1. Na secao "Veiculos", digite o nome/placa do veiculo no campo de texto (ex: ABC-1D23)
2. Clique em **Adicionar** ou pressione **Enter**
3. O veiculo sera criado e selecionado automaticamente

### 4.2 Selecionar um veiculo

Clique no card do veiculo que deseja trabalhar. O veiculo selecionado fica destacado em azul.

Ao selecionar um veiculo:
- A secao "Cadastrar Entrega" aparece com o nome do veiculo
- A lista de entregas mostra as desse veiculo
- A sequencia otimizada e o mapa mostram os dados desse veiculo

### 4.3 Renomear um veiculo

1. Clique no icone de editar (caneta) ao lado do nome do veiculo
2. Altere o nome no campo de texto
3. Pressione **Enter** para confirmar

### 4.4 Remover um veiculo

1. Clique no icone de remover (X) ao lado do nome do veiculo
2. Confirme a remocao

**Atencao:** Remover um veiculo remove tambem todas as suas entregas e sequencias geradas.

### 4.5 Indicadores na tag do veiculo

Cada tag de veiculo exibe um numero ao lado do nome. Esse numero indica a quantidade de entregas cadastradas para aquele veiculo.

### 4.6 Resumo dos veiculos

Na secao de veiculos, e possivel exportar um relatorio geral que inclui todos os veiculos e suas sequencias (quando houver 2 ou mais veiculos cadastrados).

---

## 5. Cadastro de Entregas

As entregas sao vinculadas ao veiculo selecionado. Para cadastrar entregas, primeiro selecione um veiculo.

### 5.1 Adicionar uma entrega

1. Selecione o veiculo desejado
2. Preencha o **Endereco de destino** (obrigatorio)
3. Preencha o **Cliente / Referencia** (obrigatorio)
4. Opcionalmente, altere o **Tempo carga/descarga** (o valor padrao vem da configuracao)
5. Clique em **Adicionar Entrega**

A entrega sera adicionada a lista de entregas daquele veiculo.

### 5.2 Editar entregas

O RotaSmart nao permite editar entregas ja cadastradas. Para alterar uma entrega:

1. Clique em **Remover** na entrega que deseja alterar
2. Cadastre novamente com os dados corretos

### 5.3 Remover uma entrega

Clique no botao **Remover** ao lado da entrega na tabela.

### 5.4 Limpar todas as entregas

Clique em **Limpar Todas** para remover todas as entregas do veiculo selecionado. Uma confirmacao sera solicitada. Isso nao afeta os outros veiculos.

### 5.5 Campos do formulario

| Campo                | Obrigatorio | Descricao                                              |
|----------------------|-------------|--------------------------------------------------------|
| Endereco de destino  | Sim         | Endereco completo do ponto de entrega                  |
| Cliente / Referencia | Sim         | Nome do cliente ou referencia para identificacao       |
| Tempo carga/descarga | Nao         | Tempo em minutos (usa o valor padrao se nao informado) |

---

## 6. Gerar Sequencia Otimizada

### 6.1 Pre-requisitos

Antes de gerar a sequencia, verifique:

- [x] O endereco do deposito esta configurado e geocodificado
- [x] Um veiculo esta selecionado
- [x] O veiculo selecionado tem pelo menos uma entrega cadastrada
- [x] O tempo de expediente esta definido

### 6.2 Processo

1. Selecione o veiculo desejado
2. Clique no botao verde **Gerar Sequencia Otimizada**
3. O sistema ira:
   - Geocodificar todos os enderecos das entregas daquele veiculo (converter para coordenadas)
   - Calcular o tempo de viagem ida e volta para cada entrega
   - Executar o algoritmo de ordenacao por duracao crescente
   - Exibir o resultado

**Atencao:** O processo de geocodificacao e calculo de rotas pode levar alguns segundos, dependendo da quantidade de entregas. Aguarde a mensagem "Geocodificando enderecos e calculando rotas..."

### 6.3 Entendendo o resultado

O resultado e dividido em tres partes:

1. **Resumo de tempo** - Barra de progresso mostrando quantas horas foram utilizadas daquele veiculo
2. **Sequencia numerada** - Lista ordenada das entregas que couberam no dia
3. **Entregas nao encaixadas** - Entregas que ultrapassaram o tempo disponivel

### 6.4 Otimizando varios veiculos

Repita o processo para cada veiculo:

1. Selecione o proximo veiculo
2. Cadastre as entregas dele
3. Clique em "Gerar Sequencia Otimizada"
4. O resultado e salvo automaticamente para aquele veiculo

Voce pode alternar entre veiculos a qualquer momento usando as tags na secao "Veiculos". O resultado de cada veiculo e preservado.

---

## 7. Visualizacao do Resultado

### 7.1 Resumo de tempo

Exibe uma barra de progresso com:
- Tempo utilizado (ex: 6h40min)
- Tempo disponivel (ex: 8h00min)
- Percentual de uso (ex: 83%)

### 7.2 Sequencia numerada

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

### 7.3 Entregas nao encaixadas

Entregas que nao couberam no tempo de expediente sao listadas em vermelho com o tempo do ciclo necessario. Essas entregas devem ser realizadas no proximo dia ou em horario extra.

---

## 8. Mapa

Apos gerar a sequencia, um mapa interativo e exibido mostrando os pontos do veiculo selecionado:

- **Marcador do deposito** - Ponto de partida/retorno
- **Marcadores das entregas** - Numerados na ordem da sequencia
- **Marcadores das nao encaixadas** - Em cor diferente

O mapa utiliza OpenStreetMap (gratuito) e permite:
- Zoom com scroll do mouse
- Arrastar para navegar
- Clicar nos marcadores para ver detalhes

---

## 9. Exportar Resultado

### 9.1 Exportar por veiculo

Apos gerar a sequencia de um veiculo, clique em **Exportar Resultado** para baixar um arquivo .txt com:

- Nome do veiculo
- Resumo do tempo utilizado
- Lista numerada das entregas com enderecos e tempos
- Lista das entregas nao encaixadas

O arquivo sera baixado automaticamente com o nome `{placa}-YYYY-MM-DD.txt`.

### 9.2 Exportar relatorio geral

Quando houver 2 ou mais veiculos cadastrados, aparecera o botao **Exportar Relatorio Geral (todos os veiculos)** na secao de veiculos. Esse relatorio inclui:

- Data e deposito
- Todos os veiculos com suas entregas e sequencias
- Entregas nao encaixadas de cada veiculo

---

## 10. Dados Persistidos

O RotaSmart salva automaticamente no navegador:

- **Configuracoes** (deposito, expediente, tempo padrao)
- **Veiculos** (nomes, entregas, resultados de otimizacao)
- **Veiculo selecionado** (qual esta ativo)

Esses dados permanecem salvos mesmo apos fechar o navegador. Para limpar os dados, remova os veiculos e configure novamente o deposito.

**Importante:** Os dados sao salvos localmente no navegador. Se acessar por outro dispositivo ou navegador, sera necessario cadastrar novamente.

---

## 11. Instalacao como PWA (Celular)

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

## 12. Erros Comuns

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

### "Selecione um veiculo primeiro"

**Causa:** Tentou cadastrar entregas ou gerar sequencia sem ter um veiculo selecionado.

**Solucao:** Cadastre ou selecione um veiculo na secao "Veiculos".

### Tela em branco apos carregar

**Causa:** Erro de JavaScript no navegador.

**Solucao:**
- Recarregue a pagina (Ctrl+F5 ou Cmd+Shift+R)
- Limpe o cache do navegador
- Verifique se o navegador esta atualizado

---

## 13. Perguntas Frequentes

### Posso cadastrar entregas de dias diferentes?

O RotaSmart trabalha com entregas do dia. Ao finalizar o dia, remova as entregas ou cadastre novos veiculos para o proximo dia.

### Cada veiculo tem seu proprio tempo de expediente?

Sim. O tempo de expediente configurado e aplicado individualmente a cada veiculo. Se voce configura 8 horas, cada veiculo tera 8 horas disponiveis.

### Posso ter veiculos com tempos de expediente diferentes?

No momento, o tempo de expediente e o mesmo para todos os veiculos. O sistema trabalha com um unico valor de expediente compartilhado.

### O algoritmo sempre entrega a melhor sequencia?

Sim. Para o objetivo de maximizar a **quantidade** de entregas com todas tendo o mesmo valor/prioridade, o algoritmo shortest-duration-first e comprovadamente otimo.

### Posso priorizar alguma entrega?

O algoritmo atual nao suporta priorizacao individual. Todas as entregas sao tratadas igualmente, ordenadas apenas pela duracao do ciclo.

### Funciona offline?

Apos a primeira carga, o RotaSmart funciona parcialmente offline. As funcionalidades de geocodificacao e calculo de rotas precisam de conexao com a internet.

### Quantas entregas posso cadastrar?

Nao ha limite tecnico, mas o desempenho pode ser afetado com muitas entregas (acima de 50 por veiculo) devido a quantidade de chamadas a API.

### Os horarios sao exatos?

Os horarios sao **estimativas** baseadas nos tempos de viagem calculados pela API. Fatores como transito, clima e tempo real de carga/descarga podem alterar os tempos reais.

### Posso alternar entre veiculos apos gerar a sequencia?

Sim. Basta clicar na tag de outro veiculo. A sequencia do veiculo anterior e preservada.

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

*RotaSmart - Gerenciamento de Veiculos e Otimizacao de Entregas v2.0*
