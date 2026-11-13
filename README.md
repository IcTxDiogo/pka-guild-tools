# pka-guild-tools

Calculadora da meta semanal + histórico da guild + filtro de medalhas. Página estática (HTML + CSS + JS, sem build, sem backend). Filtro e log de medalhas ficam salvos só no navegador; o resto não salva nada.

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

## Medalhas

Aba "Medalhas": filtro de bônus (20 buffs em chips multiseleção) + caixa de log
(colar com Ctrl+V ou carregar `.txt`/`.log`) + botão Filtrar. O resultado lista
só as medalhas que combinam, com sprite, nome, Dex, bônus e quantidade (×N).

- Parser: lê `Dex #N` em `Você recebeu uma medalha (Dex #N)!`; ignora o resto;
  valida 1–151; preserva duplicadas (agrupa na exibição como ×N).
- Filtro e log ficam salvos **só no navegador** (`localStorage`, chave
  `pka-guild-tools:medals:v1`); nada é enviado a servidor. Botão "Limpar dados
  locais" apaga.
- Dica: tem um print das medalhas? O botão "Copiar prompt do ChatGPT" copia o
  prompt (`data/skill-leitor-medalhas.md`); mande no ChatGPT junto com o print
  e ele devolve o texto no padrão para colar na caixa.
- Catálogo estático em `data/pka_medals_catalog.json` (151 medalhas, 20 bônus).

## Estrutura

Sem build: `index.html` é só o shell (views + `<link>`/`<script type="module">`).
Cada aba tem seu CSS (`assets/css/<aba>.css`) e seu JS (`assets/js/<aba>.js`);
compartilhados ficam em `assets/css/base.css` e `assets/js/lib.js`
(`$`, `num`, `fmt`, `esc`). `assets/js/app.js` tem a tabela de rotas `TABS`.

Nova aba = 1 entrada no `<nav>` + 1 `<div id="view...">` + par
css/js + 1 rota em `TABS`. Rodar sempre via `python3 -m http.server`
(módulos ES não abrem via `file://`).

## Regras de pontos

- Dailys: pontos do jogo × 2 (normal 1, caveira 2, primal 4 — o jogo já soma)
- Contribuição: valor do jogo ÷ 100
- Meta: 150 pts/semana (fixa, desde 26/10)
