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

## Como funciona

Dois campos, iguais às métricas do jogo: **dailys (pontos)** + **contribuição (pontos)**.
A página soma, mostra o % da meta fixa de 150 e, se faltar, diz quantas
Wildscape (+4) ou Primal (+8) passam da meta. Nada é salvo.

## Regras de pontos (referência para converter antes de lançar)

- Wildscape: 4 pts cada
- Primal: 8 pts cada
- Doação: 3 pts a cada 100k completos
- DD doado: 10 pts cada
- Meta: 150 pts/semana (fixa)
