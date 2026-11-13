# pka-guild-tools — instruções do projeto

Página estática da guild: calculadora de meta, histórico e filtro de medalhas.
Sem build, sem backend. Deploy na Vercel (framework Other, push na `main` deploya).

## Estrutura

- `index.html`: shell (views + `<link>`/`<script type="module">`).
- Cada aba tem seu CSS (`assets/css/<aba>.css`) e seu JS (`assets/js/<aba>.js`).
- Compartilhados: `assets/css/base.css` e `assets/js/lib.js` (`$`, `num`, `fmt`, `esc`).
- `assets/js/app.js`: tabela de rotas `TABS`. Nova aba = 1 entrada no `<nav>` +
  1 `<div id="view...">` + par css/js + 1 rota em `TABS`.
- `data/`: `weeks.json` + CSVs (`lvl,nome,daily,contrib,entrou`),
  `pka_medals_catalog.json`, `skill-leitor-medalhas.md`.

## Regras

- Nada de usuário sai do navegador: só `localStorage`
  (chave `pka-guild-tools:medals:v1`). Fetch só de `data/` e sprites
  `play.pokemonshowdown.com`.
- Rodar via `python3 -m http.server` (módulos ES não abrem em `file://`).
- Gates antes de commitar: `node --input-type=module --check` em cada JS
  (nunca `node --check` puro); curl 200 + content-type nos assets; re-rodar
  aceites de medalhas; rede só same-origin + sprites.
- Commits em pt-BR, formato `tipo(escopo): descrição`.
