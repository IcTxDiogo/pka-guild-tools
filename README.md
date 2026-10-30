# pka-guild-tools

Calculadora da meta semanal da guild. Página estática (HTML + CSS + JS, sem build, nada é salvo).

## Rodar local

```bash
python3 -m http.server 8000
```

Abrir http://localhost:8000

## Deploy na Vercel

1. Importar este repo na Vercel como projeto novo (framework: Other, sem build).
2. Deploy automático a cada push na `main`.

## Regras de pontos

- Wildscape: 4 pts cada
- Primal: 8 pts cada
- Doação: 3 pts a cada 100k completos
- DD doado: 10 pts cada
- Meta padrão: 150 pts/semana (editável na página)
