import { $ } from "./lib.js";
import "./calc.js";
import { loadHistory } from "./history.js";
import { loadMedals } from "./medals.js";

// Tabela de rotas: nova aba = 1 entrada aqui + <nav>/<view> no HTML
// + par assets/css/<aba>.css e assets/js/<aba>.js.
var wrap = $("wrap"), subtitle = $("subtitle");

var TABS = {
  calc: {
    tab: $("tabCalc"), view: $("viewCalc"), wide: false, load: null,
    subtitle: "Coloque o que você fez na semana e veja quanto falta."
  },
  hist: {
    tab: $("tabHist"), view: $("viewHist"), wide: true, load: loadHistory,
    subtitle: "Ranking das semanas passadas e lista de kick."
  },
  medals: {
    tab: $("tabMedals"), view: $("viewMedals"), wide: true, load: loadMedals,
    subtitle: "Filtre o log e veja quais medalhas guardar."
  }
};

function show(which) {
  Object.keys(TABS).forEach(function (key) {
    var t = TABS[key];
    t.view.hidden = key !== which;
    t.tab.className = key === which ? "active" : "";
  });
  var cur = TABS[which];
  wrap.className = "wrap" + (cur.wide ? " wide" : "");
  subtitle.textContent = cur.subtitle;
  if (cur.load) cur.load();
}

Object.keys(TABS).forEach(function (key) {
  TABS[key].tab.addEventListener("click", function () { show(key); });
});

// Doação via Pix: copia o BR Code (copia e cola) para a área de transferência.
var PIX_BRCODE = "00020126580014br.gov.bcb.pix0136702060be-4c1b-409a-99e7-2b7b0cf32ae15204000053039865802BR5923DIOGO FRANCA DOS SANTOS6008DOURADOS62070503***6304EB3F";
var pixCopy = $("pixCopy");
if (pixCopy) {
  pixCopy.addEventListener("click", function () {
    function done(ok) {
      pixCopy.textContent = ok ? "Copiado!" : "Não deu pra copiar";
      setTimeout(function () { pixCopy.textContent = "Copiar código Pix"; }, 1500);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(PIX_BRCODE).then(function () { done(true); }, function () { done(false); });
    } else {
      var ta = document.createElement("textarea");
      ta.value = PIX_BRCODE;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(true); } catch (e) { done(false); }
      document.body.removeChild(ta);
    }
  });
}
