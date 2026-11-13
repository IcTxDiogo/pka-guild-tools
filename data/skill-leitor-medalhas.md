---
name: leitor-de-medalhas-pka
description: Use quando o usuário enviar prints do inventário de medalhas do Poke Alliance e quiser convertê-las em linhas de log por Pokémon (Dex #1–151), prontas para colar no PKA Guild Tools. Não avalia buffs, raridade, slots ou valor das medalhas.
---

# Leitor de medalhas PKA — print → log

## Objetivo

Transformar **somente medalhas que possam ser identificadas com segurança** em linhas de texto importáveis pelo PKA Guild Tools. Cada unidade reconhecida gera exatamente uma linha, mesmo se o mesmo Pokémon aparecer repetido.

Esta skill **não** calcula bônus, penalidades, raridade, slots, preço, rank nem recomenda guardar, equipar, vender ou reciclar. O site faz a avaliação posterior usando o número da Pokédex.

## Quando usar

- Quando o usuário anexar um ou mais prints do Poke Alliance com medalhas e pedir para ler, identificar, converter ou gerar um log.
- Se o usuário estiver criando ou revisando a própria skill, responda à solicitação de edição, em vez de forçar um log isolado.
- Se houver print legível, execute a identificação diretamente; não peça configuração desnecessária.

## Processo

1. **Localize as medalhas.** Elas são itens com um Pokémon ao centro de um círculo. Ignore as bordas, brilho, botões, menus, barras de rolagem, molduras vazias, cursores e outros elementos da interface. O nome da janela ou de um Pokémon que apareça fora do círculo não é, por si só, uma medalha a exportar.
2. **Identifique a espécie.** Compare forma, cores e características do sprite central com a Pokédex de Kanto abaixo (#1–151). Se útil, consulte o catálogo e os sprites de referência indicados no final deste arquivo. Não presuma que o sprite isolado e o desenho dentro da medalha tenham recortes idênticos.
3. **Respeite a ordem visual.** Percorra cada print linha a linha, de cima para baixo e da esquerda para a direita; em múltiplos prints, respeite a ordem de envio.
4. **Conte unidades, não tipos.** Um ícone visível = uma medalha, salvo quando houver quantidade explícita no próprio item, como `×3` ou `3x`, que equivale a três unidades. Preserve duplicatas. Não use brilho, raridade ou aparência para inferir quantidades.
5. **Não conte o que não está visível.** Não acrescente itens que estariam acima/abaixo da rolagem, cobertos por janelas, em slots vazios ou fora da captura. Nunca complete artificialmente o inventário até 100 ou qualquer outro total.
6. **Não adivinhe.** Se a imagem estiver cortada, minúscula, coberta ou ambígua entre duas espécies, exclua essa unidade do log e informe sua posição na seção de revisão. Não troque uma espécie duvidosa pela 'mais parecida'.
7. **Separe conjuntos.** Se houver medalhas de antes e depois de uma conversão, ou de inventários distintos explicitamente apresentados como conjuntos incompatíveis, não una conjuntos sem autorização; identifique a separação e solicite apenas a decisão necessária.
8. **Aplique correções.** Se o usuário identificar inequivocamente uma medalha ou corrigir uma leitura anterior, respeite essa correção e regenere **todo** o log atualizado na mesma ordem.

## Saída obrigatória na leitura de prints

Em uma conversão bem-sucedida, devolva **um único bloco de código `text`**. Dentro dele, escreva **apenas** uma linha por medalha reconhecida, usando exatamente este padrão:

```text
00:00 Você recebeu uma medalha (Dex #7)!
00:00 Você recebeu uma medalha (Dex #25)!
00:00 Você recebeu uma medalha (Dex #7)!
```

Esses três registros são apenas um **exemplo de formato**, não representam as medalhas de qualquer print específico.

Regras do bloco:

- O prefixo `00:00` é um marcador artificial para importação, **não** o horário real da captura.
- Use o número nacional do Pokémon, sem zeros à esquerda: `Dex #7`, nunca `Dex #007`.
- Não escreva cabeçalho `Channel saved ...`, total, numeração, nome, emoji, comentário, JSON, título ou explicação **dentro** do bloco.
- Se **todas** as medalhas forem identificadas sem dúvida e o pedido for apenas converter um print, responda **somente** com o bloco.
- Se houver **alguma** ambiguidade, após o bloco escreva `REVISÃO — NÃO IMPORTAR` e liste brevemente os ícones que ficaram de fora pelo número da imagem, linha e coluna, explicando o que impede a identificação. Não gere palpites em segundo bloco.
- Se **nenhuma** medalha puder ser reconhecida, **não** invente linhas. Diga o que não foi legível e solicite recorte ampliado ou outro print.
- Se a tarefa principal for **revisar/criar** a skill e o usuário também pedir um teste, você pode apresentar a skill e o teste em seções distintas; o bloco do teste continua obedecendo ao formato exato.

## Checklist antes de enviar

- Cada linha corresponde a uma unidade realmente observada (ou a uma quantidade explícita).
- Todos os números Dex estão no intervalo **1–151** e correspondem às espécies vistas.
- A ordem visual e as duplicatas foram mantidas.
- Slots vazios, outros elementos da interface e medalhas incertas ficaram de fora.
- O formato do log foi mantido, inclusive `00:00`, `Dex #N` e `!`.

## Pokédex de referência — Kanto (número nacional)

```text
  1 — Bulbasaur
  2 — Ivysaur
  3 — Venusaur
  4 — Charmander
  5 — Charmeleon
  6 — Charizard
  7 — Squirtle
  8 — Wartortle
  9 — Blastoise
 10 — Caterpie
 11 — Metapod
 12 — Butterfree
 13 — Weedle
 14 — Kakuna
 15 — Beedrill
 16 — Pidgey
 17 — Pidgeotto
 18 — Pidgeot
 19 — Rattata
 20 — Raticate
 21 — Spearow
 22 — Fearow
 23 — Ekans
 24 — Arbok
 25 — Pikachu
 26 — Raichu
 27 — Sandshrew
 28 — Sandslash
 29 — Nidoran♀
 30 — Nidorina
 31 — Nidoqueen
 32 — Nidoran♂
 33 — Nidorino
 34 — Nidoking
 35 — Clefairy
 36 — Clefable
 37 — Vulpix
 38 — Ninetales
 39 — Jigglypuff
 40 — Wigglytuff
 41 — Zubat
 42 — Golbat
 43 — Oddish
 44 — Gloom
 45 — Vileplume
 46 — Paras
 47 — Parasect
 48 — Venonat
 49 — Venomoth
 50 — Diglett
 51 — Dugtrio
 52 — Meowth
 53 — Persian
 54 — Psyduck
 55 — Golduck
 56 — Mankey
 57 — Primeape
 58 — Growlithe
 59 — Arcanine
 60 — Poliwag
 61 — Poliwhirl
 62 — Poliwrath
 63 — Abra
 64 — Kadabra
 65 — Alakazam
 66 — Machop
 67 — Machoke
 68 — Machamp
 69 — Bellsprout
 70 — Weepinbell
 71 — Victreebel
 72 — Tentacool
 73 — Tentacruel
 74 — Geodude
 75 — Graveler
 76 — Golem
 77 — Ponyta
 78 — Rapidash
 79 — Slowpoke
 80 — Slowbro
 81 — Magnemite
 82 — Magneton
 83 — Farfetch'd
 84 — Doduo
 85 — Dodrio
 86 — Seel
 87 — Dewgong
 88 — Grimer
 89 — Muk
 90 — Shellder
 91 — Cloyster
 92 — Gastly
 93 — Haunter
 94 — Gengar
 95 — Onix
 96 — Drowzee
 97 — Hypno
 98 — Krabby
 99 — Kingler
100 — Voltorb
101 — Electrode
102 — Exeggcute
103 — Exeggutor
104 — Cubone
105 — Marowak
106 — Hitmonlee
107 — Hitmonchan
108 — Lickitung
109 — Koffing
110 — Weezing
111 — Rhyhorn
112 — Rhydon
113 — Chansey
114 — Tangela
115 — Kangaskhan
116 — Horsea
117 — Seadra
118 — Goldeen
119 — Seaking
120 — Staryu
121 — Starmie
122 — Mr. Mime
123 — Scyther
124 — Jynx
125 — Electabuzz
126 — Magmar
127 — Pinsir
128 — Tauros
129 — Magikarp
130 — Gyarados
131 — Lapras
132 — Ditto
133 — Eevee
134 — Vaporeon
135 — Jolteon
136 — Flareon
137 — Porygon
138 — Omanyte
139 — Omastar
140 — Kabuto
141 — Kabutops
142 — Aerodactyl
143 — Snorlax
144 — Articuno
145 — Zapdos
146 — Moltres
147 — Dratini
148 — Dragonair
149 — Dragonite
150 — Mewtwo
151 — Mew
```

## Referências opcionais para consulta visual

- Catálogo das medalhas: https://pkatools.com.br/medalhas
- Sprites Gen 5: https://play.pokemonshowdown.com/sprites/gen5/

Ao receber um print, **execute imediatamente** a leitura e produza o log. Não faça introduções ou perguntas de configuração desnecessárias.
