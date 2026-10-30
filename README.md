# pka-guild-tools

Calculadora da meta semanal + histórico da guild. Página estática (HTML + CSS + JS, sem build, nada é salvo).

## Rodar local

```bash
python3 -m http.server 8000
```

Abrir http://localhost:8000

## Deploy na Vercel

1. Importar este repo na Vercel como projeto novo (framework: Other, sem build).
2. Deploy automático a cada push na `main`.

## Calculadora

Dois campos, iguais às métricas do jogo: **dailys × 2** + **contribuição ÷ 100**.
A página soma, mostra o % da meta fixa de 150 e, se faltar, diz quantos
pontos de daily ou de contribuição resolvem. Nada é salvo.

## Histórico

Aba "Histórico" com ranking por semana + lista de kick automática
(abaixo da meta **e** sem nada na coluna `entrou`).

### Adicionar uma semana nova

1. Exportar o CSV do jogo e limpar para o formato (cabeçalho exato):

```csv
lvl,nome,daily,contrib,entrou
414,Osiris,53,11400,
```

- `daily`: pontos do jogo (coluna Pontos)
- `contrib`: contribuição do jogo (coluna Contribuição)
- `entrou`: vazio = conta pra kick; qualquer texto (`18/10`, `estava ocupado`, `viagem`) = fora da lista

2. Salvar como `data/AAAA-MM-DD.csv` (ex: `data/2026-11-01.csv`).
3. Adicionar a entrada no topo de `data/weeks.json`:

```json
{
  "id": "2026-11-01",
  "label": "01/11/2026",
  "file": "data/2026-11-01.csv",
  "meta": 150,
  "dailyMult": 2,
  "contribDiv": 100,
  "ruleNote": "Regra atual: daily ×2 + contribuição ÷100 · meta 150"
}
```

A semana mais recente fica no topo do `weeks.json` (primeira entrada) e abre por padrão.
A regra fica guardada por semana: semanas antigas mantêm a fórmula da época
(ex: 25/10 era daily ×4, meta 140), então republicar não bagunça o passado.

## Regras de pontos

- Dailys: pontos do jogo × 2 (normal 1, caveira 2, primal 4 — o jogo já soma)
- Contribuição: valor do jogo ÷ 100
- Meta: 150 pts/semana (fixa, desde 26/10)
